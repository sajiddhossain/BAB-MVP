import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fill, useCopy, useLocale } from '@/copy'
import { checkInsOn, myTeams, openRedFlags, roster,
         type RedFlag, type RosterAthlete, type StaffTeam, type TodayRow } from '@/lib/coach'
import { localDate } from '@/lib/repo'
import { regionLabel, type RegionCode } from '@/content/bodymap'
import { SENSATIONS } from '@/content/lexicon'
import { TEMPOS, type TempoCode } from '@/content/tempo'

/**
 * Dashboard squadra — la rosa di oggi.
 *
 * 🔴 R13: la v1 mostra CHI STA COME, non i grafici. L'analisi ha bisogno di
 * settimane di dati che nella v1 non esistono ancora, e "chi sta come" è la
 * cosa che le squadre vogliono davvero vedere.
 *
 * 🔴 §11: le bandiere rosse stanno IN CIMA, prima della rosa. Sono l'unica
 * cosa in questa schermata che non può aspettare il prossimo allenamento.
 *
 * 🔴 Nessuna classifica, nessun confronto fra atlete: la dashboard risponde a
 * "come sta lei oggi", mai a "chi è messa meglio".
 */

function daysAgo(iso: string): number {
  const then = new Date(iso).getTime()
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000))
}

export default function Roster() {
  const t = useCopy()
  const locale = useLocale()
  const [teams, setTeams] = useState<StaffTeam[] | null | 'offline'>(null)
  const [people, setPeople] = useState<RosterAthlete[]>([])
  const [today, setToday] = useState<TodayRow[]>([])
  const [flags, setFlags] = useState<RedFlag[]>([])

  useEffect(() => {
    let alive = true
    myTeams().then(async (ts) => {
      if (!alive) return
      if (ts === null) { setTeams('offline'); return }
      setTeams(ts)
      if (ts.length === 0) return
      const list = await roster(ts[0].team_id)
      if (!alive) return
      setPeople(list)
      const ids = list.map((a) => a.id)
      const [rows, rf] = await Promise.all([checkInsOn(localDate(), ids), openRedFlags(ids)])
      if (!alive) return
      setToday(rows)
      setFlags(rf)
    })
    return () => { alive = false }
  }, [])

  if (teams === null) {
    return <p className="p-8 text-center text-[15px] text-[var(--color-ink-soft)]">{t.common.loading}</p>
  }
  if (teams === 'offline') {
    return <p className="bab-card m-4 px-4 py-4 text-[15px]">{t.coach.notConnected}</p>
  }
  if (teams.length === 0) {
    return <p className="bab-card m-4 px-4 py-4 text-[15px]">{t.coach.noTeams}</p>
  }

  const nameOf = (id: string) => people.find((p) => p.id === id)?.display_name ?? '—'

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-4 py-6">
      <header>
        <h1 className="font-display text-[28px]">{teams[0].name || t.coach.title}</h1>
        <p className="text-[15px] text-[var(--color-ink-soft)]">{t.coach.subtitle}</p>
      </header>

      {/* 🚩 Prima di tutto il resto. */}
      <section className="bab-card flex flex-col gap-3 px-4 py-4"
               style={flags.length ? { background: 'var(--care-tint)', borderColor: 'var(--care)' } : undefined}>
        <h2 className="font-display text-[18px]">{t.coach.redFlagsTitle}</h2>
        {flags.length === 0 ? (
          <p className="text-[15px] text-[var(--color-ink-soft)]">{t.coach.redFlagsNone}</p>
        ) : (
          <>
            <p className="text-[13.5px] text-[var(--color-ink-soft)]">{t.coach.redFlagsHelp}</p>
            <ul className="flex flex-col gap-2">
              {flags.map((f) => {
                const d = daysAgo(f.opened_at)
                return (
                  <li key={f.id} className="bab-card flex flex-wrap items-baseline gap-x-2 gap-y-1 px-3 py-2.5">
                    <Link to={`/team/${f.athlete_id}`} className="text-[15px] font-bold underline">
                      {nameOf(f.athlete_id)}
                    </Link>
                    <span className="text-[15px]">
                      {regionLabel(f.region as RegionCode, locale)} —{' '}
                      {SENSATIONS.find((s) => s.code === f.sensation)?.label[locale] ?? f.sensation}
                    </span>
                    <span className="text-[13px] text-[var(--color-ink-soft)]">
                      {d === 0 ? t.coach.openedToday : fill(t.coach.openedDays, { n: d })}
                    </span>
                    {/* La misura di sicurezza del pilota: deve arrivare al 100%. */}
                    <span className="bab-pill px-2 py-0.5 text-[12px]"
                          style={f.told_adult ? undefined : { borderColor: 'var(--care)', color: 'var(--care)' }}>
                      {f.told_adult ? t.coach.toldAdult : t.coach.notToldAdult}
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="bab-label">{t.coach.rosterTitle}</h2>
        {people.length === 0 && (
          <p className="text-[15px] text-[var(--color-ink-soft)]">{t.coach.nothingYet}</p>
        )}
        {people.map((a) => {
          const mine = today.filter((r) => r.athlete_id === a.id)
          const pre = mine.find((r) => r.kind === 'pre')
          const post = mine.find((r) => r.kind === 'post')
          const predicted = pre?.tempo_predicted as TempoCode | undefined
          const trained = post?.tempo_chosen as TempoCode | undefined
          const pe = post?.pe_attended ?? pre?.pe_attended ?? null
          return (
            <Link key={a.id} to={`/team/${a.id}`}
                  className="bab-card flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
              <span className="text-[16px] font-bold">{a.display_name}</span>
              {!pre && !post && (
                <span className="text-[14px] text-[var(--color-ink-soft)]">{t.coach.checkedInNo}</span>
              )}
              {predicted && (
                <span className="text-[14px]">
                  {t.coach.predicted} {TEMPOS[predicted].emoji} {TEMPOS[predicted].name}
                </span>
              )}
              {trained ? (
                <span className="text-[14px]">
                  · {t.coach.trained} {TEMPOS[trained].emoji} {TEMPOS[trained].name}
                </span>
              ) : pre ? (
                <span className="text-[14px] text-[var(--color-ink-soft)]">· {t.coach.onlyPre}</span>
              ) : null}
              {post?.effort != null && (
                <span className="text-[14px] text-[var(--color-ink-soft)]">
                  · {t.coach.effort} {post.effort}/5
                </span>
              )}
              {pe !== null && (
                <span className="text-[13px] text-[var(--color-ink-soft)]">
                  · {pe ? t.coach.peYes : t.coach.peNo}
                </span>
              )}
            </Link>
          )
        })}
      </section>
    </div>
  )
}
