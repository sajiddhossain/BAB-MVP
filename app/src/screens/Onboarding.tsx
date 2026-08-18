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
import { ArrowLeftIcon, CheckIcon, ContentIcon, HeartIcon, MoonIcon, SunIcon, TempoIcon } from '@/components/icons'

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
/** Il pallone — l'SVG scelto dall'utente (svgrepo.com), a colori fissi come fornito. */
function VolleyballIcon({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512.001 512.001" aria-hidden>
      <path style={{ fill: '#0089A0' }} d="M482.963,155.719c13.567,30.666,21.106,64.588,21.106,100.287c0,39.887-9.411,77.574-26.14,110.957
        l-0.254-0.127c-34.726-34.726-68.955-58.582-99.748-74.962c-69.823-37.137-121.922-35.868-121.922-35.868
        c0-41.97-10.638-77.129-25.886-105.955c8.396-6.197,120.854-85.705,252.833,5.668L482.963,155.719L482.963,155.719z" />
      <path style={{ fill: '#E7ECED' }} d="M482.963,155.719h-0.011c-131.979-91.373-244.437-11.864-252.833-5.668
        c-35.805-67.75-96.999-100.562-105.162-104.718c38.025-23.708,82.935-37.402,131.048-37.402
        C357.318,7.931,444.44,68.67,482.963,155.719z" />
      <path style={{ fill: '#FFD248' }} d="M477.676,366.836l0.254,0.127C437.208,448.258,353.12,504.07,256.005,504.07
        c-44.095,0-85.494-11.505-121.373-31.67c195.266-0.021,242.766-179.447,242.766-179.447l0.529-1.079
        C408.72,308.254,442.949,332.109,477.676,366.836z" />
      <path style={{ fill: '#E7ECED' }} d="M155.707,328.514c83.908-26.066,100.298-72.508,100.298-72.508s52.1-1.269,121.922,35.868
        l-0.529,1.079c0,0-47.5,179.426-242.766,179.447c-49.869-28.022-89.068-72.783-109.973-126.67
        C80.481,345.655,123.17,338.613,155.707,328.514z" />
      <path style={{ fill: '#FFD248' }} d="M230.119,150.051c15.248,28.826,25.886,63.985,25.886,105.955c0,0-16.39,46.443-100.298,72.508
        C155.189,145.038,50.154,118.772,50.154,118.772l-0.582-0.381c19.626-29.386,45.353-54.342,75.385-73.058
        C133.121,49.489,194.314,82.301,230.119,150.051z" />
      <path style={{ fill: '#0089A0' }} d="M50.154,118.772c0,0,105.035,26.267,105.553,209.742c-32.537,10.098-75.226,17.141-131.048,17.215
        c-10.807-27.821-16.729-58.085-16.729-89.723c0-50.916,15.333-98.236,41.642-137.615L50.154,118.772z" />
      <path d="M490.216,152.51L490.216,152.51c-41-92.646-132.932-152.51-234.209-152.51c-47.973,0-94.739,13.349-135.242,38.602
        c-30.75,19.165-57.648,45.232-77.785,75.384C14.862,156.07,0,205.179,0,256.006c0,31.945,5.81,63.098,17.266,92.592
        c21.418,55.208,61.72,101.63,113.481,130.715C168.793,500.698,212.107,512,256.005,512c48.422,0,95.567-13.586,136.339-39.289
        c39.665-25.006,71.711-60.346,92.676-102.196c17.903-35.728,26.98-74.253,26.98-114.51C512,220.004,504.671,185.183,490.216,152.51z
        M462.828,133.906c-23.572-13.009-47.849-21.834-72.464-26.295c-27.02-4.897-54.522-4.59-81.743,0.913
        c-36.279,7.333-62.998,21.966-75.773,30.094c-28.935-50.07-71.055-80.451-92.032-93.367c35.18-19.26,74.723-29.387,115.19-29.387
        C341.549,15.862,419.978,61.395,462.828,133.906z M125.322,54.524c15.496,8.629,66.723,40.454,97.786,99.235
        c16.333,30.876,24.728,64.75,24.961,100.704c-2.911,6.518-20.801,40.554-84.603,63.122c-0.998-38.302-6.69-72.536-16.987-101.872
        c-9.121-25.99-21.848-48.246-37.826-66.152c-17.987-20.158-36.028-30.249-46.758-34.923C79.144,91.031,100.854,70.44,125.322,54.524
        z M15.862,256.006c0-45.593,12.754-89.704,36.927-127.988c8.116,3.155,25.936,11.822,44.032,32.102
        c40.26,45.12,50.078,112.12,50.897,162.495c-33.347,9.617-72.85,14.698-117.578,15.137
        C20.662,311.613,15.862,284.141,15.862,256.006z M36.503,353.525c46.264-0.901,87.118-6.747,121.557-17.437
        c70.75-21.978,95.746-58.277,102.946-72.012c13.654,0.737,55.018,5.199,107.232,31.701c-4.144,12.591-17.374,47.717-45.549,82.381
        c-20.389,25.085-44.54,45.055-71.782,59.356c-33.503,17.588-71.911,26.63-114.201,26.927
        C92.372,439.017,57.177,399.982,36.503,353.525z M383.885,459.294c-38.235,24.104-82.456,36.845-127.88,36.845
        c-30.908,0-61.5-5.97-89.926-17.428c33.602-3.481,64.637-12.622,92.563-27.344c29.191-15.389,55.018-36.825,76.766-63.712
        c27.955-34.563,41.755-68.817,47.027-84.245c30.005,16.975,58.782,38.858,85.718,65.184
        C448.482,405.593,419.452,436.871,383.885,459.294z M475.459,353.596c-29.4-28.122-60.91-51.224-93.807-68.723
        c-55.738-29.646-100.294-35.454-117.837-36.555c-1.033-33.868-8.906-65.979-23.461-95.649c10.913-7.026,36.555-21.552,71.411-28.598
        c56.625-11.446,112.07,0.984,164.827,36.918c12.96,30.043,19.548,61.994,19.548,95.018
        C496.138,290.114,489.172,322.885,475.459,353.596z" />
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
           headerRight={<BabLogo className="h-5 w-[59px] shrink-0 text-[var(--color-ink)]" />}
           icon={<VolleyballIcon size={40} />}
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
          <SunIcon size={19} color="var(--color-gold)" />
          <div>
            <p className="text-[13.5px] font-bold">{t.heart.checkinTitle}</p>
            <p className="text-[12.5px] text-[var(--color-ink-soft)]">{t.heart.checkinBody}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MoonIcon size={19} color="var(--color-lavender)" />
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
