import type { RegionCode } from '@/content/bodymap'
import { localDate } from './repo'

/**
 * Rileggere la mappa corporea.
 *
 * 🔴 Finora la mappa era solo un ingresso: lei ci segnava sopra ogni giorno e
 * non le tornava mai indietro niente. Un polpaccio che si fa vivo quattro volte
 * in tre settimane è esattamente il tipo di cosa che un corpo dice piano e che
 * nessuno sente — ed è il motivo per cui questo prodotto esiste.
 *
 * §7 vale anche qui: nessun punteggio, nessuna soglia, nessun verdetto. Si
 * contano le volte e si dicono le parole che ha usato lei. «Quattro volte, e
 * tre le hai chiamate fitta» è un fatto; «zona a rischio» sarebbe una diagnosi.
 */

export type Signal = {
  id?: string
  region: string
  region_free?: string | null
  sensation: string
  intensity?: number | null
  behaviour?: string | null
  is_red_flag?: boolean
  created_at?: string | null
}

export type Spot = {
  region: RegionCode
  times: number
  flagged: number
  /** Il giorno più recente in cui l'ha segnata, in formato locale. */
  last: string | null
  /** Le parole che ha usato lì, dalla più frequente. */
  words: { sensation: string; times: number }[]
  /** Le voci, dalla più recente. */
  entries: Signal[]
}

export type History = {
  spots: Spot[]
  /** Il massimo delle volte: serve a normalizzare la tinta della figura. */
  peak: number
  total: number
  /**
   * Righe senza data. Restano fuori dalle finestre perché non si possono
   * collocare nel tempo — ma si contano e si dicono, invece di sparire.
   * Succede solo con righe scritte da una versione dell'app precedente a
   * quella che mette `created_at` sul telefono (vedi `repo.stamp`).
   */
  undated: number
}

export const WINDOWS = [30, 90] as const
export type Window = (typeof WINDOWS)[number]

/** Il giorno dell'atleta, non quello dell'orologio: la regola delle 4 vale qui. */
export function dayOf(s: Signal): string | null {
  if (!s.created_at) return null
  const d = new Date(s.created_at)
  return Number.isNaN(d.getTime()) ? null : localDate(d)
}

/** Quanti giorni fa, contati per GIORNI e non per ore: «ieri» non è «22 ore fa». */
export function daysAgo(day: string, now: Date = new Date()): number {
  const a = new Date(`${day}T12:00:00`)
  const b = new Date(`${localDate(now)}T12:00:00`)
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

export function summarise(
  signals: Signal[], window: Window, now: Date = new Date(),
): History {
  const inside: Signal[] = []
  let undated = 0

  for (const s of signals) {
    const day = dayOf(s)
    if (!day) { undated++; continue }
    if (daysAgo(day, now) < window) inside.push(s)
  }

  const by = new Map<string, Signal[]>()
  for (const s of inside) {
    const list = by.get(s.region)
    if (list) list.push(s)
    else by.set(s.region, [s])
  }

  const spots: Spot[] = [...by.entries()].map(([region, entries]) => {
    const sorted = [...entries].sort((a, b) => (dayOf(b) ?? '').localeCompare(dayOf(a) ?? ''))
    const counts = new Map<string, number>()
    for (const e of entries) counts.set(e.sensation, (counts.get(e.sensation) ?? 0) + 1)
    return {
      region: region as RegionCode,
      times: entries.length,
      flagged: entries.filter((e) => e.is_red_flag).length,
      last: dayOf(sorted[0]!) ?? null,
      words: [...counts.entries()]
        .map(([sensation, times]) => ({ sensation, times }))
        .sort((a, b) => b.times - a.times || a.sensation.localeCompare(b.sensation)),
      entries: sorted,
    }
  })

  // Dalla più segnata alla meno, e a parità la più recente prima.
  spots.sort((a, b) => b.times - a.times || (b.last ?? '').localeCompare(a.last ?? ''))

  return {
    spots,
    peak: spots[0]?.times ?? 0,
    total: inside.length,
    undated,
  }
}

/**
 * La tinta per ogni zona, da 0 a 1.
 *
 * 🔴 Normalizzata sul suo massimo, non su una soglia fissa. Una soglia dice
 * «cinque volte è tanto», che è un giudizio clinico che nessuno qui è in grado
 * di firmare; il massimo dice soltanto «questa è la zona che torna di più fra
 * le tue», che è aritmetica.
 */
export function heatOf(h: History): Partial<Record<RegionCode, number>> {
  if (h.peak === 0) return {}
  const out: Partial<Record<RegionCode, number>> = {}
  for (const s of h.spots) out[s.region] = s.times / h.peak
  return out
}
