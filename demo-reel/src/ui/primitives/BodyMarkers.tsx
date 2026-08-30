import { Touchable } from './Touchable'

export type Marker = { x: number; y: number }

/**
 * I punti che aggiungi toccando il corpo.
 *
 * Le macchie rosse del disegno sono dipinte dentro il raster e non si possono
 * accendere una a una: questi sono segni nostri sopra la figura. Diversi
 * graficamente, ma e' il tap che conta.
 */
export function BodyMarkers({
  left,
  top,
  width,
  height,
  markers,
  onAdd,
}: {
  left: number
  top: number
  width: number
  height: number
  markers: readonly Marker[]
  onAdd: (m: Marker) => void
}) {
  return (
    <Touchable
      className="absolute"
      press={1}
      style={{ left, top, width, height }}
      onTap={undefined}
    >
      <div
        className="absolute inset-0"
        onPointerUp={(e) => {
          e.stopPropagation()
          const box = e.currentTarget.getBoundingClientRect()
          const k = box.width / width
          onAdd({ x: (e.clientX - box.left) / k, y: (e.clientY - box.top) / k })
        }}
      >
        {markers.map((m, i) => (
          <span
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: m.x - 13,
              top: m.y - 13,
              width: 26,
              height: 26,
              background: 'rgba(236,106,94,0.35)',
              border: '2px solid #ec6a5e',
              animation: 'bab-pop 320ms cubic-bezier(0.32,1.6,0.4,1)',
            }}
          />
        ))}
      </div>
    </Touchable>
  )
}
