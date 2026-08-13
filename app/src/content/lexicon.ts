import type { Locale } from '@/copy'

/**
 * Lessico delle sensazioni.
 *
 * 🔴 I `code` finiscono nel database (`body_signals.sensation`) e non si
 * cambiano mai.
 *
 * 🔴 `clinical` e `redFlag` derivano dalla tabella §4.3 del documento sorgente e
 * DEVONO ESSERE FIRMATI DA UN MEDICO DELLO SPORT prima dell'uso con minori.
 * L'atleta non vede mai la categoria clinica: lei descrive, l'app non diagnostica.
 *
 * I tre gruppi non sono decorazione. Il §4.3 chiede esplicitamente "opzioni
 * neutre e positive incluse, per costruire literacy ed evitare l'ipervigilanza":
 * un lessico fatto solo di parole negative insegna che il corpo è un posto da
 * cui arrivano solo problemi.
 */
export type SensationGroup = 'good' | 'notice' | 'flag'

export type ClinicalCategory =
  | 'normal'          // niente da fare, rinforza i buoni segnali
  | 'doms'            // tipo DOMS, di solito adattivo
  | 'tension'         // tensione muscolare/fasciale
  | 'fatigue'         // stanchezza
  | 'nociceptive'     // nocicettivo acuto — cautela
  | 'neural'          // possibile neurale — cautela
  | 'cramp'           // crampo
  | 'instability'     // 🚩 instabilità articolare
  | 'inflammation'    // 🚩 infiammazione

export type Sensation = {
  code: string
  group: SensationGroup
  clinical: ClinicalCategory
  /** Se true, apre il Care mode DA SOLA: la classificazione non è compito suo. */
  redFlag: boolean
  emoji?: string
  label: Record<Locale, string>
  /**
   * 🔴 Spiega la PAROLA, non la diagnosi: com'è sentirla, mai cosa significa
   * dal punto di vista clinico. Quella riga resta `clinical`/`redFlag`, e
   * quella sì deve passare da un medico dello sport — questa è solo
   * lessico, la stessa cosa che farebbe un dizionario.
   */
  hint: Record<Locale, string>
}

export const SENSATIONS: Sensation[] = [
  // ── Gruppo "va bene" ──────────────────────────────────────────────────────
  { code: 'strong', group: 'good', clinical: 'normal', redFlag: false, emoji: '💪',
    label: { it: 'Forte', en: 'Strong' },
    hint: { it: 'Risponde bene, ha potenza', en: 'Responds well, has power' } },
  { code: 'warm',   group: 'good', clinical: 'normal', redFlag: false, emoji: '🔥',
    label: { it: 'Calda / attiva', en: 'Warm / switched on' },
    hint: { it: 'Sveglia, pronta a muoversi', en: 'Switched on, ready to move' } },
  { code: 'light',  group: 'good', clinical: 'normal', redFlag: false, emoji: '🪶',
    label: { it: 'Leggera', en: 'Light' },
    hint: { it: 'Senza peso, si muove facile', en: 'No weight to it, moves easily' } },
  { code: 'fine',   group: 'good', clinical: 'normal', redFlag: false, emoji: '✨',
    label: { it: 'Tutto ok', en: 'All fine' },
    hint: { it: 'Non senti niente di particolare', en: "Nothing in particular to notice" } },

  // ── Gruppo "da notare" ────────────────────────────────────────────────────
  { code: 'tight',   group: 'notice', clinical: 'tension',     redFlag: false,
    label: { it: 'Tesa / rigida', en: 'Tight / stiff' },
    hint: { it: 'Fatica a muoversi del tutto, come tirata', en: 'Hard to move all the way, like it\'s pulled' } },
  { code: 'sore',    group: 'notice', clinical: 'doms',        redFlag: false,
    label: { it: 'Dolorante', en: 'Sore / achy' },
    hint: { it: 'Indolenzita, tipo il giorno dopo un allenamento duro', en: 'Achy, like the day after a hard session' } },
  { code: 'burning', group: 'notice', clinical: 'nociceptive', redFlag: false,
    label: { it: 'Che brucia', en: 'Burning' },
    hint: { it: 'Calda e pungente, come quando un muscolo lavora sodo', en: 'Hot and stinging, like a muscle working hard' } },
  { code: 'heavy',   group: 'notice', clinical: 'fatigue',     redFlag: false,
    label: { it: 'Pesante / stanca', en: 'Heavy / tired' },
    hint: { it: 'Costa fatica anche muoverla un po\'', en: 'Takes effort to move even a little' } },
  { code: 'tender',  group: 'notice', clinical: 'doms',        redFlag: false,
    label: { it: 'Sensibile al tocco', en: 'Tender' },
    hint: { it: 'Fa male solo se la premi o tocchi', en: 'Only hurts if you press or touch it' } },
  { code: 'tingly',  group: 'notice', clinical: 'neural',      redFlag: false,
    label: { it: 'Formicolio / intorpidita', en: 'Buzzy / tingly / numb' },
    hint: { it: 'Come spilli e aghi, o senti poco', en: 'Like pins and needles, or hard to feel' } },
  { code: 'crampy',  group: 'notice', clinical: 'cramp',       redFlag: false,
    label: { it: 'Crampi', en: 'Crampy' },
    hint: { it: 'Il muscolo si stringe da solo, all\'improvviso', en: 'The muscle suddenly locks up on its own' } },
  { code: 'sharp',   group: 'notice', clinical: 'nociceptive', redFlag: false,
    label: { it: 'Fitta / acuta', en: 'Sharp' },
    hint: { it: 'Un dolore breve e netto, come una puntura', en: 'A short, sharp jab, like a poke' } },

  // ── Gruppo "da far vedere" ── 🚩 instradano al Care da sole ───────────────
  { code: 'gives_way', group: 'flag', clinical: 'instability',  redFlag: true,
    label: { it: 'Cede / instabile', en: 'Gives way / unstable' },
    hint: { it: 'Come se non reggesse il tuo peso', en: "Like it won't hold your weight" } },
  { code: 'swollen',   group: 'flag', clinical: 'inflammation', redFlag: true,
    label: { it: 'Gonfia / calda al tatto', en: 'Swollen / hot' },
    hint: { it: 'Più grossa del solito, o calda se la tocchi', en: 'Bigger than usual, or warm to the touch' } },
]

/** Scala a 5, su richiesta esplicita — più fine dei tre livelli originari. */
export const INTENSITIES = [
  { value: 1, label: { it: 'Un po\'',        en: 'A little' } },
  { value: 2, label: { it: 'Un po\' di più', en: 'A bit more' } },
  { value: 3, label: { it: 'Abbastanza',     en: 'Quite a bit' } },
  { value: 4, label: { it: 'Parecchio',      en: 'A lot' } },
  { value: 5, label: { it: 'Tantissimo',     en: 'A whole lot' } },
] as const

/**
 * 🔴 Il tag di comportamento è IL DISCRIMINANTE CLINICO fra dolore adattivo e
 * protettivo (§4.3). Chiederlo come descrizione concreta — "cosa fa?" — sposta
 * il lavoro di classificazione dall'atleta al sistema, che è dove deve stare.
 */
export const BEHAVIOURS = [
  { code: 'eases',      label: { it: 'Migliora quando mi scaldo', en: 'Eases as I warm up' } },
  { code: 'worse_load', label: { it: 'Peggiora sotto carico',     en: 'Worse under load' } },
  { code: 'at_rest',    label: { it: 'C\'è anche da ferma',       en: 'There even at rest' } },
] as const

export const GROUP_LABEL: Record<SensationGroup, Record<Locale, string>> = {
  good:   { it: 'Va bene',            en: 'Feels good' },
  notice: { it: 'Da notare',          en: 'Worth noticing' },
  flag:   { it: 'Da far vedere',      en: 'Worth showing someone' },
}

export function sensationsIn(group: SensationGroup): Sensation[] {
  return SENSATIONS.filter((s) => s.group === group)
}

export function isRedFlag(code: string): boolean {
  return SENSATIONS.find((s) => s.code === code)?.redFlag ?? false
}
