import { clearPending, markAttempt, pending, type PendingOp } from './db'
import { supabase } from './supabase'

/**
 * Sincronizzazione: una coda di operazioni, non un merge.
 *
 * Quasi tutto è un INSERIMENTO, e va così perché gli eventi sono immutabili:
 * un check-in non si modifica mai, quindi non esistono due versioni della
 * stessa riga e non c'è niente da fondere. L'`id` è generato sul client,
 * quindi un reinvio è idempotente — il database rifiuta il duplicato.
 *
 * L'eccezione è il PROFILO, che per sua natura si corregge: il nome, lo sport,
 * lo stato del ciclo. Per quello serve un'operazione di modifica, ed è l'unica.
 * Finché non c'era, una modifica finiva in coda come inserimento, il server la
 * rifiutava come duplicato, e questa funzione la scambiava per «è già
 * arrivata» e la buttava: il telefono mostrava il nome nuovo, il server teneva
 * quello vecchio, e nessuno se ne accorgeva.
 */

/** Un errore di RETE è temporaneo: si riprova, la coda non si svuota mai. */
const isNetworkError = (e: unknown): boolean => {
  const msg = e instanceof Error ? e.message : String(e)
  return /fetch|network|timeout|offline/i.test(msg)
}

/** Codici Postgres che dicono "questa riga non passerà mai": si mette da parte. */
const PERMANENT = new Set([
  '23514', // check_violation — un CHECK di colonna ha rifiutato il payload
  '23503', // foreign_key_violation
  '22P02', // invalid_text_representation
  '42501', // insufficient_privilege — RLS
])

const MAX_ATTEMPTS = 8

export type SyncResult = { sent: number; kept: number; parked: number }

/**
 * 🔴 Un solo giro alla volta.
 *
 * `flush()` parte da parecchi posti — ogni salvataggio, il timer, il ritorno
 * online, la riapertura dell'app — e due giri in parallelo leggono la stessa
 * coda prima che l'uno tolga le righe dell'altro: la stessa operazione parte
 * due volte. Per un inserimento non fa danno (il duplicato viene rifiutato) e
 * nemmeno per una modifica (applicarla due volte dà lo stesso risultato), ma è
 * lavoro sprecato su una connessione che spesso è già scarsa. Chi arriva
 * mentre un giro è in corso aspetta quello, invece di aprirne un altro.
 */
let running: Promise<SyncResult> | null = null
/** Qualcuno ha chiesto un giro mentre era già in corso: gliene serve un altro. */
let again = false

export function flush(): Promise<SyncResult> {
  if (running) { again = true; return running }
  running = loop().finally(() => { running = null })
  return running
}

/**
 * Chi chiama a giro iniziato non può essere servito da quel giro: la coda era
 * già stata letta, e la sua riga non c'era. Senza questo secondo passaggio
 * resterebbe ferma fino al battito successivo — un minuto in cui l'atleta ha
 * appena salvato e non è partito niente.
 */
async function loop(): Promise<SyncResult> {
  let last = await run()
  while (again) { again = false; last = await run() }
  return last
}

async function run(): Promise<SyncResult> {
  const result: SyncResult = { sent: 0, kept: 0, parked: 0 }
  if (!supabase || !navigator.onLine) {
    result.kept = (await pending()).filter((o) => !o.lastError).length
    return result
  }

  const ops = await pending()
  // In ordine di creazione: body_signals e red_flags referenziano il check-in.
  ops.sort((a, b) => a.createdAt - b.createdAt)

  for (const op of ops) {
    if (op.lastError) { result.parked++; continue }
    try {
      if (op.op === 'update') {
        // 🔴 `select()` non è decorativo: un update su una riga che non esiste
        // NON è un errore per Postgres, tocca zero righe e torna soddisfatto.
        // Senza contarle, una modifica arrivata prima del suo inserimento
        // sparirebbe nel nulla con l'aria di essere andata a buon fine.
        const { data, error } = await supabase
          .from(op.table).update(op.row).eq('id', op.target!).select('id')
        if (error) {
          // Su una modifica, 23505 NON vuol dire «è già arrivata»: vuol dire
          // che il nuovo valore sbatte contro un vincolo. Non si ritenta.
          if (PERMANENT.has(error.code ?? '') || error.code === '23505') {
            await markAttempt(op, `${error.code}: ${error.message}`)
            result.parked++
            continue
          }
          throw new Error(error.message)
        }
        if ((data?.length ?? 0) === 0) {
          // La riga non c'è ancora: quasi sempre il suo inserimento è più
          // avanti in coda e al prossimo giro sarà passato. Se non succede mai,
          // dopo qualche tentativo si mette da parte invece di girare a vuoto.
          if (op.attempts < MAX_ATTEMPTS) { await markAttempt(op); result.kept++ }
          else { await markAttempt(op, 'riga assente sul server'); result.parked++ }
          continue
        }
        await clearPending(op.id)
        result.sent++
        continue
      }

      const { error } = await supabase.from(op.table).insert(op.row)
      if (error) {
        // Duplicato = è già arrivata: il reinvio è idempotente, si toglie.
        if (error.code === '23505') { await clearPending(op.id); result.sent++; continue }
        if (PERMANENT.has(error.code ?? '')) {
          await markAttempt(op, `${error.code}: ${error.message}`)
          result.parked++
          continue
        }
        throw new Error(error.message)
      }
      await clearPending(op.id)
      result.sent++
    } catch (e) {
      if (isNetworkError(e) || op.attempts < MAX_ATTEMPTS) {
        await markAttempt(op)
        result.kept++
      } else {
        await markAttempt(op, e instanceof Error ? e.message : String(e))
        result.parked++
      }
    }
  }
  return result
}

let timer: number | undefined

/**
 * Si attiva al ritorno online e alla riapertura dell'app, più un tentativo
 * periodico leggero. Nessun indicatore vistoso: la coda si svuota da sola, e
 * comunicare all'atleta un problema che non è suo sarebbe solo rumore.
 */
export function startSync(intervalMs = 60_000): () => void {
  const run = () => { void flush() }
  const onVisible = () => { if (document.visibilityState === 'visible') run() }
  window.addEventListener('online', run)
  document.addEventListener('visibilitychange', onVisible)
  timer = window.setInterval(run, intervalMs)
  run()
  return () => {
    window.removeEventListener('online', run)
    document.removeEventListener('visibilitychange', onVisible)
    if (timer) window.clearInterval(timer)
  }
}

/** Righe rimaste indietro per un errore vero: vanno mostrate, mai ignorate. */
export async function parked(): Promise<PendingOp[]> {
  return (await pending()).filter((o) => o.lastError)
}
