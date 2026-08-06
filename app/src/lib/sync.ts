import { clearPending, markAttempt, pending, type PendingOp } from './db'
import { supabase } from './supabase'

/**
 * Sincronizzazione: una coda di inserimenti, non un merge.
 *
 * Gli eventi sono immutabili e l'`id` è generato sul client, quindi un reinvio
 * è idempotente: il database rifiuta il duplicato e non succede niente.
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

export async function flush(): Promise<SyncResult> {
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
