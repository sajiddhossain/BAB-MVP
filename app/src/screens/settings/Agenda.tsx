import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { plural, useCopy } from '@/copy'
import { entriesOf, timeOf, type Entry } from '@/lib/agenda'
import { listAthleteEvents, listSchedule } from '@/lib/repo'
import { Pane } from './shell'

/**
 * La settimana, vista tutta insieme.
 *
 * 🔴 Questa schermata non modifica niente: mostra. È il valore che le voci
 * dell'indice non riescono a dare in una riga sola — «Mar · Gio» dice quali
 * giorni, ma non fa vedere che il giovedì ha allenamento E educazione fisica,
 * che è il giorno in cui poi si chiede perché è a pezzi.
 */

/** I sette giorni con sopra un pallino per tipo. */
function Week({ training, pe }: { training: Entry[]; pe: Entry[] }) {
  const t = useCopy()
  const has = (list: Entry[], d: number) => list.some((e) => e.weekday === d)
  return (
    <ul className="flex gap-1.5">
      {t.onboarding.weekdays.map((label, i) => {
        const d = i + 1
        const on = has(training, d) || has(pe, d)
        return (
          <li key={d} className="flex flex-1 flex-col items-center gap-1.5">
            <span className={`text-[11.5px] ${on ? 'font-bold' : 'text-[var(--color-ink-soft)]'}`}>
              {label}
            </span>
            <span className="flex h-4 items-center gap-0.5">
              {has(training, d) && (
                <span className="h-2.5 w-2.5 rounded-full"
                      style={{ background: 'var(--color-teal)' }} />
              )}
              {has(pe, d) && (
                <span className="h-2.5 w-2.5 rounded-full"
                      style={{ background: 'var(--color-gold)' }} />
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export default function SettingsAgenda() {
  const t = useCopy()
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null)
  const [events, setEvents] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    let alive = true
    Promise.all([listSchedule(), listAthleteEvents()])
      .then(([s, e]) => { if (alive) { setRows(s); setEvents(e) } })
      .catch(() => { if (alive) setRows([]) })
    return () => { alive = false }
  }, [])

  const training = entriesOf(rows ?? [], 'training')
  const pe = entriesOf(rows ?? [], 'pe')
  const time = timeOf(training)

  const days = (list: Entry[]) =>
    list.length === 0
      ? t.settings.agendaNone
      : list.map((e) => t.onboarding.weekdays[e.weekday - 1]).join(' · ')

  const rowsOut = [
    {
      to: '/settings/agenda/allenamenti',
      title: t.onboarding.weekTraining,
      value: training.length ? `${days(training)}${time ? ` · ${time}` : ''}` : t.settings.agendaNone,
    },
    {
      to: '/settings/agenda/educazione-fisica',
      title: t.onboarding.weekPe,
      value: days(pe),
    },
    {
      to: '/settings/agenda/gare',
      title: t.onboarding.weekEvents,
      value: events.length
        ? plural(events.length, t.settings.agendaEventsOne, t.settings.agendaEventsMany)
        : t.settings.agendaNone,
    },
  ]

  return (
    <Pane title={t.settings.agendaTitle} help={t.settings.agendaHelp}>
      {rows && (training.length > 0 || pe.length > 0) && (
        <section className="bab-card flex flex-col gap-3 px-4 py-4">
          <Week training={training} pe={pe} />
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--color-ink-soft)]">
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-teal)' }} />
              {t.onboarding.weekTraining}
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-gold)' }} />
              {t.onboarding.weekPe}
            </li>
          </ul>
        </section>
      )}

      <nav className="flex flex-col gap-2.5">
        {rowsOut.map((r) => (
          <Link key={r.to} to={r.to} className="bab-card flex items-center gap-3 px-4 py-3.5">
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-[16px] font-bold">{r.title}</span>
              <span className="text-[13.5px] text-[var(--color-ink-soft)]">{r.value}</span>
            </span>
            <span aria-hidden className="text-[17px] text-[var(--color-ink-soft)]">→</span>
          </Link>
        ))}
      </nav>

      <p className="px-1 text-[13px] text-[var(--color-ink-soft)]">{t.settings.agendaNote}</p>
    </Pane>
  )
}
