import { useEffect, useRef, useState } from 'react'
import { useCopy, useLocale } from '@/copy'
import PillGroup from './PillGroup'
import { regionLabel, type RegionCode } from '@/content/bodymap'
import { BEHAVIOURS, GROUP_LABEL, INTENSITIES, SENSATIONS, sensationsIn } from '@/content/lexicon'
import { CloseIcon, ContentIcon } from './icons'

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
  const [showHints, setShowHints] = useState(false)
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
              <p className="flex items-center gap-1 text-[13.5px] text-[var(--color-ink-soft)]">
                {chosen.icon && <ContentIcon name={chosen.icon} size={14} />} {chosen.label[locale]} — {chosen.hint[locale]}
              </p>
            )}
          </div>
          <button type="button" onClick={onCancel} aria-label={t.flow.close}
                  className="bab-pill flex h-10 w-10 shrink-0 items-center justify-center">
            <CloseIcon size={15} />
          </button>
        </div>

        {!sens ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[15px] font-bold">{t.checkin.pre.pinpoint.whatLike}</p>
              <button type="button" onClick={() => setShowHints((v) => !v)}
                      aria-expanded={showHints} aria-controls="region-sheet-hints"
                      className="shrink-0 text-[12.5px] underline text-[var(--color-ink-soft)]">
                {showHints ? t.checkin.pre.pinpoint.hideHints : t.checkin.pre.pinpoint.showHints}
              </button>
            </div>
            {showHints && (
              <ul id="region-sheet-hints" className="bab-card flex flex-col gap-1.5 px-3.5 py-3 text-[13px]">
                {SENSATIONS.map((s) => (
                  <li key={s.code}>
                    <span className="inline-flex items-center gap-1 font-bold">
                      {s.icon && <ContentIcon name={s.icon} size={14} />} {s.label[locale]}
                    </span>
                    {' — '}<span className="text-[var(--color-ink-soft)]">{s.hint[locale]}</span>
                  </li>
                ))}
              </ul>
            )}
            {/* 🔴 «Va bene» e «Da notare» restano la stessa scelta — nessun
                passo in più, nessun obbligo a spuntare l'uno prima
                dell'altro — ma due etichette leggere li separano a colpo
                d'occhio: undici pillole tutte uguali si scorrono, due
                gruppetti da quattro e sette si leggono. Solo «Da far
                vedere» aveva già questo trattamento; ora è coerente con gli
                altri due invece di essere l'unico raggruppato. */}
            <div className="flex flex-col gap-1.5">
              <p className="bab-label">{GROUP_LABEL.good[locale]}</p>
              <PillGroup
                size="sm"
                label={GROUP_LABEL.good[locale]}
                tone={tone}
                options={sensationsIn('good').map((s) => ({
                  value: s.code, label: s.label[locale],
                  icon: s.icon ? <ContentIcon name={s.icon} size={14} /> : undefined,
                }))}
                value={sens}
                onChange={pick}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="bab-label">{GROUP_LABEL.notice[locale]}</p>
              <PillGroup
                size="sm"
                label={GROUP_LABEL.notice[locale]}
                tone={tone}
                options={sensationsIn('notice').map((s) => ({
                  value: s.code, label: s.label[locale],
                  icon: s.icon ? <ContentIcon name={s.icon} size={14} /> : undefined,
                }))}
                value={sens}
                onChange={pick}
              />
            </div>
            {sensationsIn('flag').length > 0 && (
              <div className="flex flex-col gap-1.5 border-l-[3px] pl-3"
                   style={{ borderColor: 'var(--care)' }}>
                <p className="text-[12px]" style={{ color: 'var(--care)' }}>{GROUP_LABEL.flag[locale]}</p>
                <PillGroup
                  size="sm"
                  label={GROUP_LABEL.flag[locale]}
                  tone="care"
                  options={sensationsIn('flag').map((s) => ({
                    value: s.code, label: s.label[locale],
                    icon: s.icon ? <ContentIcon name={s.icon} size={14} /> : undefined,
                    flag: s.redFlag,
                  }))}
                  value={sens}
                  onChange={pick}
                />
              </div>
            )}
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
