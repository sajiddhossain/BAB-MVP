import { useEffect, useState } from 'react'
import { useCopy, useLocale, fill } from '@/copy'
import PillGroup from '@/components/PillGroup'
import { endTimeOf, entriesOf, minutesBetween, setDays, timeOf, type Kind } from '@/lib/agenda'
import { listSchedule } from '@/lib/repo'
import { useSession } from '@/lib/session'
import { sportLabel } from '@/content/sports'
import { Pane, SaveButton, SaveNote, saveAndSettle, type SaveState } from './shell'
import { TimeField } from '@/components/fields'
import { CalendarIcon } from '@/components/icons'

/**
 * I giorni di un tipo — allenamento o educazione fisica. Una schermata sola,
 * montata su più indirizzi: la domanda è la stessa, cambia solo di cosa.
 *
 * 🔴 R3-bis: un allenamento ('training') porta anche `sport` — con più sport
 * questa schermata è montata una volta per sport, non una sola per tutti gli
 * allenamenti. 'pe' non ha sport, `sport` resta `null`.
 *
 * 🔴 Togliere un giorno lo CANCELLA, qui e sul server. È l'unico posto del
 * prodotto dove una riga sparisce davvero, e va bene così: un martedì a cui ha
 * smesso di andare non è un fatto da conservare, è una descrizione sbagliata
 * del presente — e finché resta lì BAB continua a chiederle il check-in di
 * martedì.
 */
export default function AgendaDays({ kind, sport = null }: { kind: Kind; sport?: string | null }) {
  const t = useCopy()
  const locale = useLocale()
  const { userId } = useSession()

  const [loaded, setLoaded] = useState(false)
  const [days, setPicked] = useState<number[]>([])
  const [time, setTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [was, setWas] = useState<{ days: number[]; time: string; endTime: string }>({ days: [], time: '', endTime: '' })
  const [state, setState] = useState<SaveState>('idle')

  useEffect(() => {
    let alive = true
    listSchedule()
      .then((rows) => {
        if (!alive) return
        const mine = entriesOf(rows, kind, kind === 'training' ? sport : undefined)
        const d = mine.map((e) => e.weekday)
        const tm = kind === 'training' ? timeOf(mine) : ''
        const et = kind === 'training' ? endTimeOf(mine) : ''
        setPicked(d); setTime(tm); setEndTime(et); setWas({ days: d, time: tm, endTime: et }); setLoaded(true)
      })
      .catch(() => { if (alive) setLoaded(true) })
    return () => { alive = false }
  }, [kind, sport])

  const same = (a: number[], b: number[]) =>
    a.length === b.length && [...a].sort().join() === [...b].sort().join()
  const dirty = loaded && (!same(days, was.days) || (kind === 'training' && (time !== was.time || endTime !== was.endTime)))

  const toggle = (d: number) =>
    setPicked((p) => { setState('idle'); return p.includes(d) ? p.filter((x) => x !== d) : [...p, d] })

  async function save() {
    if (!userId) return
    await saveAndSettle(
      async () => {
        const duration = kind === 'training' ? minutesBetween(time, endTime) : null
        await setDays(userId, kind, days, time || null, sport, duration)
        setWas({ days, time, endTime })
      },
      (o) => o.table === 'athlete_schedule',
      setState,
    )
  }

  const title = kind === 'training'
    ? (sport ? fill(t.onboarding.trainDayTitle, { sport: sportLabel(sport, locale) }) : t.onboarding.weekTraining)
    : t.onboarding.weekPe
  const help = kind === 'training' ? t.onboarding.weekTrainingHelp : t.onboarding.weekPeHelp

  return (
    <Pane title={title} help={help} back="/settings/agenda">
      <PillGroup
        size="lg" label={title} value={days.map(String)}
        options={t.onboarding.weekdays.map((d, i) => ({ value: String(i + 1), label: d }))}
        onChange={(v) => toggle(Number(v))}
      />

      {/* L'orario esiste solo per gli allenamenti, e solo se ce n'è almeno uno
          a cui attaccarlo. */}
      {kind === 'training' && days.length > 0 && (
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
            {t.onboarding.trainStartTitle}
            <TimeField value={time} ariaLabel={t.onboarding.trainStartTitle}
                       onChange={(v) => { setTime(v); setState('idle') }} />
          </label>
          <label className="flex flex-1 flex-col gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
            {t.onboarding.trainEndTitle}
            <TimeField value={endTime} ariaLabel={t.onboarding.trainEndTitle}
                       onChange={(v) => { setEndTime(v); setState('idle') }} />
          </label>
        </div>
      )}

      {days.length === 0 && loaded && (
        <div className="bab-card flex items-center gap-2.5 px-4 py-3">
          <CalendarIcon size={18} color="var(--color-ink-soft)" />
          <p className="text-[14px] text-[var(--color-ink-soft)]">{t.settings.agendaNoDays}</p>
        </div>
      )}

      <SaveButton dirty={dirty} state={state} onClick={() => void save()} />
      <SaveNote state={state} />
    </Pane>
  )
}
