import { useCallback, useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import type { Tempo } from '../data/casa'
import type {
  Bottino,
  Comparsa,
  Effetto,
  Faccia,
  OreSonno,
  Parola,
  Quando,
  Tipo,
} from '../data/sessione'
import { COMPARSA_DB, EFFETTO_DB, PAROLE, QUANDO_DB, RITMI } from '../data/sessione'
import { accoda, inSospeso, togliDallaCoda } from './coda'
import { giornoDiRiposo } from './finestre'
import type { Esito } from './conto'

/**
 * Quello che si raccoglie in un check-in o in un check-out.
 *
 * Una forma sola per tutti e due, con i campi che l'altro non usa lasciati a
 * null: nel database sono gia' la stessa tabella (`check_ins`, con `kind` che
 * dice quale dei due), e avere due forme qui vorrebbe dire tenere allineati
 * due tipi che descrivono la stessa riga.
 */
export type Sensazione = {
  /** chiave locale, non finisce nel database */
  id: string
  /** `front_quad_r`, oppure `altrove` */
  zona: string
  /** dove, quando ha scelto "Altrove" */
  zonaLibera: string
  parole: Parola[]
  /** le sue parole, quando le pastiglie non bastano */
  sue: string
  unLato: boolean | null
  /** check-in: quando la senti */
  quando: Quando | null
  /** check-out: quando e' comparsa */
  comparsa: Comparsa | null
  /** check-out: cosa le ha fatto la sessione */
  effetto: Effetto | null
  /** 0–10, come l'RPE */
  intensita: number
}

export type Dati = {
  ritmo: Tempo | null
  /* check-in */
  sonno: number
  oreSonno: OreSonno | null
  energia: number
  umore: number
  scuola: number
  ciclo: boolean | null
  antidolorifici: boolean | null
  /* check-out */
  sforzo: number
  soddisfazione: Faccia | null
  bottino: Bottino[]
  bottinoMio: string
  protettivo: boolean | null
  /* tutti e due */
  sensazioni: Sensazione[]
  /** quando ha aperto il primo schermo: finisce in `started_at` */
  iniziata: string
}

/*
 * I cursori partono dal centro.
 *
 * Nel disegno stanno a 4, 6, 5, 3 — ma quelli sono valori d'esempio, non
 * default. Il centro e' l'unico punto che non suggerisce una risposta: farli
 * partire da 6 vorrebbe dire chiedere "quanto stai bene" avendo gia' scritto
 * "parecchio", e chi ha fretta lascia li' quello che trova.
 */
export const VUOTI: Dati = {
  ritmo: null,
  sonno: 4,
  oreSonno: null,
  energia: 4,
  umore: 4,
  scuola: 4,
  ciclo: null,
  antidolorifici: null,
  sforzo: 5,
  soddisfazione: null,
  bottino: [],
  bottinoMio: '',
  protettivo: null,
  sensazioni: [],
  iniziata: '',
}

/**
 * Il giorno DELL'ATLETA, che finisce alle quattro del mattino.
 *
 * Un check-out fatto all'una di notte appartiene all'allenamento della sera
 * prima, non al giorno dopo. Lo schema chiede questa data gia' calcolata,
 * perche' il fuso orario lo conosce solo il telefono.
 */
export function giornoAtleta(quando = new Date()): string {
  const d = new Date(quando)
  if (d.getHours() < 4) d.setDate(d.getDate() - 1)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

type Magazzino = { giorno: string; checkin: Dati; checkout: Dati }

const CHIAVE = 'bab.sessione'

function vuoto(): Magazzino {
  return { giorno: giornoAtleta(), checkin: { ...VUOTI }, checkout: { ...VUOTI } }
}

function leggi(): Magazzino {
  try {
    const m = JSON.parse(localStorage.getItem(CHIAVE) ?? 'null') as Magazzino | null
    // le risposte di ieri non sono le risposte di oggi
    if (!m || m.giorno !== giornoAtleta()) return vuoto()
    return {
      giorno: m.giorno,
      checkin: { ...VUOTI, ...m.checkin },
      checkout: { ...VUOTI, ...m.checkout },
    }
  } catch {
    return vuoto()
  }
}

let stato = leggi()
/* in vetrina non si scrive sul telefono: vedi `accendiVetrina` */
let vetrina = false
const ascoltatori = new Set<() => void>()

function iscrivi(f: () => void) {
  ascoltatori.add(f)
  return () => void ascoltatori.delete(f)
}

function salva() {
  try {
    if (!vetrina) localStorage.setItem(CHIAVE, JSON.stringify(stato))
  } catch {
    // spazio finito o navigazione privata: la sessione funziona lo stesso,
    // solo non sopravvive alla chiusura dell'app
  }
  ascoltatori.forEach((f) => f())
}

/**
 * Il modo vetrina: una giornata finta, in memoria, che non tocca il telefono.
 *
 * Serve all'anteprima dell'amministrazione dei testi: chi scrive deve vedere
 * lo schermo dei segnali con delle sensazioni dentro, se no meta' delle
 * scritte non compare. I dati sono quelli degli esempi in Figma, cosi' le
 * frasi escono uguali a come sono state disegnate.
 *
 * Da qui in poi niente finisce piu' in `localStorage`: se chi scrive i testi
 * fosse anche un'atleta, la sua giornata vera resterebbe intatta.
 */
export function accendiVetrina(): void {
  vetrina = true
  const zona = 'front_quad_r'
  stato = {
    giorno: giornoAtleta(),
    checkin: {
      ...VUOTI,
      ritmo: 'costante',
      sonno: 4,
      oreSonno: '7-8h',
      energia: 4,
      umore: 5,
      scuola: 3,
      ciclo: true,
      antidolorifici: false,
      iniziata: new Date().toISOString(),
      sensazioni: [
        {
          id: 'vetrina-1',
          zona,
          zonaLibera: '',
          parole: ['teso', 'indolenzito', 'bruciante'],
          sue: '',
          unLato: true,
          quando: 'muovo',
          comparsa: null,
          effetto: null,
          intensita: 4,
        },
      ],
    },
    checkout: {
      ...VUOTI,
      ritmo: 'leggero',
      sforzo: 5,
      energia: 3,
      soddisfazione: 'satisfied',
      bottino: ['ascoltato', 'gentile'],
      iniziata: new Date().toISOString(),
      sensazioni: [
        {
          id: 'vetrina-2',
          zona,
          zonaLibera: '',
          parole: ['indolenzito'],
          sue: '',
          unLato: true,
          quando: null,
          comparsa: 'durante',
          effetto: 'scaldata',
          intensita: 3,
        },
      ],
    },
  }
  ascoltatori.forEach((f) => f())
}

/**
 * La vetrina, ma col corpo ancora da segnare.
 *
 * La mappa e' l'unico schermo dell'anteprima che si vuole vuoto: le altre
 * scritte hanno bisogno di una giornata dentro per comparire, ma un corpo che
 * arriva gia' segnato non lo si puo' provare — e provarlo e' proprio quello
 * che serve fare li'. La chiama la mappa quando si apre, e solo in anteprima.
 */
export function vetrinaSenzaCorpo(): void {
  if (!vetrina) return
  stato = {
    ...stato,
    checkin: { ...stato.checkin, sensazioni: [] },
    checkout: { ...stato.checkout, sensazioni: [] },
  }
  ascoltatori.forEach((f) => f())
}

/**
 * Cambia uno o piu' campi di uno dei due giri.
 *
 * Accetta anche una funzione, come `scrivi` delle risposte: aggiungere una
 * sensazione e chiudere il foglio finiscono nello stesso giro di React, e chi
 * legge dallo stato del render avrebbe in mano la lista di prima.
 */
export function scriviSessione(
  tipo: Tipo,
  campi: Partial<Dati> | ((d: Dati) => Partial<Dati>),
) {
  const ora = stato[tipo]
  stato = {
    ...stato,
    giorno: giornoAtleta(),
    [tipo]: { ...ora, ...(typeof campi === 'function' ? campi(ora) : campi) },
  }
  salva()
}

export function datiSessione(tipo: Tipo): Dati {
  return stato[tipo]
}

export function useDatiSessione(tipo: Tipo): Dati {
  return useSyncExternalStore(
    iscrivi,
    useCallback(() => stato[tipo], [tipo]),
  )
}

/** Azzera tutti e due i giri. Serve all'uscita, come per le risposte. */
export function dimenticaSessione() {
  try {
    localStorage.removeItem(CHIAVE)
  } catch {
    // niente da fare: lo stato in memoria si azzera comunque
  }
  stato = vuoto()
  ascoltatori.forEach((f) => f())
}

/*
 * ── IL SALVATAGGIO ──────────────────────────────────────────────────────────
 */

const RITMO_DB: Record<Tempo, string> = Object.fromEntries(
  RITMI.map((r) => [r.id, r.db]),
) as Record<Tempo, string>

/** L'ora sull'orologio di casa sua: `07:12:00`. */
function oraLocale(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/**
 * Scrive un check-in o un check-out nel database.
 *
 * Come per l'onboarding: si scrive alla fine, in un colpo solo. A meta' giro
 * non c'e' ancora una riga sensata da salvare — un check-in senza il ritmo e
 * senza la mappa non e' un check-in a meta', e' un dato che non vuol dire
 * niente e che poi qualcuno leggerebbe come se lo volesse dire.
 */
export async function salvaSessione(tipo: Tipo, d: Dati): Promise<Esito> {
  const ora = new Date()
  let esito: Esito
  try {
    esito = await scrivi(tipo, d, ora)
  } catch (guaio) {
    esito = { ok: false, errore: String(guaio) }
  }
  if (esito.ok || esito.scaduta) return esito

  /*
   * Se e' colpa della rete non e' colpa sua.
   *
   * Il salvataggio resta scritto nel telefono e riparte da solo appena c'e'
   * campo, quindi per lei e' fatto — e infatti le si dice che e' fatto. Se
   * invece l'errore e' vero (un vincolo, un permesso) riprovare non
   * cambierebbe niente, e allora glielo si dice.
   */
  if (!eColpaDellaRete(esito.errore)) return esito
  accoda({ tipo, dati: d, giorno: giornoAtleta(ora), quando: ora.toISOString() })
  return { ok: true }
}

/**
 * Quando un errore vuol dire "manca il campo" e non "hai sbagliato".
 *
 * Non c'e' un modo pulito di chiederlo: supabase-js impacchetta il guasto di
 * `fetch` in un messaggio, e ogni browser lo scrive a modo suo — "Failed to
 * fetch" su Chrome, "Load failed" su Safari, "NetworkError" su Firefox. Il
 * primo controllo pero' e' quello buono: se il telefono dice che e' offline,
 * lo e'.
 */
function eColpaDellaRete(errore: string): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true
  return /fetch|network|load failed|timeout|abort/i.test(errore)
}

/**
 * Manda quello che era rimasto in coda.
 *
 * Si chiama all'avvio, quando torna la rete, e tornando alla home. Ogni riga
 * si riscrive con l'ora in cui e' stata FATTA, non con adesso: un check-out
 * delle dieci di sera spedito la mattina dopo deve restare di ieri sera.
 */
let staSvuotando = false

export async function svuotaCoda(): Promise<void> {
  if (!supabase || staSvuotando) return
  if (typeof navigator !== 'undefined' && !navigator.onLine) return

  staSvuotando = true
  let qualcosaEPartito = false
  try {
    for (const v of inSospeso()) {
      let esito: Esito
      try {
        esito = await scrivi(v.tipo, v.dati, new Date(v.quando))
      } catch (guaio) {
        esito = { ok: false, errore: String(guaio) }
      }

      if (esito.ok) {
        togliDallaCoda(v.tipo, v.giorno)
        qualcosaEPartito = true
        continue
      }
      // la rete e' andata via di nuovo, o serve rientrare: si riprova dopo,
      // e intanto non si insiste sulle altre
      if (esito.scaduta || eColpaDellaRete(esito.errore)) return
      // un errore vero: resta in coda ma non blocca chi viene dopo, cosi' una
      // riga malata non si porta dietro tutte le altre
    }
  } finally {
    staSvuotando = false
  }

  /*
   * La home rilegge dal database invece di essere avvisata direttamente: se
   * `sessione.ts` importasse `giornata.ts`, che importa `giornoAtleta` da
   * qui, i due file si terrebbero per mano in cerchio.
   */
  if (qualcosaEPartito) window.dispatchEvent(new Event('bab:salvato'))
}

/** Riprova quello che e' rimasto indietro, adesso e ogni volta che torna la rete. */
export function accendiCoda(): void {
  void svuotaCoda()
  window.addEventListener('online', () => void svuotaCoda())
}

async function scrivi(tipo: Tipo, d: Dati, ora: Date): Promise<Esito> {
  if (!supabase) return { ok: true }

  const { data: sessione } = await supabase.auth.getSession()
  const atleta = sessione.session?.user.id
  // senza sessione non c'e' nessuno per cui salvare, e "riprova" non puo'
  // funzionare: si rientra, esattamente come alla fine dell'onboarding
  if (!atleta) return { ok: false, errore: 'nessuna sessione', scaduta: true }

  const kind = tipo === 'checkin' ? 'pre' : 'post'
  const giorno = giornoAtleta(ora)
  const adesso = ora.toISOString()

  /*
   * L'id della riga si riusa se ce n'e' gia' una per oggi.
   *
   * `check_ins.id` e' la chiave primaria e `body_signals.check_in_id` ci punta
   * contro: se rifacendo un check-out mandassimo un id nuovo, l'upsert
   * sull'indice unico (atleta, tipo, giorno) proverebbe a cambiare la chiave
   * primaria sotto ai segnali gia' attaccati. Una lettura in piu' costa meno
   * di quel guaio.
   */
  const esistente = await supabase
    .from('check_ins')
    .select('id')
    .eq('athlete_id', atleta)
    .eq('kind', kind)
    .eq('local_date', giorno)
    .maybeSingle()
  if (esistente.error) return { ok: false, errore: `lettura: ${esistente.error.message}` }

  const id = esistente.data?.id ?? crypto.randomUUID()
  const ritmo = d.ritmo ? RITMO_DB[d.ritmo] : null

  const riga = {
    id,
    athlete_id: atleta,
    kind,
    local_date: giorno,
    started_at: d.iniziata || adesso,
    completed_at: adesso,
    /*
     * L'ora del SUO orologio. `completed_at` da' l'istante assoluto in UTC, e
     * per tornare da quello al momento della sua giornata servirebbe il fuso:
     * `athletes.timezone` c'e' ma non lo scrive nessuno, e' un default. Si
     * scrive quindi qui, come si scrive gia' `local_date` e per la stessa
     * ragione: il fuso lo conosce solo il telefono.
     */
    local_time: oraLocale(ora),
    // il ritmo va in due colonne diverse a seconda del giro: quella prima e'
    // una previsione, quella dopo e' un esito, e confonderle vorrebbe dire
    // perdere l'unica cosa che il confronto misura
    tempo_predicted: tipo === 'checkin' ? ritmo : null,
    tempo_chosen: tipo === 'checkout' ? ritmo : null,
    sleep: tipo === 'checkin' ? d.sonno : null,
    sleep_hours: tipo === 'checkin' ? d.oreSonno : null,
    mood: tipo === 'checkin' ? d.umore : null,
    school_load: tipo === 'checkin' ? d.scuola : null,
    on_period: tipo === 'checkin' ? d.ciclo : null,
    painkillers: tipo === 'checkin' ? d.antidolorifici : null,
    // l'energia si chiede tutte e due le volte: e' la stessa domanda, ed e'
    // la differenza fra le due risposte che dice qualcosa
    energy: d.energia,
    // nei giorni di riposo sforzo e soddisfazione non si chiedono: vuoti, non
    // il 5 di partenza del cursore spacciato per una risposta
    effort: tipo === 'checkout' && !giornoDiRiposo(ora) ? d.sforzo : null,
    satisfaction: tipo === 'checkout' && !giornoDiRiposo(ora) ? d.soddisfazione : null,
    brought_home: tipo === 'checkout' && d.bottino.length ? d.bottino : null,
    note: tipo === 'checkout' && d.bottinoMio.trim() ? d.bottinoMio.trim().slice(0, 500) : null,
    protective_pain: tipo === 'checkout' ? d.protettivo : null,
  }

  const scritto = await supabase.from('check_ins').upsert(riga)
  if (scritto.error) return { ok: false, errore: `check-in: ${scritto.error.message}` }

  /*
   * I segnali si cancellano e si riscrivono, come la settimana
   * dell'onboarding: non hanno una chiave stabile lato client, e un upsert
   * non saprebbe distinguere "ne ha aggiunta una" da "ne ha cambiata una".
   */
  const via = await supabase.from('body_signals').delete().eq('check_in_id', id)
  if (via.error) return { ok: false, errore: `segnali (pulizia): ${via.error.message}` }

  if (d.sensazioni.length) {
    const segnali = d.sensazioni.map((s) => ({
      athlete_id: atleta,
      check_in_id: id,
      created_at: adesso,
      region: s.zona,
      region_free: s.zona === 'altrove' ? s.zonaLibera.slice(0, 40) || null : null,
      sensation: s.parole,
      words: s.sue.trim() ? s.sue.trim().slice(0, 200) : null,
      one_side: s.unLato,
      // le tre "when": una la chiede il check-in, due il check-out, e nel
      // giro sbagliato restano nulle perche' quella domanda li' non c'era
      when_noticed: s.quando ? QUANDO_DB[s.quando] : null,
      onset: s.comparsa ? COMPARSA_DB[s.comparsa] : null,
      session_effect: s.effetto ? EFFETTO_DB[s.effetto] : null,
      intensity: s.intensita,
      /*
       * `is_red_flag` lo mettiamo solo quando l'ha detto lei, alla fine del
       * check-out. Dedurlo dalle parole sarebbe un giudizio clinico preso da
       * un elenco di aggettivi — e la tabella `red_flags`, che e' quella che
       * fa arrivare la cosa a un adulto, non ha ancora nessuno schermo che la
       * chiuda: aprirci righe che nessuno vede sarebbe il modo piu'
       * silenzioso di non far arrivare niente a nessuno.
       */
      is_red_flag: tipo === 'checkout' && d.protettivo === true,
    }))
    const messi = await supabase.from('body_signals').insert(segnali)
    if (messi.error) return { ok: false, errore: `segnali: ${messi.error.message}` }
  }

  return { ok: true }
}

/*
 * ── LA RILETTURA ────────────────────────────────────────────────────────────
 */

/** Una riga di `body_signals`, con le sole colonne che servono a ridisegnarla. */
export type RigaSegnale = {
  id: string
  region: string
  region_free: string | null
  sensation: string[] | null
  words: string | null
  one_side: boolean | null
  intensity: number | null
}

/**
 * Una riga del database rimessa nella forma di una sensazione.
 *
 * Tiene solo le parole che l'app conosce ancora: una parola tolta dall'elenco
 * dopo che era stata salvata non ha una pastiglia da accendere, e lasciarla
 * dentro vorrebbe dire un foglio che conta quattro parole e ne mostra tre.
 * Le domande del "quando" restano vuote: rileggendo un check-in per il
 * check-out non servono, e il check-out le chiede per conto suo.
 */
export function sensazioneDaSegnale(r: RigaSegnale): Sensazione {
  const conosciute: readonly string[] = PAROLE
  return {
    id: r.id,
    zona: r.region,
    zonaLibera: r.region_free ?? '',
    parole: (r.sensation ?? []).filter((p): p is Parola => conosciute.includes(p)),
    sue: r.words ?? '',
    unLato: r.one_side,
    quando: null,
    comparsa: null,
    effetto: null,
    // il centro della scala, come per una sensazione nuova
    intensita: r.intensity ?? 5,
  }
}

/**
 * Le sensazioni del check-in di oggi, come le ha il database.
 *
 * Serve al check-out quando sul telefono non c'e' niente: check-in fatto su
 * un altro telefono, o memoria del browser svuotata. Legge solo le righe
 * sue — la regola "own rows" di `body_signals` e `check_ins` non ne lascia
 * vedere altre — e non scrive niente.
 *
 * Qualsiasi cosa vada storta (niente rete, niente sessione, nessun check-in
 * oggi) torna una lista vuota: il corpo resta da segnare come sempre, solo
 * senza le zone chiare.
 */
export async function sensazioniCheckinDalDatabase(): Promise<Sensazione[]> {
  if (!supabase) return []

  const { data: sessione } = await supabase.auth.getSession()
  const atleta = sessione.session?.user.id
  if (!atleta) return []

  const checkin = await supabase
    .from('check_ins')
    .select('id')
    .eq('athlete_id', atleta)
    .eq('kind', 'pre')
    .eq('local_date', giornoAtleta())
    .maybeSingle()
  if (checkin.error || !checkin.data) return []

  const { data, error } = await supabase
    .from('body_signals')
    .select('id,region,region_free,sensation,words,one_side,intensity')
    .eq('check_in_id', checkin.data.id)
  if (error || !data) return []

  return (data as RigaSegnale[]).map(sensazioneDaSegnale)
}
