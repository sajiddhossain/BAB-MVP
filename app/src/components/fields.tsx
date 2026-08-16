import { CalendarIcon, ClockIcon } from './icons'

/**
 * Data e ora native — servono per la tastiera giusta e il picker di sistema,
 * niente di scritto a mano al loro posto. Ma il selettore di default del
 * browser è l'unico pezzo rimasto che sembra "un altro programma": qui si
 * nasconde solo la sua iconcina (`::-webkit-calendar-picker-indicator`,
 * vedi index.css) e si mette al suo posto un'icona disegnata, ferma alla
 * stessa altezza — il campo resta cliccabile ovunque, cambia solo il disegno.
 */

type FieldProps = {
  value: string
  onChange: (v: string) => void
  ariaLabel?: string
  min?: string
  className?: string
}

export function DateField({ value, onChange, ariaLabel, min, className }: FieldProps) {
  return (
    <span className={`bab-card flex items-center gap-2 ${className ?? 'px-3 py-2.5'}`}>
      <input type="date" value={value} min={min} aria-label={ariaLabel}
             onChange={(e) => onChange(e.target.value)}
             className="bab-native-field flex-1 text-[16px] text-[var(--color-ink)]" />
      <CalendarIcon size={18} color="var(--color-ink-soft)" />
    </span>
  )
}

export function TimeField({ value, onChange, ariaLabel, className }: FieldProps) {
  return (
    <span className={`bab-card flex items-center gap-2 ${className ?? 'px-3 py-2.5'}`}>
      <input type="time" value={value} aria-label={ariaLabel}
             onChange={(e) => onChange(e.target.value)}
             className="bab-native-field flex-1 text-[16px] text-[var(--color-ink)]" />
      <ClockIcon size={18} color="var(--color-ink-soft)" />
    </span>
  )
}
