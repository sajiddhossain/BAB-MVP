/**
 * Chi disegna la tastiera: noi o il sistema.
 *
 * Su un telefono vero la tastiera di iOS c'e' gia' ed e' meglio della nostra:
 * lasciamo fare a lei. Nel video e su computer non esiste nessuna tastiera, e
 * un campo che si illumina senza che salga niente e' la cosa che piu' di tutte
 * dice "questa e' una pagina web". Li' la disegniamo noi.
 *
 * Si decide una volta sola all'avvio: se cambiasse a meta' strada il campo
 * passerebbe da una tastiera all'altra sotto le dita.
 */
let cached: boolean | null = null

export function fakeKeyboard(): boolean {
  if (cached !== null) return cached
  if (typeof window === 'undefined') return (cached = false)
  const q = new URLSearchParams(window.location.search)
  // il probe del diff fotografa schermi a riposo: nessuna tastiera, mai
  if (q.has('probe')) return (cached = false)
  // ?kb=1: la accende comunque, serve ai controlli automatici
  if (q.has('reel') || q.get('kb') === '1') return (cached = true)
  return (cached = navigator.maxTouchPoints === 0)
}
