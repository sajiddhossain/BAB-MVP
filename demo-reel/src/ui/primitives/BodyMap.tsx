import { useRef } from 'react'
import { FRONT_ZONES, BACK_ZONES, FRONT_INK, BACK_INK, BODY_SIZE } from '../bodyZones'
import type { BodyZone } from '../bodyZones'
import lineArt from '../assets/bodymap/body-map.svg'

const MARK = '#ec6a5e'

/** Quanto lontano dal baricentro accettiamo un tocco che non centra nessuna zona. */
const NEAR = 46

export type Side = 'Front' | 'Back'

export function zonesFor(side: Side) {
  return side === 'Back' ? BACK_ZONES : FRONT_ZONES
}

export function labelOf(side: Side, id: string | null) {
  return zonesFor(side).find((z) => z.id === id)?.label ?? null
}

/**
 * La figura umana interattiva.
 *
 * Il disegno di partenza e' un path unico: le zone non ci sono. Sono estratte
 * da tools/extract-zones.py riempiendo le aree chiuse dalle linee, quindi i
 * contorni combaciano col tratto invece di stargli vicino.
 *
 * Il tratto originale sta SOPRA le zone come <image>: le campiture restano
 * dentro le linee e le linee restano nitide. Stesso viewBox, quindi combacia
 * senza doverlo allineare a mano.
 */
export function BodyMap({
  centerX,
  top,
  height,
  side,
  selected,
  onPick,
}: {
  /** asse verticale della figura: e' su quello che il disegno e' simmetrico */
  centerX: number
  top: number
  /** altezza della figura DI FRONTE. Di spalle le braccia sono piu' larghe:
      la larghezza cambia, la scala no, cosi' il corpo non cresce cambiando lato */
  height: number
  side: Side
  selected: readonly string[]
  onPick: (zone: BodyZone) => void
}) {
  const svg = useRef<SVGSVGElement>(null)
  const paths = useRef(new Map<string, SVGPathElement>())
  const down = useRef<{ x: number; y: number } | null>(null)
  const zones = zonesFor(side)
  const ink = side === 'Back' ? BACK_INK : FRONT_INK
  const k = height / FRONT_INK[3]
  const box = { width: ink[2] * k, height: ink[3] * k }

  /** Tocco -> zona, nello spazio del viewBox. */
  const hit = (e: React.PointerEvent): BodyZone | null => {
    const el = svg.current
    const ctm = el?.getScreenCTM()
    if (!el || !ctm) return null
    // getScreenCTM tiene conto di viewBox, lettering e scala dello stage:
    // convertire a mano voleva dire rifare tutti e tre i conti.
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())

    for (const z of zones) {
      const path = paths.current.get(z.id)
      if (path?.isPointInFill(p)) return z
    }
    // fuori da tutte: prendiamo la piu' vicina, se e' abbastanza vicina
    let best: BodyZone | null = null
    let bestD = NEAR * NEAR
    for (const z of zones) {
      const d = (z.c[0] - p.x) ** 2 + (z.c[1] - p.y) ** 2
      if (d < bestD) [best, bestD] = [z, d]
    }
    return best
  }

  return (
    <svg
      ref={svg}
      className="absolute"
      style={{ left: centerX - box.width / 2, top, ...box, touchAction: 'pan-y' }}
      // il viewBox e' l'ingombro esatto del tratto: la figura tocca i bordi del
      // riquadro, quindi le misure qui sopra sono quelle che si vedono davvero
      viewBox={ink.join(' ')}
      onPointerDown={(e) => {
        e.stopPropagation()
        down.current = { x: e.clientX, y: e.clientY }
      }}
      onPointerUp={(e) => {
        const d = down.current
        down.current = null
        if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12) return
        e.stopPropagation()
        const z = hit(e)
        if (z) onPick(z)
      }}
    >
      {zones.map((z) => {
        const on = selected.includes(z.id)
        return (
          <path
            key={z.id}
            ref={(el) => {
              if (el) paths.current.set(z.id, el)
              else paths.current.delete(z.id)
            }}
            d={z.d}
            data-zone={z.id}
            fill={MARK}
            stroke={MARK}
            strokeWidth={on ? 6 : 0}
            strokeLinejoin="round"
            style={{
              fillOpacity: on ? 0.55 : 0,
              strokeOpacity: on ? 0.9 : 0,
              transformBox: 'fill-box',
              transformOrigin: 'center',
              animation: on ? 'bab-zone-pop 420ms cubic-bezier(0.32,1.5,0.42,1)' : undefined,
              transition: 'fill-opacity 260ms ease-out, stroke-opacity 260ms ease-out',
            }}
          />
        )
      })}
      {/* il tratto per ultimo, cosi' le campiture non lo coprono */}
      <image
        href={lineArt}
        x={0}
        y={0}
        width={BODY_SIZE}
        height={BODY_SIZE}
        style={{ pointerEvents: 'none' }}
      />
    </svg>
  )
}
