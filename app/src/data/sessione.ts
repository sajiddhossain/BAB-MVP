import type { Tempo } from './casa'
import type { Dati } from '../lib/sessione'
import { FRONT_ZONES, BACK_ZONES } from '../ui/bodyZones'

/**
 * Il check-in e il check-out, come dati.
 *
 * Stessa idea di `onboarding.ts`: una lista di passi, non una lista di
 * componenti. I due percorsi vivono nello stesso file perche' condividono
 * quasi tutto — il ritmo, i cursori, la mappa del corpo, il foglio delle
 * sensazioni — e tenerli separati vorrebbe dire scrivere due volte le stesse
 * cose e lasciarle divergere.
 *
 * `nodo` e' il node-id Figma dello schermo italiano. Gli inglesi non esistono
 * ancora: quando arriveranno, questo campo diventa `{ it, en }` come
 * nell'onboarding.
 */

export type Tipo = 'checkin' | 'checkout'

export type CorpoSessione =
  | 'ritmo'
  | 'sintonia'
  | 'mappa'
  | 'segnali'
  | 'sforzo'
  | 'soddisfazione'
  | 'energia'
  | 'rendiconto'

export type PassoSessione = {
  id: string
  corpo: CorpoSessione
  nodo: string
  /**
   * Vero = questo schermo non si vede, viste le risposte date finora. Come il
   * `salta` dell'onboarding: il percorso non e' fisso, dipende da cosa ha
   * risposto.
   */
  salta?: (d: Dati) => boolean
}

/**
 * Il check-in: cinque schermi prima dell'allenamento.
 *
 * L'ordine e' quello del disegno e non e' negoziabile: la previsione del
 * ritmo viene PRIMA di tutto il resto perche' e' una previsione. Se venisse
 * dopo i cursori e la mappa non sarebbe piu' una stima, sarebbe una somma —
 * e il confronto al check-out non direbbe piu' niente.
 */
export const CHECKIN: PassoSessione[] = [
  { id: 'ritmo', corpo: 'ritmo', nodo: '3967:1473' },
  { id: 'sintonia', corpo: 'sintonia', nodo: '3967:1517' },
  { id: 'mappa', corpo: 'mappa', nodo: '3967:1639' },
  /*
   * "Considera questi segnali" legge le sensazioni che ha appena messo sulla
   * mappa: senza nemmeno una, non ha segnali da considerare e il titolo
   * mentirebbe. Chi non sente niente finisce il check-in sulla mappa.
   */
  { id: 'segnali', corpo: 'segnali', nodo: '3967:1783', salta: (d) => d.sensazioni.length === 0 },
]

/** Il check-out: quello che si guarda indietro, dopo. */
export const CHECKOUT: PassoSessione[] = [
  { id: 'ritmo', corpo: 'ritmo', nodo: '3967:2238' },
  { id: 'sforzo', corpo: 'sforzo', nodo: '3967:1864' },
  { id: 'soddisfazione', corpo: 'soddisfazione', nodo: '3967:1903' },
  { id: 'energia', corpo: 'energia', nodo: '3967:2005' },
  { id: 'mappa', corpo: 'mappa', nodo: '3967:2041' },
  { id: 'rendiconto', corpo: 'rendiconto', nodo: '3967:2184' },
]

export const PERCORSI: Record<Tipo, PassoSessione[]> = {
  checkin: CHECKIN,
  checkout: CHECKOUT,
}

/*
 * I tre ritmi.
 *
 * I nomi sono quelli della home — Carica, Costante, Leggero — e non quelli
 * dei frame nuovi (Scattante, Stabile, Tranquillo): sono la stessa cosa detta
 * in due modi, e averne uno solo conta piu' che seguire il disegno alla
 * lettera. Nel database sono `upbeat`/`steady`/`gentle`, che e' un terzo modo
 * ancora, ma quello non lo legge nessuna.
 */
export const RITMI: { id: Tempo; icona: string; db: 'upbeat' | 'steady' | 'gentle' }[] = [
  { id: 'carica', icona: 'tempo-scattante', db: 'upbeat' },
  { id: 'costante', icona: 'tempo-stabile', db: 'steady' },
  { id: 'leggero', icona: 'tempo-tranquillo', db: 'gentle' },
]

/**
 * Le sedici parole per dire cosa si sente.
 *
 * L'ordine e' quello del foglio, che non e' alfabetico: parte dalle parole
 * che quasi sempre vanno bene (forte, leggero, indolenzito) e scende verso
 * quelle che vanno guardate (trafittivo, instabile). Chi apre il foglio e
 * prende la prima che le somiglia finisce quasi sempre nella meta' giusta.
 *
 * `id` e' il codice che finisce nel database e non cambia mai; il testo
 * italiano sta in `copy/sessione.ts` insieme a tutto il resto.
 */
export const PAROLE = [
  'forte',
  'leggero',
  'indolenzito',
  'sordo',
  'teso',
  'rigido',
  'pungente',
  'trafittivo',
  'crampo',
  'morsa',
  'bruciante',
  'formicolante',
  'intorpidito',
  'instabile',
  'gonfio',
  'caldo',
] as const
export type Parola = (typeof PAROLE)[number]

/**
 * Le parole che, da sole, non bastano piu': quando compaiono, lo schermo dei
 * segnali mette in evidenza il dolore protettivo invece di quello da
 * affaticamento.
 *
 * Non e' una diagnosi ed e' scritto negli schermi: e' il criterio con cui
 * BAB decide QUALE delle due spiegazioni mettere per prima.
 */
export const PAROLE_DA_GUARDARE: Parola[] = ['trafittivo', 'pungente', 'instabile', 'intorpidito']

/** Le cinque facce della soddisfazione, dalla meno alla piu' contenta. */
export const FACCE = [
  { id: 'disappointed', icona: 'faccia-delusa' },
  { id: 'frustrated', icona: 'faccia-frustrata' },
  { id: 'satisfied', icona: 'faccia-soddisfatta' },
  { id: 'confident', icona: 'faccia-fiera' },
  { id: 'proud', icona: 'faccia-orgogliosa' },
] as const
export type Faccia = (typeof FACCE)[number]['id']

/** Le cinque cose che si possono portare a casa. La sesta la scrive lei. */
export const BOTTINO = ['imparato', 'ascoltato', 'aiutato', 'gentile', 'eseguito'] as const
export type Bottino = (typeof BOTTINO)[number]

/** Le fasce di ore dormite, come stanno sul disegno. */
export const ORE_SONNO = ['<6h', '6-7h', '7-8h', '8h+'] as const
export type OreSonno = (typeof ORE_SONNO)[number]

/*
 * ── LE ZONE DEL CORPO ───────────────────────────────────────────────────────
 *
 * `bodyZones.ts` ha 33 zone davanti e 33 dietro, ma DICIANNOVE id compaiono
 * in tutte e due: `knee-l` e' il ginocchio davanti E il ginocchio dietro.
 * Salvare solo l'id perderebbe il lato in cui l'ha toccata, che e' quasi
 * tutta l'informazione — un ginocchio che fa male davanti e uno che fa male
 * dietro non sono lo stesso problema.
 *
 * Quindi il codice che finisce nel database e' sempre lato + zona, con gli
 * underscore che usa il resto dello schema: `front_knee_l`, `back_ham_r`.
 */
export type Lato = 'front' | 'back'

export function codiceZona(lato: Lato, id: string): string {
  return `${lato}_${id.replace(/-/g, '_')}`
}

export const ZONE = { front: FRONT_ZONES, back: BACK_ZONES } as const

/*
 * I nomi italiani delle zone.
 *
 * `bodyZones.ts` e' generato e ha le etichette in inglese: qui si ricostruisce
 * il nome dalla radice dell'id piu' il lato, invece di elencare 66 stringhe a
 * mano. Il genere serve perche' in italiano "destro" cambia con il nome: il
 * quadricipite destro, la coscia posteriore destra.
 */
type Genere = 'm' | 'f' | 'mp' | 'fp'

const NOMI: Record<string, [string, Genere]> = {
  head: ['Collo e testa', 'f'],
  trap: ['Trapezio', 'm'],
  shoulder: ['Spalla', 'f'],
  chest: ['Petto', 'm'],
  upperarm: ['Braccio', 'm'],
  ribs: ['Costole', 'fp'],
  elbow: ['Gomito', 'm'],
  abs: ['Addominali', 'mp'],
  forearm: ['Avambraccio', 'm'],
  hip: ['Anca', 'f'],
  wrist: ['Polso', 'm'],
  hand: ['Mano', 'f'],
  quad: ['Quadricipite', 'm'],
  knee: ['Ginocchio', 'm'],
  shin: ['Tibia', 'f'],
  ankle: ['Caviglia', 'f'],
  foot: ['Piede', 'm'],
  upperback: ['Schiena alta', 'f'],
  midback: ['Schiena media', 'f'],
  lowback: ['Zona lombare', 'f'],
  glute: ['Gluteo', 'm'],
  ham: ['Coscia posteriore', 'f'],
  calf: ['Polpaccio', 'm'],
  heel: ['Tallone', 'm'],
}

const DESTRO: Record<Genere, string> = { m: 'destro', f: 'destra', mp: 'destri', fp: 'destre' }
const SINISTRO: Record<Genere, string> = {
  m: 'sinistro',
  f: 'sinistra',
  mp: 'sinistri',
  fp: 'sinistre',
}

/** "Quadricipite destro". Senza lato per la testa, che di lati non ne ha. */
export function nomeZona(id: string): string {
  const [radice, lato] = id.split('-')
  const voce = NOMI[radice]
  if (!voce) return id
  const [nome, genere] = voce
  if (lato === 'r') return `${nome} ${DESTRO[genere]}`
  if (lato === 'l') return `${nome} ${SINISTRO[genere]}`
  return nome
}

/** I passi che si vedono davvero, viste le risposte date finora. */
export function percorsoSessione(tipo: Tipo, d: Dati): PassoSessione[] {
  return PERCORSI[tipo].filter((p) => !p.salta?.(d))
}
