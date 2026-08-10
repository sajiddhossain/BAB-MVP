/**
 * Gruppo di pillole, a scelta singola o multipla.
 *
 * Multi-select non è un dettaglio di comodità: il §7 lo chiede per Headspace,
 * perché a una ragazza non si domanda di dare un voto al proprio umore ma di
 * nominarlo — e i sentimenti veri arrivano più d'uno alla volta.
 */
export type PillOption = { value: string; label: string; emoji?: string; flag?: boolean }

type Props = {
  options: PillOption[]
  /** Stringa per la scelta singola, array per la multipla. */
  value: string | string[] | null
  onChange: (v: string) => void
  label: string
  /** Colore dell'accento; corallo dove c'è di mezzo il dolore. */
  tone?: 'neutral' | 'care'
}

export default function PillGroup({ options, value, onChange, label, tone = 'neutral' }: Props) {
  const multi = Array.isArray(value)
  const accent = tone === 'care' ? 'var(--care)' : 'var(--color-teal)'
  const isOn = (v: string) => (multi ? (value as string[]).includes(v) : value === v)

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = isOn(o.value)
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className="bab-pill flex items-center gap-1.5 px-3.5 py-2 text-[14px]"
            style={on
              ? { background: accent, borderColor: accent, color: 'var(--color-surface)' }
              : o.flag
                ? { borderColor: 'var(--care)' }
                : undefined}
          >
            {o.emoji && <span aria-hidden>{o.emoji}</span>}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
