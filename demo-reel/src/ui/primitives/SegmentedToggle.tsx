import { Touchable } from './Touchable'

/**
 * Il pill Front/Back: contenitore beige, la linguetta attiva e' bianca con ombra.
 * Generico sulle opzioni cosi' chi lo usa con un'unione ('Front' | 'Back') non
 * si ritrova un `string` in mano.
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
  return (
    <div
      className="absolute flex items-end gap-[2px] p-[3px]"
      style={{ left, top, borderRadius: 100, background: 'var(--bab-bg)' }}
    >
      {options.map((o) => {
        const on = o === active
        return (
          <Touchable
            key={o}
            className="flex items-start"
            onTap={onSelect ? () => onSelect(o) : undefined}
            press={onSelect ? 0.94 : 1}
            style={{
              padding: '9px 25px',
              borderRadius: 100,
              background: on ? 'var(--bab-surface)' : 'transparent',
              filter: on ? 'drop-shadow(0px 2px 3px rgba(0,0,0,0.08))' : undefined,
            }}
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
