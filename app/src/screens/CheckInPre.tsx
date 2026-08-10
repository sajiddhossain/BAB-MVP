import { useState } from 'react'
import { fill, useCopy, useLocale } from '@/copy'
import BodyMap from '@/components/BodyMap'
import EmojiScale from '@/components/EmojiScale'
import PillGroup from '@/components/PillGroup'
import { CHANNELS, HEADSPACE, channelQuestion } from '@/content/channels'
import { regionLabel, type RegionCode } from '@/content/bodymap'
import { SENSATIONS, INTENSITIES, BEHAVIOURS, GROUP_LABEL, isRedFlag, sensationsIn } from '@/content/lexicon'
import { TEMPOS, type TempoCode } from '@/content/tempo'
import { CARE, DECODE_ACHE } from '@/content/clinical'
import { headspaceValue, total, suggestWithPain, type Channels } from '@/lib/tempo'
import { saveCheckIn, type BodySignalDraft } from '@/lib/repo'
import { useSession } from '@/lib/session'

/**
 * Check-in pre — Prevedi → Sintonizzati → Confronta → Aggiusta.
 *
 * 🔴 La previsione si salva PRIMA dell'esito, con il suo timestamp. È la
 * salvaguardia del §5: senza, non si distingue una previsione da una
 * razionalizzazione fatta dopo aver visto il risultato — e il prediction error,
 * che è la metrica del prodotto, diventa carta straccia.
 *
 * 🔴 Una sola pagina che scorre, non una procedura a passi. I passi sono
 * etichette, non muri: se torna indietro a cambiare un canale non deve rifare
 * il giro. È la struttura dei prototipi già provati.
 */

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
      )}
    </>
  )
}

function Card({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <section className="bab-card flex flex-col gap-3 px-4 py-4">
      {label && <span className="bab-label">{label}</span>}
      {children}
    </section>
  )
}

const TEMPO_ORDER: TempoCode[] = ['upbeat', 'steady', 'gentle']

export default function CheckInPre() {
  const t = useCopy()
  const locale = useLocale()
  const { userId } = useSession()

  // Il momento in cui ha aperto: serve a misurare quanto tempo passa davvero.
  // R1 · si misura per capire, non per giudicare.
  const [startedAt] = useState(() => new Date().toISOString())

  const [predicted, setPredicted] = useState<TempoCode | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [sleepHours, setSleepHours] = useState<string | null>(null)
  const [ch, setCh] = useState<Channels>({ sleep: null, energy: null, hydration: null, muscles: null })
  const [headspace, setHeadspace] = useState<string[]>([])
  const [surprise, setSurprise] = useState<number | null>(null)
  const [school, setSchool] = useState<number | null>(null)

  // Il taccuino dei segnali: regione → sensazione → intensità → comportamento.
  const [region, setRegion] = useState<RegionCode | null>(null)
  const [sens, setSens] = useState<string | null>(null)
  const [intensity, setIntensity] = useState<number | null>(null)
  const [behaviour, setBehaviour] = useState<string | null>(null)
  const [signals, setSignals] = useState<BodySignalDraft[]>([])

  const [pain, setPain] = useState<boolean | null>(null)
  const [result, setResult] = useState<{ suggested: TempoCode; chosen: TempoCode } | null>(null)
  const [saving, setSaving] = useState(false)

  const hs = headspaceValue(headspace)
  const sum = total(ch, hs)
  /**
   * 🔴 Due strade diverse arrivano al Care, e vanno raccontate diversamente.
   * Se è stata una BANDIERA ROSSA a instradare, dirle "hai segnalato dolore
   * protettivo" è falso — lei può aver risposto di no — e la prima cosa che
   * legge in Care mode non può essere una cosa che non ha detto.
   */
  const redFlag = signals.find((s) => s.is_red_flag) ?? null
  const careOn = pain === true || redFlag !== null
  const ready = predicted !== null && sum !== null && pain !== null

  function addSignal() {
    if (!region || !sens) return
    setSignals((prev) => [...prev, {
      athlete_id: userId ?? '', region, sensation: sens,
      intensity, behaviour, is_red_flag: isRedFlag(sens),
    }])
    setRegion(null); setSens(null); setIntensity(null); setBehaviour(null)
  }

  async function submit() {
    if (sum === null || !predicted) return
    const suggested = suggestWithPain(sum, careOn)
    setResult({ suggested, chosen: suggested })
    setSaving(true)
    if (userId) {
      try {
        await saveCheckIn({
          athlete_id: userId, kind: 'pre',
          tempo_predicted: predicted, prediction_confidence: confidence,
          // 🔴 Sempre entrambe le colonne, anche quando coincidono.
          tempo_suggested: suggested, tempo_chosen: suggested,
          sleep: ch.sleep, energy: ch.energy, hydration: ch.hydration, muscles: ch.muscles,
          headspace, surprise, sleep_hours: sleepHours, school_load: school,
          started_at: startedAt,
        }, signals)
      } catch { /* resta in coda locale: il check-in non si perde */ }
    }
    setSaving(false)
  }

  /** Il cambio di andatura si salva come check-in nuovo: gli eventi non si modificano. */
  async function swap(to: TempoCode) {
    if (!result || !predicted || sum === null) return
    setResult({ ...result, chosen: to })
    if (userId) {
      try {
        await saveCheckIn({
          athlete_id: userId, kind: 'pre',
          tempo_predicted: predicted, prediction_confidence: confidence,
          tempo_suggested: result.suggested, tempo_chosen: to,
          sleep: ch.sleep, energy: ch.energy, hydration: ch.hydration, muscles: ch.muscles,
          headspace, surprise, sleep_hours: sleepHours, school_load: school,
          started_at: startedAt,
        })
      } catch { /* idem */ }
    }
  }

  // ── il risultato ──────────────────────────────────────────────────────────
  if (result) {
    const tempo = TEMPOS[result.chosen]
    const guessedRight = predicted === result.suggested
    return (
      <div className="flex flex-col gap-4 pt-2">
        <h1 className="font-display text-[26px]">{t.checkin.pre.title}</h1>

        <Card label={t.checkin.pre.result.compareLabel}>
          <p className="text-[15px]">
            <Rich text={guessedRight
              ? fill(t.checkin.pre.result.matched, { tempo: TEMPOS[result.suggested].name })
              : fill(t.checkin.pre.result.differed, {
                  predicted: TEMPOS[predicted!].name, suggested: TEMPOS[result.suggested].name,
                })} />
          </p>
          {!guessedRight && (
            <p className="text-[14px] text-[var(--color-ink-soft)]">{t.checkin.pre.result.gapNote}</p>
          )}
        </Card>

        {careOn && (
          <div className="bab-card flex flex-col gap-2 px-4 py-4"
               style={{ background: 'var(--care-tint)', borderColor: 'var(--care)' }} role="alert">
            <h2 className="font-display text-[17px]">{CARE.title[locale]}</h2>
            <p className="text-[15px]">
              <Rich text={pain === true
                ? CARE.openerSelfReported[locale]
                : fill(CARE.openerRedFlag[locale], {
                    what: (SENSATIONS.find((x) => x.code === redFlag!.sensation)?.label[locale] ?? '').toLowerCase(),
                    where: regionLabel(redFlag!.region as RegionCode, locale).toLowerCase(),
                  })} />
            </p>
          </div>
        )}

        <Card label={t.checkin.pre.result.planLabel}>
          <div className="flex items-center gap-2">
            <span className="text-[28px]" aria-hidden>{tempo.emoji}</span>
            <div>
              <p className="font-display text-[20px]">{tempo.name}</p>
              <p className="text-[13px] text-[var(--color-ink-soft)]">{tempo.tag[locale]}</p>
            </div>
          </div>
          <p className="text-[15px]">{tempo.meaning[locale]}</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px]">
            {tempo.plan[locale].map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </Card>

        <Card label={t.checkin.pre.result.swapLabel}>
          <PillGroup
            label={t.checkin.pre.result.swapLabel}
            options={TEMPO_ORDER.map((c) => ({ value: c, label: TEMPOS[c].name, emoji: TEMPOS[c].emoji }))}
            value={result.chosen}
            onChange={(v) => void swap(v as TempoCode)}
          />
        </Card>

        <p className="text-center text-[13px] text-[var(--color-ink-soft)]">
          {saving ? t.checkin.post.saving : t.checkin.post.saved}
        </p>
      </div>
    )
  }

  // ── il check-in ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 pt-2">
      <h1 className="font-display text-[26px]">{t.checkin.pre.title}</h1>

      {/* Passo 1 · Prevedi — PRIMA di guardare i canali, altrimenti non è una previsione */}
      <Card label={t.checkin.pre.predict.label}>
        <p className="text-[16px] font-bold">{t.checkin.pre.predict.title}</p>
        <p className="text-[14px] text-[var(--color-ink-soft)]">{t.checkin.pre.predict.help}</p>
        <PillGroup
          label={t.checkin.pre.predict.title}
          options={TEMPO_ORDER.map((c) => ({ value: c, label: TEMPOS[c].name, emoji: TEMPOS[c].emoji }))}
          value={predicted}
          onChange={(v) => setPredicted(v as TempoCode)}
        />
        <p className="bab-label">{t.checkin.pre.predict.confidence}</p>
        <PillGroup
          label={t.checkin.pre.predict.confidence}
          options={t.checkin.pre.predict.confidenceOptions.map((l, i) => ({ value: String(i + 1), label: l }))}
          value={confidence ? String(confidence) : null}
          onChange={(v) => setConfidence(Number(v))}
        />
        <p className="bab-label">{t.checkin.pre.predict.sleepHours}</p>
        <PillGroup
          label={t.checkin.pre.predict.sleepHours}
          options={t.checkin.pre.predict.sleepHoursOptions.map((l) => ({ value: l, label: l }))}
          value={sleepHours}
          onChange={setSleepHours}
        />
      </Card>

      {/* Passo 2 · Sintonizzati */}
      <Card label={t.checkin.pre.tuneIn.label}>
        <p className="text-[16px] font-bold">{t.checkin.pre.tuneIn.title}</p>
        {CHANNELS.map((c) => (
          <div key={c.code} className="flex flex-col gap-1.5">
            <p className="text-[14.5px]">{channelQuestion(c, locale)}</p>
            <EmojiScale
              scale={c.scale}
              value={ch[c.code]}
              onChange={(v) => setCh((p) => ({ ...p, [c.code]: v }))}
              label={c.question[locale]}
              low={c.low[locale]}
              high={c.high[locale]}
            />
          </div>
        ))}

        <p className="bab-label">
          {t.checkin.pre.tuneIn.headspace}{' '}
          <span className="font-normal text-[var(--color-ink-soft)]">· {t.checkin.pre.tuneIn.headspaceHelp}</span>
        </p>
        <PillGroup
          label={t.checkin.pre.tuneIn.headspace}
          options={HEADSPACE.map((h) => ({ value: h.code, label: h.label[locale], emoji: h.emoji }))}
          value={headspace}
          onChange={(v) => setHeadspace((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])}
        />

        <p className="bab-label">{t.checkin.pre.tuneIn.surprise}</p>
        <PillGroup
          label={t.checkin.pre.tuneIn.surprise}
          options={t.checkin.pre.tuneIn.surpriseOptions.map((l, i) => ({ value: String(i + 1), label: l }))}
          value={surprise ? String(surprise) : null}
          onChange={(v) => setSurprise(Number(v))}
        />

        <p className="bab-label">{t.checkin.pre.tuneIn.schoolLoad}</p>
        <PillGroup
          label={t.checkin.pre.tuneIn.schoolLoad}
          options={t.checkin.pre.tuneIn.schoolOptions.map((l, i) => ({ value: String(i + 1), label: l }))}
          value={school ? String(school) : null}
          onChange={(v) => setSchool(Number(v))}
        />
      </Card>

      {/* Passo 2 · Individua e nomina */}
      <Card label={t.checkin.pre.pinpoint.label}>
        <p className="text-[16px] font-bold">{t.checkin.pre.pinpoint.title}</p>
        <p className="text-[14px] text-[var(--color-ink-soft)]">{t.checkin.pre.pinpoint.help}</p>

        {signals.length > 0 && (
          <ul className="flex flex-col gap-2">
            {signals.map((s, i) => (
              <li key={i} className="bab-pill flex items-center justify-between gap-2 px-3 py-2 text-[13.5px]"
                  style={s.is_red_flag ? { borderColor: 'var(--care)' } : undefined}>
                <span>
                  {s.is_red_flag && <span aria-hidden>🚩 </span>}
                  {regionLabel(s.region as RegionCode, locale)} — {SENSATIONS.find((x) => x.code === s.sensation)?.label[locale]}
                </span>
                <button type="button" onClick={() => setSignals((p) => p.filter((_, j) => j !== i))}
                        className="text-[var(--color-ink-soft)]">
                  {t.checkin.common.remove}
                </button>
              </li>
            ))}
          </ul>
        )}

        <BodyMap selected={region} logged={signals.map((s) => s.region as RegionCode)} onSelect={setRegion} />

        {region && (
          <div className="flex flex-col gap-3">
            <p className="bab-label">{regionLabel(region, locale)} · {t.checkin.pre.pinpoint.whatLike}</p>
            {(['good', 'notice', 'flag'] as const).map((g) => (
              <div key={g} className="flex flex-col gap-1.5">
                <p className="text-[12.5px] text-[var(--color-ink-soft)]">{GROUP_LABEL[g][locale]}</p>
                <PillGroup
                  label={GROUP_LABEL[g][locale]}
                  tone={g === 'flag' ? 'care' : 'neutral'}
                  options={sensationsIn(g).map((s) => ({
                    value: s.code, label: s.label[locale], emoji: s.emoji, flag: s.redFlag,
                  }))}
                  value={sens}
                  onChange={setSens}
                />
              </div>
            ))}

            {sens && (
              <>
                <p className="bab-label">{t.checkin.pre.pinpoint.howStrong}</p>
                <PillGroup
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
                <button type="button" onClick={addSignal}
                        className="bab-pill self-start px-4 py-2 text-[14px]"
                        style={{ background: 'var(--color-lime)' }}>
                  {t.checkin.common.addThis}
                </button>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Il blocco educativo PRECEDE sempre la domanda: si insegna, poi si chiede (§10). */}
      <Card>
        <details>
          <summary className="cursor-pointer text-[15px] font-bold">{DECODE_ACHE.workingTitle[locale]} · {DECODE_ACHE.protectiveTitle[locale]}</summary>
          <div className="mt-3 flex flex-col gap-3">
            <ul className="flex list-disc flex-col gap-1 pl-5 text-[14px]">
              {DECODE_ACHE.working[locale].map((x, i) => <li key={i}><Rich text={x} /></li>)}
            </ul>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-[14px]">
              {DECODE_ACHE.protective[locale].map((x, i) => <li key={i}><Rich text={x} /></li>)}
            </ul>
            <p className="text-[14px]"><Rich text={DECODE_ACHE.tell[locale]} /></p>
          </div>
        </details>

        <p className="text-[16px] font-bold">{DECODE_ACHE.question[locale]}</p>
        <PillGroup
          label={DECODE_ACHE.question[locale]}
          tone="care"
          options={[{ value: 'yes', label: t.common.yes }, { value: 'no', label: t.common.no }]}
          value={pain === null ? null : pain ? 'yes' : 'no'}
          onChange={(v) => setPain(v === 'yes')}
        />
      </Card>

      <button
        type="button"
        disabled={!ready}
        onClick={() => void submit()}
        className="bab-pill px-4 py-3 text-[16px] disabled:opacity-50"
        style={{ background: ready ? 'var(--color-lime)' : undefined }}
      >
        {t.checkin.common.next}
      </button>
    </div>
  )
}
