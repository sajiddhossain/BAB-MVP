/**
 * Gli sport proposti nella ricerca.
 *
 * Nel file Figma la lista non c'e': lo schermo mostra solo il campo di
 * ricerca. Questa e' la nostra, tenuta corta e con i nomi comuni — va rivista
 * con chi conosce le societa' con cui parte BAB, non e' un dato di disegno.
 */
export type Sport = { id: string; it: string; en: string }

export const SPORT: Sport[] = [
  { id: 'atletica', it: 'Atletica', en: 'Athletics' },
  { id: 'basket', it: 'Basket', en: 'Basketball' },
  { id: 'calcio', it: 'Calcio', en: 'Football' },
  { id: 'ciclismo', it: 'Ciclismo', en: 'Cycling' },
  { id: 'danza', it: 'Danza', en: 'Dance' },
  { id: 'ginnastica', it: 'Ginnastica', en: 'Gymnastics' },
  { id: 'judo', it: 'Judo', en: 'Judo' },
  { id: 'nuoto', it: 'Nuoto', en: 'Swimming' },
  { id: 'pallamano', it: 'Pallamano', en: 'Handball' },
  { id: 'pallavolo', it: 'Pallavolo', en: 'Volleyball' },
  { id: 'rugby', it: 'Rugby', en: 'Rugby' },
  { id: 'scherma', it: 'Scherma', en: 'Fencing' },
  { id: 'sci', it: 'Sci', en: 'Skiing' },
  { id: 'tennis', it: 'Tennis', en: 'Tennis' },
  { id: 'equitazione', it: 'Equitazione', en: 'Horse riding' },
  { id: 'arrampicata', it: 'Arrampicata', en: 'Climbing' },
  { id: 'corsa', it: 'Corsa', en: 'Running' },
  { id: 'canottaggio', it: 'Canottaggio', en: 'Rowing' },
]

/** Toglie accenti e maiuscole, cosi' "atletica" trova "Atletica". */
export function normalizza(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}
