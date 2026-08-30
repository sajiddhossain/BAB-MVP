/**
 * La fila di numeri sotto uno slider.
 * In Figma e' un flex con gap FISSO centrato su un punto, non uno space-between:
 * distribuirli sposterebbe l'1 e il 7 di qualche pixel.
 */
export function TickRow({
  centerX,
  top,
  gap = 41,
  ticks = ['1', '2', '3', '4', '5', '6', '7'],
  fontSize = 11.5,
}: {
  centerX: number
  top: number
  gap?: number
  ticks?: string[]
  fontSize?: number
}) {
  return (
    <div
      className="absolute flex items-center"
      style={{
        left: centerX,
        top,
        transform: 'translateX(-50%)',
        gap,
        fontSize,
        lineHeight: 'normal',
        color: '#b0aca5',
        fontWeight: 700,
      }}
    >
      {ticks.map((t) => (
        <p key={t} className="shrink-0 whitespace-nowrap text-center" style={{ margin: 0 }}>
          {t}
        </p>
      ))}
    </div>
  )
}

/** Etichette agli estremi: in Figma sono centrate su un punto, con larghezza fissa. */
export function EndLabel({
  centerX,
  top,
  width,
  lines,
  lineHeight = 7,
}: {
  centerX: number
  top: number
  width: number
  lines: string[]
  lineHeight?: number
}) {
  return (
    <div
      className="absolute text-center font-bold"
      style={{ left: centerX - width / 2, top, width, fontSize: 7, color: '#9a968f' }}
    >
      {lines.map((l, i) => (
        <p key={i} style={{ margin: 0, lineHeight: `${lineHeight}px` }}>
          {l}
        </p>
      ))}
    </div>
  )
}
