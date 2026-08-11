import { useEffect, useRef, useState } from 'react'
import { useCopy, useLocale } from '@/copy'
import PillGroup from './PillGroup'
import { regionLabel, type RegionCode } from '@/content/bodymap'
import { BEHAVIOURS, GROUP_LABEL, INTENSITIES, SENSATIONS, sensationsIn } from '@/content/lexicon'

/**
 * Il foglio che si alza sulla zona toccata.
 *
 * 🔴 Prima era una schermata nuova: toccavi il ginocchio e la figura spariva.
 * Nominare una sensazione vuol dire tenere insieme DOVE e COS'È, e togliere il
 * dove nel momento esatto in cui si cerca la parola è il modo più veloce per
 * far rispondere «boh, dolorante». Qui la figura resta dietro, la zona resta
 * scritta in cima, e quando ha finito è di nuovo lì per la prossima.
 *
 * 🔴 Due passi soli. Il primo è la decisione — che parola è; il secondo sono i
 * due dettagli che la rifiniscono, quanto forte e cosa fa, tutt'e due
 * facoltativi. Sono qualificatori della stessa scelta, non scelte nuove, e
 * spezzarli in due fogli farebbe sembrare obbligatorio quello che non lo è.
 */

type Draft = { sensation: string; intensity: number | null; behaviour: string | null }

type Props = {
  region: RegionCode
  /** Per «da un'altra parte»: quello che ha scritto lei vale più dell'etichetta. */
  freeText?: string
  onCancel: () => void
  onAdd: (d: Draft) => void
  tone?: 'neutral' | 'care'
}

export default function RegionSheet({ region, freeText = '', onCancel, onAdd, tone = 'neutral' }: Props) {
  const t = useCopy()
  const locale = useLocale()
  const head = useRef<HTMLHeadingElement>(null)

  const [sens, setSens] = useState<string | null>(null)
  const [intensity, setIntensity] = useState<number | null>(null)
  const [behaviour, setBehaviour] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const title = region === 'other' && freeText.trim()
    ? freeText.trim()
    : regionLabel(region, locale)

  /** Zona nuova, foglio nuovo: quello che aveva scelto prima non c'entra. */
  useEffect(() => {
    setSens(null); setIntensity(null); setBehaviour(null)
    head.current?.focus()
  }, [region])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  /**
   * Esc chiude, e il tocco fuori dal foglio pure. Non è pignoleria: un foglio
   * che si apre e non si capisce come si chiude è una trappola, e qui si apre
   * per sbaglio ogni volta che il pollice sfiora la figura.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const pick = (code: string) => {
    setSens(code)
    window.clearTimeout(timer.current)
    // La stessa pausa delle altre scelte singole: il tempo di vedere che la
    // pillola si è accesa, prima che il foglio cambi sotto le dita.
    timer.current = window.setTimeout(() => head.current?.focus(), 240)
  }

  const chosen = sens ? SENSATIONS.find((s) => s.code === sens) : null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Il velo. Il tocco fuori chiude, ed è il gesto che prova per primo chi
          si è aperto il foglio per sbaglio. */}
      <button
        type="button"
        aria-label={t.flow.close}
        onClick={onCancel}
        className="flex-1 cursor-default"
        style={{ background: 'color-mix(in srgb, var(--color-ink) 42%, transparent)' }}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bab-sheet flex max-h-[86dvh] flex-col gap-2.5 overflow-y-auto border-t-[3px] border-[var(--color-ink)] bg-[var(--color-surface)] px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3"
        style={{ borderTopLeftRadius: 22, borderTopRightRadius: 22 }}
      >
        {/* 🔴 Il foglio è alto: deve starci dentro anche l'ultimo gruppo, quello
            delle bandiere rosse. Un elenco tagliato in fondo nasconde proprio
            le due parole che non devono restare nascoste — e il
            sotto-riporto è già il rischio numero uno.

            La maniglia: dice «questo si trascina via» senza scriverlo. */}
        <span aria-hidden className="mx-auto h-1.5 w-10 shrink-0 rounded-full"
              style={{ background: 'var(--color-sand)' }} />

        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <h2 ref={head} tabIndex={-1} className="bab-heading-focus font-display text-[20px] leading-tight">
              {title}
            </h2>
            {chosen && (
              <p className="text-[13.5px] text-[var(--color-ink-soft)]">
                {chosen.emoji} {chosen.label[locale]}
              </p>
            )}
          </div>
          <button type="button" onClick={onCancel} aria-label={t.flow.close}
                  className="bab-pill h-10 w-10 shrink-0 text-[16px]">
            <span aria-hidden>✕</span>
          </button>
        </div>

        {!sens ? (
          <>
            <p className="text-[15px] font-bold">{t.checkin.pre.pinpoint.whatLike}</p>
            {(['good', 'notice', 'flag'] as const).map((g) => (
              <div key={g} className="flex flex-col gap-1.5">
                <p className="text-[12px] text-[var(--color-ink-soft)]">{GROUP_LABEL[g][locale]}</p>
                <PillGroup
                  size="sm"
                  label={GROUP_LABEL[g][locale]}
                  tone={g === 'flag' ? 'care' : tone}
                  options={sensationsIn(g).map((s) => ({
                    value: s.code, label: s.label[locale], emoji: s.emoji, flag: s.redFlag,
                  }))}
                  value={sens}
                  onChange={pick}
                />
              </div>
            ))}
          </>
        ) : (
          <>
            <p className="bab-label">{t.checkin.pre.pinpoint.howStrong}</p>
            <PillGroup
              size="lg"
              label={t.checkin.pre.pinpoint.howStrong}
              options={INTENSITIES.map((i) => ({ value: String(i.value), label: i.label[locale] }))}
              value={intensity ? String(intensity) : null}
              onChange={(v) => setIntensity(Number(v))}
            />

            <p className="bab-label">{t.checkin.pre.pinpoint.whatDoes}</p>
            <PillGroup
              label={t.checkin.pre.pinpoint.whatDoes}
              options={BEHAVIOURS.map((b) => ({ value: b.code, label: b.label[locale] }))}
              value={behaviour}
              onChange={setBehaviour}
            />

            <div className="mt-1 flex gap-2">
              <button type="button" onClick={() => setSens(null)}
                      className="bab-pill px-4 py-3 text-[14px]">
                {t.flow.back}
              </button>
              <button
                type="button"
                onClick={() => onAdd({ sensation: sens, intensity, behaviour })}
                className="bab-pill flex-1 px-4 py-3 text-[16px]"
                style={{ background: 'var(--color-lime)', boxShadow: 'var(--shadow-sm)' }}
              >
                {t.checkin.common.addThis}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
