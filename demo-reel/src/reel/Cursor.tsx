import type { CursorState } from './timeline'
import { easeOutCubic } from './timeline'

/** Il dito finto: un tondo morbido con alone al tocco. */
export function Cursor({ cursor }: { cursor: CursorState }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {cursor.ripples.map((r, i) => {
        const p = easeOutCubic(r.p)
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: r.x,
              top: r.y,
              width: r.r * 2,
              height: r.r * 2,
              marginLeft: -r.r,
              marginTop: -r.r,
              transform: `scale(${0.35 + p * 1.15})`,
              opacity: (1 - p) * 0.5,
              border: '2px solid rgba(44,44,58,0.55)',
              background:
                'radial-gradient(circle, rgba(44,44,58,0.16) 0%, rgba(44,44,58,0) 68%)',
            }}
          />
        )
      })}

      <div
        className="absolute rounded-full"
        style={{
          left: cursor.x,
          top: cursor.y,
          width: 38,
          height: 38,
          marginLeft: -19,
          marginTop: -19,
          opacity: cursor.opacity * 0.92,
          background: `rgba(28,28,38,${0.3 + cursor.press * 0.18})`,
          transform: `scale(${1 - cursor.press * 0.24})`,
          border: '2px solid rgba(255,255,255,0.85)',
          boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
          backdropFilter: 'blur(1px)',
        }}
      />
    </div>
  )
}
