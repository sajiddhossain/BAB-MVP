import {
  listSchedule, removeSchedule, saveSchedule, updateSchedule,
} from './repo'

/**
 * L'agenda della settimana: quali giorni si allena, quali fa educazione
 * fisica, e quando gareggia.
 *
 * Non è un dato in più: è quello che permette a BAB di chiedere il check-in
 * nel giorno giusto, e di sapere che il lunedì il carico c'era anche se lei
 * non l'ha scritto. Sbagliata, è peggio che assente — sposta le domande nei
 * giorni in cui non serve niente.
 *
 * R3-bis: con più sport, un allenamento non è più identificato solo dal
 * `kind` ma dalla coppia `(kind, sport)` — 'pe' e 'other' non hanno sport,
 * quindi restano identificati dal solo `kind` come prima.
 */

export type Kind = 'training' | 'pe' | 'other'

export type Entry = {
  id: string
  weekday: number            // 1 = lunedì, ISO
  kind: Kind
  sport: string | null
  start_time: string | null
  duration_min: number | null
}

export function entriesOf(rows: Record<string, unknown>[], kind: Kind, sport?: string | null): Entry[] {
  return rows
    .filter((r) => r.kind === kind && (sport === undefined || (r.sport ?? null) === sport))
    .map((r) => ({
      id: String(r.id),
      weekday: Number(r.weekday),
      kind: r.kind as Kind,
      sport: (r.sport as string | null) ?? null,
      start_time: (r.start_time as string | null) ?? null,
      duration_min: (r.duration_min as number | null) ?? null,
    }))
    .sort((a, b) => a.weekday - b.weekday)
}

/** Gli sport distinti già presenti in agenda per un `kind` — per l'indice. */
export function sportsOf(rows: Record<string, unknown>[], kind: Kind): string[] {
  return [...new Set(entriesOf(rows, kind).map((e) => e.sport).filter((s): s is string => !!s))]
}

/**
 * Porta i giorni di un tipo (e, per 'training', di uno sport) a coincidere
 * con quelli scelti.
 *
 * 🔴 Diffo, non ricreo. Cancellare tutto e riscrivere sarebbe due righe in meno
 * qui e un disastro altrove: ogni riga ha un `id` che è la sua identità, e
 * rifarla da capo per cambiare l'orario del giovedì significherebbe mandare al
 * server sette cancellazioni e sette inserimenti ogni volta che tocca qualcosa
 * — su una connessione che spesso non c'è, e con la coda che li tiene tutti.
 *
 * Quindi: i giorni tolti si cancellano, quelli nuovi si inseriscono, e quelli
 * che restano al massimo cambiano orario.
 */
export async function setDays(
  athleteId: string,
  kind: Kind,
  days: number[],
  time: string | null = null,
  sport: string | null = null,
  durationMin: number | null = null,
): Promise<void> {
  const rows = await listSchedule()
  const current = entriesOf(rows, kind, kind === 'training' ? sport : undefined)
  const wanted = new Set(days)

  for (const e of current) {
    if (!wanted.has(e.weekday)) await removeSchedule(e.id)
    else if (kind === 'training' && ((e.start_time ?? null) !== (time ?? null) || (e.duration_min ?? null) !== (durationMin ?? null))) {
      await updateSchedule(e.id, { start_time: time, duration_min: durationMin })
    }
  }

  const have = new Set(current.map((e) => e.weekday))
  const added = days.filter((d) => !have.has(d))
  if (added.length > 0) {
    await saveSchedule(added.map((weekday) => ({
      athlete_id: athleteId, weekday, kind,
      sport: kind === 'training' ? sport : null,
      start_time: kind === 'training' ? time : null,
      duration_min: kind === 'training' ? durationMin : null,
    })))
  }
}

/** L'orario che c'è già, per riempire il campo senza inventarlo. */
export function timeOf(entries: Entry[]): string {
  return entries.find((e) => e.start_time)?.start_time ?? ''
}

/** L'orario di fine, ricostruito dalla durata — anche quello senza inventarlo. */
export function endTimeOf(entries: Entry[]): string {
  const e = entries.find((e) => e.start_time && e.duration_min)
  if (!e?.start_time || !e.duration_min) return ''
  const [h, m] = e.start_time.split(':').map(Number)
  const total = (h * 60 + m + e.duration_min) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Minuti fra due orari "HH:MM". `null` se manca un pezzo. */
export function minutesBetween(start: string, end: string): number | null {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null
  const diff = (eh * 60 + em) - (sh * 60 + sm)
  return diff > 0 ? diff : diff + 24 * 60
}
