import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fill, plural, useCopy, useLocale } from '@/copy'
import BodyMap from '@/components/BodyMap'
import PillGroup from '@/components/PillGroup'
import { regionLabel, type RegionCode } from '@/content/bodymap'
import { SENSATIONS, INTENSITIES } from '@/content/lexicon'
import { recentSignals } from '@/lib/repo'
import {
  WINDOWS, dayOf, daysAgo, heatOf, summarise,
  type Signal, type Spot, type Window,
} from '@/lib/bodyhistory'

/**
 * «Il mio corpo» — la mappa corporea che finalmente restituisce qualcosa.
 *
 * 🔴 È la stessa figura del check-in, non una seconda. Se fosse un altro
 * disegno — un diagramma, una tabella — quello che ha segnato col dito e quello
 * che rilegge non si riconoscerebbero come la stessa cosa, e il collegamento
 * fra «ho toccato qui» e «questo torna» è tutto il prodotto.
 *
 * §7: nessun punteggio, nessuna soglia, nessun verdetto. Si contano le volte e
 * si ripetono le parole che ha scelto lei.
 */

function Card({ children }: { children: React.ReactNode }) {
  return <section className="bab-card flex flex-col gap-3 px-4 py-4">{children}</section>
}

export default function Body() {
  const t = useCopy()
  const locale = useLocale()
  const [rows, setRows] = useState<Signal[] | null>(null)
  const [days, setDays] = useState<Window>(WINDOWS[0])
  const [picked, setPicked] = useState<RegionCode | null>(null)

  useEffect(() => {
    let alive = true
    recentSignals(400)
      .then((r) => { if (alive) setRows(r as Signal[]) })
      .catch(() => { if (alive) setRows([]) })
    return () => { alive = false }
  }, [])

  const history = useMemo(() => summarise(rows ?? [], days), [rows, days])
  const heat = useMemo(() => heatOf(history), [history])
  const flagged = useMemo(
    () => history.spots.filter((s) => s.flagged > 0).map((s) => s.region),
    [history],
  )

  if (!rows) {
    return <p className="pt-6 text-center text-[15px] text-[var(--color-ink-soft)]">{t.common.loading}</p>
  }

  const word = (code: string) =>
    SENSATIONS.find((s) => s.code === code)?.label[locale] ?? code

  const when = (day: string) => {
    const n = daysAgo(day)
    return n <= 0 ? t.body.lastToday
      : n === 1 ? t.body.lastYesterday
      : fill(t.body.lastAgo, { n })
  }

  const spot = picked ? history.spots.find((s) => s.region === picked) ?? null : null

  /** Mai segnato niente, in nessun periodo: è un'altra cosa da «questo mese no». */
  const neverAnything = rows.length === 0

  return (
    <section className="flex flex-col gap-4 pt-2">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-[26px]">{t.body.title}</h1>
        <Link to="/me" className="text-[13.5px] underline text-[var(--color-ink-soft)]">
          {t.settings.back}
        </Link>
      </div>

      {neverAnything ? (
        <Card>
          <h2 className="font-display text-[18px]">{t.body.emptyTitle}</h2>
          <p className="text-[15px] text-[var(--color-ink-soft)]">{t.body.emptyBody}</p>
          <Link to="/checkin/pre" className="bab-pill self-start px-5 py-2.5 text-[15px]"
                style={{ background: 'var(--color-lime)' }}>
            {t.today.fresh.cta}
          </Link>
        </Card>
      ) : (
        <>
          <p className="text-[15px] text-[var(--color-ink-soft)]">{t.body.lede}</p>

          {/* L'etichetta serve: sotto ci sono subito «Fronte / Retro», che sono
              pillole identiche, e senza una parola sopra le due file si leggono
              come un unico gruppo di quattro scelte. */}
          <p className="bab-label">{t.body.windowLabel}</p>
          <PillGroup
            label={t.body.windowLabel}
            value={String(days)}
            options={WINDOWS.map((w) => ({
              value: String(w),
              label: fill(t.body.windowOption, { n: w }),
            }))}
            onChange={(v) => { setDays(Number(v) as Window); setPicked(null) }}
          />

          {history.total === 0 ? (
            <Card>
              <h2 className="font-display text-[18px]">{fill(t.body.quietTitle, { days })}</h2>
              <p className="text-[15px] text-[var(--color-ink-soft)]">{t.body.quietBody}</p>
            </Card>
          ) : (
            <>
              <BodyMap
                heat={heat}
                flagged={flagged}
                selected={picked}
                hint={t.body.pickHint}
                onSelect={(r) => setPicked((p) => (p === r ? null : r))}
              />
              <p className="text-center text-[13px] text-[var(--color-ink-soft)]">{t.body.heatNote}</p>

              {/* 🔴 Toccare una zona vuota deve dire «qui niente», non restare
                  muto: il silenzio si legge come «non ha funzionato». */}
              {picked && !spot && (
                <Card>
                  <h2 className="font-display text-[18px]">{regionLabel(picked, locale)}</h2>
                  <p className="text-[15px] text-[var(--color-ink-soft)]">{t.body.nothingHere}</p>
                </Card>
              )}

              {spot && <Detail spot={spot} days={days} word={word} when={when} />}

              {!picked && (
                <Card>
                  <h2 className="font-display text-[18px]">{t.body.topTitle}</h2>
                  <ul className="flex flex-col gap-2">
                    {history.spots.slice(0, 5).map((s) => (
                      <li key={s.region}>
                        <button type="button" onClick={() => setPicked(s.region)}
                                className="bab-pill flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-[14.5px]"
                                style={s.flagged > 0 ? { borderColor: 'var(--care)' } : undefined}>
                          <span>
                            {s.flagged > 0 && <span aria-hidden>🚩 </span>}
                            {regionLabel(s.region, locale)}
                          </span>
                          <span className="text-[13px] font-normal text-[var(--color-ink-soft)]">
                            {plural(s.times, t.body.timesOne, t.body.times)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </>
          )}

          {history.undated > 0 && (
            <p className="px-1 text-[13px] text-[var(--color-ink-soft)]">
              {plural(history.undated, t.body.undatedOne, t.body.undated)}
            </p>
          )}
        </>
      )}

      {/* 🔴 Sopra ogni ipotesi, sempre — la stessa riga della vista Me. */}
      <p className="px-1 text-[13px] text-[var(--color-ink-soft)]">{t.me.insightCaveat}</p>
    </section>
  )
}

/** Cosa ha sentito in una zona sola. Le sue parole, non le nostre. */
function Detail({ spot, days, word, when }: {
  spot: Spot
  days: number
  word: (code: string) => string
  when: (day: string) => string
}) {
  const t = useCopy()
  const locale = useLocale()

  return (
    <Card>
      <h2 className="font-display text-[20px]">{regionLabel(spot.region, locale)}</h2>
      <p className="text-[15px]">
        {fill(plural(spot.times, t.body.summaryOne, t.body.summary), {
          n: spot.times, days, when: spot.last ? when(spot.last) : '',
        })}
      </p>

      {spot.flagged > 0 && (
        <p className="text-[14px]" style={{ color: 'var(--care)' }}>
          {plural(spot.flagged, t.body.flaggedOne, t.body.flagged)}
        </p>
      )}

      <p className="bab-label pt-1">{t.body.wordsTitle}</p>
      <ul className="flex flex-wrap gap-2">
        {spot.words.map((w) => (
          <li key={w.sensation} className="bab-pill px-3 py-1.5 text-[13.5px]">
            {word(w.sensation)}
            {w.times > 1 && (
              <span className="font-normal text-[var(--color-ink-soft)]"> · {w.times}</span>
            )}
          </li>
        ))}
      </ul>

      <p className="bab-label pt-1">{t.body.entriesTitle}</p>
      <ul className="flex flex-col gap-1.5 text-[14px]">
        {spot.entries.map((e, i) => {
          const strength = INTENSITIES.find((x) => x.value === e.intensity)?.label[locale]
          // 🔴 `dayOf`, non i primi dieci caratteri del timestamp: quello è il
          // giorno UTC, e un check-in fatto alle 23:30 finirebbe scritto domani.
          const day = dayOf(e)
          return (
            <li key={e.id ?? i} className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-[var(--color-ink-soft)]">{day ? when(day) : ''}</span>
              <span>{word(e.sensation)}</span>
              {strength && (
                <span className="text-[13px] text-[var(--color-ink-soft)]">· {strength}</span>
              )}
              {e.region_free?.trim() && (
                <span className="text-[13px] text-[var(--color-ink-soft)]">
                  · {e.region_free.trim()}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
