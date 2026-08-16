import { MOOD_RANGE } from '@/content/channels'
import type { TempoCode } from '@/content/tempo'

/**
 * La formula dell'andatura.
 *
 * 🔴 STA IN UN FILE DA SOLA APPOSTA. Le soglie 20 e 13 vengono dai prototipi e
 * **non sono validate** (§8: non far guidare una decisione da una soglia prima
 * di averla validata). Quando arriveranno i dati del pilota si cambia qui, e in
 * nessun altro posto — e nel frattempo si può personalizzare per atleta senza
 * toccare una sola schermata.
 *
 * Per lo stesso motivo il risultato non viene mai salvato da solo: nel database
 * ci sono SEMPRE due colonne, `tempo_suggested` e `tempo_chosen`. La differenza
 * fra le due è l'atleta che corregge il modello, ed è il dato più prezioso del
 * pilota.
 */

/**
 * 🔴 TUTTO QUI DENTRO LAVORA SU 0–1, MAI SUI VALORI GREZZI.
 *
 * I canali non sono più sulla stessa scala — sonno ed energia vanno 1–7
 * (Hooper), l'umore 0–100 (VAS) — e sommarli così com'erano darebbe più peso
 * a quello con il range più largo senza che nessuno l'abbia deciso. Peggio:
 * cambiare una scala domani sposterebbe le soglie di nascosto, che è
 * esattamente il modo in cui questa formula si è già rotta una volta.
 *
 * Normalizzando, le soglie diventano posizioni sul range — «tre quarti», «due
 * quinti» — e restano vere qualunque scala abbia sotto.
 */

/** Da una scala [min,max] a 0–1. Fuori range viene tagliato, non esplode. */
export const norm = (v: number, min: number, max: number): number =>
  Math.max(0, Math.min(1, (v - min) / (max - min)))

/** Le scale grezze, in un posto solo: chi normalizza le legge da qui. */
export const RANGES = {
  channel: { min: 1, max: 7 },   // sonno, energia — Hooper
  mood: MOOD_RANGE,              // VAS
  effort: { min: 0, max: 10 },   // session-RPE, CR-10
} as const

/**
 * Le soglie, in un posto solo — adesso come frazioni del range, non come
 * somme. 0.75 e 0.40 sono le stesse posizioni relative delle vecchie 20 e 13
 * sulla somma 5–25 dei prototipi: **non sono validate** (§8: non far guidare
 * una decisione da una soglia prima di averla validata). Quando arriveranno i
 * dati del pilota si cambiano qui, e in nessun altro posto.
 */
export const THRESHOLDS = { upbeat: 0.75, steady: 0.40 } as const

export type Channels = {
  sleep: number | null
  energy: number | null
}

/** Vero solo quando ci sono tutti e tre: mancarne uno cambierebbe la media. */
export function isComplete(c: Channels, mood: number | null): boolean {
  return [c.sleep, c.energy, mood].every((v) => v !== null)
}

/**
 * La lettura del mattino, da 0 a 1: la media dei tre canali normalizzati.
 * Media e non somma, così aggiungerne o toglierne uno non sposta le soglie.
 */
export function total(c: Channels, mood: number | null): number | null {
  if (!isComplete(c, mood)) return null
  const parts = [
    norm(c.sleep!, RANGES.channel.min, RANGES.channel.max),
    norm(c.energy!, RANGES.channel.min, RANGES.channel.max),
    norm(mood!, RANGES.mood.min, RANGES.mood.max),
  ]
  return parts.reduce((a, b) => a + b, 0) / parts.length
}

/** `read` è 0–1, l'uscita di `total`. */
export function suggest(read: number): TempoCode {
  if (read >= THRESHOLDS.upbeat) return 'upbeat'
  if (read >= THRESHOLDS.steady) return 'steady'
  return 'gentle'
}

/**
 * 🔴 Il dolore protettivo e le bandiere rosse SCAVALCANO la somma.
 *
 * §10: una lettura verde non sovrascrive mai un report di dolore. Se lo facesse,
 * l'app direbbe a una ragazza che ha male di allenarsi forte — che è il singolo
 * modo peggiore in cui questo prodotto può sbagliare.
 */
export function suggestWithPain(read: number, protectivePain: boolean): TempoCode {
  return protectivePain ? 'gentle' : suggest(read)
}

/**
 * ── Il prediction error ───────────────────────────────────────────────────
 *
 * 🔴 È LA METRICA DEL PRODOTTO. Non la forma fisica, non il recupero, non
 * l'aderenza: quanto bene lei si legge, e se quello scarto si accorcia.
 *
 * Le tre andature hanno un ordine (Gentle < Steady < Upbeat), quindi lo scarto
 * è una distanza fra 0 e 2. Grezza di proposito: con tre livelli non c'è niente
 * di più fine da misurare, e fingere precisione sarebbe peggio che non averla.
 */
export const TEMPO_RANK: Record<TempoCode, number> = { gentle: 1, steady: 2, upbeat: 3 }

export function predictionError(predicted: TempoCode, actual: TempoCode): number {
  return Math.abs(TEMPO_RANK[predicted] - TEMPO_RANK[actual])
}

/**
 * Quanto è recuperata adesso, da 0 a 1.
 *
 * Era la media di gambe, respiro, energia e headspace. Adesso il Tune In del
 * post è una domanda sola — l'energia — quindi questa è la sua normalizzata e
 * niente altro. Resta una funzione invece di un calcolo sparso nella
 * schermata: se un giorno tornasse più di un canale, si aggiunge qui.
 */
export function recovery(energy: number | null): number | null {
  if (energy === null) return null
  return norm(energy, RANGES.channel.min, RANGES.channel.max)
}
