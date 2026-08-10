import { useEffect, useState } from 'react'
import { fill, useCopy, useLocale } from '@/copy'
import BodyMap from '@/components/BodyMap'
import EmojiScale from '@/components/EmojiScale'
import PillGroup from '@/components/PillGroup'
import { EFFORT, POST_CHANNELS, HEADSPACE, BROUGHT_HOME, channelQuestion } from '@/content/channels'
import { regionLabel, type RegionCode } from '@/content/bodymap'
import { SENSATIONS, INTENSITIES, BEHAVIOURS, GROUP_LABEL, isRedFlag, sensationsIn } from '@/content/lexicon'
import { TEMPOS, type TempoCode } from '@/content/tempo'
import { OUTCOMES, pickOutcome } from '@/content/outcomes'
import { headspaceValue, bodyAverage, predictionError } from '@/lib/tempo'
import { saveCheckIn, checkInsOn, localDate, type BodySignalDraft } from '@/lib/repo'
import { useSession } from '@/lib/session'

/**
 * Check-in post — Guarda indietro → Senti → Impara → Recupera.
 *
 * 🔴 È QUI CHE NASCE LA METRICA. Il prediction error esiste solo se questo
 * check-in trova quello di stamattina e confronta previsione contro realtà.
 * Senza il post, il pre è un diario; con il post, è calibrazione.
 *
 * Se il pre di oggi non c'è, la schermata funziona lo stesso e lo dice: non si
 * blocca, e non finge un confronto che non può fare.
 */

const SESSION_CODES = ['training', 'match', 'pe', 'gym', 'other'] as const

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, i) =>
        p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong>
        : p.startsWith('*') ? <em key={i}>{p.slice(1, -1)}</em>
        : <span key={i}>{p}</span>,
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

export default function CheckInPost() {
  const t = useCopy()
  const locale = useLocale()
  const { userId } = useSession()
  const [startedAt] = useState(() => new Date().toISOString())

  /** Il pre di oggi, se esiste: è l'altra metà del confronto. */
  const [predicted, setPredicted] = useState<TempoCode | null>(null)
  const [lookedForPre, setLookedForPre] = useState(false)

  const [actual, setActual] = useState<TempoCode | null>(null)
  const [effort, setEffort] = useState<number | null>(null)
  const [duration, setDuration] = useState<string | null>(null)
  const [session, setSession] = useState<string | null>(null)
  const [legs, setLegs] = useState<number | null>(null)
  const [breath, setBreath] = useState<number | null>(null)
  const [energy, setEnergy] = useState<number | null>(null)
  const [headspace, setHeadspace] = useState<string[]>([])
  const [hsOther, setHsOther] = useState('')
  const [brought, setBrought] = useState<string[]>([])
  const [note, setNote] = useState('')

  const [region, setRegion] = useState<RegionCode | null>(null)
  const [sens, setSens] = useState<string | null>(null)
  const [intensity, setIntensity] = useState<number | null>(null)
  const [behaviour, setBehaviour] = useState<string | null>(null)
  const [freeText, setFreeText] = useState('')
  const [signals, setSignals] = useState<BodySignalDraft[]>([])

  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    // Il giorno dell'atleta finisce alle 4 del mattino, non a mezzanotte:
    // `localDate()` lo sa già, quindi un post fatto all'una di notte trova
    // ancora il pre di "ieri", che per lei è oggi.
    checkInsOn(localDate()).then((rows) => {
      if (!alive) return
      // L'ULTIMO pre della giornata: se l'ha rifatto, vale quello che ha
      // scritto per ultimo — gli eventi non si modificano, si aggiungono.
      const pre = rows.filter((r) => r.kind === 'pre').at(0)
      if (pre?.tempo_predicted) setPredicted(pre.tempo_predicted as TempoCode)
      setLookedForPre(true)
    }).catch(() => setLookedForPre(true))
    return () => { alive = false }
  }, [])

  const hs = headspaceValue(headspace, hsOther)
  const bodyAvg = bodyAverage(legs, breath, energy, hs)
  const ready = actual !== null && effort !== null && bodyAvg !== null

  function addSignal() {
    if (!region || !sens) return
    setSignals((p) => [...p, {
      athlete_id: userId ?? '', region, region_free: freeText.trim() || null,
      sensation: sens, intensity, behaviour, is_red_flag: isRedFlag(sens),
    }])
    setRegion(null); setSens(null); setIntensity(null); setBehaviour(null); setFreeText('')
  }

  async function submit() {
    if (!ready) return
    setDone(true); setSaving(true)
    if (userId) {
      try {
        await saveCheckIn({
          athlete_id: userId, kind: 'post',
          tempo_predicted: predicted, tempo_chosen: actual,
          effort, legs, breath, energy, headspace: headspace.filter((h) => h !== '__other'),
          headspace_other: hsOther.trim() || null,
          brought_home: brought, note: note.trim() || null,
          session_type: session, duration_bucket: duration,
          started_at: startedAt,
        }, signals)
      } catch { /* resta in coda locale */ }
    }
    setSaving(false)
  }

  // ── il risultato ──────────────────────────────────────────────────────────
  if (done && actual && effort !== null && bodyAvg !== null) {
    const outcome = OUTCOMES[pickOutcome(actual, effort, bodyAvg)]
    const gap = predicted ? predictionError(predicted, actual) : null

    return (
      <div className="flex flex-col gap-4 pt-2">
        <h1 className="font-display text-[26px]">{t.checkin.post.title}</h1>

        <Card label={t.checkin.post.learnLabel}>
          <div className="flex items-start gap-2">
            <span className="text-[24px]" aria-hidden>{outcome.emoji}</span>
            <p className="font-display text-[18px]">{outcome.title[locale]}</p>
          </div>
          <p className="text-[15px]"><Rich text={outcome.body[locale]} /></p>
        </Card>

        {/* Il confronto: la metrica del prodotto, detta a parole e senza voti. */}
        <Card>
          {!predicted ? (
            <p className="text-[15px] text-[var(--color-ink-soft)]">{t.checkin.post.noPre}</p>
          ) : (
            <>
              <p className="text-[15px]">
                <Rich text={gap === 0
                  ? fill(t.checkin.post.readSpot, { predicted: TEMPOS[predicted].name })
                  : fill(t.checkin.post.readGap, {
                      predicted: TEMPOS[predicted].name, actual: TEMPOS[actual].name,
                    })} />
              </p>
              {gap !== 0 && (
                <p className="text-[14px] text-[var(--color-ink-soft)]">{t.checkin.post.readGapNote}</p>
              )}
            </>
          )}
          {signals.length > 0 && (
            <p className="text-[14px]">{fill(t.checkin.post.recapSignals, { n: signals.length })}</p>
          )}
        </Card>

        <Card label={t.checkin.post.recoverLabel}>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px]">
            {TEMPOS[actual].plan[locale].map((p, i) => <li key={i}>{p}</li>)}
          </ul>
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
      <h1 className="font-display text-[26px]">{t.checkin.post.title}</h1>

      <Card label={t.checkin.post.lookBack.label}>
        <p className="text-[16px] font-bold">{t.checkin.post.lookBack.title}</p>
        {lookedForPre && !predicted && (
          <p className="text-[13.5px] text-[var(--color-ink-soft)]">{t.checkin.post.noPre}</p>
        )}
        <PillGroup
          label={t.checkin.post.lookBack.title}
          options={TEMPO_ORDER.map((c) => ({ value: c, label: TEMPOS[c].name, emoji: TEMPOS[c].emoji }))}
          value={actual}
          onChange={(v) => setActual(v as TempoCode)}
        />

        <p className="text-[14.5px]">{channelQuestion(EFFORT, locale)}</p>
        <EmojiScale
          scale={EFFORT.scale} value={effort} onChange={setEffort}
          label={EFFORT.question[locale]} low={EFFORT.low[locale]} high={EFFORT.high[locale]}
        />

        <p className="bab-label">{t.checkin.post.lookBack.duration}</p>
        <PillGroup
          label={t.checkin.post.lookBack.duration}
          options={t.checkin.post.lookBack.durationOptions.map((l) => ({ value: l, label: l }))}
          value={duration} onChange={setDuration}
        />

        <p className="bab-label">{t.checkin.post.lookBack.sessionType}</p>
        <PillGroup
          label={t.checkin.post.lookBack.sessionType}
          options={t.checkin.post.lookBack.sessionTypeOptions.map((l, i) => ({
            value: SESSION_CODES[i], label: l,
          }))}
          value={session} onChange={setSession}
        />
      </Card>

      <Card label={t.checkin.post.senseLabel}>
        {POST_CHANNELS.map((c) => {
          const val = c.code === 'legs' ? legs : c.code === 'breath' ? breath : energy
          const set = c.code === 'legs' ? setLegs : c.code === 'breath' ? setBreath : setEnergy
          return (
            <div key={c.code} className="flex flex-col gap-1.5">
              <p className="text-[14.5px]">{c.emoji} {c.question[locale]}</p>
              <EmojiScale
                scale={c.scale} value={val} onChange={set}
                label={c.question[locale]} low={c.low[locale]} high={c.high[locale]}
              />
            </div>
          )
        })}

        <p className="bab-label">
          {t.checkin.pre.tuneIn.headspace}{' '}
          <span className="font-normal text-[var(--color-ink-soft)]">· {t.checkin.pre.tuneIn.headspaceHelp}</span>
        </p>
        <PillGroup
          label={t.checkin.pre.tuneIn.headspace}
          options={[...HEADSPACE.map((h) => ({ value: h.code, label: h.label[locale], emoji: h.emoji })),
                    { value: '__other', label: t.checkin.pre.tuneIn.headspaceOther }]}
          value={headspace}
          onChange={(v) => setHeadspace((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])}
        />
        {headspace.includes('__other') && (
          <input
            value={hsOther}
            onChange={(e) => setHsOther(e.target.value)}
            maxLength={60}
            placeholder={t.checkin.pre.tuneIn.headspaceOtherPlaceholder}
            aria-label={t.checkin.pre.tuneIn.headspaceOther}
            className="bab-card px-3 py-2 text-[15px]"
          />
        )}
      </Card>

      <Card label={t.checkin.pre.pinpoint.label}>
        <p className="text-[16px] font-bold">{t.checkin.pre.pinpoint.title}</p>
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
        <BodyMap
          selected={region}
          logged={signals.map((s) => s.region as RegionCode)}
          flagged={signals.filter((s) => s.is_red_flag).map((s) => s.region as RegionCode)}
          freeText={freeText}
          onFreeText={setFreeText}
          onSelect={setRegion}
        />
        {region && (
          <div className="flex flex-col gap-3">
            <p className="bab-label">
              {region === 'other' && freeText.trim() ? freeText.trim() : regionLabel(region, locale)}
              {' · '}{t.checkin.pre.pinpoint.whatLike}
            </p>
            {(['good', 'notice', 'flag'] as const).map((g) => (
              <div key={g} className="flex flex-col gap-1.5">
                <p className="text-[12.5px] text-[var(--color-ink-soft)]">{GROUP_LABEL[g][locale]}</p>
                <PillGroup
                  label={GROUP_LABEL[g][locale]}
                  tone={g === 'flag' ? 'care' : 'neutral'}
                  options={sensationsIn(g).map((s) => ({
                    value: s.code, label: s.label[locale], emoji: s.emoji, flag: s.redFlag,
                  }))}
                  value={sens} onChange={setSens}
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
                  value={behaviour} onChange={setBehaviour}
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

      {/* La domanda migliore del materiale originale: sposta il metro dalla
          prestazione a cosa ha imparato, e non c'è modo di rispondere male. */}
      <Card>
        <p className="text-[16px] font-bold">{t.checkin.post.broughtHome.title}</p>
        <p className="text-[14px] text-[var(--color-ink-soft)]">{t.checkin.post.broughtHome.help}</p>
        <PillGroup
          label={t.checkin.post.broughtHome.title}
          options={BROUGHT_HOME.map((b) => ({ value: b.code, label: b.label[locale], emoji: b.emoji }))}
          value={brought}
          onChange={(v) => setBrought((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])}
        />

        <p className="text-[14px]"><Rich text={t.checkin.post.openQuestion} /></p>
        {/* 🔒 Testo libero: resta suo. Non compare in nessuna vista dello staff. */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder={t.checkin.post.notePlaceholder}
          className="bab-card px-3 py-2 text-[15px]"
        />
      </Card>

      <button
        type="button" disabled={!ready} onClick={() => void submit()}
        className="bab-pill px-4 py-3 text-[16px] disabled:opacity-50"
        style={{ background: ready ? 'var(--color-lime)' : undefined }}
      >
        {t.checkin.common.next}
      </button>
    </div>
  )
}
