import { forwardRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { buzz } from '../haptics'

/**
 * Zona toccabile.
 *
 * Ferma la propagazione: senza, il tocco arriverebbe anche allo stage del
 * prototipo, che avanza allo schermo dopo. Toccare un chip lo selezionerebbe
 * E cambierebbe pagina.
 *
 * `press` da il feedback tattile (leggero affondamento): senza, il tocco
 * funziona ma non sembra che stia succedendo niente.
 */
export const Touchable = forwardRef<HTMLDivElement, {
  children?: ReactNode
  onTap?: () => void
  style?: CSSProperties
  className?: string
  /** scala a cui scende mentre e' premuto; 1 per disattivare */
  press?: number
  /** false per lasciar passare il tocco allo stage (avanza di schermo) */
  stop?: boolean
  /** attributi passanti: serve a data-cta, il gancio dei test */
  'data-cta'?: boolean
}>(function Touchable(
  { children, onTap, style, className = '', press = 0.97, stop = true, ...rest },
  ref,
) {
  const [down, setDown] = useState(false)

  return (
    <div
      ref={ref}
      {...rest}
      className={`bab-touch ${className}`.trim()}
      style={{
        ...style,
        /*
         * A riposo NIENTE transform, nemmeno scale(1): un transform crea un
         * livello a se' e cambia di un filo l'antialiasing del testo, che sul
         * diff contro Figma si vede.
         */
        transform: down ? `${style?.transform ?? ''} scale(${press})`.trim() : style?.transform,
        // affonda svelto, risale con un rimbalzo: e' quello che fa sembrare
        // il tocco una cosa fisica invece di un cambio di colore
        transition: `${
          down
            ? 'transform 90ms cubic-bezier(0.4,0,1,1)'
            : 'transform 320ms cubic-bezier(0.34,1.56,0.64,1)'
        }, background-color 180ms ease-out, border-color 180ms ease-out, color 180ms ease-out, filter 180ms ease-out`,
        cursor: onTap ? 'pointer' : undefined,
        touchAction: 'manipulation',
      }}
      onPointerDown={(e) => {
        if (stop) e.stopPropagation()
        setDown(true)
      }}
      onPointerLeave={() => setDown(false)}
      onPointerCancel={() => setDown(false)}
      onPointerUp={(e) => {
        if (stop) e.stopPropagation()
        setDown(false)
        if (onTap) {
          buzz()
          onTap()
        }
      }}
    >
      {children}
    </div>
  )
})
