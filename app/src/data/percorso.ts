import type { Parola } from './sessione'

/**
 * Il percorso: sedici parole, otto lezioni, quattro unita'.
 *
 * ── COSA C'E' QUI E COSA NO ────────────────────────────────────────────────
 * Qui c'e' solo la FORMA: quali parole stanno in quale lezione, quali lezioni
 * in quale unita', quali esercizi in quale ordine. Le parole che si leggono a
 * schermo stanno in `copy/percorso.ts`, come per tutto il resto dell'app,
 * cosi' si cambiano dal pannello senza toccare codice.
 *
 * ── PERCHE' NON SONO SESSANTANOVE SCHERMI ──────────────────────────────────
 * In Figma il percorso e' disegnato come 69 frame (138 contando l'inglese).
 * Ma sono otto lezioni fatte con gli stessi sei esercizi, piu' tre schermi
 * fissi: costruirli come schermi vorrebbe dire scrivere sessantanove volte lo
 * stesso impaginato e sbagliarlo in sessantanove modi. Costruiti come un
 * riproduttore piu' questo file sono sei componenti e una tabella — ed e'
 * anche l'unico modo in cui le lezioni nuove si aggiungono scrivendo dati
 * invece che schermi.
 *
 * E' la stessa scelta gia' fatta per il check-in e per le sedici schede: e'
 * scritta nel README, ed e' la ragione per cui questa app sta in piedi.
 */

/** I sei esercizi di una lezione, nell'ordine in cui si incontrano. */
export type Esercizio =
  /** conosci la parola: una per volta, e sono due per lezione */
  | 'incontra'
  /** abbina ogni parola alla sua descrizione, trascinandola */
  | 'abbina'
  /** uno scenario di vita vera: quale parola lo dice? */
  | 'storia'
  /** completa la frase con la parola giusta */
  | 'frase'
  /** cosa fai adesso: e' il segnale che decide, non la parola */
  | 'mossa'
  /** due parole che si somigliano e non sono la stessa cosa */
  | 'gemelle'
  /** la lezione e' finita */
  | 'fatto'
  /** la bandiera rossa: certe parole vanno dette a un adulto */
  | 'allarme'

/**
 * Gli esercizi di ogni lezione.
 *
 * `incontra` sta due volte perche' le parole sono due, e viene per primo: si
 * conoscono, e poi ci si gioca. `allarme` c'e' solo dove il disegno lo mette,
 * cioe' dopo le parole che possono voler dire che serve un adulto.
 */
export const ESERCIZI: Esercizio[] = [
  'incontra',
  'incontra',
  'abbina',
  'storia',
  'frase',
  'mossa',
  'gemelle',
  'fatto',
]

export type Lezione = {
  /** da 1 a 8 */
  numero: number
  /** le due parole, con l'identificativo che hanno gia' nel check-in */
  parole: [Parola, Parola]
  /** vero dove il disegno mette lo schermo della bandiera rossa */
  allarme?: boolean
}

/**
 * Le otto lezioni.
 *
 * Gli identificativi sono quelli che le parole hanno gia' nel check-in e
 * dentro alle righe di `body_signals`: `sordo` si legge "affaticato" e
 * `intorpidito` si legge "addormentato", ma cambiare l'identificativo
 * vorrebbe dire non ritrovare piu' i segnali gia' salvati.
 */
export const LEZIONI: Lezione[] = [
  { numero: 1, parole: ['forte', 'leggero'] },
  { numero: 2, parole: ['indolenzito', 'sordo'] },
  { numero: 3, parole: ['teso', 'rigido'] },
  { numero: 4, parole: ['crampo', 'morsa'] },
  { numero: 5, parole: ['pungente', 'trafittivo'], allarme: true },
  { numero: 6, parole: ['bruciante', 'formicolante'] },
  { numero: 7, parole: ['intorpidito', 'instabile'], allarme: true },
  { numero: 8, parole: ['gonfio', 'caldo'] },
]

export type Unita = {
  numero: number
  /** le due lezioni che ci stanno dentro */
  lezioni: [number, number]
  /** la tinta della riga e della pastiglia, dal disegno */
  tinta: string
  /** l'icona, dagli asset scaricati */
  icona: 'controllo' | 'scudo' | 'attenzione' | 'campanello'
}

/**
 * Le quattro unita'.
 *
 * Non sono un livello in piu': sono il modo in cui il disegno raggruppa le
 * otto lezioni a due a due, per dare un nome a cosa sta dicendo il corpo —
 * funziona, resiste, ti avvisa, e' un allarme. Le pastiglie in cima invece
 * contano le lezioni, che sono otto: U1..U8.
 */
export const UNITA: Unita[] = [
  { numero: 1, lezioni: [1, 2], tinta: '#ffd1c1', icona: 'controllo' },
  { numero: 2, lezioni: [3, 4], tinta: '#e9d5ff', icona: 'scudo' },
  { numero: 3, lezioni: [5, 6], tinta: '#ecfccb', icona: 'attenzione' },
  { numero: 4, lezioni: [7, 8], tinta: '#ffd1c1', icona: 'campanello' },
]

/** Le tinte delle otto pastiglie del progresso, nell'ordine del disegno. */
export const TINTE_LEZIONE = [
  '#ffd1c1',
  '#e9d5ff',
  '#ecfccb',
  '#ffd1c1',
  '#e9d5ff',
  '#ecfccb',
  '#ffd1c1',
  '#e9d5ff',
]

/** Tutte le parole del percorso, nell'ordine in cui si sbloccano. */
export function paroleInOrdine(): Parola[] {
  return LEZIONI.flatMap((l) => l.parole)
}

/** In che lezione si sblocca una parola. */
export function lezioneDi(parola: Parola): number | null {
  return LEZIONI.find((l) => l.parole.includes(parola))?.numero ?? null
}
