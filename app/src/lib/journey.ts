import { WEEKS, type JourneyWeek, type MissionMetric } from '@/content/journey'
import { localDate } from './repo'

/**
 * Il Percorso — la logica, separata dallo schermo.
 *
 * 🔴 §7 vale anche qui: nessun punteggio, nessuna soglia che giudica. La
 * missione si spunta da sola quando il numero è raggiunto, e basta — non
 * c'è un voto sopra o sotto.
 */

export type CheckIn = {
  local_date?: string | null
  kind?: string | null
  tempo_predicted?: string | null
  school_load?: number | null
}

export type BodySignal = { created_at?: string | null }

export type JourneyRow = { week?: number; completed_at?: string | null; reflection?: string | null }

/** La settimana N va da `start + (N-1)*7gg` a `start + N*7gg`, esclusa. */
export function weekWindow(start: string, week: number): { from: string; to: string } {
  const s = new Date(start)
  const from = new Date(s); from.setDate(from.getDate() + (week - 1) * 7)
  const to = new Date(s); to.setDate(to.getDate() + week * 7)
  return { from: localDate(from), to: localDate(to) }
}

/** In quale settimana siamo oggi, dal giorno in cui è iniziato il percorso — mai sopra l'ultima disponibile. */
export function currentWeek(start: string, today: string = localDate()): number {
  const days = Math.floor((new Date(today).getTime() - new Date(start).getTime()) / 86_400_000)
  const n = Math.floor(days / 7) + 1
  return Math.min(Math.max(n, 1), WEEKS.length)
}

const dayOf = (v: string | null | undefined) => (v ?? '').slice(0, 10)
const inWindow = (d: string, from: string, to: string) => d >= from && d < to

/**
 * Da quando conta la settimana 1. `athletes.created_at` è scritto dal
 * server, non dal client che fa l'onboarding — sul telefono appena entrato
 * potrebbe non esserci ancora. Il primo check-in vero è un ancoraggio che
 * c'è sempre appena inizia a usarla davvero; prima di allora, oggi.
 */
export function journeyStart(checkIns: CheckIn[]): string {
  const dates = checkIns.map((c) => dayOf(c.local_date)).filter(Boolean).sort()
  return dates[0] ?? localDate()
}

/** Quanti giorni distinti, nella finestra della settimana, soddisfano la metrica della missione. */
export function missionProgress(
  week: JourneyWeek, from: string, to: string,
  checkIns: CheckIn[], signals: BodySignal[],
): number {
  const days = new Set<string>()
  const metric: MissionMetric = week.missionMetric
  if (metric === 'checkin') {
    for (const c of checkIns) if (inWindow(dayOf(c.local_date), from, to)) days.add(dayOf(c.local_date))
  } else if (metric === 'predicted') {
    for (const c of checkIns) if (c.tempo_predicted && inWindow(dayOf(c.local_date), from, to)) days.add(dayOf(c.local_date))
  } else if (metric === 'schoolload') {
    for (const c of checkIns) if (c.school_load != null && inWindow(dayOf(c.local_date), from, to)) days.add(dayOf(c.local_date))
  } else if (metric === 'body') {
    for (const s of signals) if (inWindow(dayOf(s.created_at), from, to)) days.add(dayOf(s.created_at))
  }
  return days.size
}

export function weekOf(n: number): JourneyWeek {
  return WEEKS.find((w) => w.week === n) ?? WEEKS[0]!
}

export function progressRowFor(rows: JourneyRow[], week: number): JourneyRow | null {
  return rows.find((r) => r.week === week) ?? null
}
