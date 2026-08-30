import { useState } from 'react'
/**
 * Lo slider a gradiente. Ricorre in rpe, energy, tune-in e nei sensation sheet.
 * Le tacche sono un flex con gap fisso (come in Figma), non uno space-between:
 * cambiarlo sposterebbe "10" di qualche px.
 */
export const SLIDER_GRADIENT =
  'linear-gradient(90deg, rgb(95, 207, 168) 0%, rgb(204, 233, 101) 33%, rgb(245, 200, 122) 66%, rgb(243, 144, 127) 100%)'

/** Corsa utile del pallino: la larghezza meno il pallino stesso. */
export const travel = (width: number, thumbSize = 24) => width - thumbSize

/** Da posizione in px al valore sulla scala, per accendere la tacca giusta. */
export function valueFromThumb(thumbLeft: number, width: number, min: number, max: number, thumbSize = 24) {
  const t = travel(width, thumbSize)
  return Math.round(min + (thumbLeft / t) * (max - min))
}

/** Da valore a posizione in px: usata per agganciare il pallino agli scatti. */
export function thumbFromValue(value: number, width: number, min: number, max: number, thumbSize = 24) {
  return ((value - min) / (max - min)) * travel(width, thumbSize)
}

export function Slider({
  left,
  top,
  width,
  thumbLeft,
  gradient = SLIDER_GRADIENT,
  trackHeight = 10,
  trackTop = 13,
  thumbSize = 24,
  thumbTop = 6,
  onDrag,
  snap,
}: {
  left: number
  top: number
  width: number
  /** posizione assoluta del pallino dentro il contenitore */
  thumbLeft: number
  gradient?: string
  trackHeight?: number
  trackTop?: number
  thumbSize?: number
  thumbTop?: number
  /**
   * Se presente lo slider diventa trascinabile e riporta la nuova posizione in px.
   * Restando in px la posizione di default resta quella esatta di Figma: agganciare
   * subito agli scatti sposterebbe il pallino di un paio di pixel e il diff lo vedrebbe.
   */
  onDrag?: (thumbLeft: number) => void
  /** [min, max] per agganciare agli scatti mentre trascini */
  snap?: [number, number]
}) {
  const max = travel(width, thumbSize)
  // il pallino cresce mentre lo tieni: e' il modo di dire "l'ho preso io"
  // senza scrivercelo. A riposo niente transform, cosi' il diff non cambia.
  const [grab, setGrab] = useState(false)

  const move = (e: React.PointerEvent) => {
    if (!onDrag) return
    const track = e.currentTarget.getBoundingClientRect()
    // lo stage e' scalato per riempire il telefono: riportiamo i px a scala 1
    const k = track.width / width
    let x = (e.clientX - track.left) / k - thumbSize / 2
    x = Math.max(0, Math.min(max, x))
    if (snap) {
      const v = valueFromThumb(x, width, snap[0], snap[1], thumbSize)
      x = thumbFromValue(v, width, snap[0], snap[1], thumbSize)
    }
    onDrag(x)
  }

  return (
    <div
      className="absolute"
      style={{ left, top, width, height: 36, touchAction: onDrag ? 'none' : undefined }}
      onPointerDown={
        onDrag
          ? (e) => {
              e.stopPropagation()
              e.currentTarget.setPointerCapture(e.pointerId)
              setGrab(true)
              move(e)
            }
          : undefined
      }
      onPointerMove={onDrag ? (e) => e.currentTarget.hasPointerCapture(e.pointerId) && move(e) : undefined}
      onPointerUp={onDrag ? (e) => { e.stopPropagation(); setGrab(false) } : undefined}
      onPointerCancel={onDrag ? () => setGrab(false) : undefined}
    >
      <div
        className="absolute left-0"
        style={{ top: trackTop, width, height: trackHeight, borderRadius: 99, backgroundImage: gradient }}
      />
      <div
        className="absolute"
        style={{
          left: thumbLeft,
          top: thumbTop,
          transform: grab ? 'scale(1.22)' : undefined,
          transition:
            'left 90ms ease-out, transform 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 220ms ease-out',
          width: thumbSize,
          height: thumbSize,
          borderRadius: thumbSize / 2,
          background: 'var(--bab-surface)',
          border: '3px solid var(--bab-ink)',
          boxSizing: 'border-box',
          boxShadow: grab ? '0px 5px 14px 0px rgba(0,0,0,0.26)' : '0px 2px 6px 0px rgba(0,0,0,0.16)',
        }}
      />
    </div>
  )
}

export function SliderTicks({
  left,
  top,
  width,
  ticks,
  active,
  gap,
  fontSize = 11,
}: {
  left: number
  top: number
  width: number
  ticks: string[]
  active: string
  /** con gap le tacche sono spaziate fisse; senza, distribuite (justify-between) */
  gap?: number
  fontSize?: number
}) {
  return (
    <div
      className="absolute flex items-start"
      style={{
        left,
        top,
        width,
        gap,
        justifyContent: gap === undefined ? 'space-between' : undefined,
        fontSize,
        lineHeight: 'normal',
      }}
    >
      {ticks.map((t) => (
        <p
          key={t}
          className="shrink-0 whitespace-nowrap font-bold"
          style={{ margin: 0, color: t === active ? 'var(--bab-ink)' : '#b0aca5' }}
        >
          {t}
        </p>
      ))}
    </div>
  )
}

export function SliderEnds({
  top,
  leftLabel,
  rightLabel,
  leftX,
  rightX,
  fontSize = 11,
}: {
  top: number
  leftLabel: string
  rightLabel: string
  leftX: number
  /** bordo destro dell'etichetta, non il suo inizio */
  rightX: number
  fontSize?: number
}) {
  const style = {
    fontSize,
    lineHeight: 'normal',
    color: '#9a968f',
    margin: 0,
    whiteSpace: 'nowrap' as const,
  }
  return (
    <>
      <p className="absolute" style={{ left: leftX, top, ...style }}>
        {leftLabel}
      </p>
      <p className="absolute text-right" style={{ left: rightX - 100, width: 100, top, ...style }}>
        {rightLabel}
      </p>
    </>
  )
}
