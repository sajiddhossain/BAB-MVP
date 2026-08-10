/**
 * La scala a emoji. Compare sette volte fra pre e post, quindi è il componente
 * che vale di più farne uno buono.
 *
 * 🔴 Nessun numero visibile. §7 vieta punteggi e cifre davanti all'atleta: il
 * valore 1–5 esiste nel database, non sullo schermo. Lei sceglie un'immagine.
 *
 * Accessibile come un gruppo di radio: chi usa uno screen reader sente
 * l'etichetta a parole ("Ho dormito pochissimo" … "Profondo e riposata"), non
 * "emoji lucertola".
 */
type Props = {
  /** 5 emoji, indice 0–4 = valore 1–5. */
  scale: string[]
  value: number | null
  onChange: (v: number) => void
  label: string
  low: string
  high: string
}

export default function EmojiScale({ scale, value, onChange, label, low, high }: Props) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-1.5">
      <div className="flex justify-between gap-1.5">
        {scale.map((emoji, i) => {
          const v = i + 1
          const on = value === v
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={on}
              // Il nome accessibile è la posizione a parole, non l'emoji.
              aria-label={v === 1 ? low : v === scale.length ? high : `${v} / ${scale.length}`}
              onClick={() => onChange(v)}
              className="flex-1 rounded-[14px] border-[3px] py-2.5 text-[24px] transition-transform"
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
