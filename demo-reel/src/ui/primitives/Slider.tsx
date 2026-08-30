/**
 * Lo slider a gradiente. Ricorre in rpe, energy, tune-in e nei sensation sheet.
 * Le tacche sono un flex con gap fisso (come in Figma), non uno space-between:
 * cambiarlo sposterebbe "10" di qualche px.
 */
export const SLIDER_GRADIENT =
  'linear-gradient(90deg, rgb(95, 207, 168) 0%, rgb(204, 233, 101) 33%, rgb(245, 200, 122) 66%, rgb(243, 144, 127) 100%)'

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
}) {
  return (
    <div className="absolute" style={{ left, top, width, height: 36 }}>
      <div
        className="absolute left-0"
        style={{ top: trackTop, width, height: trackHeight, borderRadius: 99, backgroundImage: gradient }}
      />
      <div
        className="absolute"
        style={{
          left: thumbLeft,
          top: thumbTop,
          width: thumbSize,
          height: thumbSize,
          borderRadius: thumbSize / 2,
          background: 'var(--bab-surface)',
          border: '3px solid var(--bab-ink)',
          boxSizing: 'border-box',
          boxShadow: '0px 2px 6px 0px rgba(0,0,0,0.16)',
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
