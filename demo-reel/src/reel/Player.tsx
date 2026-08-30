import { useMemo } from 'react'
import { buildTimeline, resolve } from './timeline'
import type { Clip } from './timeline'
import { PhoneShell } from './PhoneShell'
import { ScreenLayer } from './ScreenLayer'
import { Cursor } from './Cursor'

export function useTimeline(clip: Clip) {
  return useMemo(() => buildTimeline(clip), [clip])
}

/** Render puro: dato t, produce sempre lo stesso fotogramma. Serve alla cattura. */
export function Player({ clip, t }: { clip: Clip; t: number }) {
  const tl = useTimeline(clip)
  const frame = resolve(tl, t)

  const top = frame.layers[frame.layers.length - 1]

  return (
    <PhoneShell topScroll={top.scrollY}>
      {frame.layers.map((layer, i) => (
        <ScreenLayer key={`${layer.screen}-${i}`} layer={layer} />
      ))}
      <Cursor cursor={frame.cursor} />
    </PhoneShell>
  )
}
