import type { Locale } from '@/copy'

/**
 * Lessico delle sensazioni.
 *
 * 🔴 I `code` finiscono nel database (`body_signals.sensation`) e non si
 * cambiano mai.
 *
 * 🔴 `clinical` e `redFlag` derivano dalla tabella §4.3 del documento madre e
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
}

export const SENSATIONS: Sensation[] = [
  // ── Gruppo "va bene" ──────────────────────────────────────────────────────
  { code: 'strong', group: 'good', clinical: 'normal', redFlag: false, emoji: '💪',
    label: { it: 'Forte', en: 'Strong' } },
  { code: 'warm',   group: 'good', clinical: 'normal', redFlag: false, emoji: '🔥',
    label: { it: 'Calda / attiva', en: 'Warm / switched on' } },
  { code: 'light',  group: 'good', clinical: 'normal', redFlag: false, emoji: '🪶',
    label: { it: 'Leggera', en: 'Light' } },
  { code: 'fine',   group: 'good', clinical: 'normal', redFlag: false, emoji: '✨',
    label: { it: 'Tutto ok', en: 'All fine' } },

  // ── Gruppo "da notare" ────────────────────────────────────────────────────
  { code: 'tight',   group: 'notice', clinical: 'tension',     redFlag: false,
    label: { it: 'Tesa / rigida', en: 'Tight / stiff' } },
  { code: 'sore',    group: 'notice', clinical: 'doms',        redFlag: false,
    label: { it: 'Dolorante', en: 'Sore / achy' } },
  { code: 'burning', group: 'notice', clinical: 'nociceptive', redFlag: false,
    label: { it: 'Che brucia', en: 'Burning' } },
  { code: 'heavy',   group: 'notice', clinical: 'fatigue',     redFlag: false,
    label: { it: 'Pesante / stanca', en: 'Heavy / tired' } },
  { code: 'tender',  group: 'notice', clinical: 'doms',        redFlag: false,
    label: { it: 'Sensibile al tocco', en: 'Tender' } },
  { code: 'tingly',  group: 'notice', clinical: 'neural',      redFlag: false,
    label: { it: 'Formicolio / intorpidita', en: 'Buzzy / tingly / numb' } },
  { code: 'crampy',  group: 'notice', clinical: 'cramp',       redFlag: false,
    label: { it: 'Crampi', en: 'Crampy' } },
  { code: 'sharp',   group: 'notice', clinical: 'nociceptive', redFlag: false,
    label: { it: 'Fitta / acuta', en: 'Sharp' } },

  // ── Gruppo "da far vedere" ── 🚩 instradano al Care da sole ───────────────
  { code: 'gives_way', group: 'flag', clinical: 'instability',  redFlag: true,
    label: { it: 'Cede / instabile', en: 'Gives way / unstable' } },
  { code: 'swollen',   group: 'flag', clinical: 'inflammation', redFlag: true,
    label: { it: 'Gonfia / calda al tatto', en: 'Swollen / hot' } },
]

/** Le tre intensità. Tre livelli e non 1–5: più veloce e più onesto a 13 anni. */
export const INTENSITIES = [
  { value: 1, label: { it: 'Un po\'',     en: 'A little' } },
  { value: 2, label: { it: 'Abbastanza',  en: 'Quite a bit' } },
  { value: 3, label: { it: 'Parecchio',   en: 'A lot' } },
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
