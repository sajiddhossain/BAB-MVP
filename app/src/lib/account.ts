import * as db from './db'
import { supabase } from './supabase'

/**
 * I due diritti del §9: portarsi via i propri dati, e farli sparire.
 *
 * Le funzioni SQL esistevano già (`export_my_data`, `delete_my_account`); qui
 * c'è il pezzo che le rende raggiungibili, e le due decisioni che non sono
 * ovvie.
 */

/* ── EXPORT ──────────────────────────────────────────────────────────────── */

export type ExportResult = {
  /** Il file, pronto da scaricare. */
  filename: string
  json: string
  /** Da dove sono usciti i dati: cambia cosa si può promettere. */
  source: 'server' | 'device'
  /** Righe salvate qui che il server non ha ancora visto. */
  pending: number
}

/** Quello che si legge aprendo il file, prima di qualunque parentesi graffa. */
const README =
  'Questo file contiene i tuoi dati di BAB. È tuo: puoi tenerlo, mandarlo a chi ' +
  'vuoi, o darlo a un altro programma. "check_ins" sono i tuoi check-in, ' +
  '"body_signals" le sensazioni che hai segnato sulla mappa del corpo, ' +
  '"cycle_events" le date del ciclo, "consents" i consensi che hai dato e quando. ' +
  'Se c\'è "non_ancora_inviati", sono cose salvate sul tuo telefono che non erano ' +
  'ancora arrivate al server quando hai scaricato: ci sono lo stesso.'

/**
 * Costruisce il file.
 *
 * 🔴 Due sorgenti, e vanno tenute tutt'e due.
 *
 * Il server è la copia completa — tutti i dispositivi, tutta la storia — e
 * quando c'è si usa quello. Ma la coda locale può contenere check-in che il
 * server non ha MAI visto: fatti in palestra senza campo, o rimasti indietro
 * per un errore. Un export che prende solo dal server li lascerebbe fuori in
 * silenzio, e lei si ritroverebbe in mano un file che sembra completo e non lo
 * è. Per questo la coda finisce sempre nel file, in una sezione a parte e
 * chiamata per quello che è.
 *
 * Senza rete si esporta l'archivio locale, e il file lo dichiara: meglio un
 * file parziale che si sa parziale, che nessun file.
 */
export async function buildExport(userId: string | null): Promise<ExportResult> {
  const queue = await db.pending().catch(() => [])
  const notSent = queue.map((o) => ({ tabella: o.table, riga: o.row, motivo: o.lastError ?? 'in attesa di rete' }))

  let data: unknown = null
  let source: ExportResult['source'] = 'device'

  if (supabase && userId && navigator.onLine) {
    const { data: remote, error } = await supabase.rpc('export_my_data')
    if (!error && remote) { data = remote; source = 'server' }
  }

  if (source === 'device') {
    const local: Record<string, unknown[]> = {}
    for (const table of db.TABLES) {
      local[table] = await db.list(table).catch(() => [])
    }
    data = local
  }

  const today = new Date().toISOString().slice(0, 10)
  const body = {
    leggimi: README,
    esportato_il: new Date().toISOString(),
    origine: source === 'server' ? 'server' : 'questo dispositivo',
    dati: data,
    ...(notSent.length ? { non_ancora_inviati: notSent } : {}),
  }

  return {
    filename: `bab-i-miei-dati-${today}.json`,
    json: JSON.stringify(body, null, 2),
    source,
    pending: notSent.length,
  }
}

/** Consegna il file al browser. Separata perché tocca il DOM e il resto no. */
export function download(result: ExportResult): void {
  const url = URL.createObjectURL(new Blob([result.json], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = result.filename
  a.click()
  URL.revokeObjectURL(url)
}

/* ── CANCELLAZIONE ───────────────────────────────────────────────────────── */

export type DeleteFailure = 'not-connected' | 'offline' | 'server'

/**
 * Cancellazione vera: la funzione SQL toglie l'utente da `auth.users` e il
 * cascade porta via tutto il resto.
 *
 * 🔴 L'ordine è la parte che conta.
 *
 * Prima il server, poi il locale, poi l'uscita. Se si cancellasse prima in
 * locale e poi il server fallisse, lei resterebbe senza i suoi dati sul
 * telefono mentre il server li tiene tutti: il peggiore dei due mondi, e
 * l'unico modo di fallire che rende la situazione peggiore di prima.
 *
 * 🔴 E serve la rete. Non è una scusa tecnica: cancellare solo qui e lasciare
 * tutto sul server sarebbe una bugia — la schermata dice «sparisce tutto», e
 * deve essere vero.
 *
 * 🔴 Il controllo però è nel PROVARE, non in `navigator.onLine`: quell'API
 * dice spesso «offline» anche con campo pieno (è nota per essere inaffidabile
 * su mobile), e qui bloccava chi aveva rete vera prima ancora di tentare.
 * Meglio chiamare il server e leggere se è fallito per davvero.
 */
export async function deleteAccount(): Promise<void> {
  if (!supabase) throw Object.assign(new Error('not-connected'), { kind: 'not-connected' as DeleteFailure })

  let result: Awaited<ReturnType<typeof supabase.rpc>>
  try {
    result = await supabase.rpc('delete_my_account')
  } catch {
    throw Object.assign(new Error('offline'), { kind: 'offline' as DeleteFailure })
  }
  if (result.error) throw Object.assign(new Error(result.error.message), { kind: 'server' as DeleteFailure })

  // Solo adesso. Da qui in poi non c'è più niente da perdere.
  await db.wipe()
  await supabase.auth.signOut()
}
