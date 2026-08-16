import { useId } from 'react'

/**
 * La scala VAS — «visual analogue scale»: una riga continua fra due estremi,
 * dove si segna un punto.
 *
 * 🔴 Niente numeri, niente tacche. Una VAS *è* una riga senza riferimenti: se
 * ci si mettessero i numeri smetterebbe di essere una VAS e diventerebbe una
 * Likert, che è un altro strumento. Qui il §7 e la letteratura chiedono la
 * stessa cosa, che non capita spesso.
 *
 * 🔴 Finché non la tocca, il valore è `null` e il cursore non c'è. Partire da
 * metà vorrebbe dire mettere in bocca a una ragazza un «così così» che non ha
 * detto — ed è la stessa ragione per cui i canali a emoji non hanno un valore
 * di partenza.
 */
type Props = {
  value: number | null
  onChange: (v: number) => void
  min: number
  max: number
  label: string
  low: string
  high: string
}

export default function VasSlider({ value, onChange, min, max, label, low, high }: Props) {
  const id = useId()
  const mid = Math.round((min + max) / 2)
  const pct = value === null ? 0 : ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-3">
      {/* Il nome accessibile è a parole, e `aria-valuetext` sostituisce il
          numero che uno screen reader leggerebbe di suo: «più verso il
          meglio» dice quello che serve, «73» no. */}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value ?? mid}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuetext={value === null ? '—' : pct >= 50 ? high : low}
        className="bab-vas"
        style={{ ['--vas-fill' as string]: value === null ? '0%' : `${pct}%` }}
      />
      <div className="flex justify-between gap-3 text-[12.5px] text-[var(--color-ink-soft)]">
        <span>{low}</span>
        <span className="text-right">{high}</span>
      </div>
    </div>
  )
}
