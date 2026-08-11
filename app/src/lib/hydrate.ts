import { useEffect, useState } from 'react'
import * as db from './db'
import { supabase } from './supabase'
import type { TableName } from './db'

/**
 * Idratazione iniziale: scaricare quello che c'è già, la prima volta che
 * un'atleta entra su un dispositivo.
 *
 * ── Perché non è una rifinitura ─────────────────────────────────────────────
 *
 * Fino a qui l'archivio locale si riempiva solo scrivendo. Va benissimo finché
 * il telefono è sempre lo stesso; smette di andare bene esattamente quando
 * conta: telefono nuovo, telefono formattato, dati del browser cancellati,
 * oppure semplicemente il tablet di casa oltre al telefono. In tutti quei casi
 * l'app si apriva **vuota** con tre mesi di dati sul server, e R10 dice che i
 * dati delle prime settimane non si perdono.
 *
 * 🔴 E c'era di peggio del vuoto. `App.tsx` decide se mostrare l'onboarding
 * guardando se il profilo esiste **in locale**: senza idratazione, un'atleta
 * che rientra da un telefono nuovo veniva rimandata a rifare l'onboarding, e
 * il profilo che ne usciva finiva in coda come inserimento — rifiutato dal
 * server come duplicato e messo da parte in silenzio. Le sarebbe stato chiesto
 * di nuovo il consenso, la data di nascita e lo stato del ciclo, per niente.
 *
 * ── Come funziona ───────────────────────────────────────────────────────────
 *
 * Si scarica una FINESTRA FISSA di 90 giorni, tutta, ogni volta. Niente
 * sincronizzazione incrementale: per una singola atleta sono qualche centinaio
 * di righe, e l'incrementale avrebbe voluto una colonna temporale per tabella
 * — che `athlete_schedule` e `athlete_events` non hanno — più la trappola
 * classica, una riga inserita oggi con una data di ieri che il filtro salta.
 * Semplice e completo batte furbo e a buchi.
 *
 * Le righe si scrivono con `db.hydrate`, che NON le rimette in coda: sono già
 * sul server, ed è tutto il punto.
 *
 * 🔴 L'idratazione non tocca le righe in attesa. Un check-in fatto sull'aereo
 * e non ancora inviato non deve sparire perché nel frattempo si è scaricata la
 * settimana: la coda è la sua, e resta.
 */

/** Quanto si guarda indietro. Copre il pilota con margine. */
const WINDOW_DAYS = 90

/** Il segnaposto è per atleta: due account sullo stesso telefono non si confondono. */
const stamp = (userId: string) => `hydrated:${userId}`

type Spec = {
  table: TableName
  /**
   * Colonna su cui si taglia la finestra. `null` per le tabelle che non hanno
   * una data e sono comunque minuscole (l'orario settimanale).
   */
  window: { column: string; type: 'date' | 'stamp' } | null
  /** La chiave d'ordinamento locale, la stessa che userebbe `repo.ts`. */
  sortKey: (r: Record<string, unknown>) => string
}

/** Il giorno di una colonna timestamp, per costruire la chiave d'ordinamento. */
const day = (v: unknown) => String(v ?? '').slice(0, 10)

/**
 * Cosa si scarica, e cosa no.
 *
 * `ux_events` è assente di proposito: è strumentazione, si scrive e non si
 * rilegge mai dall'app. Scaricarla vorrebbe dire riportare sul telefono
 * dell'atleta dei dati che servono solo a noi.
 *
 * `journey_progress` è assente perché il Percorso è fuori dalla v1 (R8):
 * niente lo scrive e niente lo legge.
 */
const SPECS: Spec[] = [
  {
    table: 'athletes',
    window: null,
    sortKey: (r) => String(r.id),
  },
  {
    table: 'check_ins',
    window: { column: 'local_date', type: 'date' },
    sortKey: (r) => `${r.local_date}:${r.id}`,
  },
  {
    table: 'body_signals',
    window: { column: 'created_at', type: 'stamp' },
    sortKey: (r) => `${day(r.created_at)}:${r.id}`,
  },
  {
    table: 'red_flags',
    window: { column: 'opened_at', type: 'stamp' },
    sortKey: (r) => `${day(r.opened_at)}:${r.id}`,
  },
  {
    table: 'cycle_events',
    window: { column: 'event_date', type: 'date' },
    sortKey: (r) => `${r.event_date}:${r.id}`,
  },
  {
    table: 'consents',
    window: null,
    sortKey: (r) => `${r.granted_at}:${r.id}`,
  },
  {
    table: 'shares',
    window: { column: 'week_start', type: 'date' },
    sortKey: (r) => `${r.week_start}:${r.id}`,
  },
  {
    table: 'athlete_schedule',
    window: null,
    sortKey: (r) => `${r.weekday}:${r.kind}:${r.id}`,
  },
  {
    table: 'athlete_events',
    window: { column: 'event_date', type: 'date' },
    sortKey: (r) => `${r.event_date}:${r.id}`,
  },
]

export type HydrationReport = { rows: number; tables: number }

/** Se non è mai stata fatta su questo dispositivo, va fatta PRIMA di entrare. */
export async function isHydrated(userId: string): Promise<boolean> {
  return Boolean(await db.getMeta(stamp(userId)))
}

/**
 * Scarica e scrive. Rilancia se qualcosa va storto — e in quel caso il
 * segnaposto NON viene messo, quindi al tentativo successivo si riprova da
 * capo invece di lasciare un archivio mezzo pieno che sembra completo.
 */
export async function hydrateAll(userId: string): Promise<HydrationReport> {
  if (!supabase) return { rows: 0, tables: 0 }

  const from = new Date()
  from.setDate(from.getDate() - WINDOW_DAYS)
  const cut = { date: from.toISOString().slice(0, 10), stamp: from.toISOString() }

  let rows = 0
  let tables = 0

  for (const spec of SPECS) {
    let q = supabase.from(spec.table).select('*').eq(
      // Il profilo si identifica con `id`; tutto il resto punta all'atleta.
      spec.table === 'athletes' ? 'id' : 'athlete_id',
      userId,
    )
    if (spec.window) q = q.gte(spec.window.column, cut[spec.window.type])

    const { data, error } = await q
    // 🔴 Si ferma al primo errore invece di andare avanti. Proseguire
    // lascerebbe un archivio con i check-in ma senza i segnali corporei, che
    // è indistinguibile da «quella settimana non ha segnalato niente».
    if (error) throw new Error(`${spec.table}: ${error.message}`)

    const list = (data ?? []) as Record<string, unknown>[]
    await db.hydrate(
      spec.table,
      list.map((r) => ({ id: String(r.id), row: r, sortKey: spec.sortKey(r) })),
    )
    rows += list.length
    if (list.length) tables++
  }

  await db.setMeta(stamp(userId), new Date().toISOString())
  return { rows, tables }
}

/**
 * Il rinfresco silenzioso degli avvii successivi.
 *
 * Serve a chi usa due dispositivi: senza, il tablet mostrerebbe per sempre la
 * fotografia del giorno in cui ci si è entrate. Non blocca niente e ingoia
 * l'errore — se non riesce, l'app ha già tutto quello che le serve in locale.
 */
export function refreshQuietly(userId: string): void {
  if (!supabase || !navigator.onLine) return
  void hydrateAll(userId).catch(() => { /* il locale basta a lavorare */ })
}

export type HydrationState = 'checking' | 'running' | 'done' | 'error'

/**
 * Lo stato dell'idratazione, per l'unico posto che deve aspettarla: la radice
 * dell'app, prima di decidere se mandarla all'onboarding.
 *
 * 🔴 I due modi di fallire non si trattano allo stesso modo.
 *
 * Se non si riesce nemmeno a LEGGERE il segnaposto, l'archivio locale è
 * inutilizzabile — navigazione privata, storage bloccato, un'altra scheda che
 * tiene la porta. Lì bloccare sarebbe un vicolo cieco: non si potrà scrivere
 * il segnaposto nemmeno riprovando mille volte. Si passa oltre e l'app degrada
 * come faceva prima, con le schermate che dicono «non c'è ancora niente».
 *
 * Se invece il segnaposto si legge ma lo SCARICO fallisce, il problema è la
 * rete o il server, ed è temporaneo: lì si blocca e si offre «riprova». È
 * l'unico momento in cui BAB pretende la rete, e va detto — proseguire
 * significherebbe rimandare all'onboarding un'atleta che ce l'ha già fatto.
 */
export function useHydration(userId: string | null) {
  const [state, setState] = useState<HydrationState>('checking')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!userId || !supabase) { setState('done'); return }
    let alive = true
    setState('checking')

    isHydrated(userId)
      .catch((e) => {
        console.warn('[hydrate] archivio locale non leggibile', e)
        return true          // si va avanti: bloccare qui non porta da nessuna parte
      })
      .then((already) => {
        if (!alive) return
        if (already) { setState('done'); refreshQuietly(userId); return }
        setState('running')
        return hydrateAll(userId).then(() => { if (alive) setState('done') })
      })
      .catch((e) => {
        console.error('[hydrate]', e)
        if (alive) setState('error')
      })

    return () => { alive = false }
  }, [userId, attempt])

  return { state, retry: () => setAttempt((a) => a + 1) }
}
