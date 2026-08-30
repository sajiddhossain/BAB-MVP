/**
 * Il bottone principale. L'ombra e' sfalsata solo in basso di 6px
 * (nel frame l'ombra sta a top+6, il corpo a top+0).
 */
import { Touchable } from './Touchable'
import { useNav } from '../../proto/nav'

export function CtaButton({
  label,
  left,
  top,
  width,
  height = 56,
  labelTop = 16.5,
  shadowTop = 6,
  labelColor = 'var(--bab-ink-max)',
  shadowInsetX = 0,
  shadowOnTop = false,
  labelWidth,
  labelCenter,
  enabled = true,
  onTap,
}: {
  label: string
  left: number
  top: number
  width: number
  height?: number
  /** Figma non lo tiene costante fra schermi: 16.5 su alcuni, 15.5 su altri. */
  labelTop?: number
  /** nemmeno l'ombra: 6px sui check-in, 4px sui check-out */
  shadowTop?: number
  labelColor?: string
  /** su checkout-4 l'ombra deborda di 3px per lato */
  shadowInsetX?: number
  /** e sta SOPRA il bottone nell'ordine di Figma, non sotto */
  shadowOnTop?: boolean
  /**
   * Figma centra l'etichetta in una scatola che non coincide sempre col bottone
   * (su checkout-4 e' larga 354 dentro un bottone da 342, centrata a 175.5).
   * Centrarla sul bottone la sposta di 5px.
   */
  labelWidth?: number
  labelCenter?: number
  /**
   * false = la domanda non ha ancora risposta. Il bottone si spegne e non porta
   * avanti. Va usato solo dove il frame Figma MOSTRA una risposta data: dove il
   * frame e' gia' senza risposta e col bottone acceso (checkout-1a) spegnerlo
   * vorrebbe dire allontanarsi dal disegno, non avvicinarsi.
   */
  enabled?: boolean
  /** per chi non va semplicemente "allo schermo dopo" (vedi la body map) */
  onTap?: () => void
}) {
  const lw = labelWidth ?? width
  const lc = labelCenter ?? width / 2
  const nav = useNav()
  const live = enabled && !!nav
  const shadow = (
    <div
      className="absolute"
      style={{
        left: -shadowInsetX,
        top: shadowTop,
        width: width + shadowInsetX * 2,
        height,
        borderRadius: 100,
        background: 'var(--bab-shadow)',
      }}
    />
  )
  return (
    <Touchable
      className="absolute"
      data-cta
      style={{ left, top, width, height: height + shadowTop }}
      onTap={live ? (onTap ?? nav.next) : undefined}
      press={live ? 0.975 : 1}
      stop={!!nav}
    >
      {!shadowOnTop && shadow}
      <div
        className="absolute left-0 top-0"
        style={{
          width,
          height,
          borderRadius: 100,
          background: enabled
            ? 'linear-gradient(to right, var(--bab-lime-from), var(--bab-lime-to))'
            : 'var(--bab-surface)',
          border: 'var(--bab-border-w) solid var(--bab-border)',
          boxSizing: 'border-box',
          transition: 'background 220ms ease-out',
        }}
      >
        <p
          className="absolute text-center font-bold"
          style={{
            left: lc - lw / 2,
            top: labelTop,
            width: lw,
            fontSize: 16,
            color: enabled ? labelColor : 'var(--bab-ink-mute)',
            transition: 'color 220ms ease-out',
            lineHeight: 'normal',
            margin: 0,
          }}
        >
          {label}
        </p>
      </div>
      {shadowOnTop && shadow}
    </Touchable>
  )
}
