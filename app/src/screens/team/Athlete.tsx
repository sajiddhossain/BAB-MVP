import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCopy } from '@/copy'
import { cycleFor, historyFor, type CycleDate, type TodayRow } from '@/lib/coach'
import { lastDays } from '@/lib/insights'
import { TEMPOS, type TempoCode } from '@/content/tempo'

/**
 * Una singola atleta, vista dallo staff.
 *
 * 🔴 Qui NON c'è niente che lei abbia scritto con parole sue: le viste
 * `coach_*` non espongono `note`, `headspace_other` né `region_free`, quindi
 * non è una scelta di questa schermata — è una cosa che non può succedere.
 *
 * ⚠️ Le date del ciclo ci sono (R2). Sono accompagnate da come vanno lette,
 * perché un elenco di date senza contesto è il modo più facile per farne un
 * uso sbagliato.
 */
export default function TeamAthlete() {
  const t = useCopy()
  const { athleteId = '' } = useParams()
  const [rows, setRows] = useState<TodayRow[] | null>(null)
  const [cycle, setCycle] = useState<CycleDate[]>([])

  const days = lastDays(14)

  useEffect(() => {
    let alive = true
    Promise.all([historyFor(athleteId, days[0]), cycleFor(athleteId)])
      .then(([h, c]) => { if (!alive) return; setRows(h); setCycle(c) })
      .catch(() => { if (alive) setRows([]) })
    return () => { alive = false }
  }, [athleteId, days[0]])

  if (!rows) {
    return <p className="p-8 text-center text-[15px] text-[var(--color-ink-soft)]">{t.common.loading}</p>
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-4 py-6">
      <Link to="/team" className="bab-pill self-start px-4 py-2 text-[14px]">{t.coach.back}</Link>

      <section className="bab-card flex flex-col gap-3 px-4 py-4">
        <h2 className="font-display text-[18px]">{t.coach.historyTitle}</h2>
        {rows.length === 0 ? (
          <p className="text-[15px] text-[var(--color-ink-soft)]">{t.coach.nothingYet}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {[...days].reverse().map((d) => {
              const ofDay = rows.filter((r) => r.local_date === d)
              const pre = ofDay.find((r) => r.kind === 'pre')
              const post = ofDay.find((r) => r.kind === 'post')
              const predicted = pre?.tempo_predicted as TempoCode | undefined
              const trained = post?.tempo_chosen as TempoCode | undefined
              return (
                <li key={d} className="flex flex-wrap items-baseline gap-x-2 border-b border-[var(--color-sand)] pb-1.5 text-[14px] last:border-0">
                  <span className="w-[86px] shrink-0 text-[13px] text-[var(--color-ink-soft)]">{d}</span>
                  {!pre && !post && (
                    <span className="text-[var(--color-ink-soft)]">{t.coach.checkedInNo}</span>
                  )}
                  {predicted && <span>{t.coach.predicted} {TEMPOS[predicted].emoji}</span>}
                  {trained && <span>· {t.coach.trained} {TEMPOS[trained].emoji} {TEMPOS[trained].name}</span>}
                  {post?.effort != null && (
                    <span className="text-[var(--color-ink-soft)]">· {t.coach.effort} {post.effort}/5</span>
                  )}
                  {(post?.pe_attended ?? pre?.pe_attended) != null && (
                    <span className="text-[13px] text-[var(--color-ink-soft)]">
                      · {(post?.pe_attended ?? pre?.pe_attended) ? t.coach.peYes : t.coach.peNo}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* ⚠️ R2. Le date ci sono; come si leggono sta scritto sopra, non sotto. */}
      <section className="bab-card flex flex-col gap-2 px-4 py-4" style={{ background: 'var(--cycle-tint)' }}>
        <h2 className="font-display text-[18px]">{t.coach.cycleTitle}</h2>
        <p className="text-[13.5px]">{t.coach.cycleNote}</p>
        {cycle.length === 0 ? (
          <p className="text-[15px] text-[var(--color-ink-soft)]">{t.coach.cycleNone}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {cycle.map((c, i) => (
              <li key={i} className="bab-pill px-3 py-1 text-[13px]">{c.event_date}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
