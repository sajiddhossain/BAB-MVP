import { useState } from 'react'
import { fill, plural, useCopy, useLocale, type Locale } from '@/copy'
import PillGroup from '@/components/PillGroup'
import CalendarMultiSelect from '@/components/CalendarMultiSelect'
import { DateField, TimeField } from '@/components/fields'
import { Progress } from '@/components/Step'
import {
  saveProfile, saveConsent, saveSchedule, saveSports, saveAthleteEvent, saveCycleEvent,
  type ScheduleEntry,
} from '@/lib/repo'
import { useSession } from '@/lib/session'
import { SPORTS, sportLabel } from '@/content/sports'
import { minutesBetween } from '@/lib/agenda'
import { TEMPOS, type TempoCode } from '@/content/tempo'
import { bandFromBpm, type HeartBand } from '@/lib/heart'
import TapCounter from '@/components/TapCounter'
import Sparkle from '@/components/Sparkle'
import Mascot from '@/components/Mascot'
import BabLogo from '@/components/BabLogo'
import { ArrowLeftIcon, CheckIcon, CompassIcon, ContentIcon, HeartIcon, TempoIcon } from '@/components/icons'

/**
 * Onboarding — la forma decisa in R3, estesa in R3-bis per gli sport multipli
 * e per il calendario del ciclo.
 *
 * 🔴 Qui la procedura a passi è giusta, al contrario del check-in: si fa una
 * volta sola, e ci sono cancelli veri (la contraccezione si chiede solo dai
 * 16 anni in su; le date del ciclo solo se ha detto di averlo).
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
 * Il tabellone delle freccette — a cerchi pieni, non a contorno.
 *
 * 🔴 `TargetIcon` (in `components/icons.tsx`) è un contorno sottile, pensato
 * per stare dentro un badge colorato altrove. Qui invece l'icona È il
 * disegno: doveva somigliare al bersaglio vero — anelli pieni, non un
 * cerchietto vuoto — quindi resta locale a questa schermata.
 */
function DartboardIcon({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden>
      <circle cx="17" cy="17" r="16" fill="var(--color-coral)" />
      <circle cx="17" cy="17" r="12.5" fill="var(--color-surface)" />
      <circle cx="17" cy="17" r="9" fill="var(--color-coral)" />
      <circle cx="17" cy="17" r="5.5" fill="var(--color-surface)" />
      <circle cx="17" cy="17" r="2.2" fill="var(--color-coral)" />
      <circle cx="17" cy="17" r="16" fill="none" stroke="var(--color-ink)" strokeWidth="1.6" />
    </svg>
  )
}

/**
 * Il pallone — a pannelli pieni come l'emoji 🏐, non l'emoji stessa.
 *
 * 🔴 L'emoji vera rende in modo diverso su ogni sistema (e piccola, sgranata
 * su schermi ad alta densità). Stesso principio di `DartboardIcon`: campiture
 * piene (oro e teal della palette BAB) dentro il cerchio, cuciture sopra —
 * uguale su ogni telefono.
 */
/** Gli sparkles — l'SVG scelto dall'utente (svgrepo.com), a colori fissi come fornito. */
function SparklesIcon({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden>
      <path fill="#FFB636" d="M210.3 65.5c28.8 7.3 51.4 29.9 58.7 58.7c.7 2.8 4.3 2.8 5 0c7.3-28.8 29.9-51.4 58.7-58.7c2.8-.7 2.8-4.3 0-5c-28.8-7.3-51.4-29.9-58.7-58.7c-.7-2.8-4.3-2.8-5 0c-7.3 28.8-29.9 51.4-58.7 58.7c-2.8.7-2.8 4.3 0 5z" />
      <path fill="#FFD469" d="M6.7 188.3c50.8 12.9 90.8 52.9 103.7 103.7c1.2 4.9 7.5 4.9 8.8 0c12.9-50.8 52.9-90.8 103.7-103.7c4.9-1.2 4.9-7.5 0-8.8C172 166.7 132 126.7 119.2 75.9c-1.2-4.9-7.5-4.9-8.8 0c-12.9 50.8-52.9 90.8-103.7 103.7c-4.9 1.2-4.9 7.5 0 8.7z" />
      <path fill="#FFE1AB" d="M180 350.7c76 19.3 135.9 79.1 155.1 155.1c1.9 7.3 11.3 7.3 13.1 0c19.3-76 79.1-135.9 155.1-155.1c7.3-1.9 7.3-11.3 0-13.1c-76-19.3-135.9-79.1-155.1-155.1c-1.9-7.3-11.3-7.3-13.1 0c-19.3 76-79.1 135.9-155.1 155.1c-7.3 1.8-7.3 11.2 0 13.1z" />
    </svg>
  )
}

/** Un passo del metodo, numerato — la schermata «Indovina. Poi senti davvero.» */
function NumberedStep({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold"
            style={{ background: 'var(--color-lavender)' }}>
        {n}
      </span>
      <div className="flex flex-col gap-0.5">
        <p className="text-[14px] font-bold">{title}</p>
        <p className="text-[13px] text-[var(--color-ink-soft)]">{body}</p>
      </div>
    </div>
  )
}

/**
 * 🔴 Frame sta FUORI dal componente, e non è pignoleria: definito dentro,
 * sarebbe un tipo di componente nuovo a ogni render, React smonterebbe il
 * sottoalbero e il campo del nome perderebbe il fuoco a ogni lettera battuta.
 */
function Frame({ title, icon, headerRight, eyebrow, help, children, next, nextLabel, canNext, back, onBack, labels, at, of, extra, mascot }: {
  title: string; help?: string; children?: React.ReactNode
  /** Icona sopra l'eyebrow — sotto la barra di avanzamento, prima di ogni testo. */
  icon?: React.ReactNode
  /** Accanto alla barra di avanzamento, sulla stessa riga — oggi solo il marchio. */
  headerRight?: React.ReactNode
  /** Etichetta piccola sopra il titolo — solo dove il titolo da solo non basta. */
  eyebrow?: string
  next?: () => void
  /** Sostituisce `labels.continue` solo per questo passo — raro, di proposito. */
  nextLabel?: string
  canNext?: boolean; back?: boolean; onBack?: () => void
  labels: { back: string; continue: string }
  at: number; of: number
  /** Un secondo bottone, più leggero — oggi solo "non me lo ricordo". */
  extra?: { label: string; onClick: () => void }
  /**
   * 🔴 Compagna di sfondo, non protagonista: piccola, sempre nello stesso
   * punto, sotto il titolo. Gli step che già la mettono altrove apposta
   * (accanto al cuore, sopra la card del risultato...) non passano questo
   * prop, per non averne due sullo stesso schermo.
   */
  mascot?: boolean
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-3 px-5 py-6">
      <div className="flex items-center gap-3">
        {back && (
          <button type="button" onClick={onBack} aria-label={labels.back}
                  className="bab-pill flex h-10 w-10 shrink-0 items-center justify-center">
            <ArrowLeftIcon size={18} />
          </button>
        )}
        <Progress at={at} of={of} />
        {headerRight}
      </div>
      {icon}
      {eyebrow && <p className="bab-label">{eyebrow}</p>}
      <h1 className="font-display text-[24px] leading-tight">{title}</h1>
      {help && <p className="text-[14px] text-[var(--color-ink-soft)]">{help}</p>}
      {mascot && (
        <div className="flex justify-center py-1">
          <Mascot size={40} />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3">{children}</div>
      {next && (
        <button type="button" onClick={next} disabled={canNext === false}
                className="bab-pill px-4 py-3.5 text-[17px] disabled:opacity-40"
                style={canNext === false
                  ? undefined
                  : { background: 'var(--color-lime)', boxShadow: 'var(--shadow-lg)' }}>
          {nextLabel ?? labels.continue}
        </button>
      )}
      {extra && (
        <button type="button" onClick={extra.onClick}
                className="text-[14px] text-[var(--color-ink-soft)] underline">
          {extra.label}
        </button>
      )}
    </div>
  )
}

/**
 * 🔴 «La tua settimana» era un passo solo con dentro tre domande — allenamenti,
 * educazione fisica, gare — più due campi orario. È esattamente la cosa che
 * l'onboarding fa bene dappertutto tranne lì, quindi adesso sono tre passi.
 *
 * 🔴 R3-bis: con più sport, `trainDay`/`trainStart`/`trainEnd` si ripetono una
 * volta per ogni sport scelto — `trainIndex` dice a quale. La barra "passo X
 * di Y" si ricalcola da sola (vedi `buildFlow`), non è più un array fisso.
 */
type Step =
  | 'welcome'
  | 'heartConcept' | 'heartSettle' | 'heartGuess' | 'heartCount' | 'heartReveal' | 'heartWrap'
  | 'whoSees' | 'consent' | 'name' | 'birthday' | 'sport'
  | 'trainDay' | 'trainStart' | 'trainEnd'
  | 'pe' | 'events' | 'rhythm' | 'firstPeriodAge'
  | 'datesLast' | 'datesPrev' | 'datesBefore'
  | 'contraception' | 'done'

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

  const [step, setStep] = useState<Step>(
    (import.meta.env.DEV && (new URLSearchParams(location.search).get('step') as Step)) || 'welcome',
  )
  const [name, setName] = useState('')
  const [birth, setBirth] = useState('')

  // L'esercizio del battito: niente di questo si salva, è solo il concetto
  // provato una volta con le mani.
  const [heartGuessBand, setHeartGuessBand] = useState<HeartBand | null>(null)
  const [heartTaps, setHeartTaps] = useState<number | null>(null)

  const [sports, setSportsPicked] = useState<string[]>([])
  const [otherSport, setOtherSport] = useState('')
  const [trainIndex, setTrainIndex] = useState(0)
  const [trainDaysBySport, setTrainDaysBySport] = useState<Record<string, number[]>>({})
  const [trainStartBySport, setTrainStartBySport] = useState<Record<string, string>>({})
  const [trainEndBySport, setTrainEndBySport] = useState<Record<string, string>>({})

  const [peDays, setPeDays] = useState<number[]>([])
  const [eventDate, setEventDate] = useState('')
  const [cycle, setCycle] = useState<CycleStatus | null>(null)
  const [firstPeriodAge, setFirstPeriodAge] = useState<number | null>(null)
  const [lastCycleDays, setLastCycleDays] = useState<string[]>([])
  const [prevCycleStart, setPrevCycleStart] = useState<string[]>([])
  const [beforeCycleStart, setBeforeCycleStart] = useState<string[]>([])
  const [contraception, setContraception] = useState<'hormonal' | 'natural' | 'undisclosed' | null>(null)
  const [consentA, setConsentA] = useState(false)
  const [consentG, setConsentG] = useState(false)
  const [guardianName, setGuardianName] = useState('')
  const [guardianContact, setGuardianContact] = useState('')
  const [saving, setSaving] = useState(false)

  const L = { back: t.onboarding.back, continue: t.onboarding.continue }
  const age = ageFrom(birth)
  const asksContraception = cycle === 'tracking' && age !== null && age >= 16

  /** Gli sport scelti, come stringhe finite: "Altro" diventa quello che ha scritto. */
  const effectiveSports = sports
    .map((c) => (c === 'other' ? otherSport.trim() : c))
    .filter((s, i, arr) => s.length > 0 && arr.indexOf(s) === i)

  const toggle = (list: number[], set: (v: number[]) => void, d: number) =>
    set(list.includes(d) ? list.filter((x) => x !== d) : [...list, d])

  const toggleSport = (code: string) =>
    setSportsPicked((p) => (p.includes(code) ? p.filter((x) => x !== code) : [...p, code]))

  /**
   * L'elenco di tutte le schermate che si vedranno con le scelte fatte finora
   * — serve solo a calcolare "passo X di Y". Non un array fisso: cambia con
   * quanti sport ha scelto e se ha detto di avere il ciclo.
   */
  function buildFlow(): string[] {
    const flow = [
      'welcome', 'heartConcept', 'heartSettle', 'heartGuess', 'heartCount', 'heartReveal', 'heartWrap',
      'whoSees', 'consent', 'name', 'birthday', 'sport',
    ]
    for (const sport of effectiveSports) {
      flow.push(`trainDay:${sport}`, `trainStart:${sport}`, `trainEnd:${sport}`)
    }
    flow.push('pe', 'events', 'rhythm')
    if (cycle === 'tracking') flow.push('firstPeriodAge', 'datesLast', 'datesPrev', 'datesBefore')
    if (asksContraception) flow.push('contraception')
    flow.push('done')
    return flow
  }

  const currentTrainSport = effectiveSports[trainIndex]
  const currentKey =
    step === 'trainDay' || step === 'trainStart' || step === 'trainEnd'
      ? `${step}:${currentTrainSport}`
      : step
  const flow = buildFlow()
  const F = { labels: L, at: Math.max(1, flow.indexOf(currentKey) + 1), of: flow.length }

  async function finish() {
    setSaving(true)
    if (userId) {
      try {
        await saveProfile({
          id: userId, display_name: name.trim(), birth_date: birth,
          sport: effectiveSports[0] ?? null,
          cycle_status: cycle ?? 'undisclosed',
          first_period_age: firstPeriodAge,
          contraception: contraception ?? 'undisclosed',
          locale: locale as Locale,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })
        await saveConsent(userId, 'athlete', t.onboarding.consentVersion, consentA)
        await saveConsent(userId, 'guardian', t.onboarding.consentVersion, consentG,
          { name: guardianName, contact: guardianContact })

        if (effectiveSports.length) await saveSports(userId, effectiveSports)

        const entries: ScheduleEntry[] = []
        for (const sport of effectiveSports) {
          const days = trainDaysBySport[sport] ?? []
          const start = trainStartBySport[sport] || null
          const duration = start ? minutesBetween(start, trainEndBySport[sport] ?? '') : null
          for (const d of days) {
            entries.push({ athlete_id: userId, weekday: d, kind: 'training', sport, start_time: start, duration_min: duration })
          }
        }
        for (const d of peDays) entries.push({ athlete_id: userId, weekday: d, kind: 'pe', start_time: null })
        if (entries.length) await saveSchedule(entries)
        if (eventDate) await saveAthleteEvent(userId, eventDate, 'competition')

        // Le date del ciclo stanno in una tabella a sé, e ci arrivano da sole.
        // L'ultimo ciclo può avere più giorni: il primo toccato è l'inizio,
        // l'ultimo la fine — riusa i due valori che `cycle_events` ha già.
        if (lastCycleDays.length) {
          const sorted = [...lastCycleDays].sort()
          await saveCycleEvent(userId, sorted[0], 'period_start')
          if (sorted.length > 1) await saveCycleEvent(userId, sorted[sorted.length - 1], 'period_end')
        }
        if (prevCycleStart[0]) await saveCycleEvent(userId, prevCycleStart[0], 'period_start')
        if (beforeCycleStart[0]) await saveCycleEvent(userId, beforeCycleStart[0], 'period_start')
      } catch { /* resta in coda locale */ }
    }
    setSaving(false)
    onDone()
  }

  if (step === 'welcome') return (
    <Frame title={t.onboarding.welcomeTitle}
           headerRight={<BabLogo className="h-5 w-[59px] shrink-0 text-[var(--color-vividteal)]" />}
           icon={<SparklesIcon size={40} />}
           eyebrow={t.onboarding.welcomeEyebrow}
           next={() => setStep('heartConcept')} nextLabel={t.onboarding.welcomeCta} {...F}>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed [&_strong]:text-[var(--color-lavender)]">
        <p><Rich text={t.onboarding.welcomeBody1} /></p>
        <p><Rich text={t.onboarding.welcomeBody2} /></p>
      </div>
    </Frame>
  )

  // 🔴 R3-bis: prima di chiederle qualsiasi dato, le si fa PROVARE il concetto
  // — indovina, senti davvero, impara lo scarto — con le mani, non solo
  // raccontato. Niente di questi sei passi si salva: è un esercizio, non un
  // dato. I "gear" della schermata finale sono le andature vere di
  // `content/tempo.ts`, lette da lì e non riscritte qui.
  if (step === 'heartConcept') return (
    <Frame title={t.heart.conceptTitle} help={t.heart.conceptHelp}
           next={() => setStep('heartSettle')} canNext back onBack={() => setStep('welcome')} mascot {...F}>
      <div className="bab-card flex flex-col gap-3 px-4 py-3.5">
        <NumberedStep n={1} title={t.heart.step1Title} body={t.heart.step1Body} />
        <NumberedStep n={2} title={t.heart.step2Title} body={t.heart.step2Body} />
        <NumberedStep n={3} title={t.heart.step3Title} body={t.heart.step3Body} />
      </div>
      <p className="text-[13px] text-[var(--color-ink-soft)]">{t.heart.conceptFooter}</p>
    </Frame>
  )

  if (step === 'heartSettle') return (
    <Frame title={t.heart.settleTitle} help={t.heart.settleBody}
           next={() => setStep('heartGuess')} canNext back onBack={() => setStep('heartConcept')} {...F}>
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="flex items-center gap-2">
          <Mascot size={44} />
          <HeartIcon size={44} color="var(--care)" />
        </div>
        <p className="max-w-[280px] text-center text-[13px] text-[var(--color-ink-soft)]">{t.heart.settleNote}</p>
      </div>
    </Frame>
  )

  if (step === 'heartGuess') return (
    <Frame title={t.heart.guessTitle} help={t.heart.guessHelp}
           next={() => setStep('heartCount')} canNext={heartGuessBand !== null}
           back onBack={() => setStep('heartSettle')} {...F}>
      <div className="flex justify-center py-1">
        <Mascot size={44} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {([
          ['slow', 'moon', t.heart.slow, t.heart.slowHelp],
          ['medium', 'cloud-sun', t.heart.medium, t.heart.mediumHelp],
          ['fast', 'flame', t.heart.fast, t.heart.fastHelp],
        ] as const).map(([band, icon, label, help]) => (
          <button key={band} type="button" onClick={() => setHeartGuessBand(band)}
                  aria-pressed={heartGuessBand === band}
                  className="bab-pill flex flex-col items-center gap-1 px-2 py-3 text-center"
                  style={heartGuessBand === band
                    ? { background: 'var(--color-teal)', borderColor: 'var(--color-teal)', color: 'var(--color-surface)' }
                    : undefined}>
            <ContentIcon name={icon} size={22} color={heartGuessBand === band ? 'var(--color-surface)' : 'var(--color-ink)'} />
            <span className="text-[13px] font-bold">{label}</span>
            <span className="text-[10.5px] opacity-80">{help}</span>
          </button>
        ))}
      </div>
      <p className="text-[12.5px] text-[var(--color-ink-soft)]">{t.heart.guessFooter}</p>
    </Frame>
  )

  if (step === 'heartCount') return (
    <Frame title={t.heart.countTitle} help={t.heart.countHelp}
           next={() => setStep('heartReveal')} canNext={heartTaps !== null}
           back onBack={() => setStep('heartGuess')} mascot {...F}>
      <TapCounter durationSec={15} ariaLabel={t.heart.tapAriaLabel}
                  startLabel={t.heart.tapStart} startSub={t.heart.tapReady}
                  goLabel={t.heart.tapGo} goSub={t.heart.tapGoSub}
                  countingPrefix={t.heart.tapCounting} doneLabel={t.heart.tapDone}
                  unitLabel={t.heart.tapBeats} onDone={setHeartTaps} />
    </Frame>
  )

  if (step === 'heartReveal') {
    const bpm = (heartTaps ?? 0) * 4
    const measured = bandFromBpm(bpm)
    const match = heartGuessBand === measured
    const label = (b: HeartBand | null) => b === 'slow' ? t.heart.slow : b === 'medium' ? t.heart.medium : t.heart.fast
    return (
      <Frame title={match ? t.heart.revealMatchTitle : t.heart.revealMissTitle}
             next={() => setStep('heartWrap')} canNext back onBack={() => setStep('heartCount')} {...F}>
        <div className="flex justify-center py-1">
          <Mascot size={44} />
        </div>
        <div className="bab-card flex flex-col items-center gap-1 px-4 py-3.5">
          <span className="text-[38px] font-bold" style={{ color: 'var(--color-coral)' }}>{bpm}</span>
          <span className="text-[11px] text-[var(--color-ink-soft)]">{t.heart.bpmLabel}</span>
          <div className="mt-2 grid w-full grid-cols-2 gap-2">
            <div className="rounded-2xl px-2 py-2 text-center"
                 style={{ background: 'color-mix(in srgb, var(--color-lavender) 30%, white)' }}>
              <p className="bab-label">{t.heart.yourGuess}</p>
              <p className="text-[15px] font-bold">{label(heartGuessBand)}</p>
            </div>
            <div className="rounded-2xl px-2 py-2 text-center"
                 style={{ background: 'color-mix(in srgb, var(--color-pink) 30%, white)' }}>
              <p className="bab-label">{t.heart.youCounted}</p>
              <p className="text-[15px] font-bold">{label(measured)}</p>
            </div>
          </div>
        </div>
        <div className="bab-card px-3 py-2.5" style={{ background: 'var(--tempo-steady-tint)' }}>
          <p className="text-[13px]"><Rich text={match ? t.heart.revealMatchNote : t.heart.revealMissNote} /></p>
        </div>
        <p className="text-[12px] text-[var(--color-ink-soft)]">{t.heart.revealFooter}</p>
      </Frame>
    )
  }

  if (step === 'heartWrap') return (
    <Frame title={t.heart.wrapTitle} icon={<DartboardIcon size={34} />}
           eyebrow={t.heart.wrapReady} help={t.heart.wrapBody}
           next={() => setStep('whoSees')} canNext back onBack={() => setStep('heartReveal')} {...F}>
      <div className="bab-card flex flex-col gap-2.5 px-3.5 py-3">
        <div className="flex items-start gap-2.5">
          <CompassIcon size={19} color="var(--color-gold)" />
          <div>
            <p className="text-[13.5px] font-bold">{t.heart.checkinTitle}</p>
            <p className="text-[12.5px] text-[var(--color-ink-soft)]">{t.heart.checkinBody}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <CheckIcon size={19} color="var(--color-lavender)" />
          <div>
            <p className="text-[13.5px] font-bold">{t.heart.checkoutTitle}</p>
            <p className="text-[12.5px] text-[var(--color-ink-soft)]">{t.heart.checkoutBody}</p>
          </div>
        </div>
      </div>
      <p className="text-[13px]">{t.heart.gearsIntro}</p>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(TEMPOS) as TempoCode[]).map((code) => {
          const tempo = TEMPOS[code]
          return (
            <div key={code} className="bab-card flex flex-col items-center gap-0.5 px-1 py-2.5 text-center"
                 style={{ borderColor: `var(${tempo.cssVar})` }}>
              <TempoIcon code={code} size={19} color={`var(${tempo.cssVar})`} />
              <span className="text-[11.5px] font-bold">{tempo.name}</span>
            </div>
          )
        })}
      </div>
      <p className="text-[12px] text-[var(--color-ink-soft)]">{t.heart.wrapNote}</p>
    </Frame>
  )

  // 🔴 Prima del consenso, non dopo.
  if (step === 'whoSees') return (
    <Frame title={t.onboarding.whoSeesTitle} next={() => setStep('consent')} back onBack={() => setStep('heartWrap')} mascot {...F}>
      <div className="bab-card px-4 py-4"><p className="text-[15px]">{t.onboarding.whoSeesTeam}</p></div>
      <div className="bab-card px-4 py-4" style={{ background: 'var(--tempo-steady-tint)' }}>
        <p className="text-[15px]">{t.onboarding.whoSeesPrivate}</p>
      </div>
      <p className="text-[14px] text-[var(--color-ink-soft)]">{t.onboarding.whoSeesYou}</p>
    </Frame>
  )

  if (step === 'consent') return (
    <Frame title={t.onboarding.consentTitle} help={t.onboarding.consentHelp}
           next={() => setStep('name')}
           canNext={consentA && consentG && guardianName.trim().length > 0}
           back onBack={() => setStep('whoSees')} mascot {...F}>
      <div className="bab-card px-4 py-3" style={{ background: 'var(--care-tint)', borderColor: 'var(--care)' }}>
        <p className="text-[14px]">{t.onboarding.consentDraftWarning}</p>
      </div>
      {([['athlete', consentA, setConsentA, t.onboarding.consentAthlete],
         ['guardian', consentG, setConsentG, t.onboarding.consentGuardian]] as const).map(([k, on, set, label]) => (
        <label key={k} className="bab-card flex cursor-pointer items-center gap-3 px-4 py-3 text-[15px]">
          <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="sr-only" />
          <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                style={{ border: 'var(--bab-border) solid var(--color-ink)', background: on ? 'var(--color-lime)' : 'var(--color-surface)' }}>
            {on && <CheckIcon size={15} />}
          </span>
          {label}
        </label>
      ))}
      {consentG && (
        <div className="bab-card flex flex-col gap-2.5 px-4 py-3.5">
          <label className="flex flex-col gap-1 text-[13px] text-[var(--color-ink-soft)]">
            {t.onboarding.consentGuardianNameLabel}
            <input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} maxLength={100}
                   placeholder={t.onboarding.consentGuardianNamePlaceholder}
                   className="bab-card px-3 py-2.5 text-[15px] text-[var(--color-ink)]" />
          </label>
          <label className="flex flex-col gap-1 text-[13px] text-[var(--color-ink-soft)]">
            {t.onboarding.consentGuardianContactLabel}
            <input value={guardianContact} onChange={(e) => setGuardianContact(e.target.value)} maxLength={120}
                   placeholder={t.onboarding.consentGuardianContactPlaceholder}
                   className="bab-card px-3 py-2.5 text-[15px] text-[var(--color-ink)]" />
          </label>
          <p className="text-[12.5px] text-[var(--color-ink-soft)]">{t.onboarding.consentGuardianNote}</p>
        </div>
      )}
    </Frame>
  )

  if (step === 'name') return (
    <Frame title={t.onboarding.nameTitle} help={t.onboarding.nameHelp}
           next={() => setStep('birthday')} canNext={name.trim().length > 0} back onBack={() => setStep('consent')} mascot {...F}>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40}
             placeholder={t.onboarding.namePlaceholder} autoComplete="given-name"
             aria-label={t.onboarding.nameTitle}
             className="bab-card px-4 py-3 text-[16px]" />
    </Frame>
  )

  if (step === 'birthday') return (
    <Frame title={t.onboarding.birthdayTitle} help={t.onboarding.birthdayHelp}
           next={() => setStep('sport')} canNext={age !== null && age >= 12 && age <= 80} back onBack={() => setStep('name')} mascot {...F}>
      <DateField value={birth} onChange={setBirth} ariaLabel={t.onboarding.birthdayTitle} className="px-4 py-3" />
      {age !== null && age < 12 && (
        <p className="text-[13px]" style={{ color: 'var(--care)' }}>{t.onboarding.birthdayTooYoung}</p>
      )}
    </Frame>
  )

  if (step === 'sport') return (
    <Frame title={t.onboarding.sportTitle} help={t.onboarding.sportHelp}
           next={() => { setTrainIndex(0); setStep(effectiveSports.length ? 'trainDay' : 'pe') }}
           canNext back onBack={() => setStep('birthday')} mascot {...F}>
      <PillGroup columns={2} label={t.onboarding.sportLabel} value={sports}
                 options={SPORTS.map((s) => ({ value: s.code, label: s.label[locale] }))}
                 onChange={toggleSport} />
      {sports.includes('other') && (
        <input value={otherSport} onChange={(e) => setOtherSport(e.target.value)} maxLength={40}
               placeholder={t.onboarding.sportOtherPlaceholder}
               aria-label={t.onboarding.sportOtherPlaceholder}
               className="bab-card px-4 py-3 text-[16px]" />
      )}
    </Frame>
  )

  if (step === 'trainDay') return (
    <Frame title={fill(t.onboarding.trainDayTitle, { sport: sportLabel(currentTrainSport, locale) })}
           help={t.onboarding.weekTrainingHelp}
           next={() => setStep('trainStart')} canNext back
           onBack={() => {
             if (trainIndex > 0) { setTrainIndex(trainIndex - 1); setStep('trainEnd') } else setStep('sport')
           }} mascot {...F}>
      <PillGroup size="lg" label={t.onboarding.weekTraining}
                 value={(trainDaysBySport[currentTrainSport] ?? []).map(String)}
                 options={t.onboarding.weekdays.map((d, i) => ({ value: String(i + 1), label: d }))}
                 onChange={(v) => setTrainDaysBySport((p) => ({
                   ...p,
                   [currentTrainSport]: (() => {
                     const cur = p[currentTrainSport] ?? []
                     const d = Number(v)
                     return cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]
                   })(),
                 }))} />
    </Frame>
  )

  if (step === 'trainStart') return (
    <Frame title={t.onboarding.trainStartTitle}
           next={() => setStep('trainEnd')} canNext back onBack={() => setStep('trainDay')} mascot {...F}>
      <TimeField value={trainStartBySport[currentTrainSport] ?? ''}
                 onChange={(v) => setTrainStartBySport((p) => ({ ...p, [currentTrainSport]: v }))}
                 ariaLabel={t.onboarding.trainStartTitle} />
    </Frame>
  )

  if (step === 'trainEnd') return (
    <Frame title={t.onboarding.trainEndTitle} help={t.onboarding.trainEndHelp}
           next={() => {
             if (trainIndex + 1 < effectiveSports.length) { setTrainIndex(trainIndex + 1); setStep('trainDay') }
             else setStep('pe')
           }} canNext back onBack={() => setStep('trainStart')} mascot {...F}>
      <TimeField value={trainEndBySport[currentTrainSport] ?? ''}
                 onChange={(v) => setTrainEndBySport((p) => ({ ...p, [currentTrainSport]: v }))}
                 ariaLabel={t.onboarding.trainEndTitle} />
    </Frame>
  )

  if (step === 'pe') return (
    <Frame title={t.onboarding.weekPe} help={t.onboarding.weekPeHelp}
           next={() => setStep('events')} canNext back
           onBack={() => {
             if (effectiveSports.length) { setTrainIndex(effectiveSports.length - 1); setStep('trainEnd') } else setStep('sport')
           }} mascot {...F}>
      <PillGroup size="lg" label={t.onboarding.weekPe} value={peDays.map(String)}
                 options={t.onboarding.weekdays.map((d, i) => ({ value: String(i + 1), label: d }))}
                 onChange={(v) => toggle(peDays, setPeDays, Number(v))} />
    </Frame>
  )

  if (step === 'events') return (
    <Frame title={t.onboarding.weekEvents} help={t.onboarding.weekEventsHelp}
           next={() => setStep('rhythm')} canNext back onBack={() => setStep('pe')} mascot {...F}>
      <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
        {t.onboarding.eventDateLabel}
        <DateField value={eventDate} onChange={setEventDate} ariaLabel={t.onboarding.eventDateLabel} />
      </label>
    </Frame>
  )

  if (step === 'rhythm') return (
    <Frame title={t.onboarding.rhythmTitle} help={t.onboarding.rhythmBody} back onBack={() => setStep('events')} mascot {...F}>
      {([['tracking', t.onboarding.rhythmYes, t.onboarding.rhythmYesHelp],
         ['not_yet', t.onboarding.rhythmNotYet, undefined],
         ['undisclosed', t.onboarding.rhythmSkip, undefined]] as const).map(([k, label, help]) => (
        <button key={k} type="button"
                onClick={() => { setCycle(k); setStep(k === 'tracking' ? 'firstPeriodAge' : 'done') }}
                className="bab-card flex flex-col gap-1 px-4 py-4 text-left">
          <span className="text-[16px] font-bold">{label}</span>
          {help && <span className="text-[13.5px] text-[var(--color-ink-soft)]">{help}</span>}
        </button>
      ))}
    </Frame>
  )

  if (step === 'firstPeriodAge') return (
    <Frame title={t.onboarding.firstPeriodAgeTitle} help={t.onboarding.firstPeriodAgeHelp}
           next={() => setStep('datesLast')} canNext back onBack={() => setStep('rhythm')}
           extra={{ label: t.onboarding.datesSkip, onClick: () => { setFirstPeriodAge(null); setStep('datesLast') } }}
           mascot {...F}>
      <input type="number" inputMode="numeric" min={6} max={20}
             value={firstPeriodAge ?? ''}
             onChange={(e) => setFirstPeriodAge(e.target.value ? Number(e.target.value) : null)}
             placeholder={t.onboarding.firstPeriodAgePlaceholder}
             aria-label={t.onboarding.firstPeriodAgeTitle}
             className="bab-card px-4 py-3 text-[16px]" />
    </Frame>
  )

  if (step === 'datesLast') return (
    <Frame title={t.onboarding.datesTitle} help={t.onboarding.datesHelp}
           next={() => setStep('datesPrev')} canNext back onBack={() => setStep('rhythm')} mascot {...F}>
      <CalendarMultiSelect label={t.onboarding.datesTitle} selected={lastCycleDays} onChange={setLastCycleDays} />
      <div className="bab-card px-3 py-2.5" style={{ background: 'var(--cycle-tint)' }}>
        <p className="text-[13px]"><Rich text={t.onboarding.cyclePrivacy} /></p>
      </div>
    </Frame>
  )

  if (step === 'datesPrev') return (
    <Frame title={t.onboarding.datesPrevTitle} help={t.onboarding.datesPrevHelp}
           next={() => setStep('datesBefore')} canNext back onBack={() => setStep('datesLast')}
           extra={{ label: t.onboarding.datesSkip, onClick: () => { setPrevCycleStart([]); setStep('datesBefore') } }} mascot {...F}>
      <CalendarMultiSelect label={t.onboarding.datesPrevTitle} selected={prevCycleStart}
                           onChange={setPrevCycleStart} multiple={false} />
    </Frame>
  )

  if (step === 'datesBefore') return (
    <Frame title={t.onboarding.datesBeforeTitle} help={t.onboarding.datesBeforeHelp}
           next={() => setStep(asksContraception ? 'contraception' : 'done')}
           canNext back onBack={() => setStep('datesPrev')}
           extra={{
             label: t.onboarding.datesSkip,
             onClick: () => { setBeforeCycleStart([]); setStep(asksContraception ? 'contraception' : 'done') },
           }} mascot {...F}>
      <CalendarMultiSelect label={t.onboarding.datesBeforeTitle} selected={beforeCycleStart}
                           onChange={setBeforeCycleStart} multiple={false} />
    </Frame>
  )

  // 🔴 Solo dai 16 anni in su. Sotto, la domanda non compare proprio.
  if (step === 'contraception') return (
    <Frame title={t.onboarding.contraceptionTitle} help={t.onboarding.contraceptionHelp}
           next={() => setStep('done')} canNext={contraception !== null} back onBack={() => setStep('datesBefore')} mascot {...F}>
      <PillGroup label={t.onboarding.contraceptionTitle} value={contraception}
                 options={[{ value: 'hormonal', label: t.common.yes },
                           { value: 'natural', label: t.common.no },
                           { value: 'undisclosed', label: t.onboarding.contraceptionUndisclosed }]}
                 onChange={(v) => setContraception(v as 'hormonal' | 'natural' | 'undisclosed')} />
    </Frame>
  )

  const trainedSports = effectiveSports.filter((s) => (trainDaysBySport[s] ?? []).length)
  /** La più vecchia delle date segnate per l'ultimo ciclo: è l'inizio. */
  const lastCycleStart = lastCycleDays.length
    ? lastCycleDays.slice().sort()[0]
    : undefined

  return (
    <Frame title={fill(t.onboarding.doneTitle, { name })} help={t.onboarding.doneBody} {...F}>
      {/* 🔴 Stessa mascotte del Percorso e dello scintillio di fine check-in:
          non un'illustrazione a sé per questa schermata, è la stessa
          compagna. Qui accoglie invece di segnare "sei qui" — l'unico altro
          posto in cui compare senza essere accanto a una tappa "ora". */}
      <div className="flex justify-center py-1">
        <Mascot size={56} />
      </div>
      <dl className="bab-card relative flex flex-col gap-2 px-4 py-4 text-[15px]">
        <Sparkle />
        <div><dt className="bab-label">{t.onboarding.nameTitle}</dt><dd>{name}</dd></div>
        {effectiveSports.length > 0 && (
          <div><dt className="bab-label">{t.onboarding.sportLabel}</dt>
            <dd>{effectiveSports.map((s) => sportLabel(s, locale)).join(' · ')}</dd></div>
        )}
        {trainedSports.length > 0 && (
          <div>
            <dt className="bab-label">{t.onboarding.weekTraining}</dt>
            <dd className="flex flex-col gap-0.5">
              {trainedSports.map((s) => {
                const days = (trainDaysBySport[s] ?? []).slice().sort((a, b) => a - b)
                  .map((d) => t.onboarding.weekdays[d - 1]).join(' · ')
                const start = trainStartBySport[s]
                const end = trainEndBySport[s]
                const time = start && end ? ` · ${start}–${end}` : start ? ` · ${start}` : ''
                return <span key={s}>{sportLabel(s, locale)}: {days}{time}</span>
              })}
            </dd>
          </div>
        )}
        {peDays.length > 0 && (
          <div><dt className="bab-label">{t.onboarding.weekPe}</dt>
            <dd>{peDays.sort().map((d) => t.onboarding.weekdays[d - 1]).join(' · ')}</dd></div>
        )}
        {cycle === 'tracking' && lastCycleStart && (
          <div><dt className="bab-label">{t.onboarding.doneLastCycle}</dt>
            <dd>{new Date(lastCycleStart).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}</dd></div>
        )}
        {cycle === 'tracking' && firstPeriodAge !== null && age !== null && age >= firstPeriodAge && (
          <div><dd>{plural(age - firstPeriodAge, t.onboarding.doneCycleYearsOne, t.onboarding.doneCycleYears)}</dd></div>
        )}
      </dl>
      <button type="button" onClick={() => void finish()} disabled={saving}
              className="bab-pill px-4 py-3 text-[16px] disabled:opacity-60"
              style={{ background: 'var(--color-lime)' }}>
        {saving ? t.checkin.post.saving : t.onboarding.doneCta}
      </button>
    </Frame>
  )
}
