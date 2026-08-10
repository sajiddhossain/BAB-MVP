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
  /** Indice 0–4 = valore 1–5. */
  scale: string[]
  question: Record<Locale, string>
  low: Record<Locale, string>
  high: Record<Locale, string>
}

export const CHANNELS: Channel[] = [
  {
    code: 'sleep', emoji: '😴',
    scale: ['🦥', '🐢', '🐨', '🐰', '🦁'],
    question: { it: 'Sonno — quanto sei riposata da stanotte', en: 'Sleep — how rested you are from last night' },
    low: { it: 'Ho dormito pochissimo', en: 'Barely slept' },
    high: { it: 'Profondo e riposata', en: 'Deep & rested' },
  },
  {
    code: 'energy', emoji: '🔋',
    scale: ['🌧️', '⛅', '🌤️', '☀️', '🔥'],
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

export function channelQuestion(c: Channel, locale: Locale): string {
  return `${c.emoji} ${c.question[locale]}`
}
