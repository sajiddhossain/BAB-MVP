import type { CSSProperties, ReactNode } from 'react'

/**
 * L'elemento "sollevato" di BAB: un rettangolo pieno sfalsato dietro,
 * piu' il corpo con bordo spesso sopra. Non e' una box-shadow.
 *
 * In Figma l'ombra e' sfalsata in modi diversi a seconda del componente
 * (le card 4px su entrambi gli assi, i bottoni 6px solo in basso),
 * quindi offsetX/offsetY sono espliciti.
 */
export function Raised({
  children,
  width,
  height,
  radius,
  offsetX = 4,
  offsetY = 4,
  shadow = 'var(--bab-shadow)',
  background = 'var(--bab-surface)',
  borderColor = 'var(--bab-border)',
  borderWidth = 'var(--bab-border-w)',
  className = '',
  style,
}: {
  children?: ReactNode
  width: number
  height: number
  radius: number
  offsetX?: number
  offsetY?: number
  shadow?: string
  background?: string
  borderColor?: string
  borderWidth?: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={`relative ${className}`} style={{ width, height, ...style }}>
      <div
        className="absolute"
        style={{
          left: offsetX,
          top: offsetY,
          width,
          height,
          borderRadius: radius,
          background: shadow,
        }}
      />
      <div
        className="absolute left-0 top-0"
        style={{
          width,
          height,
          borderRadius: radius,
          background,
          border: `${borderWidth} solid ${borderColor}`,
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  )
}
