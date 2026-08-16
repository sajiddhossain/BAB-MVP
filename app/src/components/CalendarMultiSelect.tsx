import { useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from './icons'

/**
 * Un calendario piccolo, per toccare i giorni invece di scriverli.
 *
 * 🔴 Niente libreria: il progetto non ne ha mai avuta una per le date, solo
 * `<input type="date">` nativi. Qui serve la selezione multipla — più giorni
 * di uno stesso ciclo — che un input nativo non sa fare, quindi la griglia è
 * scritta a mano, nello stesso stile pillola del resto dell'app.
 *
 * `multiple=false` la usa come selettore di UN giorno solo (le due date
 * precedenti, in R3-bis): toccarne uno sostituisce la selezione invece di
 * aggiungersi.
 */

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const WEEKDAY_LETTERS = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

type Props = {
  selected: string[]
  onChange: (next: string[]) => void
  label: string
  multiple?: boolean
}

export default function CalendarMultiSelect({ selected, onChange, label, multiple = true }: Props) {
  const today = new Date()
  const latest = selected.length ? new Date(`${[...selected].sort().at(-1)}T00:00:00`) : today
  const [view, setView] = useState(() => new Date(latest.getFullYear(), latest.getMonth(), 1))

  const year = view.getFullYear()
  const month = view.getMonth()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
  // Lunedì = 0, coerente col resto dell'app (ISO).
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ]
  const monthLabel = view.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  const set = new Set(selected)

  function toggle(d: Date) {
    if (d > today) return
    const iso = toISO(d)
    if (!multiple) { onChange([iso]); return }
    onChange(set.has(iso) ? selected.filter((x) => x !== iso) : [...selected, iso].sort())
  }

  return (
    <div role="group" aria-label={label} className="bab-card flex flex-col gap-2 px-2.5 py-2.5">
      <div className="flex items-center justify-between px-1">
        <button type="button" aria-label="Mese precedente"
                onClick={() => setView(new Date(year, month - 1, 1))}
                className="bab-pill flex h-11 w-11 items-center justify-center"><ArrowLeftIcon size={16} /></button>
        <span className="text-[13px] font-bold capitalize">{monthLabel}</span>
        <button type="button" aria-label="Mese successivo" disabled={isCurrentMonth}
                onClick={() => setView(new Date(year, month + 1, 1))}
                className="bab-pill flex h-11 w-11 items-center justify-center disabled:opacity-30"><ArrowRightIcon size={16} /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-[10.5px] text-[var(--color-ink-soft)]">
        {WEEKDAY_LETTERS.map((d, i) => <span key={i}>{d}</span>)}
      </div>
      {/* Bottoni a misura fissa, non a griglia piena: così la riga resta
          bassa qualunque sia la larghezza dello schermo — l'onboarding non
          scorre mai, e sei righe di celle "aspect-square" bastavano a
          sforare il viewport. */}
      <div className="grid grid-cols-7 justify-items-center gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <span key={i} aria-hidden />
          const iso = toISO(d)
          const on = set.has(iso)
          const future = d > today
          return (
            <button key={iso} type="button" disabled={future} onClick={() => toggle(d)}
                    aria-pressed={on}
                    className="bab-pill h-11 w-11 px-0 text-[12px] disabled:opacity-25"
                    style={on
                      ? { background: 'var(--color-teal)', borderColor: 'var(--color-teal)', color: 'var(--color-surface)' }
                      : undefined}>
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
