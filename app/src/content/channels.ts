import type { Locale } from '@/copy'

/**
 * I canali del check-in, e le scale che li misurano.
 *
 * 🔴 I `code` sono nomi di COLONNE (`check_ins.sleep`, `.energy`, …) e i codici
 * di Headspace finiscono in `check_ins.headspace text[]`. Non si cambiano mai.
 *
 * Le emoji non sono decorazione: il §7 chiede scale che una tredicenne legga
 * senza pensarci, e una fila di numeri da 1 a 5 non lo è. Ogni canale ha la sua
 * famiglia di immagini — animali per il sonno, meteo per l'energia, paesaggi
 * per l'idratazione, natura per i muscoli — così la scala si capisce prima di
 * leggere le etichette agli estremi.
 */

export type ChannelCode = 'sleep' | 'energy' | 'hydration' | 'muscles'

export type Channel = {
  code: ChannelCode
  emoji: string
  /** Indice 0-based; il valore reale è `indice + offset` (default 1, vedi `EmojiScale`). */
  scale: string[]
  question: Record<Locale, string>
  low: Record<Locale, string>
  high: Record<Locale, string>
}

export const CHANNELS: Channel[] = [
  {
    // 🔴 Sonno ed energia sono a 7 punti, non 5: la spec originale della
    // founder li misura con lo Hooper Questionnaire, che usa una scala 1-7.
    // Restano emoji, non numeri (§7), ma il RANGE combacia con lo strumento
    // citato — vedi anche `lib/tempo.ts` per come cambia la somma dei canali.
    code: 'sleep', emoji: '😴',
    scale: ['🦥', '🐢', '🐨', '🐿️', '🐰', '🦌', '🦁'],
    question: { it: 'Sonno — quanto sei riposata da stanotte', en: 'Sleep — how rested you are from last night' },
    low: { it: 'Ho dormito pochissimo', en: 'Barely slept' },
    high: { it: 'Profondo e riposata', en: 'Deep & rested' },
  },
  {
    code: 'energy', emoji: '🔋',
    scale: ['🌧️', '🌦️', '⛅', '🌤️', '☀️', '🌞', '🔥'],
    question: { it: 'Energia — la voglia di partire, adesso', en: 'Energy — your get-up-and-go right now' },
    low: { it: 'A secco', en: 'Running on empty' },
    high: { it: 'Piena di voglia', en: 'Full of go' },
  },
  {
    code: 'hydration', emoji: '💧',
    scale: ['🏜️', '🌵', '🌾', '🌿', '🌊'],
    question: { it: 'Idratazione — quanto ti senti dissetata', en: 'Hydration — how watered you feel' },
    low: { it: 'Assetata, secca', en: 'Parched / dry' },
    high: { it: 'Ben idratata', en: 'Fully watered' },
  },
  {
    code: 'muscles', emoji: '💪',
    scale: ['🪨', '🪵', '🍂', '🪶', '🦋'],
    question: { it: 'Muscoli e corpo — pesantezza contro elasticità', en: 'Muscles & body — heaviness vs spring' },
    low: { it: 'Pesante, dolorante', en: 'Heavy / sore' },
    high: { it: 'Leggera ed elastica', en: 'Light & springy' },
  },
]

/**
 * Headspace è multi-select di proposito (§7): non si chiede a una ragazza di
 * dare un VOTO al proprio umore, le si chiede di NOMINARLO. Il valore numerico
 * si deriva dopo, e lei non lo vede mai.
 */
export type Headspace = {
  code: string
  emoji: string
  polarity: 'positive' | 'negative'
  label: Record<Locale, string>
}

export const HEADSPACE: Headspace[] = [
  { code: 'distracted',  emoji: '🌀',    polarity: 'negative', label: { it: 'Distratta',      en: 'Distracted' } },
  { code: 'insecure',    emoji: '🫣',    polarity: 'negative', label: { it: 'Insicura',       en: 'Insecure' } },
  { code: 'stressed',    emoji: '😣',    polarity: 'negative', label: { it: 'Stressata',      en: 'Stressed' } },
  { code: 'overwhelmed', emoji: '😵‍💫', polarity: 'negative', label: { it: 'Sopraffatta',    en: 'Overwhelmed' } },
  { code: 'calm',        emoji: '😌',    polarity: 'positive', label: { it: 'Calma',          en: 'Calm' } },
  { code: 'focused',     emoji: '🎯',    polarity: 'positive', label: { it: 'Concentrata',    en: 'Focused' } },
  { code: 'confident',   emoji: '😎',    polarity: 'positive', label: { it: 'Sicura di me',   en: 'Confident' } },
]

/** Il `code` non c'entra col titolo, quindi non lo si pretende: così vale anche
 *  per i canali del post, che hanno codici loro. */
export function channelQuestion(c: Omit<Channel, 'code'>, locale: Locale): string {
  return `${c.emoji} ${c.question[locale]}`
}

/**
 * I canali del check-in POST. Sono altri: dopo l'allenamento non si chiede più
 * "quanto hai dormito", si chiede cosa è rimasto addosso.
 *
 * 🔴 `effort` è la session-RPE, ed è l'unico dato del prodotto che ha una
 * letteratura solida dietro (Temm). Ha una scala tutta sua perché non misura
 * uno stato ma una fatica: le altre vanno dal peggio al meglio, questa dal
 * facile al massimale.
 *
 * 🔴 11 punti, 0–10: è la scala RPE standard (CR-10 di Foster), non la 1–5
 * delle altre letture — la spec originale la chiede esplicitamente. `offset:
 * 0` va passato a `EmojiScale` quando si usa questo canale, altrimenti
 * l'indice 0 dell'array diventerebbe valore 1 invece di 0.
 */
export type PostChannelCode = 'legs' | 'breath' | 'energy'

export const EFFORT: Channel = {
  code: 'energy', emoji: '🔥',   // `code` non usato: l'effort ha una colonna sua
  scale: ['😌', '🙂', '😊', '🙃', '😅', '😓', '😰', '🥵', '😖', '🥴', '🤯'],
  question: { it: 'Quanto è stata dura davvero?', en: 'How hard did it actually feel?' },
  low: { it: 'Niente di niente', en: 'Nothing at all' },
  high: { it: 'Il massimo che avevo', en: 'Everything I had' },
}

export const POST_CHANNELS: (Omit<Channel, 'code'> & { code: PostChannelCode })[] = [
  {
    code: 'legs', emoji: '💪',
    scale: ['🪨', '🪵', '🍂', '🪶', '🦋'],
    question: { it: 'Gambe e muscoli', en: 'Legs & muscles' },
    low: { it: 'Distrutte, pesanti', en: 'Trashed / heavy' },
    high: { it: 'Leggere e a posto', en: 'Light & fine' },
  },
  {
    code: 'breath', emoji: '🫁',
    scale: ['🌩️', '🌧️', '🌥️', '🌤️', '☀️'],
    question: { it: 'Respiro e cuore', en: 'Breathing & heart' },
    low: { it: 'Ancora a mille', en: 'Still pounding' },
    high: { it: 'Calmi', en: 'Settled & calm' },
  },
  {
    code: 'energy', emoji: '🔋',
    scale: ['🪫', '🔅', '🔆', '✨', '⚡'],
    question: { it: 'Energia adesso', en: 'Energy right now' },
    low: { it: 'A terra', en: 'Drained' },
    high: { it: 'Ancora carica', en: 'Still buzzing' },
  },
]

/**
 * "Cosa ti sei portata a casa?" — recuperata dal PDF originale della founder.
 *
 * È la domanda migliore del materiale: sposta il metro da com'è andata la
 * prestazione a cosa ha imparato, e non c'è modo di rispondere male.
 */
export const BROUGHT_HOME = [
  { code: 'learned',  emoji: '💡', label: { it: 'Ho imparato qualcosa di nuovo', en: 'Learned something new' } },
  { code: 'listened', emoji: '👂', label: { it: 'Ho ascoltato il mio corpo',     en: 'Listened to my body' } },
  { code: 'helped',   emoji: '🤝', label: { it: 'Ho aiutato una compagna',        en: 'Helped a teammate' } },
  { code: 'kind',     emoji: '💛', label: { it: 'Sono stata gentile con me',      en: 'Was kind to myself' } },
  { code: 'nailed',   emoji: '✅', label: { it: 'Ho eseguito bene un esercizio',  en: 'Nailed an exercise' } },
]
