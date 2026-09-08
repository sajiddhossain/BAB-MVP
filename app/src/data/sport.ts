/**
 * Gli sport proposti nella ricerca.
 *
 * Nel file Figma la lista non c'e': lo schermo mostra solo il campo di
 * ricerca. Questa e' la nostra, tenuta corta e con i nomi comuni — va rivista
 * con chi conosce le societa' con cui parte BAB, non e' un dato di disegno.
 *
 * Qui c'e' solo l'ordine: i nomi stanno in `copy/testi.ts` sotto
 * `sport.nomi`, perche' sono scritte che si leggono a schermo e vanno
 * cambiabili dal pannello come tutte le altre.
 */
export const SPORT: string[] = [
  'atletica',
  'basket',
  'calcio',
  'ciclismo',
  'danza',
  'ginnastica',
  'judo',
  'nuoto',
  'pallamano',
  'pallavolo',
  'rugby',
  'scherma',
  'sci',
  'tennis',
  'equitazione',
  'arrampicata',
  'corsa',
  'canottaggio',
]

/**
 * Il nome visibile di uno sport.
 *
 * Si passa la mappa dei nomi invece di leggerla da soli: e' quella gia'
 * corretta dal pannello, e una lettura diretta dal file compilato salterebbe
 * le correzioni.
 */
export function nomeSport(nomi: Record<string, string>, id: string): string {
  return nomi[id] ?? id
}

/** Toglie accenti e maiuscole, cosi' "atletica" trova "Atletica". */
export function normalizza(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}
