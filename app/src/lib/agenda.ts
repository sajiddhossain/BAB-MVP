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
 */

export type Kind = 'training' | 'pe' | 'other'

export type Entry = {
  id: string
  weekday: number            // 1 = lunedì, ISO
  kind: Kind
  start_time: string | null
  duration_min: number | null
}

export function entriesOf(rows: Record<string, unknown>[], kind: Kind): Entry[] {
  return rows
    .filter((r) => r.kind === kind)
    .map((r) => ({
      id: String(r.id),
      weekday: Number(r.weekday),
      kind: r.kind as Kind,
      start_time: (r.start_time as string | null) ?? null,
      duration_min: (r.duration_min as number | null) ?? null,
    }))
    .sort((a, b) => a.weekday - b.weekday)
}

/**
 * Porta i giorni di un tipo a coincidere con quelli scelti.
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
): Promise<void> {
  const rows = await listSchedule()
  const current = entriesOf(rows, kind)
  const wanted = new Set(days)

  for (const e of current) {
    if (!wanted.has(e.weekday)) await removeSchedule(e.id)
    else if (kind === 'training' && (e.start_time ?? null) !== (time ?? null)) {
      await updateSchedule(e.id, { start_time: time })
    }
  }

  const have = new Set(current.map((e) => e.weekday))
  const added = days.filter((d) => !have.has(d))
  if (added.length > 0) {
    await saveSchedule(added.map((weekday) => ({
      athlete_id: athleteId, weekday, kind,
      start_time: kind === 'training' ? time : null,
    })))
  }
}

/** L'orario che c'è già, per riempire il campo senza inventarlo. */
export function timeOf(entries: Entry[]): string {
  return entries.find((e) => e.start_time)?.start_time ?? ''
}
