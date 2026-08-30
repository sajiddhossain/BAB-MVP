import arrowLeft from '../assets/icons/arrow-left.svg'
import { Touchable } from './Touchable'
import { useNav } from '../../proto/nav'

/** Barra in alto: bottone indietro + progress. progress e' 0..1. */
export function NavBar({
  progress,
  left = 31,
  top = 56,
  trackWidth = 289,
  borderWidth = 'var(--bab-border-w)',
  inset = 2.5,
}: {
  progress: number
  left?: number
  top?: number
  trackWidth?: number
  /** checkout usa 1px sulla track, checkin 1.5px */
  borderWidth?: string
  /** distanza del riempimento dal bordo della track */
  inset?: number
}) {
  const trackW = trackWidth
  const innerW = trackW - inset * 2
  const nav = useNav()
  return (
    <div className="absolute" style={{ left, top, width: 60 + trackW, height: 44 }}>
      <Touchable
        className="absolute left-0 top-0"
        onTap={nav ? nav.back : undefined}
        press={nav ? 0.9 : 1}
        stop={!!nav}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          background: 'var(--bab-surface)',
          border: 'var(--bab-border-w) solid var(--bab-border)',
          boxSizing: 'border-box',
          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.06))',
        }}
      >
        <img
          src={arrowLeft}
          alt=""
          className="absolute"
          style={{ left: 11.5, top: 11.5, width: 18, height: 18 }}
        />
      </Touchable>

      <div
        className="absolute"
        style={{
          left: 60,
          top: 14,
          width: trackW,
          height: 16,
          borderRadius: 100,
          background: 'var(--bab-surface)',
          border: `${borderWidth} solid var(--bab-border)`,
          boxSizing: 'border-box',
          filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.05))',
        }}
      >
        <div
          className="absolute"
          style={{
            left: inset,
            top: inset,
            height: 8,
            width: innerW * Math.max(0, Math.min(1, progress)),
            borderRadius: 100,
            background: 'linear-gradient(to right, var(--bab-lime-from), var(--bab-lime-to))',
          }}
        />
      </div>
    </div>
  )
}
