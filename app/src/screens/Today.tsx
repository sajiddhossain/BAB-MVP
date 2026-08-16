import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCopy, useLocale } from '@/copy'
import { TEMPOS, type TempoCode } from '@/content/tempo'
import { checkInsOn, localDate } from '@/lib/repo'
import Mascot from '@/components/Mascot'
import Loading from '@/components/Loading'
import { ArrowRightIcon, CompassIcon, SunIcon, TempoIcon } from '@/components/icons'

/** Il cerchio colorato dietro un'icona — stessa idea in ogni stato, colore diverso. */
function Badge({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[var(--bab-border)] border-[var(--color-ink)]"
         style={{ background: bg }}>
      {children}
    </div>
  )
}

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
    return <Loading label={t.common.loading} />
  }

  return (
    <section className="flex flex-col gap-4 pt-2">
      <h1 className="font-display text-[26px]">{t.tabs.today}</h1>

      {state.kind === 'fresh' && (
        <div className="bab-card flex flex-col gap-3 px-4 py-5" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="flex items-center gap-3">
            <Badge bg="var(--tempo-steady-tint)"><SunIcon size={22} color="var(--color-vividteal)" /></Badge>
            <h2 className="font-display text-[20px] leading-tight">{t.today.fresh.title}</h2>
          </div>
          <p className="text-[15px] text-[var(--color-ink-soft)]">{t.today.fresh.body}</p>
          <Link to="/checkin/pre" className="bab-pill px-4 py-3 text-center text-[16px]"
                style={{ background: 'var(--color-lime)' }}>
            {t.today.fresh.cta}
          </Link>
          {/* 🔴 Prima del check-in non c'è ancora niente da leggere. La
              mascotte tiene compagnia invece di lasciare la card fredda. */}
          <div className="flex justify-center pt-1">
            <Mascot size={36} />
          </div>
        </div>
      )}

      {state.kind === 'mid' && (
        <div className="bab-card flex flex-col gap-3 px-4 py-5" style={{ boxShadow: 'var(--shadow-lg)' }}>
          {state.tempo && (
            <div className="flex items-center gap-3">
              <Badge bg={`var(${TEMPOS[state.tempo].cssVar}-tint)`}>
                <TempoIcon code={state.tempo} size={22} color={`var(${TEMPOS[state.tempo].cssVar})`} />
              </Badge>
              <p className="font-display text-[20px] leading-tight">{TEMPOS[state.tempo].name}</p>
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
        <div className="bab-card flex flex-col gap-3 px-4 py-5" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <h2 className="font-display text-[20px]">{t.today.closed.title}</h2>
          <p className="text-[15px] text-[var(--color-ink-soft)]">{t.today.closed.body}</p>
          <div className="flex gap-4">
            {state.predicted && (
              <div className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl px-3 py-3 text-center"
                   style={{ background: `var(${TEMPOS[state.predicted].cssVar}-tint)` }}>
                <TempoIcon code={state.predicted} size={20} color={`var(${TEMPOS[state.predicted].cssVar})`} />
                <p className="bab-label">{t.today.closed.predicted}</p>
                <p className="text-[14px] font-bold">{TEMPOS[state.predicted].name}</p>
              </div>
            )}
            {state.trained && (
              <div className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl px-3 py-3 text-center"
                   style={{ background: `var(${TEMPOS[state.trained].cssVar}-tint)` }}>
                <TempoIcon code={state.trained} size={20} color={`var(${TEMPOS[state.trained].cssVar})`} />
                <p className="bab-label">{t.today.closed.trained}</p>
                <p className="text-[14px] font-bold">{TEMPOS[state.trained].name}</p>
              </div>
            )}
          </div>
          {state.trained && (
            <p className="text-[13px] text-[var(--color-ink-soft)]">{TEMPOS[state.trained].tag[locale]}</p>
          )}
        </div>
      )}

      {/* Sempre visibile, in ogni stato: si fa quando vuoi, non è legata al check-in. */}
      <Link to="/senti" className="bab-card flex items-center gap-3 px-4 py-3.5">
        <Badge bg="var(--tempo-steady-tint)"><CompassIcon size={20} color="var(--color-vividteal)" /></Badge>
        <div className="flex flex-1 flex-col">
          <p className="font-display text-[16px]">{t.bodySense.entryTitle}</p>
          <p className="text-[13px] text-[var(--color-ink-soft)]">{t.bodySense.entryBody}</p>
        </div>
        <ArrowRightIcon size={18} color="var(--color-ink-soft)" />
      </Link>
    </section>
  )
}
