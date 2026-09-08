import type { ReactNode } from 'react'

/**
 * La scheda bianca con l'ombra dura.
 *
 * L'ombra non e' sfocata: e' un secondo rettangolo identico spostato di 4px
 * in giu' e a destra. E' la stessa firma del bottone principale — la' e' 6px
 * solo in giu' — e con una box-shadow morbida non viene uguale.
 *
 * `piatta` toglie l'ombra: nel disegno alcune schede ce l'hanno e altre no,
 * e la regola e' che ce l'ha chi si puo' toccare. Quelle che spiegano e
 * basta stanno appoggiate.
 */
export function Scheda({
  children,
  piatta = false,
  className = '',
}: {
  children: ReactNode
  piatta?: boolean
  className?: string
}) {
  return (
    <div className="relative">
      {!piatta && (
        <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[22px] bg-black/4" />
      )}
      <div
        className={`relative rounded-[22px] border-[1.5px] border-line bg-surface ${className}`}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * La scheda lilla: quella che non chiede niente e dice solo una cosa.
 *
 * Nel disegno e' sempre l'ultima prima del bottone, ed e' sempre il rimando a
 * un adulto. Il colore la separa da tutto il resto proprio per questo: non e'
 * una domanda, e non e' una risposta di BAB.
 */
export function Nota({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 rounded-chip border-[1.5px] border-lilla-bordo bg-lilla-fondo p-[10px] text-[11px] leading-[1.4] text-lilla-vivo">
      {children}
    </p>
  )
}
