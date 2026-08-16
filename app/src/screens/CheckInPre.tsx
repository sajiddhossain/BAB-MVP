import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fill, useCopy, useLocale } from '@/copy'
import BodyMap from '@/components/BodyMap'
import EmojiScale from '@/components/EmojiScale'
import PillGroup from '@/components/PillGroup'
import VasSlider from '@/components/VasSlider'
import RegionSheet from '@/components/RegionSheet'
import Step, { useAdvance, useFlow } from '@/components/Step'
import { CHANNELS, MOOD_RANGE, channelQuestion } from '@/content/channels'
import { regionLabel, type RegionCode } from '@/content/bodymap'
import { GEOMETRY } from '@/components/body-shapes'
import { SENSATIONS, isRedFlag } from '@/content/lexicon'
import { TEMPOS, type TempoCode } from '@/content/tempo'
import { CARE, DECODE_ACHE } from '@/content/clinical'
import Sparkle from '@/components/Sparkle'
import { BrainIcon, CloseIcon, FlagIcon, TempoIcon } from '@/components/icons'
import { total, suggestWithPain, type Channels } from '@/lib/tempo'
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
 * 🔴 Una domanda per schermata. Prima era una pagina sola che scorreva, e il
 * motivo per cui era stata scritta così era buono: tornare a cambiare un canale
 * non deve costare il giro intero. Quel motivo è conservato — le risposte non si
 * perdono mai e il passo indietro è libero — ma la pagina unica chiedeva a una
 * tredicenne di guardare quattordici domande in una volta prima di rispondere
 * alla prima. La risposta singola fa avanzare da sola, quindi il flusso a passi
 * costa MENO tocchi della pagina che scorre, non di più.
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

const TEMPO_ORDER: TempoCode[] = ['upbeat', 'steady', 'gentle']

/**
 * 🔴 Gli id dei passi sono NOMI DI COLONNA. Finiscono in due posti che devono
 * combaciare: l'indirizzo (`?p=sleep_hours`) e `check_ins.skipped_fields`.
 * Chiamarli `passo7` renderebbe illeggibile la seconda cosa, che è quella che
 * dice quali domande vale la pena tenere dopo il pilota.
 */
const MAIN = [
  'tempo_predicted', 'prediction_confidence', 'sleep_hours',
  'sleep', 'energy', 'mood', 'school_load', 'on_period', 'painkillers',
  'body', 'pain',
] as const

/**
 * 🔴 La mappa NON ha più passi annidati. Sensazione, intensità e comportamento
 * erano tre schermate: toccavi il ginocchio e la figura spariva. Adesso sono un
 * foglio che si alza sopra la figura — vedi `RegionSheet` per il perché — e
 * quale zona è aperta sta in `?zona=`, così il tasto indietro del telefono
 * chiude il foglio invece di far uscire dal check-in.
 */
const ZONE = 'zona'

export default function CheckInPre() {
  const t = useCopy()
  const locale = useLocale()
  const navigate = useNavigate()
  const { userId } = useSession()
  const flow = useFlow(MAIN)
  const [params, setParams] = useSearchParams()
  const advance = useAdvance()

  // Il momento in cui ha aperto: serve a misurare quanto tempo passa davvero.
  // R1 · si misura per capire, non per giudicare.
  const [startedAt] = useState(() => new Date().toISOString())

  const [predicted, setPredicted] = useState<TempoCode | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [sleepHours, setSleepHours] = useState<string | null>(null)
  const [ch, setCh] = useState<Channels>({ sleep: null, energy: null })
  const [mood, setMood] = useState<number | null>(null)
  const [school, setSchool] = useState<number | null>(null)
  const [onPeriod, setOnPeriod] = useState<boolean | null>(null)
  const [painkillers, setPainkillers] = useState<boolean | null>(null)

  // Il taccuino dei segnali: regione → sensazione → intensità → comportamento.
  const [region, setRegion] = useState<RegionCode | null>(null)
  const [freeText, setFreeText] = useState('')
  const [signals, setSignals] = useState<BodySignalDraft[]>([])

  const [pain, setPain] = useState<boolean | null>(null)
  /** Le domande che ha scelto di saltare. Vedi `Step.onSkip`. */
  const [skipped, setSkipped] = useState<string[]>([])
  const [result, setResult] = useState<{ suggested: TempoCode; chosen: TempoCode } | null>(null)
  const [saving, setSaving] = useState(false)

  /** 0–1, non una somma grezza: vedi `lib/tempo.ts`. */
  const read = total(ch, mood)
  /**
   * 🔴 Due strade diverse arrivano al Care, e vanno raccontate diversamente.
   * Se è stata una BANDIERA ROSSA a instradare, dirle "hai segnalato dolore
   * protettivo" è falso — lei può aver risposto di no — e la prima cosa che
   * legge in Care mode non può essere una cosa che non ha detto.
   */
  const redFlag = signals.find((s) => s.is_red_flag) ?? null
  const careOn = pain === true || redFlag !== null

  /** C'è qualcosa da perdere uscendo? Serve a non chiedere conferma a vuoto. */
  const dirty = predicted !== null || confidence !== null || sleepHours !== null
    || Object.values(ch).some((v) => v !== null) || mood !== null
    || school !== null || onPeriod !== null || painkillers !== null
    || signals.length > 0 || pain !== null

  /** Rispondere cancella l'eventuale salto: si può cambiare idea tornando indietro. */
  const answer = (id: string, set: () => void, go = flow.onward) =>
    advance(() => { set(); setSkipped((p) => p.filter((x) => x !== id)) }, go)

  const skip = (id: string) => {
    setSkipped((p) => (p.includes(id) ? p : [...p, id]))
    flow.onward()
  }

  /** Quale zona ha il foglio aperto sopra, se ce l'ha. */
  const openZone = (() => {
    const z = params.get(ZONE)
    return z && z in { ...GEOMETRY.front, ...GEOMETRY.back, other: 1, all_over: 1 }
      ? (z as RegionCode) : null
  })()
  const openSheet = (r: RegionCode) => setParams({ p: 'body', [ZONE]: r })
  /** Chiudere senza aggiungere: si torna indietro, così la cronologia resta pulita. */
  const closeSheet = () => navigate(-1)

  function addSignal(d: { sensation: string; intensity: number | null; behaviour: string | null }) {
    if (!openZone) return
    setSignals((prev) => [...prev, {
      athlete_id: userId ?? '', region: openZone, region_free: freeText.trim() || null,
      sensation: d.sensation, intensity: d.intensity, behaviour: d.behaviour,
      is_red_flag: isRedFlag(d.sensation),
    }])
    setRegion(null); setFreeText('')
    // `replace`: dopo averlo aggiunto, tornare indietro nel foglio sarebbe
    // tornare a una scelta che ha già confermato.
    setParams({ p: 'body' }, { replace: true })
  }

  async function submit(protective: boolean) {
    if (read === null || !predicted) return
    const suggested = suggestWithPain(read, protective || redFlag !== null)
    setResult({ suggested, chosen: suggested })
    setSaving(true)
    if (userId) {
      try {
        await saveCheckIn({
          athlete_id: userId, kind: 'pre',
          tempo_predicted: predicted, prediction_confidence: confidence,
          // 🔴 Sempre entrambe le colonne, anche quando coincidono.
          tempo_suggested: suggested, tempo_chosen: suggested,
          sleep: ch.sleep, energy: ch.energy, mood,
          sleep_hours: sleepHours, school_load: school,
          on_period: onPeriod, painkillers,
          started_at: startedAt,
          skipped_fields: skipped.length ? skipped : null,
        }, signals)
      } catch { /* resta in coda locale: il check-in non si perde */ }
    }
    setSaving(false)
  }

  /** Il cambio di andatura si salva come check-in nuovo: gli eventi non si modificano. */
  async function swap(to: TempoCode) {
    if (!result || !predicted || read === null) return
    setResult({ ...result, chosen: to })
    if (userId) {
      try {
        await saveCheckIn({
          athlete_id: userId, kind: 'pre',
          tempo_predicted: predicted, prediction_confidence: confidence,
          tempo_suggested: result.suggested, tempo_chosen: to,
          sleep: ch.sleep, energy: ch.energy, mood,
          sleep_hours: sleepHours, school_load: school,
          on_period: onPeriod, painkillers,
          started_at: startedAt,
          skipped_fields: skipped.length ? skipped : null,
        })
      } catch { /* idem */ }
    }
  }

  /* ── Il risultato ─────────────────────────────────────────────────────────
     🔴 Vince sempre sul passo nell'indirizzo. Il check-in è già salvato, e gli
     eventi non si modificano: tornare indietro a "correggere" una risposta
     creerebbe un secondo check-in che lei non ha chiesto. */
  if (result) {
    const tempo = TEMPOS[result.chosen]
    const guessedRight = predicted === result.suggested
    return (
      <div className="flex flex-col gap-5 pt-2">
        <p className="bab-label">{t.checkin.pre.result.compareLabel}</p>
        <p className="text-[17px] leading-snug">
          <Rich text={guessedRight
            ? fill(t.checkin.pre.result.matched, { tempo: TEMPOS[result.suggested].name })
            : fill(t.checkin.pre.result.differed, {
                predicted: TEMPOS[predicted!].name, suggested: TEMPOS[result.suggested].name,
              })} />
        </p>
        {!guessedRight && (
          <p className="text-[14px] text-[var(--color-ink-soft)]">{t.checkin.pre.result.gapNote}</p>
        )}

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

        {/* 🔴 Il protagonista della schermata, e si vede: è l'unico oggetto con
            l'ombra da 8px e il colore pieno dell'andatura. Prima erano quattro
            card identiche, e il piano di oggi pesava quanto il selettore. */}
        <section className="bab-card relative flex flex-col gap-3 px-5 py-5"
                 style={{ background: `var(--tempo-${result.chosen}-tint)`,
                          borderColor: `var(--tempo-${result.chosen})`,
                          boxShadow: 'var(--shadow-lg)' }}>
          {/* 🔴 Mai se è in corso il Care mode: uno scintillio sopra un
              avviso di dolore protettivo sarebbe fuori luogo, non festoso. */}
          {!careOn && <Sparkle />}
          <p className="bab-label">{t.checkin.pre.result.planLabel}</p>
          <div className="flex items-center gap-3">
            <TempoIcon code={result.chosen} size={40} color={`var(--tempo-${result.chosen})`} />
            <div>
              <h1 className="font-display text-[26px]">{tempo.name}</h1>
              <p className="text-[13px] text-[var(--color-ink-soft)]">{tempo.tag[locale]}</p>
            </div>
          </div>
          <p className="text-[15px]">{tempo.meaning[locale]}</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px]">
            {tempo.plan[locale].map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </section>

        <div className="flex flex-col gap-2">
          <p className="text-[14px] text-[var(--color-ink-soft)]">{t.checkin.pre.result.swapLabel}</p>
          <PillGroup
            label={t.checkin.pre.result.swapLabel}
            options={TEMPO_ORDER.map((c) => ({ value: c, label: TEMPOS[c].name, icon: <TempoIcon code={c} size={16} color={`var(--tempo-${c})`} /> }))}
            value={result.chosen}
            onChange={(v) => void swap(v as TempoCode)}
          />
        </div>

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
   * Il passo della mappa. È una funzione e non un `case` perché le tre
   * deviazioni annidate ci ricadono dentro quando la regione non c'è più —
   * indietro-avanti col tasto del telefono, o un indirizzo incollato. Navigare
   * durante il render sarebbe l'altra strada, ed è quella che React vieta.
   */
  /**
   * 🔴 `fill` + `fit`: la mappa sta in UNA schermata e non scorre. Prima la
   * figura aveva un'altezza sua e tutto il resto — il fronte/retro, le zone già
   * segnate, «da un'altra parte», il ripiego a elenco — la spingeva sotto la
   * piega. Per indicare il ginocchio bisognava far salire la pagina, e la
   * figura si spostava sotto il dito mentre lo si appoggiava.
   *
   * Niente etichetta di sezione: la domanda la dice già, e ogni riga
   * risparmiata qui è una riga in più di figura.
   */
  const bodyStep = () => (
    <Step {...frame} fill
          question={t.checkin.pre.pinpoint.title} help={t.checkin.pre.pinpoint.mapHint}
          onNext={region === 'other' ? () => openSheet('other') : flow.onward}
          nextLabel={region === 'other' ? t.flow.next
            : signals.length ? t.checkin.common.thatsAll : t.checkin.common.nothingHere}>
      {/* Le zone già segnate: una riga sola che scorre di lato, così la
          figura non perde altezza a ogni sensazione aggiunta. */}
      {signals.length > 0 && (
        <ul className="flex shrink-0 gap-2 overflow-x-auto pb-1">
          {signals.map((s, i) => (
            <li key={i} className="bab-pill flex shrink-0 items-center gap-1.5 py-1.5 pl-3 pr-1.5 text-[12.5px]"
                style={s.is_red_flag ? { borderColor: 'var(--care)' } : undefined}>
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                {s.is_red_flag && <FlagIcon size={13} color="var(--care)" />}
                {regionLabel(s.region as RegionCode, locale)}
              </span>
              <button type="button" onClick={() => setSignals((p) => p.filter((_, j) => j !== i))}
                      aria-label={t.checkin.common.remove}
                      className="relative flex h-6 w-6 items-center justify-center rounded-full before:absolute before:-inset-2.5 before:content-['']"
                      style={{ background: 'var(--color-sand)' }}>
                <CloseIcon size={12} color="var(--color-ink-soft)" />
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
        // 🔴 «Da un'altra parte» non salta avanti: sotto la figura compare il
        // campo dove scrivere dov'è, e saltando non lo vedrebbe mai. Era così
        // fin dall'inizio nella segnalazione immediata, e non nei check-in:
        // polso, mandibola e costole non stanno sulla mappa, e la colonna per
        // accoglierle è sempre esistita.
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

  /** I quattro canali: stessa forma, stessa scala, una per schermata. */
  const channel = CHANNELS.find((x) => x.code === flow.id)
  if (channel) {
    return (
      <Step {...frame} section={t.checkin.pre.tuneIn.label}
            question={channelQuestion(channel, locale)}
            onNext={ch[channel.code] ? flow.onward : null}>
        <EmojiScale
          size="lg"
          scale={channel.scale}
          value={ch[channel.code]}
          onChange={(v) => answer(channel.code, () => setCh((p) => ({ ...p, [channel.code]: v })))}
          label={channel.question[locale]}
          low={channel.low[locale]}
          high={channel.high[locale]}
        />
      </Step>
    )
  }

  switch (flow.id) {
    case 'tempo_predicted':
      return (
        <Step {...frame} section={t.checkin.pre.predict.label}
              question={t.checkin.pre.predict.title} help={t.checkin.pre.predict.help}
              onNext={predicted ? flow.onward : null}>
          <PillGroup
            size="lg"
            label={t.checkin.pre.predict.title}
            options={TEMPO_ORDER.map((c) => ({ value: c, label: TEMPOS[c].name, icon: <TempoIcon code={c} size={16} color={`var(--tempo-${c})`} /> }))}
            value={predicted}
            onChange={(v) => answer('tempo_predicted', () => setPredicted(v as TempoCode))}
          />
        </Step>
      )

    case 'prediction_confidence':
      return (
        <Step {...frame} section={t.checkin.pre.predict.label}
              question={t.checkin.pre.predict.confidence}
              onNext={confidence ? flow.onward : null}
              onSkip={() => skip('prediction_confidence')}>
          <PillGroup
            size="lg"
            label={t.checkin.pre.predict.confidence}
            options={t.checkin.pre.predict.confidenceOptions.map((l, i) => ({ value: String(i + 1), label: l }))}
            value={confidence ? String(confidence) : null}
            onChange={(v) => answer('prediction_confidence', () => setConfidence(Number(v)))}
          />
        </Step>
      )

    case 'sleep_hours':
      return (
        <Step {...frame} section={t.checkin.pre.predict.label}
              question={t.checkin.pre.predict.sleepHours}
              onNext={sleepHours ? flow.onward : null}
              onSkip={() => skip('sleep_hours')}>
          <PillGroup
            size="lg"
            label={t.checkin.pre.predict.sleepHours}
            options={t.checkin.pre.predict.sleepHoursOptions.map((l) => ({ value: l, label: l }))}
            value={sleepHours}
            onChange={(v) => answer('sleep_hours', () => setSleepHours(v))}
          />
        </Step>
      )

    case 'mood':
      /**
       * 🔴 L'umore NON è saltabile: è il terzo canale della media, e senza
       * `total()` torna `null` e l'andatura non si può calcolare.
       *
       * La VAS parte senza cursore, non da metà — vedi `VasSlider`.
       */
      return (
        <Step {...frame} section={t.checkin.pre.tuneIn.label}
              question={t.checkin.pre.tuneIn.mood}
              questionIcon={<BrainIcon size={24} color="var(--color-lavender)" />}
              help={t.checkin.pre.tuneIn.moodHelp}
              onNext={mood !== null ? flow.onward : null}>
          <VasSlider
            value={mood}
            onChange={(v) => setMood(v)}
            min={MOOD_RANGE.min} max={MOOD_RANGE.max}
            label={t.checkin.pre.tuneIn.mood}
            low={t.checkin.pre.tuneIn.moodLow}
            high={t.checkin.pre.tuneIn.moodHigh}
          />
        </Step>
      )

    case 'on_period':
      return (
        <Step {...frame} section={t.checkin.pre.tuneIn.label}
              question={t.checkin.pre.tuneIn.period}
              help={t.checkin.pre.tuneIn.periodHelp}
              onNext={onPeriod !== null ? flow.onward : null}
              onSkip={() => skip('on_period')}>
          <PillGroup
            size="lg"
            label={t.checkin.pre.tuneIn.period}
            options={[{ value: 'yes', label: t.common.yes }, { value: 'no', label: t.common.no }]}
            value={onPeriod === null ? null : onPeriod ? 'yes' : 'no'}
            onChange={(v) => answer('on_period', () => setOnPeriod(v === 'yes'))}
          />
        </Step>
      )

    case 'painkillers':
      return (
        <Step {...frame} section={t.checkin.pre.tuneIn.label}
              question={t.checkin.pre.tuneIn.painkillers}
              help={t.checkin.pre.tuneIn.painkillersHelp}
              onNext={painkillers !== null ? flow.onward : null}
              onSkip={() => skip('painkillers')}>
          <PillGroup
            size="lg"
            label={t.checkin.pre.tuneIn.painkillers}
            options={[{ value: 'yes', label: t.common.yes }, { value: 'no', label: t.common.no }]}
            value={painkillers === null ? null : painkillers ? 'yes' : 'no'}
            onChange={(v) => answer('painkillers', () => setPainkillers(v === 'yes'))}
          />
        </Step>
      )

    case 'school_load':
      return (
        <Step {...frame} section={t.checkin.pre.tuneIn.label}
              question={t.checkin.pre.tuneIn.schoolLoad}
              onNext={school ? flow.onward : null}
              onSkip={() => skip('school_load')}>
          <PillGroup
            size="lg"
            label={t.checkin.pre.tuneIn.schoolLoad}
            options={t.checkin.pre.tuneIn.schoolOptions.map((l, i) => ({ value: String(i + 1), label: l }))}
            value={school ? String(school) : null}
            onChange={(v) => answer('school_load', () => setSchool(Number(v)))}
          />
        </Step>
      )

    case 'body':
      return bodyStep()

    case 'pain':
      /**
       * 🔴 Il pezzo educativo sta sulla STESSA schermata della domanda, non su
       * quella prima. §10 dice «si insegna, poi si chiede»: separarli vorrebbe
       * dire insegnare in un posto e chiedere in un altro, e a quel punto la
       * lezione è una schermata da superare invece che il modo di rispondere.
       * Una decisione per schermata, non un elemento per schermata.
       */
      return (
        <Step {...frame} section={t.checkin.pre.decodeLabel}
              question={DECODE_ACHE.question[locale]}
              onNext={pain !== null && read !== null ? () => void submit(pain) : null}
              nextLabel={t.flow.next}>
          <div className="bab-card flex flex-col gap-3 px-4 py-4">
            <p className="bab-label">{DECODE_ACHE.workingTitle[locale]}</p>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-[14px]">
              {DECODE_ACHE.working[locale].map((x, i) => <li key={i}><Rich text={x} /></li>)}
            </ul>
            <p className="bab-label" style={{ color: 'var(--care)' }}>{DECODE_ACHE.protectiveTitle[locale]}</p>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-[14px]">
              {DECODE_ACHE.protective[locale].map((x, i) => <li key={i}><Rich text={x} /></li>)}
            </ul>
            <p className="text-[14px]"><Rich text={DECODE_ACHE.tell[locale]} /></p>
          </div>

          <PillGroup
            size="lg"
            label={DECODE_ACHE.question[locale]}
            tone="care"
            options={[{ value: 'yes', label: t.common.yes }, { value: 'no', label: t.common.no }]}
            value={pain === null ? null : pain ? 'yes' : 'no'}
            onChange={(v) => setPain(v === 'yes')}
          />

          {/* 🔴 Se i canali non sono completi la somma non esiste, e senza somma
              non c'è andatura da suggerire. Si dice dove sta il buco invece di
              lasciare un bottone spento senza spiegazione. */}
          {read === null && (
            <p className="text-[14px] text-[var(--color-ink-soft)]">{t.checkin.common.needChannels}</p>
          )}
        </Step>
      )

    /** `useFlow` non restituisce mai un id fuori da `MAIN`. */
    default:
      return null
  }
}
