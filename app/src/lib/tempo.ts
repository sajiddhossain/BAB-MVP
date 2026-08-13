import { HEADSPACE } from '@/content/channels'
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
 * Le soglie, in un posto solo. Somma dei 5 canali — ma non più tutti sulla
 * stessa scala: sonno ed energia vanno 1–7 (Hooper), idratazione/muscoli/
 * headspace restano 1–5. La somma resta da 5 (minimo di ognuno) a 29 (non più
 * 25). 20 e 13 erano già soglie non validate sulla vecchia somma 5–25; 23 e 15
 * sono le stesse posizioni relative (75% e 40% del range) sulla nuova — non
 * più validate di prima, solo riscalate perché il range è cambiato sotto.
 */
export const THRESHOLDS = { upbeat: 23, steady: 15 } as const

/**
 * Headspace è multi-select, ma la somma vuole un numero. Positivi meno
 * negativi, intorno a 3, tagliato a [1,5].
 *
 * `null` quando non ha risposto: senza questo un silenzio varrebbe 3, cioè
 * "nella media" — un'affermazione che lei non ha fatto.
 */
export function headspaceValue(selected: string[], other = ''): number | null {
  if (selected.length === 0) return other.trim() ? 3 : null
  const pos = selected.filter((c) => HEADSPACE.find((h) => h.code === c)?.polarity === 'positive').length
  const neg = selected.filter((c) => HEADSPACE.find((h) => h.code === c)?.polarity === 'negative').length
  return Math.max(1, Math.min(5, 3 + pos - neg))
}

export type Channels = {
  sleep: number | null
  energy: number | null
  hydration: number | null
  muscles: number | null
}

/** Vero solo quando ci sono tutti e cinque: mancarne uno cambierebbe la somma. */
export function isComplete(c: Channels, headspace: number | null): boolean {
  return [c.sleep, c.energy, c.hydration, c.muscles, headspace].every((v) => v !== null)
}

export function total(c: Channels, headspace: number | null): number | null {
  if (!isComplete(c, headspace)) return null
  return c.sleep! + c.energy! + c.hydration! + c.muscles! + headspace!
}

export function suggest(sum: number): TempoCode {
  if (sum >= THRESHOLDS.upbeat) return 'upbeat'
  if (sum >= THRESHOLDS.steady) return 'steady'
  return 'gentle'
}

/**
 * 🔴 Il dolore protettivo e le bandiere rosse SCAVALCANO la somma.
 *
 * §10: una lettura verde non sovrascrive mai un report di dolore. Se lo facesse,
 * l'app direbbe a una ragazza che ha male di allenarsi forte — che è il singolo
 * modo peggiore in cui questo prodotto può sbagliare.
 */
export function suggestWithPain(sum: number, protectivePain: boolean): TempoCode {
  return protectivePain ? 'gentle' : suggest(sum)
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
 * Quanto è recuperata adesso: gambe, respiro, energia più l'Headspace.
 * L'Headspace entra nella media perché dopo l'allenamento la testa fa parte
 * dello stato del corpo quanto le gambe.
 */
export function bodyAverage(
  legs: number | null, breath: number | null, energy: number | null, headspace: number | null,
): number | null {
  const v = [legs, breath, energy, headspace]
  if (v.some((x) => x === null)) return null
  return (v as number[]).reduce((a, b) => a + b, 0) / 4
}
