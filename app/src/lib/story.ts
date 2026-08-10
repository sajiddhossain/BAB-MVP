import { lastDays, type Row } from './insights'
import type { TempoCode } from '@/content/tempo'
import type { RegionCode } from '@/content/bodymap'

/**
 * I dati della body-story — l'output "Communicate" del §11.
 *
 * 🔴 Qui non si inventa niente. La card mostra SOLO quello che lei ha già
 * scritto nei check-in: se una settimana è vuota, la card è vuota. Riempire i
 * buchi con una media o una stima trasformerebbe una prova in un'illustrazione,
 * e questa card serve a farsi credere da un adulto.
 */

export type Week = {
  days: string[]
  /** L'andatura di ogni giorno, `null` dove non si è allenata o non ha chiuso. */
  tempos: (TempoCode | null)[]
  /** Energia 1–5 per giorno, per la linea. `null` dove manca. */
  energy: (number | null)[]
  /** I punti più ricorrenti, al massimo tre. */
  spots: { region: RegionCode; sensation: string; times: number }[]
  /** L'ultima cosa che ha scritto con parole sue, se c'è. */
  note: string | null
}

export function buildWeek(checkIns: Row[], signals: Row[]): Week {
  const days = lastDays(7)

  const tempoOf = (day: string): TempoCode | null => {
    const ofDay = checkIns.filter((r) => r.local_date === day)
    // Vale l'andatura in cui si è allenata DAVVERO; il pre è il ripiego.
    const post = ofDay.find((r) => r.kind === 'post' && r.tempo_chosen)
    const pre = ofDay.find((r) => r.kind === 'pre' && r.tempo_chosen)
    return ((post ?? pre)?.tempo_chosen as TempoCode) ?? null
  }

  const energyOf = (day: string): number | null => {
    const r = checkIns.find((x) => x.local_date === day && x.kind === 'pre' && x.energy != null)
    return (r?.energy as number) ?? null
  }

  // I punti che tornano: si contano le coppie zona+sensazione della settimana.
  const from = days[0]
  const counts = new Map<string, number>()
  for (const s of signals) {
    const when = String(s.created_at ?? '').slice(0, 10)
    if (when && when < from) continue
    const key = `${s.region}|${s.sensation}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const spots = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, times]) => {
      const [region, sensation] = key.split('|')
      return { region: region as RegionCode, sensation, times }
    })

  const noteRow = checkIns.find(
    (r) => r.kind === 'post' && typeof r.note === 'string' && (r.note as string).trim(),
  )

  return {
    days,
    tempos: days.map(tempoOf),
    energy: days.map(energyOf),
    spots,
    note: noteRow ? String(noteRow.note).trim() : null,
  }
}

export type BlockCode = 'tempos' | 'spots' | 'energy' | 'note' | 'cycle'

/**
 * 🔴 Il ciclo NON è in questo elenco, ed è deliberato: i blocchi accesi di
 * default sono questi, e il ciclo si accende solo a mano, ogni volta.
 */
export const DEFAULT_BLOCKS: BlockCode[] = ['tempos', 'spots', 'energy']

/** Vero se il blocco ha davvero qualcosa da mostrare. */
export function hasContent(week: Week, block: BlockCode, phase: string | null): boolean {
  if (block === 'tempos') return week.tempos.some(Boolean)
  if (block === 'energy') return week.energy.some((e) => e !== null)
  if (block === 'spots') return week.spots.length > 0
  if (block === 'note') return week.note !== null
  return phase !== null
}
