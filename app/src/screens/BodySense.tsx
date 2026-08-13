import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fill, useCopy, useLocale, type Locale } from '@/copy'
import PillGroup from '@/components/PillGroup'
import { Progress } from '@/components/Step'
import TapCounter from '@/components/TapCounter'
import { bandFromBpm, type HeartBand } from '@/lib/heart'
import {
  EXERCISES, EXERCISE_ORDER, WHEN_LABEL,
  type ExerciseId, type PickOption, type Step, type When,
} from '@/content/bodysense'

/**
 * Body-Sense — piccoli esercizi di interocezione, fuori dall'onboarding: si
 * fanno quando vuoi, non una volta sola. Presa da un mockup esterno
 * (bab-body-sense.html) e restilizzata sul sistema vero di BAB — niente tema
 * scuro, niente concetti nuovi ("gears" → le andature vere già in `content/tempo.ts`).
 *
 * 🔴 L'esercizio "Battito" NON duplica quello dell'onboarding: è lo stesso
 * `TapCounter` e le stesse soglie (`lib/heart.ts`), con lo stesso testo
 * (`t.heart.*`) — solo raggiungibile da qui invece che una volta sola.
 *
 * Niente di quello che si fa qui si salva: è pratica, non un dato.
 */

type Card = { id: ExerciseId | 'heartbeat'; emoji: string; name: string; trains: string; dur: string; when: When[] }

const WHEN_ORDER: When[] = ['before', 'after', 'match', 'anytime']

const TWOSIDES_OPT: Record<string, { emoji: string; label: Record<Locale, string> }> = {
  left: { emoji: '👈', label: { it: 'Sinistro', en: 'Left' } },
  same: { emoji: '⚖️', label: { it: 'Uguale', en: 'Same' } },
  right: { emoji: '👉', label: { it: 'Destro', en: 'Right' } },
}

function Kicker({ text }: { text: string }) {
  return <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">{text}</p>
}

/** Il cerchio che respira col ritmo dentro/fuori — nessun nuovo concetto, solo un timer visivo. */
function BreathOrb({ onCycle }: { onCycle: () => void }) {
  const [phase, setPhase] = useState<'in' | 'out'>('in')
  useEffect(() => {
    const ms = phase === 'in' ? 4000 : 6000
    const id = setTimeout(() => {
      setPhase((p) => (p === 'in' ? 'out' : 'in'))
      if (phase === 'in') onCycle()
    }, ms)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])
  return (
    <div
      className="mx-auto h-32 w-32 rounded-full border-[3px] border-[var(--color-ink)] transition-transform ease-in-out"
      style={{
        background: 'var(--tempo-steady-tint)',
        transform: phase === 'in' ? 'scale(1)' : 'scale(0.62)',
        transitionDuration: phase === 'in' ? '4000ms' : '6000ms',
      }}
    />
  )
}

function ScaleRow({ value, onPick }: { value: string | undefined; onPick: (v: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onPick(String(n))}
                aria-pressed={value === String(n)}
                className="bab-pill py-4 text-[17px] font-bold"
                style={value === String(n)
                  ? { background: 'var(--color-teal)', borderColor: 'var(--color-teal)', color: 'var(--color-surface)' }
                  : undefined}>
          {n}
        </button>
      ))}
    </div>
  )
}

export default function BodySense() {
  const t = useCopy()
  const locale = useLocale()

  const [filter, setFilter] = useState<'all' | When>('all')
  const [openId, setOpenId] = useState<ExerciseId | 'heartbeat' | null>(null)
  const [stepIdx, setStepIdx] = useState(0)
  const [data, setData] = useState<Record<string, string>>({})
  const [heartGuess, setHeartGuess] = useState<HeartBand | null>(null)
  const [heartTaps, setHeartTaps] = useState<number | null>(null)
  const [toast, setToast] = useState(false)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(false), 2600)
    return () => clearTimeout(id)
  }, [toast])

  const cards: Card[] = [
    { id: 'heartbeat', emoji: '❤️', name: t.bodySense.heartbeatName, trains: t.bodySense.heartbeatTrains,
      dur: t.bodySense.heartbeatDur, when: ['anytime', 'before'] },
    ...EXERCISE_ORDER.map((id): Card => {
      const e = EXERCISES[id]
      return { id, emoji: e.emoji, name: e.name[locale], trains: e.trains[locale], dur: e.dur[locale], when: e.when }
    }),
  ]
  const visible = filter === 'all' ? cards : cards.filter((c) => c.when.includes(filter))

  function open(id: ExerciseId | 'heartbeat') {
    setOpenId(id); setStepIdx(0); setData({}); setHeartGuess(null); setHeartTaps(null)
  }
  function close() { setOpenId(null) }

  const heartSteps = 3
  const totalSteps = openId === 'heartbeat' ? heartSteps : openId ? EXERCISES[openId].steps.length : 0
  const isLast = stepIdx >= totalSteps - 1

  function advance() {
    if (isLast) { close(); setToast(true) } else { setStepIdx((i) => i + 1) }
  }

  // 🔴 Il lettore resta DENTRO al flusso normale della pagina, non un overlay
  // a tutto schermo: `HurtButton` sta fuori dal router (§5, sempre a un
  // tocco), quindi qualunque cosa lo copra lo renderebbe irraggiungibile
  // proprio mentre un'atleta è concentrata su un esercizio.
  if (openId) {
    return (
      <section className="flex flex-col gap-4 pt-2">
        <Player openId={openId} stepIdx={stepIdx} totalSteps={totalSteps} isLast={isLast}
                data={data} setData={setData}
                heartGuess={heartGuess} setHeartGuess={setHeartGuess}
                heartTaps={heartTaps} setHeartTaps={setHeartTaps}
                onClose={close} onAdvance={advance} />
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4 pt-2">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-[26px]">{t.bodySense.title}</h1>
        <Link to="/me" className="text-[13.5px] underline text-[var(--color-ink-soft)]">
          {t.settings.back}
        </Link>
      </div>
      <p className="text-[15px] text-[var(--color-ink-soft)]">{t.bodySense.lead}</p>

      <PillGroup
        label={t.bodySense.filterAll}
        value={filter}
        onChange={(v) => setFilter(v as 'all' | When)}
        options={[
          { value: 'all', label: t.bodySense.filterAll },
          ...WHEN_ORDER.map((w) => ({ value: w, label: WHEN_LABEL[w][locale] })),
        ]}
      />

      <div className="grid grid-cols-2 gap-2.5">
        {visible.map((c) => (
          <button key={c.id} type="button" onClick={() => open(c.id)}
                  className="bab-card flex min-h-[140px] flex-col gap-1.5 px-3.5 py-3.5 text-left">
            <span aria-hidden className="text-[28px]">{c.emoji}</span>
            <span className="font-display text-[15px] leading-tight">{c.name}</span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--color-vividteal)' }}>{c.trains}</span>
            <span className="mt-auto text-[11px] text-[var(--color-ink-soft)]">⏱ {c.dur}</span>
          </button>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-2xl px-4 py-3 text-center text-[13.5px] font-bold"
             style={{ background: 'var(--color-ink)', color: 'var(--color-surface)', boxShadow: 'var(--shadow-md)' }}>
          {t.bodySense.finishToast}
        </div>
      )}
    </section>
  )
}

function Player({
  openId, stepIdx, totalSteps, isLast, data, setData,
  heartGuess, setHeartGuess, heartTaps, setHeartTaps, onClose, onAdvance,
}: {
  openId: ExerciseId | 'heartbeat'
  stepIdx: number
  totalSteps: number
  isLast: boolean
  data: Record<string, string>
  setData: (fn: (d: Record<string, string>) => Record<string, string>) => void
  heartGuess: HeartBand | null
  setHeartGuess: (b: HeartBand) => void
  heartTaps: number | null
  setHeartTaps: (n: number) => void
  onClose: () => void
  onAdvance: () => void
}) {
  const t = useCopy()
  const locale = useLocale()

  if (openId === 'heartbeat') return <HeartbeatPlayer {...{ stepIdx, isLast, heartGuess, setHeartGuess, heartTaps, setHeartTaps, onClose, onAdvance }} />

  const ex = EXERCISES[openId]
  const step = ex.steps[stepIdx]
  const canNext = step.kind === 'pick' || step.kind === 'scale' ? data[step.store] !== undefined : true

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--color-vividteal)' }}>
          {ex.emoji} {ex.name[locale]}
        </span>
        <button type="button" onClick={onClose} aria-label={t.bodySense.close}
                className="flex h-9 w-9 items-center justify-center text-[20px] text-[var(--color-ink-soft)]">
          ✕
        </button>
      </div>
      <div className="mb-4"><Progress at={stepIdx + 1} of={totalSteps} /></div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        <StepBody step={step} exId={openId} data={data} setData={setData} />
      </div>

      <button type="button" onClick={onAdvance} disabled={!canNext}
              className="bab-pill mt-4 px-4 py-3.5 text-[17px] disabled:opacity-40"
              style={canNext ? { background: 'var(--color-lime)', boxShadow: 'var(--shadow-lg)' } : undefined}>
        {isLast ? t.bodySense.finish : t.bodySense.next}
      </button>
    </div>
  )
}

function StepBody({ step, exId, data, setData }: {
  step: Step
  exId: ExerciseId
  data: Record<string, string>
  setData: (fn: (d: Record<string, string>) => Record<string, string>) => void
}) {
  const locale = useLocale()
  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }))

  return (
    <>
      <Kicker text={step.kicker[locale]} />
      <h2 className="font-display text-[22px] leading-tight">{step.title[locale]}</h2>
      {'body' in step && step.body && <p className="text-[14.5px] text-[var(--color-ink-soft)]">{step.body[locale]}</p>}

      {step.kind === 'pick' && (
        <div className={step.row ? 'grid gap-2' : 'flex flex-col gap-2'}
             style={step.row ? { gridTemplateColumns: `repeat(${step.options.length}, minmax(0, 1fr))` } : undefined}>
          {step.options.map((o) => (
            <PickButton key={o.value} option={o} row={Boolean(step.row)}
                        selected={data[step.store] === o.value} onPick={() => set(step.store, o.value)} />
          ))}
        </div>
      )}

      {step.kind === 'scale' && (
        <>
          <ScaleRow value={data[step.store]} onPick={(v) => set(step.store, v)} />
          <div className="flex justify-between text-[11px] text-[var(--color-ink-soft)]">
            <span>{step.low[locale]}</span>
            <span>{step.high[locale]}</span>
          </div>
        </>
      )}

      {step.kind === 'breath' && (
        <div className="flex flex-col items-center gap-4 pt-4">
          <BreathOrb onCycle={() => set('breathCycles', String(Number(data.breathCycles ?? '0') + 1))} />
        </div>
      )}

      {step.kind === 'reveal' && <Reveal exId={exId} data={data} />}
    </>
  )
}

function PickButton({ option, row, selected, onPick }: { option: PickOption; row: boolean; selected: boolean; onPick: () => void }) {
  const locale = useLocale()
  return (
    <button type="button" onClick={onPick} aria-pressed={selected}
            className={`bab-pill flex items-center gap-2 ${row ? 'flex-col justify-center px-2 py-3 text-center' : 'px-3.5 py-3 text-left'}`}
            style={selected
              ? { background: 'var(--color-teal)', borderColor: 'var(--color-teal)', color: 'var(--color-surface)' }
              : undefined}>
      {option.emoji && <span aria-hidden className="text-[20px]">{option.emoji}</span>}
      <span className="text-[14px] font-bold">{option.label[locale]}</span>
    </button>
  )
}

function Reveal({ exId, data }: { exId: ExerciseId; data: Record<string, string> }) {
  const t = useCopy()
  const locale = useLocale()

  if (exId === 'twosides') {
    const guess = data.guess, actual = data.actual
    const match = guess === actual
    const label = (v: string | undefined) => v && TWOSIDES_OPT[v] ? `${TWOSIDES_OPT[v].emoji} ${TWOSIDES_OPT[v].label[locale]}` : '—'
    return (
      <>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl px-2 py-2.5 text-center" style={{ background: 'color-mix(in srgb, var(--color-lavender) 30%, white)' }}>
            <p className="bab-label">{t.bodySense.twosidesYourGuess}</p>
            <p className="text-[15px] font-bold">{label(guess)}</p>
          </div>
          <div className="rounded-2xl px-2 py-2.5 text-center" style={{ background: 'color-mix(in srgb, var(--color-pink) 30%, white)' }}>
            <p className="bab-label">{t.bodySense.twosidesActual}</p>
            <p className="text-[15px] font-bold">{label(actual)}</p>
          </div>
        </div>
        <div className="bab-card px-3 py-2.5" style={{ background: 'var(--tempo-steady-tint)' }}>
          <p className="text-[13px]"><strong>{match ? t.bodySense.twosidesMatch : t.bodySense.twosidesMiss}</strong> {' '}
            {match ? t.bodySense.twosidesMatchNote : t.bodySense.twosidesMissNote}</p>
        </div>
      </>
    )
  }

  // zone
  const before = Number(data.before || 3), after = Number(data.after || 3)
  const diff = after - before
  const unit = Math.abs(diff) === 1 ? t.bodySense.zoneNotchOne : t.bodySense.zoneNotch
  const moved = diff === 0 ? t.bodySense.zoneSame
    : fill(diff < 0 ? t.bodySense.zoneDown : t.bodySense.zoneUp, { n: Math.abs(diff), unit })
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl px-2 py-2.5 text-center" style={{ background: 'color-mix(in srgb, var(--color-lavender) 30%, white)' }}>
          <p className="bab-label">{t.bodySense.zoneBefore}</p>
          <p className="text-[17px] font-bold">{before} / 5</p>
        </div>
        <div className="rounded-2xl px-2 py-2.5 text-center" style={{ background: 'color-mix(in srgb, var(--color-pink) 30%, white)' }}>
          <p className="bab-label">{t.bodySense.zoneAfter}</p>
          <p className="text-[17px] font-bold">{after} / 5</p>
        </div>
      </div>
      <div className="bab-card px-3 py-2.5" style={{ background: 'var(--tempo-steady-tint)' }}>
        <p className="text-[13px]"><strong>{moved}</strong> {t.bodySense.zoneNote}</p>
      </div>
    </>
  )
}

/** L'esercizio "Battito": stesso `TapCounter`, stesse soglie, stesso testo dell'onboarding. */
function HeartbeatPlayer({ stepIdx, isLast, heartGuess, setHeartGuess, heartTaps, setHeartTaps, onClose, onAdvance }: {
  stepIdx: number
  isLast: boolean
  heartGuess: HeartBand | null
  setHeartGuess: (b: HeartBand) => void
  heartTaps: number | null
  setHeartTaps: (n: number) => void
  onClose: () => void
  onAdvance: () => void
}) {
  const t = useCopy()
  const canNext = stepIdx === 0 ? heartGuess !== null : stepIdx === 1 ? heartTaps !== null : true

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--color-vividteal)' }}>
          ❤️ {t.bodySense.heartbeatName}
        </span>
        <button type="button" onClick={onClose} aria-label={t.bodySense.close}
                className="flex h-9 w-9 items-center justify-center text-[20px] text-[var(--color-ink-soft)]">
          ✕
        </button>
      </div>
      <div className="mb-4"><Progress at={stepIdx + 1} of={3} /></div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {stepIdx === 0 && (
          <>
            <Kicker text={t.heart.guessTitle} />
            <h2 className="font-display text-[22px] leading-tight">{t.heart.guessTitle}</h2>
            <p className="text-[14.5px] text-[var(--color-ink-soft)]">{t.heart.guessHelp}</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                ['slow', '🐢', t.heart.slow, t.heart.slowHelp],
                ['medium', '🚶', t.heart.medium, t.heart.mediumHelp],
                ['fast', '🐇', t.heart.fast, t.heart.fastHelp],
              ] as const).map(([band, emoji, label, help]) => (
                <button key={band} type="button" onClick={() => setHeartGuess(band)}
                        aria-pressed={heartGuess === band}
                        className="bab-pill flex flex-col items-center gap-1 px-2 py-3 text-center"
                        style={heartGuess === band
                          ? { background: 'var(--color-teal)', borderColor: 'var(--color-teal)', color: 'var(--color-surface)' }
                          : undefined}>
                  <span aria-hidden className="text-[22px]">{emoji}</span>
                  <span className="text-[13px] font-bold">{label}</span>
                  <span className="text-[10.5px] opacity-80">{help}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {stepIdx === 1 && (
          <>
            <Kicker text={t.heart.countTitle} />
            <h2 className="font-display text-[22px] leading-tight">{t.heart.countTitle}</h2>
            <p className="text-[14.5px] text-[var(--color-ink-soft)]">{t.heart.countHelp}</p>
            <TapCounter durationSec={15} ariaLabel={t.heart.tapAriaLabel}
                        startLabel={t.heart.tapStart} startSub={t.heart.tapReady}
                        goLabel={t.heart.tapGo} goSub={t.heart.tapGoSub}
                        countingPrefix={t.heart.tapCounting} doneLabel={t.heart.tapDone}
                        unitLabel={t.heart.tapBeats} onDone={setHeartTaps} />
          </>
        )}
        {stepIdx === 2 && (() => {
          const bpm = (heartTaps ?? 0) * 4
          const measured = bandFromBpm(bpm)
          const match = heartGuess === measured
          const label = (b: HeartBand | null) => b === 'slow' ? t.heart.slow : b === 'medium' ? t.heart.medium : t.heart.fast
          return (
            <>
              <Kicker text={match ? t.heart.revealMatchTitle : t.heart.revealMissTitle} />
              <h2 className="font-display text-[22px] leading-tight">{match ? t.heart.revealMatchTitle : t.heart.revealMissTitle}</h2>
              <div className="bab-card flex flex-col items-center gap-1 px-4 py-3.5">
                <span className="text-[38px] font-bold" style={{ color: 'var(--color-coral)' }}>{bpm}</span>
                <span className="text-[11px] text-[var(--color-ink-soft)]">{t.heart.bpmLabel}</span>
                <div className="mt-2 grid w-full grid-cols-2 gap-2">
                  <div className="rounded-2xl px-2 py-2 text-center" style={{ background: 'color-mix(in srgb, var(--color-lavender) 30%, white)' }}>
                    <p className="bab-label">{t.heart.yourGuess}</p>
                    <p className="text-[15px] font-bold">{label(heartGuess)}</p>
                  </div>
                  <div className="rounded-2xl px-2 py-2 text-center" style={{ background: 'color-mix(in srgb, var(--color-pink) 30%, white)' }}>
                    <p className="bab-label">{t.heart.youCounted}</p>
                    <p className="text-[15px] font-bold">{label(measured)}</p>
                  </div>
                </div>
              </div>
              <div className="bab-card px-3 py-2.5" style={{ background: 'var(--tempo-steady-tint)' }}>
                <p className="text-[13px]">{match ? t.heart.revealMatchNote.replace(/\*\*/g, '') : t.heart.revealMissNote.replace(/\*\*/g, '')}</p>
              </div>
            </>
          )
        })()}
      </div>

      <button type="button" onClick={onAdvance} disabled={!canNext}
              className="bab-pill mt-4 px-4 py-3.5 text-[17px] disabled:opacity-40"
              style={canNext ? { background: 'var(--color-lime)', boxShadow: 'var(--shadow-lg)' } : undefined}>
        {isLast ? t.bodySense.finish : t.bodySense.next}
      </button>
    </div>
  )
}
