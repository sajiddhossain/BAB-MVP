import { useCallback, useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import { giornoAtleta } from './sessione'
import { statoFinestra } from './finestre'
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
  /**
   * Vero quando lo stesso punto e lo stesso gesto tornano piu' di una volta.
   *
   * Non lo scrive ancora nessuno: per dirlo servirebbe leggere la storia dei
   * segnali e decidere quando due giorni sono "lo stesso punto", che e' un
   * giudizio, non un conto. Finche' non lo si e' deciso, la scheda d'allarme
   * non compare — meglio muta che sbagliata.
   */
  segnalata: boolean
  /** giorni di fila con almeno un check-in */
  striscia: number
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
  segnalata: false,
  striscia: 0,
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
    if (g.data !== giornoAtleta()) return { ...VUOTA, striscia: g.striscia ?? 0 }
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
    .select('kind,local_date,tempo_predicted,tempo_chosen')
    .eq('athlete_id', atleta)
    .gte('local_date', giornoAtleta(mezzogiorno(da)))
    .order('local_date', { ascending: false })
  if (error || !data) return

  const righe = data as RigaGiorno[]
  const oggi = giornoAtleta()
  const diOggi = righe.filter((r) => r.local_date === oggi)
  const pre = diOggi.find((r) => r.kind === 'pre')
  const post = diOggi.find((r) => r.kind === 'post')

  segna({
    fattoCheckin: !!pre,
    fattoCheckout: !!post,
    previsto: pre?.tempo_predicted ? (RITMO_DA_DB[pre.tempo_predicted] ?? null) : null,
    sentito: post?.tempo_chosen ? (RITMO_DA_DB[post.tempo_chosen] ?? null) : null,
    striscia: striscia(
      new Set(righe.filter((r) => r.kind === 'pre').map((r) => r.local_date)),
      oggi,
    ),
  })
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
 * Guarda gli allenamenti e l'educazione fisica messi nell'onboarding. I
 * giorni li' sono indicizzati da lunedi' = 0, mentre `getDay()` mette
 * domenica a 0: da qui il giro dei sette.
 */
export function allenamentoDiOggi(quando = new Date()): { ce: boolean; ora: string } {
  const giorno = (quando.getDay() + 6) % 7
  const r = tutte()

  const seAllena = Object.values(r.allenamenti).some((a) => a.giorni.includes(giorno))
  const sePalestra = r.edFisica.includes(giorno)
  if (!seAllena && !sePalestra) return { ce: false, ora: '' }

  // la fascia scelta nell'onboarding non e' un orario: e' mattina, pomeriggio
  // o sera. Finche' non chiediamo l'ora vera, questa e' l'ora al centro della
  // fascia — si vede sull'etichetta, quindi va detto che e' una nostra scelta
  const fascia = Object.values(r.allenamenti).find((a) => a.giorni.includes(giorno))?.fascia ?? 1
  return { ce: true, ora: ['08:00', '17:30', '20:00'][fascia] ?? '17:30' }
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
  // nei giorni di riposo c'e' un solo giro, ed e' quello del mattino
  if (!allenamentoDiOggi(quando).ce) return 'riposo'

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
