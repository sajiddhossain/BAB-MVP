import type { Lingua } from './lingua'

/**
 * L'ora come la scrive chi legge.
 *
 * In Figma l'italiano dice "17:30" e l'inglese "5:30pm": non e' una svista,
 * sono due modi diversi di leggere l'orologio, e scriverne uno solo farebbe
 * sembrare la app tradotta a meta'.
 */
export function ora(ore: number, minuti: number, lingua: Lingua): string {
  const mm = String(minuti).padStart(2, '0')
  if (lingua === 'it') return `${String(ore).padStart(2, '0')}:${mm}`
  const dodici = ore % 12 === 0 ? 12 : ore % 12
  return `${dodici}:${mm}${ore < 12 ? 'am' : 'pm'}`
}

/** Come sopra, partendo da "17:30". */
export function oraDaTesto(hhmm: string, lingua: Lingua): string {
  const [h, m] = hhmm.split(':').map(Number)
  return Number.isFinite(h) && Number.isFinite(m) ? ora(h, m, lingua) : hhmm
}
