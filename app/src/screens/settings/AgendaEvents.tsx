import { useEffect, useState } from 'react'
import { useCopy } from '@/copy'
import PillGroup from '@/components/PillGroup'
import { listAthleteEvents, localDate, removeAthleteEvent, saveAthleteEvent } from '@/lib/repo'
import { useSession } from '@/lib/session'
import { Pane, SaveNote, saveAndSettle, type SaveState } from './shell'
import { DateField } from '@/components/fields'
import Loading from '@/components/Loading'

/**
 * Gare e partite. Sono date, non giorni della settimana: una gara non torna
 * ogni martedì.
 *
 * 🔴 Le passate restano e non si possono togliere per sbaglio: servono a
 * spiegare perché quella settimana è andata come è andata, e cancellarle
 * toglierebbe il contesto a un mese di check-in. Si tolgono solo quelle
 * future — cioè quelle che non sono ancora successe, e che quindi sono ancora
 * una previsione e non un fatto.
 */

type Kind = 'match' | 'competition' | 'other'

const KINDS: Kind[] = ['competition', 'match', 'other']

export default function AgendaEvents() {
  const t = useCopy()
  const { userId } = useSession()

  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null)
  const [date, setDate] = useState('')
  const [kind, setKind] = useState<Kind>('competition')
  const [title, setTitle] = useState('')
  const [state, setState] = useState<SaveState>('idle')

  const reload = () =>
    listAthleteEvents().then(setRows).catch(() => setRows([]))

  useEffect(() => { void reload() }, [])

  const today = localDate()
  const all = (rows ?? []).map((r) => ({
    id: String(r.id),
    date: String(r.event_date ?? ''),
    kind: (r.kind as Kind) ?? 'other',
    title: (r.title as string | null) ?? null,
  }))
  const upcoming = all.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  const past = all.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date))

  const label = (k: Kind) =>
    k === 'competition' ? t.settings.agendaKindCompetition
      : k === 'match' ? t.settings.agendaKindMatch
      : t.settings.agendaKindOther

  async function add() {
    if (!userId || !date) return
    await saveAndSettle(
      async () => {
        await saveAthleteEvent(userId, date, kind, title.trim() || undefined)
        setDate(''); setTitle('')
        await reload()
      },
      (o) => o.table === 'athlete_events',
      setState,
    )
  }

  async function drop(id: string) {
    await saveAndSettle(
      async () => { await removeAthleteEvent(id); await reload() },
      (o) => o.table === 'athlete_events',
      setState,
    )
  }

  const row = (e: typeof all[number], removable: boolean) => (
    <li key={e.id} className="bab-card flex items-center gap-3 px-3.5 py-3">
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-bold">{e.title || label(e.kind)}</span>
        <span className="text-[13px] text-[var(--color-ink-soft)]">
          {e.date}{e.title ? ` · ${label(e.kind)}` : ''}
        </span>
      </span>
      {removable && (
        <button type="button" onClick={() => void drop(e.id)}
                className="bab-pill px-3.5 py-2 text-[13.5px]"
                style={{ borderColor: 'var(--care)', color: 'var(--care)' }}>
          {t.checkin.common.remove}
        </button>
      )}
    </li>
  )

  return (
    <Pane title={t.onboarding.weekEvents} help={t.settings.agendaEventsHelp} back="/settings/agenda">
      {rows === null ? (
        <Loading label={t.common.loading} />
      ) : (
        <>
          {upcoming.length > 0 && (
            <ul className="flex flex-col gap-2">{upcoming.map((e) => row(e, true))}</ul>
          )}
          {upcoming.length === 0 && (
            <p className="text-[14px] text-[var(--color-ink-soft)]">{t.settings.agendaNoEvents}</p>
          )}

          <section className="bab-card mt-1 flex flex-col gap-3 px-4 py-4">
            <h2 className="font-display text-[17px]">{t.settings.agendaAddEvent}</h2>
            <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
              {t.onboarding.eventDateLabel}
              <DateField value={date} min={today} ariaLabel={t.onboarding.eventDateLabel}
                         onChange={(v) => { setDate(v); setState('idle') }} />
            </label>
            <PillGroup
              label={t.settings.agendaKindLabel} value={kind}
              options={KINDS.map((k) => ({ value: k, label: label(k) }))}
              onChange={(v) => setKind(v as Kind)}
            />
            <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
              {t.settings.agendaEventName}
              <input value={title} maxLength={60}
                     onChange={(e) => setTitle(e.target.value)}
                     className="bab-card px-3 py-2.5 text-[16px] text-[var(--color-ink)]" />
            </label>
            <button type="button" disabled={!date || state === 'saving'}
                    onClick={() => void add()}
                    className="bab-pill px-5 py-3 text-[16px] disabled:opacity-40"
                    style={date ? { background: 'var(--color-lime)' } : undefined}>
              {state === 'saving' ? t.settings.profileSaving : t.checkin.common.addThis}
            </button>
            <SaveNote state={state} />
          </section>

          {past.length > 0 && (
            <>
              <p className="bab-label pt-2">{t.settings.agendaPast}</p>
              <ul className="flex flex-col gap-2">{past.slice(0, 8).map((e) => row(e, false))}</ul>
              <p className="text-[13px] text-[var(--color-ink-soft)]">{t.settings.agendaPastNote}</p>
            </>
          )}
        </>
      )}
    </Pane>
  )
}
