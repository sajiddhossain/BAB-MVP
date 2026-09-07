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
  | 'cicloEta'
  | 'primoCiclo'
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
}

/** Meno di 18 anni compiuti oggi. Se la data non c'e' ancora, si assume di si'. */
export function minorenne(nascita: string): boolean {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(nascita.trim())
  if (!m) return true
  const [, g, me, a] = m
  const nato = new Date(Number(a), Number(me) - 1, Number(g))
  const diciotto = new Date(nato.getFullYear() + 18, nato.getMonth(), nato.getDate())
  return diciotto > new Date()
}

const haCiclo = (r: Risposte) => r.ciclo !== 'si'

export const PERCORSO: Passo[] = [
  { id: 'accesso', corpo: 'accesso', nodo: { it: '3771:2', en: '3958:461' }, fuoriPercorso: true },
  { id: 'link', corpo: 'link', nodo: { it: '3771:14', en: '3958:486' }, fuoriPercorso: true },
  { id: 'intro', corpo: 'intro', nodo: { it: '3771:39', en: '3958:323' }, fuoriPercorso: true },

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

  { id: 'ciclo', corpo: 'cicloSiNo', nodo: { it: '3772:241', en: '3958:769' } },
  { id: 'ciclo-date', corpo: 'cicloDate', nodo: { it: '3772:261', en: '3958:797' }, salta: haCiclo },
  { id: 'ciclo-eta', corpo: 'cicloEta', nodo: { it: '3871:2', en: '3958:1248' }, salta: haCiclo },
  {
    id: 'primo-ciclo',
    corpo: 'primoCiclo',
    nodo: { it: '3907:2', en: '3958:1308' },
    // ci si arriva solo da "non me lo ricordo" sullo schermo dell'eta'
    salta: (r) => r.ciclo !== 'si' || r.etaPrimoCiclo !== 'non-ricordo',
  },
  {
    id: 'contraccettivo',
    corpo: 'contraccettivo',
    nodo: { it: '3772:287', en: '3958:1437' },
    salta: haCiclo,
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
