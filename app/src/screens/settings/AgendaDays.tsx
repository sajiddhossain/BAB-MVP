import { useEffect, useState } from 'react'
import { useCopy } from '@/copy'
import PillGroup from '@/components/PillGroup'
import { entriesOf, setDays, timeOf, type Kind } from '@/lib/agenda'
import { listSchedule } from '@/lib/repo'
import { useSession } from '@/lib/session'
import { Pane, SaveButton, SaveNote, saveAndSettle, type SaveState } from './shell'

/**
 * I giorni di un tipo — allenamento o educazione fisica. Una schermata sola,
 * montata su due indirizzi: la domanda è la stessa, cambia solo di cosa.
 *
 * 🔴 Togliere un giorno lo CANCELLA, qui e sul server. È l'unico posto del
 * prodotto dove una riga sparisce davvero, e va bene così: un martedì a cui ha
 * smesso di andare non è un fatto da conservare, è una descrizione sbagliata
 * del presente — e finché resta lì BAB continua a chiederle il check-in di
 * martedì.
 */
export default function AgendaDays({ kind }: { kind: Kind }) {
  const t = useCopy()
  const { userId } = useSession()

  const [loaded, setLoaded] = useState(false)
  const [days, setPicked] = useState<number[]>([])
  const [time, setTime] = useState('')
  const [was, setWas] = useState<{ days: number[]; time: string }>({ days: [], time: '' })
  const [state, setState] = useState<SaveState>('idle')

  useEffect(() => {
    let alive = true
    listSchedule()
      .then((rows) => {
        if (!alive) return
        const mine = entriesOf(rows, kind)
        const d = mine.map((e) => e.weekday)
        const tm = kind === 'training' ? timeOf(mine) : ''
        setPicked(d); setTime(tm); setWas({ days: d, time: tm }); setLoaded(true)
      })
      .catch(() => { if (alive) setLoaded(true) })
    return () => { alive = false }
  }, [kind])

  const same = (a: number[], b: number[]) =>
    a.length === b.length && [...a].sort().join() === [...b].sort().join()
  const dirty = loaded && (!same(days, was.days) || (kind === 'training' && time !== was.time))

  const toggle = (d: number) =>
    setPicked((p) => { setState('idle'); return p.includes(d) ? p.filter((x) => x !== d) : [...p, d] })

  async function save() {
    if (!userId) return
    await saveAndSettle(
      async () => {
        await setDays(userId, kind, days, time || null)
        setWas({ days, time })
      },
      (o) => o.table === 'athlete_schedule',
      setState,
    )
  }

  const title = kind === 'training' ? t.onboarding.weekTraining : t.onboarding.weekPe
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
        <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
          {t.onboarding.timeLabel}
          <input type="time" value={time}
                 onChange={(e) => { setTime(e.target.value); setState('idle') }}
                 className="bab-card px-3 py-2.5 text-[16px] text-[var(--color-ink)]" />
        </label>
      )}

      {days.length === 0 && loaded && (
        <p className="text-[14px] text-[var(--color-ink-soft)]">{t.settings.agendaNoDays}</p>
      )}

      <SaveButton dirty={dirty} state={state} onClick={() => void save()} />
      <SaveNote state={state} />
    </Pane>
  )
}
