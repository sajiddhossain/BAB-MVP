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

/* ── Profilo, consensi, calendario ───────────────────────────────────────── */

export type AthleteDraft = {
  id: string
  display_name: string
  birth_date: string
  sport?: string | null
  cycle_status: 'tracking' | 'not_yet' | 'undisclosed'
  contraception: 'natural' | 'hormonal' | 'unsure' | 'undisclosed'
  locale: string
  timezone?: string | null
}

/**
 * ⚠️ La coda sincronizza INSERIMENTI. Per il profilo va bene la prima volta —
 * l'onboarding — ma un aggiornamento dalle impostazioni verrebbe rifiutato come
 * duplicato e archiviato in silenzio. Quando arriveranno le impostazioni serve
 * un percorso di update vero, non questo.
 */
export async function saveProfile(a: AthleteDraft): Promise<void> {
  await db.put('athletes', a.id, a, a.id)
  void flush()
}

export async function getProfile(id: string) {
  return db.get('athletes', id)
}

/**
 * 🔴 Il consenso si salva con la VERSIONE del testo accettato. Se domani il
 * testo legale cambia, serve sapere chi ha detto sì a quale versione — senza,
 * il consenso di ieri non prova niente su quello che c'è scritto oggi.
 */
export async function saveConsent(
  athleteId: string, kind: 'athlete' | 'guardian' | 'research',
  textVersion: string, granted: boolean,
): Promise<void> {
  const id = newId()
  await db.put('consents', id, {
    athlete_id: athleteId, kind, text_version: textVersion, granted,
    granted_at: new Date().toISOString(),
  }, `${new Date().toISOString()}:${id}`)
  void flush()
}

export type ScheduleEntry = {
  athlete_id: string
  weekday: number            // 1 = lunedì, ISO
  kind: 'pe' | 'training' | 'other'
  start_time?: string | null
  duration_min?: number | null
}

export async function saveSchedule(entries: ScheduleEntry[]): Promise<void> {
  for (const e of entries) {
    const id = newId()
    await db.put('athlete_schedule', id, e, `${e.weekday}:${e.kind}:${id}`)
  }
  void flush()
}

export async function saveAthleteEvent(
  athleteId: string, date: string, kind: 'match' | 'competition' | 'other', title?: string,
): Promise<void> {
  const id = newId()
  await db.put('athlete_events', id, {
    athlete_id: athleteId, event_date: date, kind, title: title ?? null,
  }, `${date}:${id}`)
  void flush()
}
