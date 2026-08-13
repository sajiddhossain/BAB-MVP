import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { fill, plural, useCopy, useLocale } from '@/copy'
import BodyMap from '@/components/BodyMap'
import EmojiScale from '@/components/EmojiScale'
import PillGroup from '@/components/PillGroup'
import RegionSheet from '@/components/RegionSheet'
import Step, { useAdvance, useFlow } from '@/components/Step'
import { EFFORT, POST_CHANNELS, HEADSPACE, BROUGHT_HOME, channelQuestion } from '@/content/channels'
import { regionLabel, type RegionCode } from '@/content/bodymap'
import { GEOMETRY } from '@/components/body-shapes'
import { isRedFlag } from '@/content/lexicon'
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
 *
 * Una domanda per schermata, come il pre. Qui conta ancora di più: il post si
 * fa a fine allenamento, in piedi, stanca — è il momento peggiore possibile per
 * mettere davanti a qualcuno una pagina con dieci domande sopra.
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

const TEMPO_ORDER: TempoCode[] = ['upbeat', 'steady', 'gentle']

/** 🔴 Nomi di colonna, non numeri di passo: vedi la nota in `CheckInPre`. */
const MAIN = [
  'tempo_chosen', 'effort', 'duration_bucket', 'session_type',
  'legs', 'breath', 'energy', 'headspace',
  'body', 'brought_home', 'note',
] as const

/** Vedi la nota in `CheckInPre`: la mappa apre un foglio, non una schermata. */
const ZONE = 'zona'

export default function CheckInPost() {
  const t = useCopy()
  const locale = useLocale()
  const navigate = useNavigate()
  const { userId } = useSession()
  const flow = useFlow(MAIN)
  const [params, setParams] = useSearchParams()
  const advance = useAdvance()
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
  const [freeText, setFreeText] = useState('')
  const [signals, setSignals] = useState<BodySignalDraft[]>([])

  const [skipped, setSkipped] = useState<string[]>([])
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

  const dirty = actual !== null || effort !== null || duration !== null || session !== null
    || legs !== null || breath !== null || energy !== null || headspace.length > 0
    || brought.length > 0 || note.trim() !== '' || signals.length > 0

  const answer = (id: string, set: () => void, go = flow.onward) =>
    advance(() => { set(); setSkipped((p) => p.filter((x) => x !== id)) }, go)

  const skip = (id: string) => {
    setSkipped((p) => (p.includes(id) ? p : [...p, id]))
    flow.onward()
  }

  const openZone = (() => {
    const z = params.get(ZONE)
    return z && z in { ...GEOMETRY.front, ...GEOMETRY.back, other: 1, all_over: 1 }
      ? (z as RegionCode) : null
  })()
  const openSheet = (r: RegionCode) => setParams({ p: 'body', [ZONE]: r })
  const closeSheet = () => navigate(-1)

  function addSignal(d: { sensation: string; intensity: number | null; behaviour: string | null }) {
    if (!openZone) return
    setSignals((p) => [...p, {
      athlete_id: userId ?? '', region: openZone, region_free: freeText.trim() || null,
      sensation: d.sensation, intensity: d.intensity, behaviour: d.behaviour,
      is_red_flag: isRedFlag(d.sensation),
    }])
    setRegion(null); setFreeText('')
    setParams({ p: 'body' }, { replace: true })
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
          skipped_fields: skipped.length ? skipped : null,
        }, signals)
      } catch { /* resta in coda locale */ }
    }
    setSaving(false)
  }

  /* ── Il risultato ─────────────────────────────────────────────────────── */
  if (done && actual && effort !== null && bodyAvg !== null) {
    const outcome = OUTCOMES[pickOutcome(actual, effort, bodyAvg)]
    const gap = predicted ? predictionError(predicted, actual) : null

    return (
      <div className="flex flex-col gap-5 pt-2">
        <p className="bab-label">{t.checkin.post.learnLabel}</p>

        {/* Il protagonista: cosa è successo oggi, detto in una frase sola. */}
        <section className="bab-card flex flex-col gap-3 px-5 py-5"
                 style={{ boxShadow: 'var(--shadow-lg)' }}>
          <span className="text-[40px] leading-none" aria-hidden>{outcome.emoji}</span>
          <h1 className="font-display text-[24px] leading-tight">{outcome.title[locale]}</h1>
          <p className="text-[15px]"><Rich text={outcome.body[locale]} /></p>
        </section>

        {/* Il confronto: la metrica del prodotto, detta a parole e senza voti. */}
        {!predicted ? (
          <p className="text-[15px] text-[var(--color-ink-soft)]">{t.checkin.post.noPre}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-[16px] leading-snug">
              <Rich text={gap === 0
                ? fill(t.checkin.post.readSpot, { predicted: TEMPOS[predicted].name })
                : fill(t.checkin.post.readGap, {
                    predicted: TEMPOS[predicted].name, actual: TEMPOS[actual].name,
                  })} />
            </p>
            {gap !== 0 && (
              <p className="text-[14px] text-[var(--color-ink-soft)]">{t.checkin.post.readGapNote}</p>
            )}
          </div>
        )}

        {signals.length > 0 && (
          <p className="text-[14px]">
            {plural(signals.length, t.checkin.post.recapSignalsOne, t.checkin.post.recapSignals)}
          </p>
        )}

        <section className="bab-card flex flex-col gap-2 px-4 py-4"
                 style={{ background: `var(--tempo-${actual}-tint)`,
                          borderColor: `var(--tempo-${actual})` }}>
          <p className="bab-label">{t.checkin.post.recoverLabel}</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px]">
            {TEMPOS[actual].plan[locale].map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </section>

        <Link to="/senti" className="bab-pill flex items-center justify-center gap-2 px-4 py-3 text-[15px]">
          <span aria-hidden>🧭</span> {t.checkin.post.bodySenseCta}
        </Link>

        <p className="text-center text-[13px] text-[var(--color-ink-soft)]">
          {saving ? t.checkin.post.saving : t.checkin.post.saved}
        </p>

        <button type="button" onClick={() => navigate('/today')}
                className="bab-pill px-4 py-3.5 text-[17px]"
                style={{ background: 'var(--color-lime)' }}>
          {t.common.done}
        </button>
      </div>
    )
  }

  /* ── I passi ──────────────────────────────────────────────────────────── */

  const frame = {
    at: flow.at, of: flow.of, onBack: flow.back,
    onClose: () => navigate('/today'), dirty,
  }

  /**
   * Una schermata sola, senza scorrere — vedi la nota in `CheckInPre`.
   * Niente etichetta di sezione: lo spazio va alla figura.
   */
  const bodyStep = () => (
    <Step {...frame} fill
          question={t.checkin.pre.pinpoint.title} help={t.checkin.pre.pinpoint.mapHint}
          onNext={region === 'other' ? () => openSheet('other') : flow.onward}
          nextLabel={region === 'other' ? t.flow.next
            : signals.length ? t.checkin.common.thatsAll : t.checkin.common.nothingHere}>
      {signals.length > 0 && (
        <ul className="flex shrink-0 gap-2 overflow-x-auto pb-1">
          {signals.map((s, i) => (
            <li key={i} className="bab-pill flex shrink-0 items-center gap-1.5 py-1.5 pl-3 pr-1.5 text-[12.5px]"
                style={s.is_red_flag ? { borderColor: 'var(--care)' } : undefined}>
              <span className="whitespace-nowrap">
                {s.is_red_flag && <span aria-hidden>🚩 </span>}
                {regionLabel(s.region as RegionCode, locale)}
              </span>
              <button type="button" onClick={() => setSignals((p) => p.filter((_, j) => j !== i))}
                      aria-label={t.checkin.common.remove}
                      className="relative flex h-6 w-6 items-center justify-center rounded-full text-[13px] text-[var(--color-ink-soft)] before:absolute before:-inset-2.5 before:content-['']"
                      style={{ background: 'var(--color-sand)' }}>
                <span aria-hidden>✕</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <BodyMap
        fit
        selected={region}
        logged={signals.map((s) => s.region as RegionCode)}
        flagged={signals.filter((s) => s.is_red_flag).map((s) => s.region as RegionCode)}
        freeText={freeText}
        onFreeText={setFreeText}
        onSelect={(r) => r === 'other'
          ? setRegion(r)
          : answer('body', () => setRegion(r), () => openSheet(r))}
      />
      {openZone && (
        <RegionSheet region={openZone} freeText={freeText}
                     onCancel={closeSheet} onAdd={addSignal} />
      )}
    </Step>
  )

  /** Le tre letture del dopo: gambe, respiro, energia. Una per schermata. */
  const channel = POST_CHANNELS.find((x) => x.code === flow.id)
  if (channel) {
    const val = channel.code === 'legs' ? legs : channel.code === 'breath' ? breath : energy
    const set = channel.code === 'legs' ? setLegs : channel.code === 'breath' ? setBreath : setEnergy
    return (
      <Step {...frame} section={t.checkin.post.senseLabel}
            question={channelQuestion(channel, locale)}
            onNext={val ? flow.onward : null}>
        <EmojiScale
          size="lg"
          scale={channel.scale} value={val}
          onChange={(v) => answer(channel.code, () => set(v))}
          label={channel.question[locale]}
          low={channel.low[locale]} high={channel.high[locale]}
        />
      </Step>
    )
  }

  switch (flow.id) {
    case 'tempo_chosen':
      return (
        <Step {...frame} section={t.checkin.post.lookBack.label}
              question={t.checkin.post.lookBack.title}
              help={lookedForPre && !predicted ? t.checkin.post.noPre : undefined}
              onNext={actual ? flow.onward : null}>
          <PillGroup
            size="lg"
            label={t.checkin.post.lookBack.title}
            options={TEMPO_ORDER.map((c) => ({ value: c, label: TEMPOS[c].name, emoji: TEMPOS[c].emoji }))}
            value={actual}
            onChange={(v) => answer('tempo_chosen', () => setActual(v as TempoCode))}
          />
        </Step>
      )

    case 'effort':
      /**
       * 🔴 La session-RPE. È l'unico dato del prodotto con della letteratura
       * seria dietro, quindi è l'ultima domanda che si può saltare.
       */
      return (
        <Step {...frame} section={t.checkin.post.lookBack.label}
              question={channelQuestion(EFFORT, locale)}
              onNext={effort ? flow.onward : null}>
          <EmojiScale
            size="lg"
            scale={EFFORT.scale} value={effort}
            onChange={(v) => answer('effort', () => setEffort(v))}
            label={EFFORT.question[locale]} low={EFFORT.low[locale]} high={EFFORT.high[locale]}
          />
        </Step>
      )

    case 'duration_bucket':
      return (
        <Step {...frame} section={t.checkin.post.lookBack.label}
              question={t.checkin.post.lookBack.duration}
              onNext={duration ? flow.onward : null}
              onSkip={() => skip('duration_bucket')}>
          <PillGroup
            size="lg"
            label={t.checkin.post.lookBack.duration}
            options={t.checkin.post.lookBack.durationOptions.map((l) => ({ value: l, label: l }))}
            value={duration}
            onChange={(v) => answer('duration_bucket', () => setDuration(v))}
          />
        </Step>
      )

    case 'session_type':
      return (
        <Step {...frame} section={t.checkin.post.lookBack.label}
              question={t.checkin.post.lookBack.sessionType}
              onNext={session ? flow.onward : null}
              onSkip={() => skip('session_type')}>
          <PillGroup
            size="lg"
            label={t.checkin.post.lookBack.sessionType}
            options={t.checkin.post.lookBack.sessionTypeOptions.map((l, i) => ({
              value: SESSION_CODES[i]!, label: l,
            }))}
            value={session}
            onChange={(v) => answer('session_type', () => setSession(v))}
          />
        </Step>
      )

    case 'headspace':
      /** 🔴 Entra in `bodyAverage`: senza, il risultato non si può calcolare. */
      return (
        <Step {...frame} section={t.checkin.post.senseLabel}
              question={t.checkin.pre.tuneIn.headspace}
              help={t.checkin.pre.tuneIn.headspaceHelp}
              onNext={hs !== null ? flow.onward : null}>
          <PillGroup
            size="lg"
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
              className="bab-card px-3 py-2 text-[16px]"
            />
          )}
        </Step>
      )

    case 'body':
      return bodyStep()

    case 'brought_home':
      /**
       * La domanda migliore del materiale originale: sposta il metro dalla
       * prestazione a cosa ha imparato, e non c'è modo di rispondere male.
       */
      return (
        <Step {...frame} section={t.checkin.post.learnLabel}
              question={t.checkin.post.broughtHome.title}
              help={t.checkin.post.broughtHome.help}
              onNext={flow.onward}>
          <PillGroup
            size="lg"
            label={t.checkin.post.broughtHome.title}
            options={BROUGHT_HOME.map((b) => ({ value: b.code, label: b.label[locale], emoji: b.emoji }))}
            value={brought}
            onChange={(v) => setBrought((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])}
          />
        </Step>
      )

    case 'note':
      return (
        <Step {...frame} section={t.checkin.post.learnLabel}
              question={t.checkin.post.openQuestion}
              onNext={ready ? () => void submit() : null}
              nextLabel={t.common.done}>
          {/* 🔒 Testo libero: resta suo. Non compare in nessuna vista dello staff. */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={5}
            placeholder={t.checkin.post.notePlaceholder}
            aria-label={t.checkin.post.openQuestion}
            className="bab-card px-3 py-3 text-[16px]"
          />
          {!ready && (
            <p className="text-[14px] text-[var(--color-ink-soft)]">{t.checkin.common.needChannels}</p>
          )}
        </Step>
      )

    default:
      return null
  }
}
