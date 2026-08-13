import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCopy, useLocale } from '@/copy'
import { TEMPOS, type TempoCode } from '@/content/tempo'
import { checkInsOn, localDate } from '@/lib/repo'

/**
 * La home. È l'unica schermata che vedono ogni giorno, quindi deve avere
 * **una sola cosa ovvia da fare adesso**.
 *
 * 🔴 Gli stati si calcolano dai dati veri, non da uno switcher. Tre dei sei
 * sono qui perché sono quelli che i due check-in sanno già produrre:
 *
 *   nessun pre        → «Sintonizzati»
 *   pre fatto         → «Chiudi il cerchio», con l'andatura scelta
 *   entrambi fatti    → riepilogo, e niente altro da fare
 *
 * Gli altri tre — riposo, bentornata, Care attivo — arrivano quando esisteranno
 * il calendario e lo stato delle bandiere rosse. Fingerli adesso insegnerebbe a
 * fidarsi di qualcosa che non c'è.
 */
type State =
  | { kind: 'loading' }
  | { kind: 'fresh' }
  | { kind: 'mid'; tempo: TempoCode | null }
  | { kind: 'closed'; predicted: TempoCode | null; trained: TempoCode | null }

export default function Today() {
  const t = useCopy()
  const locale = useLocale()
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    let alive = true
    checkInsOn(localDate()).then((rows) => {
      if (!alive) return
      const pre = rows.filter((r) => r.kind === 'pre').at(0)
      const post = rows.filter((r) => r.kind === 'post').at(0)
      if (post) {
        setState({ kind: 'closed',
          predicted: (post.tempo_predicted as TempoCode) ?? null,
          trained: (post.tempo_chosen as TempoCode) ?? null })
      } else if (pre) {
        setState({ kind: 'mid', tempo: (pre.tempo_chosen as TempoCode) ?? null })
      } else {
        setState({ kind: 'fresh' })
      }
    }).catch(() => setState({ kind: 'fresh' }))
    return () => { alive = false }
  }, [])

  if (state.kind === 'loading') {
    return <p className="pt-6 text-center text-[15px] text-[var(--color-ink-soft)]">{t.common.loading}</p>
  }

  return (
    <section className="flex flex-col gap-4 pt-2">
      <h1 className="font-display text-[26px]">{t.tabs.today}</h1>

      {state.kind === 'fresh' && (
        <div className="bab-card flex flex-col gap-3 px-4 py-5">
          <h2 className="font-display text-[20px]">{t.today.fresh.title}</h2>
          <p className="text-[15px] text-[var(--color-ink-soft)]">{t.today.fresh.body}</p>
          <Link to="/checkin/pre" className="bab-pill px-4 py-3 text-center text-[16px]"
                style={{ background: 'var(--color-lime)' }}>
            {t.today.fresh.cta}
          </Link>
        </div>
      )}

      {state.kind === 'mid' && (
        <div className="bab-card flex flex-col gap-3 px-4 py-5">
          {state.tempo && (
            <div className="flex items-center gap-2">
              <span className="text-[26px]" aria-hidden>{TEMPOS[state.tempo].emoji}</span>
              <p className="font-display text-[20px]">{TEMPOS[state.tempo].name}</p>
            </div>
          )}
          <p className="text-[15px] text-[var(--color-ink-soft)]">{t.today.mid.body}</p>
          <Link to="/checkin/post" className="bab-pill px-4 py-3 text-center text-[16px]"
                style={{ background: 'var(--color-lime)' }}>
            {t.today.mid.cta}
          </Link>
          <p className="text-[13px] text-[var(--color-ink-soft)]">{t.today.mid.hint}</p>
        </div>
      )}

      {state.kind === 'closed' && (
        <div className="bab-card flex flex-col gap-3 px-4 py-5">
          <h2 className="font-display text-[20px]">{t.today.closed.title}</h2>
          <p className="text-[15px] text-[var(--color-ink-soft)]">{t.today.closed.body}</p>
          <dl className="flex gap-6 text-[15px]">
            {state.predicted && (
              <div>
                <dt className="bab-label">{t.today.closed.predicted}</dt>
                <dd>{TEMPOS[state.predicted].emoji} {TEMPOS[state.predicted].name}</dd>
              </div>
            )}
            {state.trained && (
              <div>
                <dt className="bab-label">{t.today.closed.trained}</dt>
                <dd>{TEMPOS[state.trained].emoji} {TEMPOS[state.trained].name}</dd>
              </div>
            )}
          </dl>
          {state.trained && (
            <p className="text-[13px] text-[var(--color-ink-soft)]">{TEMPOS[state.trained].tag[locale]}</p>
          )}
        </div>
      )}

      {/* Sempre visibile, in ogni stato: si fa quando vuoi, non è legata al check-in. */}
      <Link to="/senti" className="bab-card flex items-center gap-3 px-4 py-3.5">
        <span aria-hidden className="text-[26px]">🧭</span>
        <div className="flex flex-1 flex-col">
          <p className="font-display text-[16px]">{t.bodySense.entryTitle}</p>
          <p className="text-[13px] text-[var(--color-ink-soft)]">{t.bodySense.entryBody}</p>
        </div>
        <span aria-hidden className="text-[18px] text-[var(--color-ink-soft)]">→</span>
      </Link>
    </section>
  )
}
