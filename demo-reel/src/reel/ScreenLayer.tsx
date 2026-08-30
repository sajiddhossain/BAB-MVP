import { memo } from 'react'
import { screenOf, VIEWPORT } from './timeline'
import type { LayerState } from './timeline'

/**
 * Un singolo schermo dentro il viewport del telefono.
 * L'SVG di Figma viene inserito intatto: nessuna ricostruzione, fedelta' 1:1.
 */
export const ScreenLayer = memo(function ScreenLayer({ layer }: { layer: LayerState }) {
  const s = screenOf(layer.screen)

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        transform: `translate3d(${layer.tx}px, ${layer.ty}px, 0) scale(${layer.scale})`,
        opacity: layer.opacity,
        transformOrigin: '50% 50%',
        willChange: 'transform, opacity',
      }}
    >
      <div
        className="absolute left-0 top-0"
        style={{
          width: s.w,
          height: s.h,
          transform: `translate3d(${s.offsetX}px, ${s.offsetY - layer.scrollY}px, 0)`,
          willChange: 'transform',
        }}
      >
        {s.kind === 'svg' ? (
          <div
            className="h-full w-full [&>svg]:block"
            dangerouslySetInnerHTML={{ __html: s.content }}
          />
        ) : (
          <img
            src={s.content}
            width={s.w}
            height={s.h}
            alt=""
            draggable={false}
            className="block h-full w-full"
          />
        )}
      </div>

      {layer.dim > 0 && (
        <div
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: layer.dim }}
        />
      )}
    </div>
  )
})

export const VIEWPORT_SIZE = VIEWPORT
