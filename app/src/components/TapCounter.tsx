import { useEffect, useState } from 'react'

/**
 * Il cerchio a cui si tocca a ogni battito, per un tempo fisso. Nato per
 * l'esercizio del battito in onboarding (`Onboarding.tsx`), riusato in
 * Body-Sense: stessa interazione, stesso ritmo — non due widget diversi che
 * un'atleta deve imparare a leggere due volte.
 *
 * Niente di quello che conta qui si salva: è un esercizio, non un dato.
 */
export default function TapCounter({
  durationSec, ariaLabel, startLabel, startSub, goLabel, goSub,
  countingPrefix, doneLabel, unitLabel, onDone,
}: {
  durationSec: number
  ariaLabel: string
  startLabel: string
  startSub: string
  goLabel: string
  goSub: string
  countingPrefix: string
  doneLabel: string
  unitLabel: string
  /** Chiamata una volta sola, quando il tempo scade. */
  onDone: (taps: number) => void
}) {
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [left, setLeft] = useState(durationSec)
  const [taps, setTaps] = useState(0)

  // Un timeout alla volta, non un intervallo: si riattacca da solo a ogni
  // render finché `running` resta vero, e si ferma da solo appena arriva a zero.
  useEffect(() => {
    if (!running) return
    if (left <= 0) { setRunning(false); setDone(true); onDone(taps); return }
    const id = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, left])

  const timerLabel = done
    ? `${doneLabel} ${taps} ${unitLabel}`
    : running ? `${countingPrefix} ${left}s`
    : startSub
  const big = done ? String(taps) : running ? goLabel : startLabel
  const sub = done ? unitLabel : running ? goSub : startSub

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <p className="text-[13px] font-bold text-[var(--color-ink-soft)]">{timerLabel}</p>
      <button type="button" disabled={done} aria-label={ariaLabel}
              onClick={() => {
                if (!running) { setRunning(true); setLeft(durationSec); setTaps(0); return }
                setTaps((n) => n + 1)
              }}
              className={`bab-pill flex h-40 w-40 flex-col items-center justify-center gap-1 disabled:opacity-70 ${
                running ? 'animate-pulse' : ''
              }`}
              style={{ background: 'var(--color-pink)', boxShadow: 'var(--shadow-lg)' }}>
        <span className="text-[30px] font-bold">{big}</span>
        <span className="text-[11px]">{sub}</span>
      </button>
    </div>
  )
}
