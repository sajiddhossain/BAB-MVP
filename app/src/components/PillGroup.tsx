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
  /**
   * `lg` dove la domanda è sola sulla schermata: lo spazio c'è, e un bersaglio
   * più grande si prende meglio con un pollice mentre si cammina verso il campo.
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Griglia a colonne fisse invece del flusso libero. Per una manciata di
   * opzioni corte il flusso libero va bene da solo; per una lista lunga con
   * etichette di lunghezza diversa (gli sport) il flusso libero incolonna le
   * pillole in righe irregolari — sembra buttato lì invece che scelto.
   */
  columns?: number
}

export default function PillGroup({ options, value, onChange, label, tone = 'neutral', size = 'md', columns }: Props) {
  const multi = Array.isArray(value)
  const accent = tone === 'care' ? 'var(--care)' : 'var(--color-teal)'
  const isOn = (v: string) => (multi ? (value as string[]).includes(v) : value === v)
  const big = size === 'lg'
  const small = size === 'sm'

  return (
    <div role="group" aria-label={label}
         className={columns ? 'grid gap-2' : `flex flex-wrap ${big ? 'gap-2.5' : small ? 'gap-1.5' : 'gap-2'}`}
         style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}>
      {options.map((o) => {
        const on = isOn(o.value)
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`bab-pill flex items-center gap-1.5 ${
              columns ? 'justify-center px-2 py-2.5 text-center text-[14px]'
                : big ? 'px-5 py-3 text-[16px]'
                : small ? 'px-3 py-1.5 text-[13px]'
                : 'px-3.5 py-2 text-[14px]'
            }`}
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
