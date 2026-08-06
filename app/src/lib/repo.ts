import * as db from './db'
import { flush } from './sync'

/**
 * L'API che usano le schermate. Nasconde del tutto la distinzione
 * locale/remoto: si scrive, e basta.
 */

/** Il giorno dell'atleta finisce alle 4 del mattino, non a mezzanotte. */
export function localDate(now: Date = new Date()): string {
  const d = new Date(now)
  if (d.getHours() < 4) d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const newId = (): string => crypto.randomUUID()

export type CheckInDraft = {
  id?: string
  athlete_id: string
  kind: 'pre' | 'post'
  tempo_predicted?: string | null
  prediction_confidence?: number | null
  /** 🔴 Sempre entrambe: la differenza è l'atleta che corregge il modello. */
  tempo_suggested?: string | null
  tempo_chosen?: string | null
  sleep?: number | null
  energy?: number | null
  hydration?: number | null
  muscles?: number | null
  legs?: number | null
  breath?: number | null
  effort?: number | null
  headspace?: string[] | null
  headspace_other?: string | null
  surprise?: number | null
  sleep_hours?: string | null
  school_load?: number | null
  painkillers?: boolean | null
  brought_home?: string[] | null
  note?: string | null
  session_type?: string | null
  duration_bucket?: string | null
  /** Strumentazione del pilota: irrecuperabile se non la si mette adesso. */
  started_at?: string | null
  skipped_fields?: string[] | null
}

export type BodySignalDraft = {
  athlete_id: string
  region: string
  region_free?: string | null
  sensation: string
  intensity?: number | null
  behaviour?: string | null
  is_red_flag: boolean
}

/**
 * Salva un check-in con i suoi segnali corporei e le eventuali bandiere rosse.
 * Scrive tutto in locale immediatamente; l'invio parte da solo.
 */
export async function saveCheckIn(
  draft: CheckInDraft,
  signals: BodySignalDraft[] = [],
): Promise<string> {
  const id = draft.id ?? newId()
  const date = localDate()
  const row = { ...draft, id, local_date: date, completed_at: new Date().toISOString() }

  await db.put('check_ins', id, row, `${date}:${id}`)

  for (const s of signals) {
    const sid = newId()
    await db.put('body_signals', sid, { ...s, check_in_id: id }, `${date}:${sid}`)

    // 🔴 Una bandiera rossa è una RIGA A SÉ, non un campo: §11 chiede che
    // escali a un umano subito e non finisca sepolta in un trend.
    if (s.is_red_flag) {
      const rid = newId()
      await db.put('red_flags', rid, {
        athlete_id: s.athlete_id,
        region: s.region,
        sensation: s.sensation,
        told_adult: false,
        opened_at: new Date().toISOString(),
      }, `${date}:${rid}`)
    }
  }

  void flush()
  return id
}

/** Segnalazione immediata: fuori dal check-in, perché un infortunio non aspetta. */
export async function saveAcuteSignal(s: BodySignalDraft): Promise<string> {
  const id = newId()
  const date = localDate()
  await db.put('body_signals', id, { ...s, check_in_id: null }, `${date}:${id}`)
  if (s.is_red_flag) {
    const rid = newId()
    await db.put('red_flags', rid, {
      athlete_id: s.athlete_id, region: s.region, sensation: s.sensation,
      told_adult: false, opened_at: new Date().toISOString(),
    }, `${date}:${rid}`)
  }
  void flush()
  return id
}

export async function saveCycleEvent(athleteId: string, date: string, kind: 'period_start' | 'period_end') {
  const id = newId()
  await db.put('cycle_events', id, { athlete_id: athleteId, kind, event_date: date }, `${date}:${id}`)
  void flush()
  return id
}

export async function recentCheckIns(limit = 60) {
  return db.list('check_ins', { limit, desc: true })
}

export async function checkInsOn(date: string) {
  const all = await db.list('check_ins', { desc: true })
  return all.filter((r) => r.local_date === date)
}

export async function openRedFlags() {
  const all = await db.list('red_flags', { desc: true })
  return all.filter((r) => !r.resolved_at)
}

export async function cycleDates(): Promise<string[]> {
  const all = await db.list('cycle_events')
  return all.filter((r) => r.kind === 'period_start').map((r) => String(r.event_date))
}
