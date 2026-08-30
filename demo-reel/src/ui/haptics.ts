/**
 * Il colpetto sotto il dito.
 *
 * Su Android e' quello che separa un'app da una pagina web: senza, il tocco
 * l'hai solo visto, non sentito. iOS Safari non espone `vibrate`, quindi li'
 * non succede niente — nessun ripiego, un finto feedback e' peggio del nulla.
 */
export function buzz(ms = 6) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* alcuni contesti la bloccano: non e' un errore, e' una feature assente */
  }
}
