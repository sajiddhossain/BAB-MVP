import type { Locale } from '@/copy'
import type { IconKey } from '@/components/icons'

/**
 * I canali del check-in, e le scale che li misurano.
 *
 * 🔴 I `code` sono nomi di COLONNE (`check_ins.sleep`, `.energy`). Non si
 * cambiano mai.
 *
 * Le emoji non sono decorazione: il §7 chiede scale che una tredicenne legga
 * senza pensarci, e una fila di numeri non lo è. Ogni canale ha la sua famiglia
 * di immagini — animali per il sonno, meteo per l'energia — così la scala si
 * capisce prima di leggere le etichette agli estremi.
 *
 * 🔴 QUESTA LISTA È CORTA APPOSTA. Erano quattro (più idratazione e muscoli):
 * la spec della founder ne chiede due, e i muscoli in particolare li cattura
 * già la mappa corporea, che chiede DOVE e con che parola invece di un voto
 * medio su tutto il corpo. Ogni domanda tolta è un check-in che finisce.
 */

export type ChannelCode = 'sleep' | 'energy'

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
]

/**
 * L'umore, su scala VAS — «visual analogue scale»: una riga continua fra due
 * estremi, senza tacche e senza numeri, dove si segna un punto.
 *
 * 🔴 Prima era un multi-select di parole ("Stressata", "Concentrata"…), scelto
 * per non chiedere a una ragazza di dare un VOTO al proprio umore. La spec
 * della founder chiede una VAS, che è lo strumento con cui l'umore si misura
 * in letteratura, e la sostituzione è deliberata. Il §7 resta rispettato dove
 * conta: la riga non ha numeri, non ha tacche e non mostra mai un punteggio —
 * lei sposta un cursore fra "il peggio" e "il meglio", e il valore 0–100
 * esiste solo nel database.
 */
export const MOOD_RANGE = { min: 0, max: 100 } as const

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
export type PostChannelCode = 'energy'

export const EFFORT: Channel = {
  code: 'energy', emoji: '🔥',   // `code` non usato: l'effort ha una colonna sua
  scale: ['😌', '🙂', '😊', '🙃', '😅', '😓', '😰', '🥵', '😖', '🥴', '🤯'],
  question: { it: 'Quanto è stata dura davvero?', en: 'How hard did it actually feel?' },
  low: { it: 'Niente di niente', en: 'Nothing at all' },
  high: { it: 'Il massimo che avevo', en: 'Everything I had' },
}

/**
 * 🔴 Il Tune In del post è UNA domanda sola: l'energia, sulla stessa 1–7 di
 * Hooper del mattino — è la spec, e serve che sia la stessa scala perché
 * mattina e sera vanno confrontate. "Gambe e muscoli" e "Respiro e cuore"
 * erano qui e sono stati tolti: quello che dice il corpo lo chiede la mappa,
 * che localizza e nomina invece di chiedere una media.
 */
export const POST_CHANNELS: (Omit<Channel, 'code'> & { code: PostChannelCode })[] = [
  {
    code: 'energy', emoji: '🔋',
    scale: ['🪫', '🔅', '🔆', '💡', '✨', '🌟', '⚡'],
    question: { it: 'Energia adesso', en: 'Energy right now' },
    low: { it: 'A terra', en: 'Drained' },
    high: { it: 'Ancora carica', en: 'Still buzzing' },
  },
]

/**
 * "Quanto ti senti soddisfatta?" — dalla spec della founder, Step 1 del post.
 *
 * 🔴 Cinque parole, non una scala: sono stati d'animo, e nessuno è un voto
 * sulla prestazione. "Delusa" non è il fondo di una classifica che ha "Fiera"
 * in cima — sono cinque modi legittimi di uscire da un allenamento. L'ordine
 * è quello della spec, e il `code` è quello che finisce nel database.
 */
/**
 * 🔴 Icone astratte, non volti — coerente col resto dell'app (vedi
 * `ContentIcon`/`ZigzagIcon`): non impersonano l'emozione che è lei a
 * nominare, la illustrano da fuori (nuvola, scudo, stella...).
 */
export const SATISFACTION: { code: string; icon: IconKey; label: Record<Locale, string> }[] = [
  { code: 'disappointed', icon: 'cloud-rain', label: { it: 'Delusa',       en: 'Disappointed' } },
  { code: 'frustrated',   icon: 'zigzag',     label: { it: 'Frustrata',    en: 'Frustrated' } },
  { code: 'satisfied',    icon: 'check',      label: { it: 'Soddisfatta',  en: 'Satisfied' } },
  { code: 'confident',    icon: 'shield',     label: { it: 'Sicura di me', en: 'Confident' } },
  { code: 'proud',        icon: 'star',       label: { it: 'Fiera',        en: 'Proud' } },
]

/**
 * "Cosa ti sei portata a casa?" — recuperata dal PDF originale della founder.
 *
 * È la domanda migliore del materiale: sposta il metro da com'è andata la
 * prestazione a cosa ha imparato, e non c'è modo di rispondere male.
 */
export const BROUGHT_HOME: { code: string; icon: IconKey; label: Record<Locale, string> }[] = [
  { code: 'learned',  icon: 'bulb',      label: { it: 'Ho imparato qualcosa di nuovo', en: 'Learned something new' } },
  { code: 'listened', icon: 'ear',       label: { it: 'Ho ascoltato il mio corpo',     en: 'Listened to my body' } },
  { code: 'helped',   icon: 'handshake', label: { it: 'Ho aiutato una compagna',        en: 'Helped a teammate' } },
  { code: 'kind',     icon: 'heart',     label: { it: 'Sono stata gentile con me',      en: 'Was kind to myself' } },
  { code: 'nailed',   icon: 'check',     label: { it: 'Ho eseguito bene un esercizio',  en: 'Nailed an exercise' } },
]
