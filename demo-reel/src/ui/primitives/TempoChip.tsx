import { Touchable } from './Touchable'

export type ChipTone = 'plain' | 'amber-fill' | 'amber-line' | 'thick'

/**
 * Il chip Upbeat/Steady/Gentle. Le coordinate dell'icona NON sono costanti fra
 * schermi (checkin-1 la mette a 10px e 16px, checkout-1a a 8px e 18px), quindi
 * sono parametri e non valori dentro il componente.
 */
export function TempoChip({
  left,
  label,
  icon,
  iconSize,
  iconLeft,
  iconTop,
  labelLeft,
  labelTop = 32.5,
  tone = 'plain',
  width = 110,
  height = 62,
  shadow,
  labelColor,
  onTap,
}: {
  left: number
  label: string
  icon: string
  iconSize: number
  iconLeft: number
  iconTop: number
  /** se assente il testo e' centrato */
  labelLeft?: number
  labelTop?: number
  tone?: ChipTone
  width?: number
  height?: number
  /** l'ombra non segue sempre il tono: nello stato "rivelato" sono disaccoppiati */
  shadow?: string
  labelColor?: string
  onTap?: () => void
}) {
  const border =
    tone === 'amber-fill'
      ? '2px solid var(--bab-amber-line)'
      : tone === 'amber-line'
        ? 'var(--bab-border-w) solid var(--bab-amber-line)'
        : tone === 'thick'
          ? '2px solid var(--bab-border)'
          : 'var(--bab-border-w) solid var(--bab-border)'

  return (
    <Touchable
      className="absolute top-0"
      style={{ left, width, height }}
      onTap={onTap}
      press={onTap ? 0.95 : 1}
      stop={!!onTap}
    >
      <div
        className="absolute"
        style={{
          left: 4,
          top: 4,
          width,
          height,
          borderRadius: 16,
          background: shadow ?? (tone === 'amber-fill' ? 'var(--bab-amber-shadow)' : 'var(--bab-shadow)'),
        }}
      />
      <div
        className="absolute left-0 top-0"
        style={{
          width,
          height,
          borderRadius: 16,
          boxSizing: 'border-box',
          background: tone === 'amber-fill' ? 'var(--bab-amber-bg)' : 'var(--bab-surface)',
          border,
        }}
      >
        <img
          src={icon}
          alt=""
          className="absolute"
          style={{ left: iconLeft, top: iconTop, width: iconSize, height: iconSize }}
        />
        <p
          className="bab-font-ui absolute font-bold"
          style={{
            left: labelLeft ?? 0,
            top: labelTop,
            width: labelLeft === undefined ? width : undefined,
            textAlign: labelLeft === undefined ? 'center' : undefined,
            whiteSpace: 'nowrap',
            fontSize: 13,
            lineHeight: 'normal',
            margin: 0,
            color: labelColor ?? (tone === 'amber-fill' ? 'var(--bab-ink-strong)' : 'var(--bab-ink)'),
          }}
        >
          {label}
        </p>
      </div>
    </Touchable>
  )
}
