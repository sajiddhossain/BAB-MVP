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

/** Un `HH:MM` in minuti da mezzanotte. Torna `null` per qualunque altra cosa. */
export function minutiDaOra(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm)
  if (!m) return null
  const ore = Number(m[1])
  const min = Number(m[2])
  if (ore > 23 || min > 59) return null
  return ore * 60 + min
}

/** Minuti da mezzanotte a `HH:MM`. */
export function oraDaMinuti(minuti: number): string {
  const m = ((minuti % 1440) + 1440) % 1440
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(m / 60))}:${p(m % 60)}`
}

/**
 * Quanto dura un allenamento che va da `inizio` a `fine`, in minuti.
 *
 * Se la fine e' prima dell'inizio si e' passata la mezzanotte — succede a chi
 * si allena tardi la sera — e si conta il giro. Il risultato sta fra i
 * quindici minuti e le cinque ore perche' e' quello che lo schema accetta
 * (`duration_min`, vedi `athlete_schedule`): fuori di li' e' piu' probabile
 * un dito storto sulla rotella che un allenamento vero, e comunque una riga
 * rifiutata dal database farebbe fallire tutto il salvataggio.
 */
export function durataInMinuti(inizio: string, fine: string): number | null {
  const a = minutiDaOra(inizio)
  const b = minutiDaOra(fine)
  if (a === null || b === null) return null
  const d = b > a ? b - a : b + 1440 - a
  return Math.min(300, Math.max(15, d))
}
