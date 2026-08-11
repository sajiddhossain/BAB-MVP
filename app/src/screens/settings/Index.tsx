import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { plural, useCopy, useLocale, LOCALES } from '@/copy'
import { getProfile } from '@/lib/repo'
import { useSession } from '@/lib/session'
import { parked } from '@/lib/sync'
import * as db from '@/lib/db'
import type { Cycle } from './shell'

/**
 * L'indice. Cinque voci, e ognuna dice già com'è messa.
 *
 * 🔴 Una riga che porta a una schermata e basta è un menu; una riga che porta a
 * una schermata E mostra il valore che c'è dentro è una risposta. «Lingua ›» non
 * dice niente, «Lingua · Italiano ›» dice tutto quello che serviva sapere — e
 * spesso evita di aprirla.
 */

type Row = {
  to: string
  title: string
  value: string
  /** Una riga d'allarme sotto il valore: la coda ferma si vede da qui. */
  warn?: string
  soft?: string
}

export default function SettingsIndex() {
  const t = useCopy()
  const locale = useLocale()
  const { userId, connected } = useSession()
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [queue, setQueue] = useState({ waiting: 0, stuck: 0 })

  useEffect(() => {
    let alive = true
    Promise.all([db.pending(), parked()])
      .then(([all, stuck]) => {
        if (alive) setQueue({ waiting: all.length - stuck.length, stuck: stuck.length })
      })
      .catch(() => { /* senza archivio non c'è coda da mostrare */ })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!userId) return
    let alive = true
    getProfile(userId)
      .then((p) => { if (alive && p) setProfile(p) })
      .catch(() => { /* niente profilo da riassumere */ })
    return () => { alive = false }
  }, [userId])

  const name = String(profile?.display_name ?? '').trim()
  const sport = String(profile?.sport ?? '').trim()
  const cycle = (profile?.cycle_status as Cycle) ?? null

  const cycleLabel = cycle === 'tracking' ? t.onboarding.rhythmYes
    : cycle === 'not_yet' ? t.onboarding.rhythmNotYet
    : cycle === 'undisclosed' ? t.onboarding.rhythmSkip
    : t.settings.notSet

  const rows: Row[] = [
    {
      to: '/settings/profilo',
      title: t.settings.profileTitle,
      value: [name, sport].filter(Boolean).join(' · ') || t.settings.notSet,
    },
    {
      to: '/settings/ritmo',
      title: t.settings.rhythmTitle,
      value: cycleLabel,
    },
    {
      to: '/settings/lingua',
      title: t.settings.langTitle,
      value: LOCALES[locale].langName,
    },
    {
      to: '/settings/dati',
      title: t.settings.dataTitle,
      value: t.settings.dataHint,
      // 🔴 `sync.ts` dice che le righe rimaste indietro vanno mostrate e mai
      // ignorate. Sepolte dentro una sotto-schermata nessuno le vedrebbe: il
      // conto sale fin qui, dove passa comunque.
      soft: queue.waiting > 0
        ? plural(queue.waiting, t.settings.queueBodyOne, t.settings.queueBody) : undefined,
      warn: queue.stuck > 0
        ? plural(queue.stuck, t.settings.queueParkedOne, t.settings.queueParked) : undefined,
    },
    {
      to: '/settings/account',
      title: t.settings.accountTitle,
      value: connected ? t.settings.accountHint : t.settings.accountHintOffline,
    },
  ]

  return (
    <section className="flex flex-col gap-4 pt-2">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-[26px]">{t.settings.title}</h1>
        <Link to="/me" className="text-[13.5px] underline text-[var(--color-ink-soft)]">
          {t.settings.back}
        </Link>
      </div>

      <nav className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <Link key={r.to} to={r.to}
                className="bab-card flex items-center gap-3 px-4 py-3.5">
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-[16px] font-bold">{r.title}</span>
              <span className="text-[13.5px] text-[var(--color-ink-soft)]">{r.value}</span>
              {r.soft && <span className="text-[13px] text-[var(--color-ink-soft)]">{r.soft}</span>}
              {r.warn && <span className="text-[13px]" style={{ color: 'var(--care)' }}>{r.warn}</span>}
            </span>
            <span aria-hidden className="text-[17px] text-[var(--color-ink-soft)]">→</span>
          </Link>
        ))}
      </nav>

      <p className="px-1 text-[13px] text-[var(--color-ink-soft)]">{t.settings.indexNote}</p>
    </section>
  )
}
