import arrowLeft from '../assets/icons/arrow-left.svg'

/** Barra in alto: bottone indietro + progress. progress e' 0..1. */
export function NavBar({ progress }: { progress: number }) {
  const trackW = 289
  const innerW = trackW - 5
  return (
    <div className="absolute" style={{ left: 31, top: 56, width: 349, height: 44 }}>
      <div
        className="absolute left-0 top-0"
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
      </div>

      <div
        className="absolute"
        style={{
          left: 60,
          top: 14,
          width: trackW,
          height: 16,
          borderRadius: 100,
          background: 'var(--bab-surface)',
          border: 'var(--bab-border-w) solid var(--bab-border)',
          boxSizing: 'border-box',
          filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.05))',
        }}
      >
        <div
          className="absolute"
          style={{
            left: 2.5,
            top: 2.5,
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
