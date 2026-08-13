/**
 * La scala a emoji. Compare sette volte fra pre e post, quindi è il componente
 * che vale di più farne uno buono.
 *
 * 🔴 Nessun numero visibile. §7 vieta punteggi e cifre davanti all'atleta: il
 * valore esiste nel database, non sullo schermo. Lei sceglie un'immagine.
 *
 * Accessibile come un gruppo di radio: chi usa uno screen reader sente
 * l'etichetta a parole ("Ho dormito pochissimo" … "Profondo e riposata"), non
 * "emoji lucertola".
 *
 * 🔴 Oltre 5 punti (sonno/energia a 7, effort a 11) una riga sola che si
 * stringe per stare tutta larga finirebbe sotto i 44px di bersaglio — la
 * stessa regola vista nel resto dell'app. Da 6 in su i bottoni restano a
 * misura fissa e vanno a capo invece di rimpicciolirsi.
 */
type Props = {
  /** Indice 0-based; il valore reale è `indice + offset`. */
  scale: string[]
  value: number | null
  onChange: (v: number) => void
  label: string
  low: string
  high: string
  /** `lg` quando la scala è l'unica cosa sulla schermata. */
  size?: 'md' | 'lg'
  /** Il valore del primo elemento della scala. 1 di default; 0 per la RPE dell'effort. */
  offset?: number
}

export default function EmojiScale({ scale, value, onChange, label, low, high, size = 'md', offset = 1 }: Props) {
  const big = size === 'lg'
  const wrap = scale.length > 5
  const max = offset + scale.length - 1
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-2">
      <div className={`flex ${wrap ? 'flex-wrap justify-center' : 'justify-between'} ${big ? 'gap-2' : 'gap-1.5'}`}>
        {scale.map((emoji, i) => {
          const v = i + offset
          const on = value === v
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={on}
              // Il nome accessibile è la posizione a parole, non l'emoji.
              aria-label={v === offset ? low : v === max ? high : `${v} / ${max}`}
              onClick={() => onChange(v)}
              className={`rounded-[14px] border-[3px] transition-transform ${
                wrap
                  ? 'h-11 w-11 shrink-0 text-[22px]'
                  : `flex-1 ${big ? 'py-4 text-[32px]' : 'py-2.5 text-[24px]'}`
              }`}
              style={{
                borderColor: on ? 'var(--color-ink)' : 'var(--color-sand)',
                background: on ? 'var(--tempo-steady-tint)' : 'var(--color-surface)',
                transform: on ? 'translateY(-2px)' : undefined,
                boxShadow: on ? '3px 3px 0 0 var(--color-ink)' : undefined,
              }}
            >
              <span aria-hidden>{emoji}</span>
            </button>
          )
        })}
      </div>
      <div className="flex justify-between text-[11.5px] text-[var(--color-ink-soft)]">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}
