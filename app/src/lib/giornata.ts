import { useCallback, useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import { giornoAtleta } from './sessione'
import { giornoDellaSettimana, statoFinestra } from './finestre'
import { minutiDaOra } from './ore'
import { fattoInCoda } from './coda'
import { riempi } from '../copy/riempi'
import { tutte } from './risposte'
import { RITMI } from '../data/sessione'
import type { StatoGiornata, Tempo } from '../data/casa'
import type { TestiSessione } from '../copy/sessione'

/**
 * Com'e' messa la giornata di oggi.
 *
 * ── DA DOVE VIENE ──────────────────────────────────────────────────────────
 * Dal database, con una copia nel telefono. La copia serve perche' la home e'
 * la prima cosa che si apre e non puo' restare bianca ad aspettare la rete;
 * il database serve perche' senza, "l'ho gia' fatto oggi" vivrebbe solo in un
 * telefono — e cambiando telefono, o svuotando i dati dell'app, un'atleta si
 * ritroverebbe a rifare un check-in gia' fatto, sovrascrivendo quello vero.
 *
 * Quindi: si parte dalla copia, si chiede al database, e quando risponde
 * vince lui. Se non risponde — niente rete, niente chiavi — resta la copia, e
 * l'app funziona lo stesso.
 *
 * ── COSA NON SI TIENE DA PARTE ─────────────────────────────────────────────
 * La frase del riepilogo. Si ricalcola ogni volta da `previsto` e `sentito`
 * (vedi `riassuntoDelGiorno`): e' l'unica cosa della giornata che cambia con
 * la lingua, e tenerla scritta vorrebbe dire che cambiando lingua a meta'
 * giornata la home resta indietro.
 */
export type Giornata = {
  /** il giorno dell'atleta a cui si riferisce: finisce alle quattro */
  data: string
  fattoCheckin: boolean
  fattoCheckout: boolean
  /** il ritmo che aveva indovinato al check-in */
  previsto: Tempo | null
  /** il ritmo che ha sentito al check-out */
  sentito: Tempo | null
  /** giorni di fila con almeno un check-in */
  striscia: number
  /** com'e' andata la settimana, da lunedi' a oggi */
  settimana: Settimana
}

/**
 * La settimana, ridotta a quello che la home mostra.
 *
 * Serve a due cose sole: il riepilogo del giorno di riposo, e la nota della
 * lampadina a giornata finita. Le medie sono medie di quello che c'e' — una
 * settimana con due check-in fa media su due — e `null` quando non c'e'
 * niente: senza il `null` una settimana vuota avrebbe sonno zero, cioe' il
 * peggiore possibile, e la nota le direbbe di dormire di piu' senza avere
 * la minima idea di quanto abbia dormito.
 */
export type Settimana = {
  /** giorni con almeno un check-in, da lunedi' a oggi */
  fatti: number
  /** come si e' sentita piu' spesso alla fine, fra le cinque facce */
  sentita: string | null
  sonno: number | null
  scuola: number | null
  sforzo: number | null
  /** almeno una volta ha detto che il dolore le cambia il gesto */
  dolore: boolean
}

const SETTIMANA_VUOTA: Settimana = {
  fatti: 0,
  sentita: null,
  sonno: null,
  scuola: null,
  sforzo: null,
  dolore: false,
}

/** Dall'enum del database ai nomi di qui: `upbeat` -> `carica`. */
const RITMO_DA_DB: Record<string, Tempo> = Object.fromEntries(
  RITMI.map((r) => [r.db, r.id]),
) as Record<string, Tempo>

const VUOTA: Giornata = {
  data: giornoAtleta(),
  fattoCheckin: false,
  fattoCheckout: false,
  previsto: null,
  sentito: null,
  striscia: 0,
  settimana: SETTIMANA_VUOTA,
}

const CHIAVE = 'bab.giornata'

function dallaCopia(): Giornata {
  try {
    const g = JSON.parse(localStorage.getItem(CHIAVE) ?? 'null') as Giornata | null
    if (!g) return VUOTA
    /*
     * Una giornata di ieri non e' la giornata di oggi. La striscia invece
     * attraversa i giorni per definizione, quindi sopravvive — e comunque il
     * database la ricalcola appena risponde.
     */
    if (g.data !== giornoAtleta()) {
      return { ...VUOTA, striscia: g.striscia ?? 0, settimana: g.settimana ?? SETTIMANA_VUOTA }
    }
    return { ...VUOTA, ...g }
  } catch {
    return VUOTA
  }
}

let stato = dallaCopia()
const ascoltatori = new Set<() => void>()

function iscrivi(f: () => void) {
  ascoltatori.add(f)
  return () => void ascoltatori.delete(f)
}

function annuncia() {
  ascoltatori.forEach((f) => f())
}

/** Cambia la giornata di oggi e la scrive nella copia locale. */
export function segna(campi: Partial<Giornata>) {
  stato = { ...stato, ...campi, data: giornoAtleta() }
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(stato))
  } catch {
    // spazio finito o navigazione privata: la home funziona lo stesso, e al
    // prossimo avvio la giornata torna dal database
  }
  annuncia()
}

/** La giornata di adesso, fuori da un componente o dentro a un effetto. */
export function giornataAdesso(): Giornata {
  return stato
}

export function useGiornata(): Giornata {
  return useSyncExternalStore(
    iscrivi,
    useCallback(() => stato, []),
  )
}

/* ── il database ──────────────────────────────────────────────────────────── */

/** Quanto indietro si guarda per contare la striscia. */
const GIORNI_INDIETRO = 120

type RigaGiorno = {
  kind: 'pre' | 'post'
  local_date: string
  tempo_predicted: string | null
  tempo_chosen: string | null
  sleep: number | null
  school_load: number | null
  effort: number | null
  satisfaction: string | null
  protective_pain: boolean | null
}

/**
 * Chiede al database cos'ha gia' fatto, oggi e nei mesi scorsi.
 *
 * Si chiama all'avvio e ogni volta che si torna alla home: e' una query sola
 * su un indice che c'e' gia' (`athlete_id, local_date desc`), e paga la
 * certezza che quello che si vede sia quello che c'e' scritto davvero.
 *
 * Non tocca niente se il database non risponde: un errore di rete non deve
 * cancellare dalla home un check-in appena fatto.
 */
export async function caricaGiornata(): Promise<void> {
  if (!supabase) return

  const { data: sessione } = await supabase.auth.getSession()
  const atleta = sessione.session?.user.id
  if (!atleta) return

  const da = new Date()
  da.setDate(da.getDate() - GIORNI_INDIETRO)

  const { data, error } = await supabase
    .from('check_ins')
    .select(
      'kind,local_date,tempo_predicted,tempo_chosen,sleep,school_load,effort,satisfaction,protective_pain',
    )
    .eq('athlete_id', atleta)
    .gte('local_date', giornoAtleta(mezzogiorno(da)))
    .order('local_date', { ascending: false })
  if (error || !data) return

  const righe = data as RigaGiorno[]
  const oggi = giornoAtleta()
  const diOggi = righe.filter((r) => r.local_date === oggi)
  const pre = diOggi.find((r) => r.kind === 'pre')
  const post = diOggi.find((r) => r.kind === 'post')

  /*
   * Vale anche quello che deve ancora partire.
   *
   * Senza, un check-in finito in palestra senza campo risulterebbe "da fare"
   * appena la home rilegge dal database — e rifarlo sarebbe la cosa piu'
   * ovvia da fare, e la piu' sbagliata.
   */
  const coda = fattoInCoda()

  const giorniConCheckin = new Set(righe.filter((r) => r.kind === 'pre').map((r) => r.local_date))
  if (coda.checkin) giorniConCheckin.add(oggi)

  segna({
    fattoCheckin: !!pre || coda.checkin,
    fattoCheckout: !!post || coda.checkout,
    previsto: pre?.tempo_predicted ? (RITMO_DA_DB[pre.tempo_predicted] ?? null) : null,
    sentito: post?.tempo_chosen ? (RITMO_DA_DB[post.tempo_chosen] ?? null) : null,
    striscia: striscia(giorniConCheckin, oggi),
    settimana: dellaSettimana(righe, oggi),
  })
}

/*
 * Quando la coda riesce a mandare qualcosa, la giornata si rilegge.
 *
 * Passa da un evento e non da una chiamata diretta perche' `sessione.ts`,
 * che tiene la coda, e' gia' importato da qui: chiamandosi a vicenda i due
 * file si terrebbero per mano in cerchio.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('bab:salvato', () => void caricaGiornata())
}

/**
 * I giorni di fila con almeno un check-in.
 *
 * Se oggi non l'ha ancora fatto la striscia non si azzera: si conta da ieri.
 * Una striscia che cade alle quattro del mattino, prima che uno abbia avuto
 * modo di alzarsi, non premia niente — punisce solo il dormire.
 */
function striscia(giorni: Set<string>, oggi: string): number {
  const d = mezzogiorno(new Date(`${oggi}T12:00:00`))
  if (!giorni.has(oggi)) d.setDate(d.getDate() - 1)

  let quanti = 0
  while (giorni.has(giornoAtleta(d))) {
    quanti++
    d.setDate(d.getDate() - 1)
  }
  return quanti
}

/**
 * Da lunedi' a oggi, ridotto ai numeri che servono.
 *
 * La settimana comincia di lunedi' e non "sette giorni fa": e' la settimana
 * di scuola e degli allenamenti, quella che un'atleta ha in testa quando
 * legge "questa settimana". Di domenica sera guarda indietro sei giorni, di
 * lunedi' mattina ricomincia da capo, ed e' giusto cosi'.
 */
function dellaSettimana(righe: RigaGiorno[], oggi: string): Settimana {
  const primo = giornoAtleta(lunedi(new Date(`${oggi}T12:00:00`)))
  const dentro = righe.filter((r) => r.local_date >= primo && r.local_date <= oggi)
  if (dentro.length === 0) return SETTIMANA_VUOTA

  const pre = dentro.filter((r) => r.kind === 'pre')
  const post = dentro.filter((r) => r.kind === 'post')

  return {
    fatti: new Set(pre.map((r) => r.local_date)).size,
    sentita: piuFrequente(post.map((r) => r.satisfaction)),
    sonno: media(pre.map((r) => r.sleep)),
    scuola: media(pre.map((r) => r.school_load)),
    sforzo: media(post.map((r) => r.effort)),
    dolore: post.some((r) => r.protective_pain === true),
  }
}

/** Il lunedi' della settimana di quella data. */
function lunedi(d: Date): Date {
  const m = mezzogiorno(d)
  /* getDay() mette domenica a 0: qui la domenica e' il settimo giorno */
  const quanti = (m.getDay() + 6) % 7
  m.setDate(m.getDate() - quanti)
  return m
}

function media(numeri: (number | null)[]): number | null {
  const veri = numeri.filter((n): n is number => typeof n === 'number')
  if (veri.length === 0) return null
  return veri.reduce((a, b) => a + b, 0) / veri.length
}

/**
 * Quello che torna piu' spesso. A pari merito vince l'ultimo in ordine di
 * tempo, che e' il primo dell'elenco: le righe arrivano dalla piu' recente.
 */
function piuFrequente(voci: (string | null)[]): string | null {
  const conto = new Map<string, number>()
  for (const v of voci) {
    if (v) conto.set(v, (conto.get(v) ?? 0) + 1)
  }
  let vinta: string | null = null
  let quante = 0
  for (const [v, n] of conto) {
    if (n > quante) {
      vinta = v
      quante = n
    }
  }
  return vinta
}

/**
 * La stessa data, ma a mezzogiorno.
 *
 * `giornoAtleta` toglie un giorno prima delle quattro del mattino: passandogli
 * una data presa "adesso" mentre si conta all'indietro, una notte insonne
 * sposterebbe tutto il conto di un giorno. A mezzogiorno non succede, e
 * nemmeno quando l'ora legale accorcia la notte.
 */
function mezzogiorno(d: Date): Date {
  const m = new Date(d)
  m.setHours(12, 0, 0, 0)
  return m
}

/* ── cosa mostra la home ──────────────────────────────────────────────────── */

/**
 * Se oggi c'e' allenamento, e a che ora.
 *
 * Guarda gli allenamenti e l'educazione fisica messi nell'onboarding. Il
 * giorno e' quello dell'atleta, che finisce alle quattro del mattino — lo
 * stesso che usano le finestre, se no dopo mezzanotte la home e le finestre
 * guarderebbero due giorni diversi.
 */
export function allenamentoDiOggi(quando = new Date()): { ce: boolean; ora: string } {
  const giorno = giornoDellaSettimana(quando)
  const r = tutte()

  const seAllena = Object.values(r.allenamenti).some((a) => a.giorni.includes(giorno))
  const sePalestra = r.edFisica.includes(giorno)
  if (!seAllena && !sePalestra) return { ce: false, ora: '' }

  /*
   * L'ora e' quella vera, quella che ha scritto lei. Prima era l'ora al
   * centro della fascia — le 17:30 per "Pomeriggio" — e finiva sull'etichetta
   * della home come se gliel'avesse detta lei.
   *
   * Se oggi si allena per due sport si prende il primo che comincia: e'
   * l'allenamento a cui il check-in del mattino serve.
   *
   * Nei giorni di sola educazione fisica l'ora non c'e', e torna vuota invece
   * che inventata: l'etichetta della home sa gia' cavarsela senza — vedi il
   * puntino che si toglie da solo, in `Casa.tsx`.
   */
  const orari = Object.values(r.allenamenti)
    .filter((a) => a.giorni.includes(giorno))
    .map((a) => (a.perGiorno?.[giorno] ?? a).inizio)
    .filter((o) => minutiDaOra(o) !== null)
    .sort((a, b) => (minutiDaOra(a) as number) - (minutiDaOra(b) as number))
  return { ce: true, ora: orari[0] ?? '' }
}

/**
 * In che stato e' la giornata: quale delle quattro schede si vede.
 *
 * Le finestre entrano qui dentro, e cambiano una cosa sola ma importante: una
 * cosa che non si puo' piu' fare non tiene ferma la giornata. Se il check-in
 * non l'ha fatto e sono le quattro del pomeriggio, la home non resta a
 * chiederglielo — passa al check-out, che e' quello che puo' fare adesso.
 *
 * Non esiste uno stato "giornata finita senza aver fatto niente": alle
 * quattro del mattino il giorno cambia, e la scheda torna a essere quella del
 * check-in di domani.
 */
export function statoDiOggi(g: Giornata, quando = new Date()): StatoGiornata {
  /*
   * I giorni di riposo seguono lo stesso giro: check-in, check-out, fatto.
   * Prima c'era solo il check-in del mattino. Senza allenamenti con gli orari
   * valgono le finestre fisse (vedi `finestre.ts`), e il check-out salta le
   * domande sulla sessione (vedi `giornoDiRiposo`).
   */
  /*
   * `chiusa` e non `!siPuoFare`: prima delle cinque il check-in non si puo'
   * ancora fare, ma e' comunque la prossima cosa che succede, e la scheda
   * dev'essere la sua — con dentro l'ora in cui apre. Solo quando il momento
   * e' passato per davvero la giornata va avanti al check-out.
   */
  if (!g.fattoCheckin && statoFinestra('checkin', quando) !== 'chiusa') return 'checkin'
  if (!g.fattoCheckout) return 'checkout'
  return 'fatto'
}

/**
 * La frase che la home mostra a giornata finita.
 *
 * Il disegno della home non dice cosa ci vada dentro: qui si scrive il
 * confronto, che e' l'unica cosa che la giornata ha davvero prodotto.
 */
/**
 * Quale delle quattro note mostrare a giornata finita.
 *
 * ── PERCHE' QUATTRO REGOLE E NON UN CONSIGLIO VERO ─────────────────────────
 * Un consiglio vero vorrebbe dire leggere una settimana di dati e dire
 * qualcosa che nessuno le ha ancora detto. Qui invece sono quattro casi
 * scritti a mano, scelti guardando i numeri che ci sono davvero: dolore che
 * le cambia il gesto, scuola e allenamento tutti e due pesanti, poco sonno,
 * e tutto il resto. Poche, e per questo mai fuori posto.
 *
 * L'ordine conta: il dolore viene prima di tutto, perche' e' l'unico dei
 * quattro che puo' voler dire "parlane con qualcuno" e non "bevi un po'
 * d'acqua". Il caso `liscio` non e' un ripiego — una settimana in cui non
 * c'e' niente da segnalare merita di sentirselo dire.
 */
export type Consiglio = 'dolore' | 'carico' | 'sonno' | 'liscio'

/** Le soglie: le risposte vanno da 1 a 5, quindi 4 e' "parecchio". */
const PARECCHIO = 4
const POCO = 2.5

export function consiglioDelGiorno(s: Settimana): Consiglio {
  if (s.dolore) return 'dolore'
  if ((s.scuola ?? 0) >= PARECCHIO && (s.sforzo ?? 0) >= PARECCHIO) return 'carico'
  if (s.sonno !== null && s.sonno <= POCO) return 'sonno'
  return 'liscio'
}

export function riassuntoDelGiorno(
  previsto: string | null,
  sentito: string | null,
  ts: TestiSessione,
): string {
  const nomi = ts.comune.ritmi
  if (!sentito) return ''
  const dopo = nomi[sentito as keyof typeof nomi]
  if (!previsto) return riempi(ts.giorno.soloDopo, { dopo: dopo.toLowerCase() })
  const prima = nomi[previsto as keyof typeof nomi]
  const modello = previsto === sentito ? ts.giorno.uguale : ts.giorno.diverso
  return riempi(modello, { prima, dopo: dopo.toLowerCase() })
}
