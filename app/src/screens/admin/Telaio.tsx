import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

/**
 * La cornice che hanno tutte le stanze del pannello, tranne l'atrio.
 *
 * Una riga sola in cima: da dove sei venuta, dove sei, e quello che questa
 * stanza vuole avere a portata di mano. Serve a una cosa che prima non
 * c'era: da qualunque punto del pannello si torna indietro senza scrivere
 * l'indirizzo a mano e senza il tasto del browser.
 *
 * Il nome della stanza non e' un titolo grosso in mezzo alla pagina: le
 * stanze sono piene di roba, e un'intestazione alta trenta pixel per dire
 * una parola che si sa gia' e' spazio tolto a quello che si guarda.
 */
export function Telaio({
  nome,
  sotto,
  destra,
  scorre = true,
  children,
}: {
  nome: string
  /** una riga che dice a cosa serve questa stanza, se non e' ovvio */
  sotto?: string
  /** i bottoni di questa stanza: stanno nella stessa riga, in fondo */
  destra?: ReactNode
  /**
   * se la stanza si scorre tutta insieme. Le scritte no: dentro hanno tre
   * colonne che si scorrono per conto loro, e una pagina che si scorre
   * intera le farebbe uscire dallo schermo tutte e tre.
   */
  scorre?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex h-dvh flex-col bg-paper text-ink">
      <header className="flex shrink-0 items-center gap-3 border-b border-line bg-surface px-4 py-[10px]">
        <Link
          to="/admin"
          className="bab-tocco shrink-0 rounded-pill border border-line bg-chip px-3 py-[5px] text-[12px] font-bold text-ink-medio no-underline"
        >
          ← Pannello
        </Link>
        <p className="m-0 shrink-0 text-[14px] font-bold">{nome}</p>
        {sotto && (
          <p className="m-0 min-w-0 flex-1 truncate text-[12px] text-ink-medio">{sotto}</p>
        )}
        {!sotto && <span className="min-w-0 flex-1" />}
        {destra}
      </header>
      {scorre ? (
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      ) : (
        <div className="flex min-h-0 flex-1">{children}</div>
      )}
    </div>
  )
}
