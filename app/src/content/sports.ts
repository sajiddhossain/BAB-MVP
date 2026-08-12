import type { Locale } from '@/copy'

/**
 * Gli sport fra cui scegliere in onboarding (R3-bis, sport multipli).
 *
 * 🔴 `code` finisce nel database (`athletes.sport`, `athlete_sports.sport`,
 * `athlete_schedule.sport`) e non si cambia mai, stesso motivo di
 * `content/lexicon.ts`. `'other'` è un caso speciale: in UI apre un campo di
 * testo libero, e quello che scrive lei finisce salvato al posto del code.
 */
export type SportCode =
  | 'athletics' | 'volleyball' | 'football' | 'swimming' | 'basketball'
  | 'gymnastics' | 'dance' | 'tennis' | 'handball' | 'martial_arts'
  | 'cycling' | 'skiing' | 'functional' | 'other'

export type Sport = { code: SportCode; label: Record<Locale, string> }

export const SPORTS: Sport[] = [
  { code: 'athletics', label: { it: 'Atletica', en: 'Athletics' } },
  { code: 'volleyball', label: { it: 'Pallavolo', en: 'Volleyball' } },
  { code: 'football', label: { it: 'Calcio', en: 'Football' } },
  { code: 'swimming', label: { it: 'Nuoto', en: 'Swimming' } },
  { code: 'basketball', label: { it: 'Basket', en: 'Basketball' } },
  { code: 'gymnastics', label: { it: 'Ginnastica', en: 'Gymnastics' } },
  { code: 'dance', label: { it: 'Danza', en: 'Dance' } },
  { code: 'tennis', label: { it: 'Tennis', en: 'Tennis' } },
  { code: 'handball', label: { it: 'Pallamano', en: 'Handball' } },
  { code: 'martial_arts', label: { it: 'Arti marziali', en: 'Martial arts' } },
  { code: 'cycling', label: { it: 'Ciclismo', en: 'Cycling' } },
  { code: 'skiing', label: { it: 'Sci', en: 'Skiing' } },
  { code: 'functional', label: { it: 'Hyrox / functional', en: 'Hyrox / functional' } },
  { code: 'other', label: { it: 'Altro', en: 'Other' } },
]

/**
 * Da code a etichetta leggibile. Se non lo trova — è testo libero scritto
 * dietro "Altro", o un valore vecchio da prima che questa lista esistesse —
 * ritorna il valore così com'è: è già leggibile di suo.
 */
export function sportLabel(value: string, locale: Locale): string {
  return SPORTS.find((s) => s.code === value)?.label[locale] ?? value
}

