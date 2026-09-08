import { useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import { TESTI } from '../copy/testi'
import { TESTI_SESSIONE } from '../copy/sessione'
import { TESTI_PAROLE } from '../copy/parole'
import type { Lingua } from './lingua'

/**
 * Le scritte cambiate da fuori.
 *
 * I file di `copy/` restano la verita' di partenza: sono compilati dentro
 * all'app, e con questa tabella vuota — o con Supabase spento, o senza rete
 * al primo avvio — l'app dice esattamente quello che ha sempre detto. Qui
 * dentro c'e' solo cio' che qualcuno ha cambiato dopo, e ogni scritta puo'
 * sempre tornare a quella di partenza togliendo la riga.
 *
 * Questo e' il motivo per cui non si scarica l'intero testo dell'app dal
 * database: un testo che vive solo la' e' un testo che sparisce quando la
 * rete non c'e'. Le sovrascritture invece possono mancare senza che si rompa
 * niente.
 */

/** Una scritta e' una stringa, o una lista di stringhe (i quattro passi). */
export type Valore = string | string[]

/** chiave -> valore, dove la chiave e' `sessione.ritmoPrima.titolo`. */
export type Mappa = Record<string, Valore>

export type Scritte = Record<Lingua, Mappa>

const VUOTE: Scritte = { it: {}, en: {} }

/*
 * I tre alberi, col nome con cui cominciano le loro chiavi.
 *
 * `parole` e' un albero a se' e non un ramo di `sessione` perche' e' l'unico
 * pezzo di testo che ha una vita sua: le sedici schede si leggono anche dal
 * glossario, fuori dal check-in.
 */
export const ALBERI = {
  testi: TESTI,
  sessione: TESTI_SESSIONE,
  parole: TESTI_PAROLE,
} as const

export type Albero = keyof typeof ALBERI

/*
 * Le stringhe che NON sono scritte.
 *
 * `tono` dice di che colore e' un riquadro delle schede-parola, non cosa c'e'
 * scritto sopra: e' un valore che il codice legge, e cambiarlo in "verde" non
 * cambierebbe una parola, romperebbe il riquadro. Chi scrive i testi non deve
 * nemmeno vederlo.
 */
const NON_SCRITTE = new Set(['tono'])

/**
 * Tutte le foglie di un albero di testi, come chiave -> valore.
 *
 * Foglia e' una stringa o una lista di stringhe. Non c'e' niente altro:
 * dopo che le frasi coi buchi sono diventate modelli, in `copy/` non e'
 * rimasta una sola funzione, ed e' quello che rende possibile indirizzare
 * ogni scritta per nome.
 *
 * Una lista di stringhe e' UNA scritta — i quattro passi si scrivono
 * insieme. Una lista di oggetti no: i tre riquadri di una scheda-parola sono
 * tre pezzi diversi, e si numerano (`…riquadri.0.testo`). Senza questo le
 * caselle delle sedici schede non esistevano per il pannello, e infatti non
 * si riuscivano a toccare.
 */
export function foglie(nodo: unknown, prefisso: string, dentro: Mappa = {}): Mappa {
  if (typeof nodo === 'string') {
    dentro[prefisso] = nodo
    return dentro
  }
  if (Array.isArray(nodo)) {
    if (nodo.every((v) => typeof v === 'string')) {
      dentro[prefisso] = nodo as string[]
      return dentro
    }
    nodo.forEach((v, i) => foglie(v, `${prefisso}.${i}`, dentro))
    return dentro
  }
  if (nodo && typeof nodo === 'object') {
    for (const [k, v] of Object.entries(nodo)) {
      if (NON_SCRITTE.has(k)) continue
      foglie(v, prefisso ? `${prefisso}.${k}` : k, dentro)
    }
  }
  return dentro
}

/** Tutte le scritte dell'app in una lingua, come stanno nel codice. */
export function scrittePartenza(lingua: Lingua): Mappa {
  const tutte: Mappa = {}
  for (const [nome, albero] of Object.entries(ALBERI)) {
    foglie((albero as Record<Lingua, unknown>)[lingua], nome, tutte)
  }
  return tutte
}

/**
 * Un albero con le sovrascritture applicate.
 *
 * Se sotto a `prefisso` non c'e' niente da cambiare torna lo STESSO oggetto,
 * non una copia: React confronta per identita', e copiare l'albero a ogni
 * render farebbe ridisegnare mezza app per niente.
 */
export function conScritte<T>(albero: T, prefisso: string, mappa: Mappa): T {
  const chiavi = Object.keys(mappa).filter((k) => k === prefisso || k.startsWith(`${prefisso}.`))
  if (chiavi.length === 0) return albero

  const copia = struttura(albero)
  for (const chiave of chiavi) {
    const pezzi = chiave.slice(prefisso.length + 1).split('.')
    scrivi(copia as Record<string, unknown>, pezzi, mappa[chiave])
  }
  return copia
}

/** Copia profonda, ma solo di oggetti e liste: le foglie sono immutabili. */
function struttura<T>(nodo: T): T {
  if (Array.isArray(nodo)) return nodo.map(struttura) as unknown as T
  if (nodo && typeof nodo === 'object') {
    const fuori: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(nodo)) fuori[k] = struttura(v)
    return fuori as T
  }
  return nodo
}

/**
 * Scrive un valore in fondo a un percorso.
 *
 * I pezzi numerici entrano nelle liste: `riquadri.0.testo` va nel primo
 * riquadro, perche' in JavaScript una lista si legge come un oggetto con le
 * chiavi "0", "1", "2".
 *
 * Se il percorso non esiste piu' — una chiave salvata mesi fa per una scritta
 * che nel frattempo e' stata tolta — non fa niente. Meglio una sovrascrittura
 * che non ha piu' effetto di un'app che si rompe leggendo il database.
 */
function scrivi(nodo: Record<string, unknown>, pezzi: string[], valore: Valore): void {
  let qui: Record<string, unknown> = nodo
  for (let i = 0; i < pezzi.length - 1; i++) {
    const dopo = qui[pezzi[i]]
    if (!dopo || typeof dopo !== 'object') return
    qui = dopo as Record<string, unknown>
  }
  const ultima = pezzi[pezzi.length - 1]
  if (!(ultima in qui)) return
  qui[ultima] = valore
}

/* ── i marcatori invisibili ───────────────────────────────────────────────── */

/*
 * Come fa l'anteprima a sapere quale scritta hai toccato.
 *
 * Il problema: sullo schermo c'e' "Qual e' il ritmo di oggi?", e per
 * cambiarla bisogna sapere che quella e' `sessione.ritmoPrima.titolo`. La via
 * ovvia sarebbe marcare ogni scritta nel punto in cui viene usata — ma sono
 * quattrocento punti, e vorrebbe dire sporcare per sempre il codice dell'app
 * per un pannello che l'app non sa nemmeno che esiste.
 *
 * La via presa: dentro alla cornice dell'anteprima, e SOLO li', ogni scritta
 * si porta dietro il proprio numero scritto in fondo con caratteri a
 * larghezza zero. Non si vedono, non si selezionano, non mandano a capo, non
 * cambiano l'impaginazione, e sopravvivono a `toLowerCase()` e al riempimento
 * dei buchi.
 * Quando qualcuno tocca un punto dello schermo, si legge il testo che c'e'
 * li' sotto e dentro ci si trova scritto di quale scritta si tratta.
 *
 * Il numero e' la posizione della chiave nell'elenco ordinato di tutte le
 * scritte: la cornice e il pannello calcolano lo stesso elenco dallo stesso
 * codice, quindi si capiscono senza doverselo mandare.
 *
 * Fuori dall'anteprima niente di tutto questo esiste: `conMarcatori` non
 * viene mai chiamato, e nell'app che scaricano le atlete non c'e' un solo
 * carattere in piu'.
 */

/*
 * I tre caratteri, e perche' proprio questi.
 *
 * Tutti e tre sono larghi zero, ma la larghezza non basta: devono anche NON
 * essere un punto in cui si puo' andare a capo. Il primo tentativo usava lo
 * zero width space (U+200B), che invece un punto d'a capo lo e' eccome — e
 * dentro all'anteprima i bottoni stretti mandavano il marcatore su una
 * seconda riga vuota, alta come le altre. "Front" e "Back" finivano storti, e
 * chi scriveva i testi vedeva un difetto che nell'app non esiste.
 *
 * Word joiner, ZWNJ e ZWJ non lo sono. Il word joiner fa anche da guardia
 * alle due estremita': cosi' fra un'emoji e uno ZWJ c'e' sempre lui in mezzo,
 * e non si formano per sbaglio sequenze di emoji unite.
 */
const SENTINELLA = '\u2060' // word joiner
const ZERO = '\u200c' // zero width non-joiner
const UNO = '\u200d' // zero width joiner
const BIT = 12 // 4096 scritte: oggi sono 550

export function marcatore(numero: number): string {
  let bit = ''
  for (let i = BIT - 1; i >= 0; i--) bit += (numero >> i) & 1 ? UNO : ZERO
  return SENTINELLA + bit + SENTINELLA
}

/** I numeri delle scritte nascosti in un testo, nell'ordine in cui compaiono. */
export function leggiMarcatori(testo: string): number[] {
  const trovati: number[] = []
  const re = new RegExp(`${SENTINELLA}([${ZERO}${UNO}]{${BIT}})${SENTINELLA}`, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(testo)) !== null) {
    let n = 0
    for (const c of m[1]) n = (n << 1) | (c === UNO ? 1 : 0)
    trovati.push(n)
  }
  return trovati
}

/** Toglie i marcatori: serve a chi deve confrontare o mostrare il testo pulito. */
export function senzaMarcatori(testo: string): string {
  return testo.replace(new RegExp(`${SENTINELLA}[${ZERO}${UNO}]{${BIT}}${SENTINELLA}`, 'g'), '')
}

/** L'elenco ordinato delle chiavi: e' lui a dare il numero a ogni scritta. */
export function elencoChiavi(lingua: Lingua): string[] {
  return Object.keys(scrittePartenza(lingua)).sort()
}

/**
 * Lo stesso albero, con ogni scritta che si porta dietro il proprio numero.
 *
 * Le liste prendono il numero della lista, non uno per riga: una lista e' una
 * scritta sola, e toccarne una riga apre tutte le sue righe.
 */
export function conMarcatori<T>(albero: T, prefisso: string, numeri: Map<string, number>): T {
  function giu(nodo: unknown, percorso: string): unknown {
    if (typeof nodo === 'string') {
      const n = numeri.get(percorso)
      return n === undefined ? nodo : nodo + marcatore(n)
    }
    if (Array.isArray(nodo)) {
      const n = numeri.get(percorso)
      if (n !== undefined) {
        return nodo.map((v) => (typeof v === 'string' ? v + marcatore(n) : v))
      }
      // una lista di oggetti: ogni voce ha le sue scritte, numerate per posto
      return nodo.map((v, i) => giu(v, `${percorso}.${i}`))
    }
    if (nodo && typeof nodo === 'object') {
      const fuori: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(nodo)) {
        fuori[k] = NON_SCRITTE.has(k) ? v : giu(v, `${percorso}.${k}`)
      }
      return fuori
    }
    return nodo
  }
  return giu(albero, prefisso) as T
}

/* ── il magazzino ─────────────────────────────────────────────────────────── */

const CHIAVE_CACHE = 'bab.scritte'

/*
 * La copia locale.
 *
 * Serve perche' l'app apre e mostra qualcosa prima che la rete risponda: se
 * le sovrascritture arrivassero solo dal server, ogni avvio farebbe lampeggiare
 * il testo di partenza per un attimo e poi quello vero. Con la copia locale il
 * lampo c'e' solo la primissima volta.
 */
function dallaCache(): Scritte {
  try {
    const grezzo = localStorage.getItem(CHIAVE_CACHE)
    if (!grezzo) return VUOTE
    const letto = JSON.parse(grezzo) as Scritte
    return { it: letto.it ?? {}, en: letto.en ?? {} }
  } catch {
    return VUOTE
  }
}

let vive: Scritte = dallaCache()
/** quando c'e', vince su tutto: e' l'anteprima dell'amministrazione */
let forzate: Scritte | null = null
const ascoltatori = new Set<() => void>()

function annuncia() {
  for (const f of ascoltatori) f()
}

function adesso(): Scritte {
  return forzate ?? vive
}

export function useScritte(): Scritte {
  return useSyncExternalStore(
    (f) => {
      ascoltatori.add(f)
      return () => ascoltatori.delete(f)
    },
    adesso,
    () => VUOTE,
  )
}

/**
 * Le scritte in onda, dal database.
 *
 * Passa dalla vista `copy_vivo`, che mostra solo la colonna pubblicata: la
 * bozza di chi sta scrivendo non esce di li'. La vista si legge anche senza
 * essere entrate, perche' il primo schermo che l'app mostra — quello
 * dell'accesso — viene prima di qualsiasi sessione.
 */
export async function caricaScritte(): Promise<void> {
  if (!supabase) return
  const { data, error } = await supabase.from('copy_vivo').select('chiave,lingua,valore')
  if (error || !data) return

  const nuove: Scritte = { it: {}, en: {} }
  for (const riga of data as { chiave: string; lingua: Lingua; valore: Valore }[]) {
    if (riga.lingua !== 'it' && riga.lingua !== 'en') continue
    nuove[riga.lingua][riga.chiave] = riga.valore
  }
  vive = nuove
  try {
    localStorage.setItem(CHIAVE_CACHE, JSON.stringify(nuove))
  } catch {
    /* niente spazio: si riparte dal codice al prossimo avvio, e va bene */
  }
  if (!forzate) annuncia()
}

/**
 * L'anteprima: quello che l'amministrazione manda dentro alla cornice mentre
 * qualcuno scrive. `null` la spegne e si torna a quello che vedono tutte.
 */
export function forzaScritte(s: Scritte | null): void {
  forzate = s
  annuncia()
}

/**
 * L'anteprima, vista da dentro alla cornice.
 *
 * L'app di amministrazione tiene questa stessa app dentro a un <iframe> e le
 * manda le bozze mentre qualcuno scrive. Non e' una scorciatoia: e'
 * l'anteprima piu' onesta possibile, perche' sono gli stessi componenti, le
 * stesse misure e lo stesso carattere di quello che vedra' un'atleta.
 *
 * Si accetta solo da chi sta sulla stessa origine. Una pagina di un altro
 * sito che ci mettesse dentro a una cornice e provasse a mandare qualcosa
 * verrebbe scartata qui.
 */
export function ascoltaAnteprima(): void {
  if (window.parent === window) return
  window.addEventListener('message', (e: MessageEvent) => {
    if (e.origin !== window.location.origin) return
    const m = e.data as { tipo?: string; scritte?: Scritte } | null
    if (!m || m.tipo !== 'bab:scritte') return
    forzaScritte(m.scritte ?? null)
  })
  // "sono in piedi": l'amministrazione risponde mandando le bozze di adesso
  window.parent.postMessage({ tipo: 'bab:pronta' }, window.location.origin)
}
