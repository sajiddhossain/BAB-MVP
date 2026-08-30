import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

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
export function Touchable({
  children,
  onTap,
  style,
  className = '',
  press = 0.97,
  stop = true,
}: {
  children?: ReactNode
  onTap?: () => void
  style?: CSSProperties
  className?: string
  /** scala a cui scende mentre e' premuto; 1 per disattivare */
  press?: number
  /** false per lasciar passare il tocco allo stage (avanza di schermo) */
  stop?: boolean
}) {
  const [down, setDown] = useState(false)

  return (
    <div
      className={className}
      style={{
        ...style,
        transform: `${style?.transform ?? ''} scale(${down ? press : 1})`.trim(),
        transition: 'transform 120ms ease-out',
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
        onTap?.()
      }}
    >
      {children}
    </div>
  )
}
