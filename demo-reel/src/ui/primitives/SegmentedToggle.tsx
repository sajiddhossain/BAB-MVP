import { useLayoutEffect, useRef, useState } from 'react'
import { Touchable } from './Touchable'

/**
 * Il pill Front/Back: contenitore beige, la linguetta attiva e' bianca con ombra.
 * Generico sulle opzioni cosi' chi lo usa con un'unione ('Front' | 'Back') non
 * si ritrova un `string` in mano.
 *
 * La linguetta bianca e' UN elemento solo che scorre da un'opzione all'altra,
 * non due sfondi che si accendono a turno: prima cambiava per dissolvenza e
 * sembrava che la linguetta sparisse e ne comparisse un'altra. Su iOS scorre.
 * Le due parole non sono larghe uguale, quindi si muove e cambia larghezza
 * insieme — misurata dal DOM, perche' dipende dal carattere.
 */
export function SegmentedToggle<T extends string>({
  left,
  top,
  options,
  active,
  onSelect,
}: {
  left: number
  top: number
  options: readonly T[]
  active: T
  onSelect?: (o: T) => void
}) {
  const tabs = useRef<(HTMLDivElement | null)[]>([])
  const [box, setBox] = useState<{ x: number; w: number } | null>(null)
  const i = options.indexOf(active)

  /*
   * Prima della pittura, non dopo: con useEffect la linguetta comparirebbe a
   * zero e scivolerebbe al suo posto al primo fotogramma di ogni schermo.
   */
  useLayoutEffect(() => {
    const el = tabs.current[i]
    if (el) setBox({ x: el.offsetLeft, w: el.offsetWidth })
  }, [i, options])

  return (
    <div
      className="absolute flex items-end gap-[2px] p-[3px]"
      style={{ left, top, borderRadius: 100, background: 'var(--bab-bg)' }}
    >
      {box && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: box.x,
            top: 3,
            width: box.w,
            bottom: 3,
            borderRadius: 100,
            background: 'var(--bab-surface)',
            filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.08))',
            transition: 'left 320ms cubic-bezier(0.32,0.72,0,1), width 320ms cubic-bezier(0.32,0.72,0,1)',
          }}
        />
      )}
      {options.map((o, n) => {
        const on = o === active
        return (
          <Touchable
            key={o}
            ref={(el) => {
              tabs.current[n] = el
            }}
            className="relative flex items-start"
            onTap={onSelect ? () => onSelect(o) : undefined}
            press={onSelect ? 0.94 : 1}
            style={{ padding: '9px 25px', borderRadius: 100 }}
          >
            <p
              className="whitespace-nowrap font-bold"
              style={{
                fontSize: 13,
                lineHeight: 'normal',
                margin: 0,
                color: on ? '#866bf2' : 'var(--bab-ink-mute)',
              }}
            >
              {o}
            </p>
          </Touchable>
        )
      })}
    </div>
  )
}
