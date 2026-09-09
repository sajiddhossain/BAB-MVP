import type { Risposte } from '../lib/risposte'

/**
 * Il percorso dell'onboarding.
 *
 * Non e' una lista di componenti: e' una lista di domande. Ogni schermo del
 * file Figma ha lo stesso guscio — barra, occhiello, titolo, occhio, corpo,
 * bottone — e cambia solo il corpo. Tenerli come dati invece che come 24
 * file di JSX e' quello che permette di aggiungere una domanda, o di
 * cambiarne l'ordine, senza toccare il codice degli schermi.
 *
 * `nodo` sono i due node-id di Figma, uno per lingua: servono a ritrovare le
 * macchie di sfondo di quello schermo e a risalire al disegno originale.
 */
export type Corpo =
  | 'accesso'
  | 'link'
  | 'intro'
  | 'nome'
  | 'compleanno'
  | 'sport'
  | 'allenamenti'
  | 'edFisica'
  | 'gare'
  | 'cicloSiNo'
  | 'cicloDate'
  | 'contraccettivo'
  | 'riepilogo'
  | 'consenso'

export type Passo = {
  id: string
  corpo: Corpo
  nodo: { it: string; en: string }
  /** vero = questo schermo non si vede, con le risposte date finora */
  salta?: (r: Risposte) => boolean
  /** vero = lo schermo non ha la barra dell'avanzamento (sta prima del percorso) */
  fuoriPercorso?: boolean
  /**
   * Il frame Figma della stessa domanda una volta aperta, dove ce n'e' uno.
   * Serve solo alle macchie di sfondo, che nel disegno cambiano fra i due
   * stati: sta qui e non nel componente perche' gli id di Figma vivono
   * tutti in questo file.
   */
  nodoAperto?: { it: string; en: string }
}

/**
 * Ha compiuto `anni` anni, oggi?
 *
 * Compiuti davvero: chi li fa domani non li ha. `null` quando la data non
 * c'e' o non si legge — e' diverso da "no", e chi chiama decide cosa farne.
 * Prima erano due funzioni con dentro lo stesso conto e due numeri diversi.
 */
export function haCompiuto(nascita: string, anni: number): boolean | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(nascita.trim())
  if (!m) return null
  const [, g, me, a] = m
  const nato = new Date(Number(a), Number(me) - 1, Number(g))
  const compleanno = new Date(nato.getFullYear() + anni, nato.getMonth(), nato.getDate())
  return compleanno <= new Date()
}

/** Meno di 18 anni compiuti oggi. Se la data non c'e' ancora, si assume di si'. */
export function minorenne(nascita: string): boolean {
  return haCompiuto(nascita, 18) !== true
}

/**
 * BAB parte dai 12 anni: il limite sta anche nel database, quindi se lo
 * lasciassimo solo alla UI l'inserimento fallirebbe con un errore che non
 * vuol dire niente per chi lo legge.
 */
export function abbastanzaGrande(nascita: string): boolean {
  return haCompiuto(nascita, 12) === true
}

const haCiclo = (r: Risposte) => r.ciclo !== 'si'

/*
 * Il contraccettivo si chiede solo da 16 anni compiuti in su.
 *
 * Non e' pudore: e' che sotto quell'eta' la domanda arriva prima che serva, a
 * qualcuna che nella maggior parte dei casi non ha niente da rispondere, e
 * una domanda sanitaria a cui non si sa rispondere fa venire voglia di
 * chiudere l'app. Chi li compie dopo la trovera' quando sara' il momento.
 *
 * `!== true` e non `=== false`: con la data mancante o scritta storta
 * `haCompiuto` dice `null`, e in quel caso la domanda si salta. Chiederla a
 * una dodicenne per colpa di una data che non si legge e' l'errore peggiore
 * dei due.
 */
const troppoGiovane = (r: Risposte) => haCompiuto(r.nascita, 16) !== true

export const PERCORSO: Passo[] = [
  { id: 'accesso', corpo: 'accesso', nodo: { it: '3771:2', en: '3958:461' }, fuoriPercorso: true },
  { id: 'link', corpo: 'link', nodo: { it: '3771:14', en: '3958:486' }, fuoriPercorso: true },
  { id: 'intro', corpo: 'intro', nodo: { it: '3771:39', en: '3975:2524' }, fuoriPercorso: true },

  { id: 'nome', corpo: 'nome', nodo: { it: '3771:104', en: '3958:567' } },
  { id: 'compleanno', corpo: 'compleanno', nodo: { it: '3771:122', en: '3958:592' } },
  { id: 'sport', corpo: 'sport', nodo: { it: '3771:140', en: '3958:616' } },
  {
    id: 'allenamenti',
    corpo: 'allenamenti',
    nodo: { it: '3771:160', en: '3958:641' },
    salta: (r) => r.sport.length === 0,
  },
  { id: 'ed-fisica', corpo: 'edFisica', nodo: { it: '3772:193', en: '3958:709' } },
  { id: 'gare', corpo: 'gare', nodo: { it: '3772:223', en: '3958:745' } },

  {
    id: 'ciclo',
    corpo: 'cicloSiNo',
    nodo: { it: '3772:241', en: '3958:769' },
    nodoAperto: { it: '3907:2', en: '3958:1308' },
  },
  /*
   * 13b-first-period-date (3907:2) non e' un passo: e' questa stessa domanda
   * con la prima carta aperta. Si tocca "si'" e la carta diventa il modulo
   * del mese e dell'anno, senza cambiare schermo ne' far salire la barra —
   * e' un frame solo, e la barra sale quando la domanda e' finita.
   *
   * 13-cycle-age (3871:2) chiedeva la stessa cosa come numero di anni. Resta
   * in Figma ma non nel percorso: mese e anno sono piu' facili da rispondere
   * di un'eta' che va ricordata a mente.
   */
  { id: 'ciclo-date', corpo: 'cicloDate', nodo: { it: '3772:261', en: '3958:797' }, salta: haCiclo },
  {
    id: 'contraccettivo',
    corpo: 'contraccettivo',
    nodo: { it: '3772:287', en: '3958:1437' },
    salta: (r) => haCiclo(r) || troppoGiovane(r),
  },

  { id: 'riepilogo', corpo: 'riepilogo', nodo: { it: '3772:308', en: '3958:853' } },
  {
    id: 'consenso',
    corpo: 'consenso',
    nodo: { it: '3771:81', en: '3958:538' },
    salta: (r) => !minorenne(r.nascita),
  },
]

/** Gli schermi che si vedono davvero, viste le risposte date finora. */
export function percorsoVisibile(r: Risposte): Passo[] {
  return PERCORSO.filter((p) => !p.salta?.(r))
}
