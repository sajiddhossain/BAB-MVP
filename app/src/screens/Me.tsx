import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fill, useCopy } from '@/copy'
import { recentCheckIns } from '@/lib/repo'
import {
  closedLoops, dayStates, errorSeries, lastDays, sparkline, trend,
  type DayState, type Row,
} from '@/lib/insights'

/**
 * Vista "Me" — la sua dashboard.
 *
 * 🔴 R7: entra nella v1 perché è ciò che la motiva a tornare. E deve mostrare
 * **anche le assenze**: "quando non l'ho fatto" è informazione, e nasconderla
 * la renderebbe più gentile ma meno vera.
 *
 * 🔴 §7 vieta punteggi e numeri rossi. Quindi lo scarto si vede come FORMA —
 * una linea senza assi — e si legge a parole. La domanda è sempre «quanto bene
 * mi leggo», mai «quanto sono in forma».
 */

/** Sotto questa soglia non si dice niente su una tendenza: sarebbe rumore. */
const NEEDED = 6
const W = 260
const H = 56

function Card({ children }: { children: React.ReactNode }) {
  return <section className="bab-card flex flex-col gap-3 px-4 py-4">{children}</section>
}

const DOT: Record<DayState, { bg: string; border: string }> = {
  both: { bg: 'var(--color-teal)', border: 'var(--color-teal)' },
  pre:  { bg: 'var(--tempo-steady-tint)', border: 'var(--color-teal)' },
  none: { bg: 'transparent', border: 'var(--color-sand)' },
}

export default function Me() {
  const t = useCopy()
  const [rows, setRows] = useState<Row[] | null>(null)

  useEffect(() => {
    let alive = true
    recentCheckIns(200)
      .then((r) => { if (alive) setRows(r as Row[]) })
      .catch(() => { if (alive) setRows([]) })
    return () => { alive = false }
  }, [])

  if (!rows) {
    return <p className="pt-6 text-center text-[15px] text-[var(--color-ink-soft)]">{t.common.loading}</p>
  }

  const series = errorSeries(rows)
  const done = closedLoops(rows)
  const days = lastDays(28)
  const states = dayStates(rows, days)
  const tr = trend(series)
  const line = sparkline(series, W, H)

  /** La story si sblocca dopo una settimana in cui ha fatto almeno qualcosa. */
  const activeDays = days.filter((d) => states[d] !== 'none').length
  const storyReady = activeDays >= 7

  return (
    <section className="flex flex-col gap-4 pt-2">
      <h1 className="font-display text-[26px]">{t.me.title}</h1>

      {/* 1 · La mia lettura — la metrica del prodotto, in cima. */}
      <Card>
        {tr === 'tooEarly' ? (
          <>
            <h2 className="font-display text-[18px]">{t.me.collectingTitle}</h2>
            <p className="text-[15px] text-[var(--color-ink-soft)]">{t.me.collectingBody}</p>
            <div className="flex items-center gap-2" role="img"
                 aria-label={fill(t.me.collectingCount, { done, total: NEEDED })}>
              {Array.from({ length: NEEDED }, (_, i) => (
                <span key={i} className="h-3 w-3 rounded-full"
                      style={{ background: i < done ? 'var(--color-teal)' : 'transparent',
                               border: `2px solid ${i < done ? 'var(--color-teal)' : 'var(--color-sand)'}` }} />
              ))}
            </div>
            <p className="text-[14px]">{fill(t.me.collectingCount, { done, total: NEEDED })}</p>
            {done < NEEDED && (
              <p className="text-[14px] text-[var(--color-ink-soft)]">
                {fill(t.me.collectingLeft, { n: NEEDED - done })}
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="font-display text-[18px]">{t.me.readingTitle}</h2>
            <p className="bab-label">{t.me.readingLabel}</p>
            {/* Nessun asse, nessuna tacca, nessun numero: solo la forma. */}
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
                 aria-label={t.me.readingLabel}>
              <polyline points={line} fill="none" stroke="var(--color-teal)"
                        strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-[15px]">
              {tr === 'down' ? t.me.readingDown : tr === 'up' ? t.me.readingUp : t.me.readingFlat}
            </p>
            <p className="text-[13px] text-[var(--color-ink-soft)]">{t.me.readingNoAxis}</p>
          </>
        )}
      </Card>

      {/* 2 · Le mie giornate — comprese quelle vuote (R7). */}
      <Card>
        <h2 className="font-display text-[18px]">{t.me.daysTitle}</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d) => (
            <span key={d} className="aspect-square rounded-[5px]"
                  title={d}
                  style={{ background: DOT[states[d]].bg, border: `2px solid ${DOT[states[d]].border}` }} />
          ))}
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-[var(--color-ink-soft)]">
          {([['both', t.me.dayBoth], ['pre', t.me.dayHalf], ['none', t.me.dayNone]] as const).map(([k, label]) => (
            <li key={k} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[4px]"
                    style={{ background: DOT[k].bg, border: `2px solid ${DOT[k].border}` }} />
              {label}
            </li>
          ))}
        </ul>
        <p className="text-[13px] text-[var(--color-ink-soft)]">{t.me.daysHelp}</p>
      </Card>

      {/* 3 · La mia storia — l'output "Communicate". */}
      <Card>
        <h2 className="font-display text-[18px]">{t.me.storyTitle}</h2>
        <p className="text-[15px] text-[var(--color-ink-soft)]">{t.me.storyBody}</p>
        {storyReady ? (
          <Link to="/story" className="bab-pill self-start px-4 py-2 text-[14px]"
                style={{ background: 'var(--color-lime)' }}>
            {t.me.storyCta}
          </Link>
        ) : (
          <p className="text-[13px] text-[var(--color-ink-soft)]">{t.me.storyLocked}</p>
        )}
      </Card>

      {/* 🔴 Sopra ogni ipotesi, sempre. Vale anche quando le ipotesi non ci sono
          ancora: insegna da subito come vanno prese. */}
      <p className="px-1 text-[13px] text-[var(--color-ink-soft)]">{t.me.insightCaveat}</p>

      {/* I dati sono suoi, e la porta per portarseli via sta dove stanno i
          suoi dati — non sepolta in un menu che nessuno apre. */}
      <Link to="/settings" className="px-1 text-[13.5px] underline text-[var(--color-ink-soft)]">
        {t.settings.open}
      </Link>
    </section>
  )
}
