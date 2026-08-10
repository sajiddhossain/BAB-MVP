import { useState } from 'react'
import { useCopy, useLocale, type Locale } from '@/copy'
import PillGroup from '@/components/PillGroup'
import { saveProfile, saveConsent, saveSchedule, saveAthleteEvent, saveCycleEvent, type ScheduleEntry } from '@/lib/repo'
import { useSession } from '@/lib/session'

/**
 * Onboarding — la forma decisa in R3.
 *
 * 🔴 Qui la procedura a passi è giusta, al contrario del check-in: si fa una
 * volta sola, e ci sono cancelli veri (la contraccezione si chiede solo sopra i
 * 15 anni; le date del ciclo solo se ha detto di averlo).
 *
 * 🔴 «Chi vede cosa» viene PRIMA del consenso, e il consenso prima di tutto il
 * resto. R2: lo staff vede i check-in e le date del ciclo, e un consenso che
 * non lo descrive non è informato. Non è una schermata da mettere in fondo per
 * non spaventare — è il presupposto perché tutto il resto sia lecito.
 */

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
      )}
    </>
  )
}

/**
 * 🔴 Frame sta FUORI dal componente, e non è pignoleria: definito dentro,
 * sarebbe un tipo di componente nuovo a ogni render, React smonterebbe il
 * sottoalbero e il campo del nome perderebbe il fuoco a ogni lettera battuta.
 */
function Frame({ title, help, children, next, canNext, back, onBack, labels }: {
  title: string; help?: string; children?: React.ReactNode
  next?: () => void; canNext?: boolean; back?: boolean; onBack?: () => void
  labels: { back: string; continue: string }
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-4 px-5 py-8">
      <h1 className="font-display text-[26px] leading-tight">{title}</h1>
      {help && <p className="text-[15px] text-[var(--color-ink-soft)]">{help}</p>}
      <div className="flex flex-1 flex-col gap-4">{children}</div>
      <div className="flex items-center gap-3">
        {back && (
          <button type="button" onClick={onBack} className="bab-pill px-4 py-3 text-[14px]">
            {labels.back}
          </button>
        )}
        {next && (
          <button type="button" onClick={next} disabled={canNext === false}
                  className="bab-pill flex-1 px-4 py-3 text-[16px] disabled:opacity-50"
                  style={{ background: canNext === false ? undefined : 'var(--color-lime)' }}>
            {labels.continue}
          </button>
        )}
      </div>
    </div>
  )
}

type Step =
  | 'welcome' | 'whoSees' | 'consent' | 'name' | 'birthday' | 'sport'
  | 'week' | 'rhythm' | 'dates' | 'contraception' | 'done'

type CycleStatus = 'tracking' | 'not_yet' | 'undisclosed'

/** Anni compiuti, per decidere se la domanda sulla contraccezione ha senso. */
function ageFrom(birth: string): number | null {
  if (!birth) return null
  const b = new Date(birth)
  if (Number.isNaN(b.getTime())) return null
  const now = new Date()
  let a = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--
  return a
}

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const t = useCopy()
  const locale = useLocale()
  const { userId } = useSession()

  const [step, setStep] = useState<Step>('welcome')
  const [name, setName] = useState('')
  const [birth, setBirth] = useState('')
  const [sport, setSport] = useState('')
  const [trainDays, setTrainDays] = useState<number[]>([])
  const [trainTime, setTrainTime] = useState('')
  const [peDays, setPeDays] = useState<number[]>([])
  const [eventDate, setEventDate] = useState('')
  const [cycle, setCycle] = useState<CycleStatus | null>(null)
  const [dates, setDates] = useState<string[]>(['', '', ''])
  const [contraception, setContraception] = useState<'hormonal' | 'natural' | 'undisclosed' | null>(null)
  const [consentA, setConsentA] = useState(false)
  const [consentG, setConsentG] = useState(false)
  const [saving, setSaving] = useState(false)

  const L = { back: t.onboarding.back, continue: t.onboarding.continue }
  const age = ageFrom(birth)
  const asksContraception = cycle === 'tracking' && age !== null && age >= 15

  const toggle = (list: number[], set: (v: number[]) => void, d: number) =>
    set(list.includes(d) ? list.filter((x) => x !== d) : [...list, d])

  async function finish() {
    setSaving(true)
    if (userId) {
      try {
        await saveProfile({
          id: userId, display_name: name.trim(), birth_date: birth,
          sport: sport.trim() || null,
          cycle_status: cycle ?? 'undisclosed',
          contraception: contraception ?? 'undisclosed',
          locale: locale as Locale,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })
        await saveConsent(userId, 'athlete', t.onboarding.consentVersion, consentA)
        await saveConsent(userId, 'guardian', t.onboarding.consentVersion, consentG)

        const entries: ScheduleEntry[] = [
          ...trainDays.map((d) => ({ athlete_id: userId, weekday: d, kind: 'training' as const, start_time: trainTime || null })),
          ...peDays.map((d) => ({ athlete_id: userId, weekday: d, kind: 'pe' as const, start_time: null })),
        ]
        if (entries.length) await saveSchedule(entries)
        if (eventDate) await saveAthleteEvent(userId, eventDate, 'competition')
        // Le date del ciclo stanno in una tabella a sé, e ci arrivano da sole.
        for (const d of dates.filter(Boolean)) await saveCycleEvent(userId, d, 'period_start')
      } catch { /* resta in coda locale */ }
    }
    setSaving(false)
    onDone()
  }

  if (step === 'welcome') return (
    <Frame title={t.onboarding.welcomeTitle} help={t.onboarding.welcomeBody}
           next={() => setStep('whoSees')} labels={L}>
      <div className="bab-card flex flex-col gap-2 px-4 py-4">
        <p className="bab-label">{t.onboarding.isTitle}</p>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-[15px]">
          {t.onboarding.isItems.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>
      <div className="bab-card flex flex-col gap-2 px-4 py-4" style={{ background: 'var(--color-sand)' }}>
        <p className="bab-label">{t.onboarding.isNotTitle}</p>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-[15px]">
          {t.onboarding.isNotItems.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>
    </Frame>
  )

  // 🔴 Prima del consenso, non dopo.
  if (step === 'whoSees') return (
    <Frame title={t.onboarding.whoSeesTitle} next={() => setStep('consent')} back onBack={() => setStep('welcome')} labels={L}>
      <div className="bab-card px-4 py-4"><p className="text-[15px]">{t.onboarding.whoSeesTeam}</p></div>
      <div className="bab-card px-4 py-4" style={{ background: 'var(--tempo-steady-tint)' }}>
        <p className="text-[15px]">{t.onboarding.whoSeesPrivate}</p>
      </div>
      <p className="text-[14px] text-[var(--color-ink-soft)]">{t.onboarding.whoSeesYou}</p>
    </Frame>
  )

  if (step === 'consent') return (
    <Frame title={t.onboarding.consentTitle} help={t.onboarding.consentHelp}
           next={() => setStep('name')} canNext={consentA && consentG} back onBack={() => setStep('whoSees')} labels={L}>
      <div className="bab-card px-4 py-3" style={{ background: 'var(--care-tint)', borderColor: 'var(--care)' }}>
        <p className="text-[14px]">{t.onboarding.consentDraftWarning}</p>
      </div>
      {([['athlete', consentA, setConsentA, t.onboarding.consentAthlete],
         ['guardian', consentG, setConsentG, t.onboarding.consentGuardian]] as const).map(([k, on, set, label]) => (
        <label key={k} className="bab-card flex cursor-pointer items-center gap-3 px-4 py-3 text-[15px]">
          <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="h-5 w-5" />
          {label}
        </label>
      ))}
    </Frame>
  )

  if (step === 'name') return (
    <Frame title={t.onboarding.nameTitle} help={t.onboarding.nameHelp}
           next={() => setStep('birthday')} canNext={name.trim().length > 0} back onBack={() => setStep('consent')} labels={L}>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40}
             placeholder={t.onboarding.namePlaceholder} autoComplete="given-name"
             className="bab-card px-4 py-3 text-[16px]" />
    </Frame>
  )

  if (step === 'birthday') return (
    <Frame title={t.onboarding.birthdayTitle} help={t.onboarding.birthdayHelp}
           next={() => setStep('sport')} canNext={age !== null && age >= 8 && age <= 80} back onBack={() => setStep('name')} labels={L}>
      <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)}
             aria-label={t.onboarding.birthdayTitle}
             className="bab-card px-4 py-3 text-[16px]" />
    </Frame>
  )

  if (step === 'sport') return (
    <Frame title={t.onboarding.sportTitle} help={t.onboarding.sportHelp}
           next={() => setStep('week')} canNext back onBack={() => setStep('birthday')} labels={L}>
      <p className="bab-label">{t.onboarding.sportLabel}</p>
      <input value={sport} onChange={(e) => setSport(e.target.value)} maxLength={40}
             aria-label={t.onboarding.sportLabel}
             className="bab-card px-4 py-3 text-[16px]" />
    </Frame>
  )

  if (step === 'week') return (
    <Frame title={t.onboarding.weekTitle} help={t.onboarding.weekHelp}
           next={() => setStep('rhythm')} canNext back onBack={() => setStep('sport')} labels={L}>
      <p className="bab-label">{t.onboarding.weekTraining}</p>
      <p className="text-[13px] text-[var(--color-ink-soft)]">{t.onboarding.weekTrainingHelp}</p>
      <PillGroup label={t.onboarding.weekTraining} value={trainDays.map(String)}
                 options={t.onboarding.weekdays.map((d, i) => ({ value: String(i + 1), label: d }))}
                 onChange={(v) => toggle(trainDays, setTrainDays, Number(v))} />
      <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
        {t.onboarding.timeLabel}
        <input type="time" value={trainTime} onChange={(e) => setTrainTime(e.target.value)}
               className="bab-card px-3 py-2 text-[16px] text-[var(--color-ink)]" />
      </label>

      <p className="bab-label">{t.onboarding.weekPe}</p>
      <p className="text-[13px] text-[var(--color-ink-soft)]">{t.onboarding.weekPeHelp}</p>
      <PillGroup label={t.onboarding.weekPe} value={peDays.map(String)}
                 options={t.onboarding.weekdays.map((d, i) => ({ value: String(i + 1), label: d }))}
                 onChange={(v) => toggle(peDays, setPeDays, Number(v))} />

      <p className="bab-label">{t.onboarding.weekEvents}</p>
      <p className="text-[13px] text-[var(--color-ink-soft)]">{t.onboarding.weekEventsHelp}</p>
      <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
        {t.onboarding.eventDateLabel}
        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
               className="bab-card px-3 py-2 text-[16px] text-[var(--color-ink)]" />
      </label>
    </Frame>
  )

  if (step === 'rhythm') return (
    <Frame title={t.onboarding.rhythmTitle} help={t.onboarding.rhythmBody} back onBack={() => setStep('week')} labels={L}>
      {([['tracking', t.onboarding.rhythmYes, t.onboarding.rhythmYesHelp],
         ['not_yet', t.onboarding.rhythmNotYet, t.onboarding.rhythmNotYetHelp],
         ['undisclosed', t.onboarding.rhythmSkip, t.onboarding.rhythmSkipHelp]] as const).map(([k, label, help]) => (
        <button key={k} type="button"
                onClick={() => { setCycle(k); setStep(k === 'tracking' ? 'dates' : 'done') }}
                className="bab-card flex flex-col gap-1 px-4 py-4 text-left">
          <span className="text-[16px] font-bold">{label}</span>
          <span className="text-[13.5px] text-[var(--color-ink-soft)]">{help}</span>
        </button>
      ))}
    </Frame>
  )

  if (step === 'dates') return (
    <Frame title={t.onboarding.datesTitle} help={t.onboarding.datesHelp}
           next={() => setStep(asksContraception ? 'contraception' : 'done')}
           canNext back onBack={() => setStep('rhythm')} labels={L}>
      {[t.onboarding.dateMostRecent, t.onboarding.datePrevious, t.onboarding.dateBefore].map((label, i) => (
        <label key={i} className="flex flex-col gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
          {label}
          <input type="date" value={dates[i]}
                 onChange={(e) => setDates((p) => p.map((d, j) => j === i ? e.target.value : d))}
                 className="bab-card px-3 py-2 text-[16px] text-[var(--color-ink)]" />
        </label>
      ))}
      <details className="bab-card px-4 py-3">
        <summary className="cursor-pointer text-[14px] font-bold">{t.onboarding.whyDatesTitle}</summary>
        <p className="mt-2 text-[14px]">{t.onboarding.whyDatesBody}</p>
      </details>
      <div className="bab-card px-4 py-3" style={{ background: 'var(--cycle-tint)' }}>
        <p className="text-[14px]"><Rich text={t.onboarding.cyclePrivacy} /></p>
      </div>
    </Frame>
  )

  // 🔴 Solo sopra i 15 anni (R3). Sotto, la domanda non compare proprio.
  if (step === 'contraception') return (
    <Frame title={t.onboarding.contraceptionTitle} help={t.onboarding.contraceptionHelp}
           next={() => setStep('done')} canNext={contraception !== null} back onBack={() => setStep('dates')} labels={L}>
      <PillGroup label={t.onboarding.contraceptionTitle} value={contraception}
                 options={[{ value: 'hormonal', label: t.common.yes },
                           { value: 'natural', label: t.common.no },
                           { value: 'undisclosed', label: t.checkin.common.dontKnow }]}
                 onChange={(v) => setContraception(v as 'hormonal' | 'natural' | 'undisclosed')} />
    </Frame>
  )

  return (
    <Frame title={t.onboarding.doneTitle} help={t.onboarding.doneBody} labels={L}>
      <dl className="bab-card flex flex-col gap-2 px-4 py-4 text-[15px]">
        <div><dt className="bab-label">{t.onboarding.nameTitle}</dt><dd>{name}</dd></div>
        {sport && <div><dt className="bab-label">{t.onboarding.sportLabel}</dt><dd>{sport}</dd></div>}
        {trainDays.length > 0 && (
          <div><dt className="bab-label">{t.onboarding.weekTraining}</dt>
            <dd>{trainDays.sort().map((d) => t.onboarding.weekdays[d - 1]).join(' · ')}</dd></div>
        )}
        {peDays.length > 0 && (
          <div><dt className="bab-label">{t.onboarding.weekPe}</dt>
            <dd>{peDays.sort().map((d) => t.onboarding.weekdays[d - 1]).join(' · ')}</dd></div>
        )}
        <div><dt className="bab-label">{t.rhythm.title}</dt>
          <dd>{cycle === 'tracking' ? t.onboarding.rhythmYes
             : cycle === 'not_yet' ? t.onboarding.rhythmNotYet : t.onboarding.rhythmSkip}</dd></div>
      </dl>
      <button type="button" onClick={() => void finish()} disabled={saving}
              className="bab-pill px-4 py-3 text-[16px] disabled:opacity-60"
              style={{ background: 'var(--color-lime)' }}>
        {saving ? t.checkin.post.saving : t.onboarding.doneCta}
      </button>
    </Frame>
  )
}
