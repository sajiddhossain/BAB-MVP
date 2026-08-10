import { predictionError } from './tempo'
import { localDate } from './repo'
import type { TempoCode } from '@/content/tempo'

/**
 * I calcoli della vista "Me". Stanno qui e non nella schermata perché sono
 * l'unica parte del prodotto che si può sbagliare in silenzio: un grafico
 * disegna sempre qualcosa, anche quando la matematica sotto è sbagliata.
 *
 * 🔴 Nessuna soglia qui dentro è validata (§8). Servono a decidere COSA
 * mostrare, mai a dire all'atleta come sta.
 */

export type Row = Record<string, unknown>

/** Cosa ha fatto in un giorno. `pre` senza `post` è un cerchio non chiuso. */
export type DayState = 'none' | 'pre' | 'both'

/** Le ultime `n` date dell'atleta, dalla più vecchia alla più recente. */
export function lastDays(n: number, today = localDate()): string[] {
  const end = new Date(today + 'T12:00:00')
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(d.getDate() - i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

/**
 * 🔴 R7: la vista deve mostrare ANCHE le assenze. "Quando non l'ho fatto" è
 * informazione, e nasconderla la renderebbe più gentile ma meno vera.
 */
export function dayStates(rows: Row[], days: string[]): Record<string, DayState> {
  const out: Record<string, DayState> = {}
  for (const day of days) {
    const ofDay = rows.filter((r) => r.local_date === day)
    const pre = ofDay.some((r) => r.kind === 'pre')
    const post = ofDay.some((r) => r.kind === 'post')
    out[day] = pre && post ? 'both' : pre || post ? 'pre' : 'none'
  }
  return out
}

/**
 * Lo scarto fra quello che aveva previsto la mattina e l'andatura in cui si è
 * allenata davvero. È LA metrica del prodotto.
 *
 * Solo i giorni con entrambi i check-in: senza il post non c'è niente da
 * confrontare, e riempire il buco con una stima sarebbe inventare.
 */
export function errorSeries(rows: Row[]): { date: string; error: number }[] {
  const byDay = new Map<string, { predicted?: TempoCode; actual?: TempoCode }>()
  for (const r of rows) {
    const day = String(r.local_date ?? '')
    if (!day) continue
    const e = byDay.get(day) ?? {}
    // Il più recente vince: gli eventi non si modificano, si aggiungono, e
    // `rows` arriva ordinato dal più nuovo.
    if (r.kind === 'pre' && !e.predicted && r.tempo_predicted) e.predicted = r.tempo_predicted as TempoCode
    if (r.kind === 'post' && !e.actual && r.tempo_chosen) e.actual = r.tempo_chosen as TempoCode
    byDay.set(day, e)
  }
  return [...byDay.entries()]
    .filter(([, e]) => e.predicted && e.actual)
    .map(([date, e]) => ({ date, error: predictionError(e.predicted!, e.actual!) }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export type Trend = 'tooEarly' | 'down' | 'flat' | 'up'

/**
 * Confronta la prima metà con la seconda. Grezzo di proposito: con pochi punti
 * e uno scarto che vale 0, 1 o 2 una regressione darebbe una precisione che i
 * dati non hanno.
 *
 * Sotto i sei giorni non si dice niente. Una "tendenza" su tre punti è rumore,
 * e dirle che sta migliorando quando non si sa è il modo più veloce di far
 * perdere fiducia allo strumento.
 */
export function trend(series: { error: number }[]): Trend {
  if (series.length < 6) return 'tooEarly'
  const half = Math.floor(series.length / 2)
  const mean = (xs: { error: number }[]) => xs.reduce((a, b) => a + b.error, 0) / xs.length
  const delta = mean(series.slice(half)) - mean(series.slice(0, half))
  if (delta <= -0.25) return 'down'
  if (delta >= 0.25) return 'up'
  return 'flat'
}

/** Quante volte ha chiuso il cerchio: è il conteggio che sblocca i pattern. */
export function closedLoops(rows: Row[]): number {
  return errorSeries(rows).length
}

/**
 * La spezzata dello scarto, pronta per un `<polyline>`.
 *
 * 🔴 Nessun numero sugli assi (§7): si mostra la FORMA, non un voto. E la
 * linea SCENDE quando lo scarto si accorcia — verso il basso è la direzione
 * che tutti leggono come "sta migliorando", ed è l'unica lettura che vogliamo.
 */
const MAX_ERROR = 2   // le andature sono tre: lo scarto massimo è Gentle ↔ Upbeat

export function sparkline(series: { error: number }[], w: number, h: number): string {
  if (series.length < 2) return ''
  return series
    .map((p, i) => {
      const x = (i / (series.length - 1)) * w
      const y = h - (p.error / MAX_ERROR) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}
