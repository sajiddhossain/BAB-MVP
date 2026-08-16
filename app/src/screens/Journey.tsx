import { useEffect, useState } from 'react'
import { fill, useCopy, useLocale } from '@/copy'
import { MONTHS, WEEKS, type JourneyWeek } from '@/content/journey'
import {
  currentWeek, journeyStart, missionProgress, progressRowFor, weekOf, weekWindow,
  type CheckIn, type BodySignal, type JourneyRow,
} from '@/lib/journey'
import { recentCheckIns, recentSignals, listJourney, saveJourneyWeek } from '@/lib/repo'
import { useSession } from '@/lib/session'
import Sparkle from '@/components/Sparkle'
import Mascot from '@/components/Mascot'
import { EyeIcon, PuzzleIcon } from '@/components/icons'

/** Icona del mese — occhio per «riconosci» (mese 1), puzzle per «capisci» (mese 2). */
function MonthIcon({ month, size = 14 }: { month: 1 | 2; size?: number }) {
  return month === 1 ? <EyeIcon size={size} /> : <PuzzleIcon size={size} />
}

/**
 * Il Percorso — Mesi 1 e 2, le 8 settimane richieste dal pilota.
 *
 * 🔴 Le settimane si sbloccano in ordine, mai a salti: `riconosci → capisci`
 * è una scala, non otto moduli indipendenti (vedi `content/journey.ts`).
 * Si può sempre tornare indietro a rileggere una settimana già fatta, mai
 * saltare avanti a una che non è ancora arrivata.
 *
 * 🔴 La missione si spunta da sola quando il numero è raggiunto — nessun
 * bottone "fatto" da premere, nessun voto. §7.
 */

function Card({ children, relative }: { children: React.ReactNode; relative?: boolean }) {
  return (
    <section className={`bab-card flex flex-col gap-3 px-4 py-4 ${relative ? 'relative' : ''}`}>
      {children}
    </section>
  )
}

export default function Journey() {
  const t = useCopy()
  const locale = useLocale()
  const { userId } = useSession()

  const [checkIns, setCheckIns] = useState<CheckIn[] | null>(null)
  const [signals, setSignals] = useState<BodySignal[]>([])
  const [rows, setRows] = useState<JourneyRow[]>([])
  const [openWeek, setOpenWeek] = useState<number | null>(null)
  const [reflection, setReflection] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  /**
   * Le settimane che si sono chiuse da sole DURANTE questa visita — non quelle
   * già fatte prima. Lo scintillio festeggia il momento in cui succede, non
   * ogni volta che si rilegge una settimana vecchia: altrimenti sarebbe
   * decorazione permanente, non un festeggiamento (§1 del tono di voce).
   */
  const [justCompleted, setJustCompleted] = useState<Set<number>>(new Set())

  useEffect(() => {
    let alive = true
    Promise.all([recentCheckIns(300), recentSignals(300), listJourney()])
      .then(([c, s, j]) => {
        if (!alive) return
        setCheckIns(c as CheckIn[]); setSignals(s as BodySignal[]); setRows(j as JourneyRow[])
      })
      .catch(() => { if (alive) { setCheckIns([]); setSignals([]); setRows([]) } })
    return () => { alive = false }
  }, [])

  const start = journeyStart(checkIns ?? [])
  const atWeek = currentWeek(start)

  // Segna da sola la settimana appena la missione tocca l'obiettivo — una
  // volta sola, non ogni render: si scrive solo se non è già segnata.
  // 🔴 Deve stare PRIMA di ogni `return` condizionale: gli hook di React
  // vanno chiamati sempre nello stesso ordine, a ogni render.
  useEffect(() => {
    if (!userId || !checkIns?.length) return
    for (const w of WEEKS) {
      if (w.week > atWeek) break
      const already = progressRowFor(rows, w.week)?.completed_at
      if (already) continue
      const { from, to } = weekWindow(start, w.week)
      const done = missionProgress(w, from, to, checkIns, signals) >= w.missionGoal
      if (done) {
        void saveJourneyWeek(userId, w.week, { completed_at: new Date().toISOString() })
          .then(() => {
            setRows((r) => [...r.filter((x) => x.week !== w.week), { week: w.week, completed_at: new Date().toISOString() }])
            setJustCompleted((p) => new Set(p).add(w.week))
          })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIns, signals, rows, atWeek, userId])

  if (!checkIns) {
    return <p className="pt-6 text-center text-[15px] text-[var(--color-ink-soft)]">{t.common.loading}</p>
  }

  function open(week: JourneyWeek) {
    if (week.week > atWeek) return
    setOpenWeek(week.week)
    setReflection(String(progressRowFor(rows, week.week)?.reflection ?? ''))
    setSaveState('idle')
  }

  async function saveReflection(week: number) {
    if (!userId) return
    setSaveState('saving')
    await saveJourneyWeek(userId, week, { reflection: reflection.trim() || undefined })
    setRows((r) => [...r.filter((x) => x.week !== week), { ...progressRowFor(r, week), week, reflection: reflection.trim() }])
    setSaveState('saved')
  }

  if (openWeek) {
    const week = weekOf(openWeek)
    const { from, to } = weekWindow(start, week.week)
    const progress = missionProgress(week, from, to, checkIns, signals)
    const done = Boolean(progressRowFor(rows, week.week)?.completed_at)

    return (
      <section className="flex flex-col gap-4 pt-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="bab-label flex items-center gap-1.5">
            <MonthIcon month={week.month} /> {fill(t.journey.weekLabel, { n: week.week })}
          </span>
          <button type="button" onClick={() => setOpenWeek(null)}
                  className="text-[13.5px] underline text-[var(--color-ink-soft)]">
            {t.journey.backToList}
          </button>
        </div>
        <h1 className="font-display text-[24px] leading-tight">{week.title[locale]}</h1>
        <p className="text-[14px] text-[var(--color-ink-soft)] italic">{week.subtitle[locale]}</p>
        <p className="text-[15px]">{week.body[locale]}</p>

        <Card relative>
          {done && justCompleted.has(week.week) && <Sparkle />}
          <p className="bab-label">{t.journey.missionLabel}</p>
          <p className="text-[15px]">🎯 {week.mission[locale]}</p>
          <div className="flex items-center gap-2">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-surface)]">
              <div className="h-full rounded-full" style={{
                width: `${Math.min(100, Math.round((progress / week.missionGoal) * 100))}%`,
                background: done ? 'var(--color-lime)' : 'var(--color-teal)',
              }} />
            </div>
            <span className="text-[13px] font-bold text-[var(--color-ink-soft)]">
              {progress}/{week.missionGoal}
            </span>
          </div>
          {done && <p className="text-[13px] font-bold" style={{ color: 'var(--color-vividteal)' }}>{t.journey.missionDone}</p>}
        </Card>

        <Card>
          <p className="bab-label">{t.journey.howBabHelpsLabel}</p>
          <p className="text-[14.5px]">{week.howBabHelps[locale]}</p>
        </Card>

        <Card>
          <p className="bab-label">{t.journey.reflectLabel}</p>
          <p className="text-[14.5px]">{week.reflect[locale]}</p>
          <textarea value={reflection} onChange={(e) => { setReflection(e.target.value); setSaveState('idle') }}
                    maxLength={1000} rows={4} placeholder={t.journey.reflectPlaceholder}
                    aria-label={week.reflect[locale]}
                    className="bab-card px-3 py-2.5 text-[15px]" />
          <button type="button" onClick={() => void saveReflection(week.week)}
                  disabled={saveState === 'saving'}
                  className="bab-pill self-start px-4 py-2 text-[14px] disabled:opacity-50">
            {saveState === 'saved' ? t.journey.reflectSaved : t.journey.reflectSave}
          </button>
        </Card>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4 pt-2">
      <h1 className="font-display text-[26px]">{t.tabs.journey}</h1>
      <p className="text-[15px] text-[var(--color-ink-soft)]">{t.journey.lede}</p>

      {/* 🔴 Un sentiero, non un elenco: le tappe si susseguono a zig-zag,
          collegate da una riga tratteggiata — la stessa idea di una mappa di
          livelli, nello stile quaderno invece che nel 3D patinato di quel
          genere di app. L'ordine nel DOM resta dall'alto in basso: per uno
          screen reader è comunque un elenco in ordine, lo zig-zag è solo
          visivo. */}
      {([1, 2] as const).map((m) => {
        const monthWeeks = WEEKS.filter((w) => w.month === m)
        return (
          <div key={m} className="flex flex-col gap-1">
            <p className="bab-label flex items-center gap-1.5">
              <MonthIcon month={m} /> {t.journey.monthLabel} {m} · {MONTHS[m].name[locale]}
            </p>
            <div className="relative flex flex-col items-stretch py-1">
              <div aria-hidden
                   className="absolute left-1/2 top-8 bottom-8 -translate-x-1/2 border-l-[3px] border-dashed"
                   style={{ borderColor: 'var(--color-sand)' }} />
              {monthWeeks.map((w, i) => {
                const done = Boolean(progressRowFor(rows, w.week)?.completed_at)
                const locked = w.week > atWeek
                const isNow = w.week === atWeek && !done
                const onRight = i % 2 === 1
                return (
                  <button key={w.week} type="button" onClick={() => open(w)} disabled={locked}
                          className={`bab-card relative z-10 my-1.5 flex max-w-[80%] items-center gap-3 px-3.5 py-3 text-left disabled:opacity-45 ${
                            onRight ? 'flex-row-reverse self-end text-right' : 'self-start'}`}
                          style={{
                            background: done ? 'var(--tempo-steady-tint)' : locked ? 'var(--color-sand)' : undefined,
                            boxShadow: isNow ? 'var(--shadow-md)' : undefined,
                          }}>
                    {done && justCompleted.has(w.week) && <Sparkle />}
                    <span aria-hidden className="text-[20px]">{done ? '✅' : locked ? '🔒' : '▶️'}</span>
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className="text-[12.5px] font-bold text-[var(--color-ink-soft)]">
                        {fill(t.journey.weekLabel, { n: w.week })}
                      </span>
                      <span className="text-[15px] font-bold">{w.title[locale]}</span>
                    </span>
                    {isNow && !locked && (
                      <span className="bab-pill px-2.5 py-1 text-[11px]" style={{ background: 'var(--color-lime)' }}>
                        {t.journey.now}
                      </span>
                    )}
                    {isNow && !locked && (
                      <span className={`absolute -top-4 ${onRight ? '-left-4' : '-right-4'}`}>
                        <Mascot size={40} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </section>
  )
}
