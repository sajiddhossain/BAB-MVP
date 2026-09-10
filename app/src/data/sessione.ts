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
 * `nodo` e' il node-id Figma dello schermo italiano, e non cambia con la
 * lingua: serve solo a `Sfondo` come chiave delle macchie di decoro, che
 * sono le stesse su tutt'e due i frame. I testi, quelli si', cambiano — ma
 * stanno in `copy/sessione.ts`.
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
 * I tre livelli in cui stanno le sedici parole.
 *
 * Non e' una scala di gravita' e non e' una diagnosi: e' cosa il corpo sta
 * CHIEDENDO. `push` vuol dire che sta lavorando, `calibra` che chiede un
 * aggiustamento, `sostegno` che chiede aiuto a qualcuno.
 *
 * Prima di avere questo, lo schermo dei segnali sceglieva quale spiegazione
 * mettere per prima con un elenco di aggettivi deciso da noi. Questa
 * tassonomia viene dal disegno — e' la stessa che l'atleta vede scritta
 * sullo schermo delle sedici parole — e quindi quello che BAB mostra e
 * quello che BAB sa sono la stessa cosa.
 */
export const LIVELLI = ['push', 'calibra', 'sostegno'] as const
export type Livello = (typeof LIVELLI)[number]

export const LIVELLO_DI: Record<Parola, Livello> = {
  forte: 'push',
  leggero: 'push',
  indolenzito: 'push',
  teso: 'push',
  bruciante: 'push',

  sordo: 'calibra',
  rigido: 'calibra',
  crampo: 'calibra',
  morsa: 'calibra',
  pungente: 'calibra',

  trafittivo: 'sostegno',
  formicolante: 'sostegno',
  intorpidito: 'sostegno',
  instabile: 'sostegno',
  gonfio: 'sostegno',
  caldo: 'sostegno',
}

/** Le parole di un livello, nell'ordine in cui stanno sul disegno. */
export function paroleDi(livello: Livello): Parola[] {
  return PAROLE.filter((p) => LIVELLO_DI[p] === livello)
}

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

/*
 * Le tre domande che il disegno chiama "when".
 *
 * Non sono decorazione: sono quello che distingue un dolore che ha lavorato
 * da uno che protegge, e che nessuna parola da sola dice. Il check-in chiede
 * QUANDO la senti — mentre ti muovi, premendoci sopra, o anche stando ferma.
 * Il check-out ne chiede due: quando e' comparsa, e cosa le ha fatto la
 * sessione. Sono due giri diversi, quindi tre colonne diverse: una risposta
 * "e' rimasta uguale" non e' la stessa cosa di "la sento anche da ferma".
 *
 * I codici che finiscono nel database sono inglesi come tutto il resto dello
 * schema; qui restano italiani come gli id delle parole.
 */
export const QUANDO = ['muovo', 'premo', 'ferma'] as const
export type Quando = (typeof QUANDO)[number]
export const QUANDO_DB: Record<Quando, string> = {
  muovo: 'on_move',
  premo: 'on_press',
  ferma: 'at_rest',
}

export const COMPARSA = ['mattina', 'durante', 'dopo'] as const
export type Comparsa = (typeof COMPARSA)[number]
export const COMPARSA_DB: Record<Comparsa, string> = {
  mattina: 'this_morning',
  durante: 'during',
  dopo: 'after_stopping',
}

/*
 * La quarta risposta: prima della sessione quella sensazione non c'era.
 *
 * Le altre tre raccontano cos'e' successo a una cosa che c'era gia'. Se e'
 * nata durante l'allenamento nessuna delle tre e' vera, e prima di questa
 * quarta l'unico modo di dirlo era non rispondere — cioe' perdere il dato
 * proprio nel caso in cui e' piu' interessante.
 *
 * Non e' un doppione di `COMPARSA`, che chiede quando l'ha notata: li' la
 * risposta e' un momento, qui e' cos'ha fatto la sessione, e "l'ha fatta
 * nascere" e' una risposta a questa domanda, non a quella.
 */
export const EFFETTO = ['scaldata', 'uguale', 'peggio', 'nuova'] as const
export type Effetto = (typeof EFFETTO)[number]
export const EFFETTO_DB: Record<Effetto, string> = {
  scaldata: 'warmed_out',
  uguale: 'unchanged',
  peggio: 'worse',
  nuova: 'appeared_after',
}

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
 * Il nome visibile di una zona.
 *
 * I nomi stanno in `copy/sessione.ts` sotto `zone`, come tutte le altre
 * scritte: qui c'e' solo il modo di cercarli. Si passa la mappa invece di
 * leggerla da soli perche' e' la mappa gia' corretta dal pannello, e una
 * lettura diretta dal file compilato salterebbe le correzioni.
 *
 * Se una zona non ha nome — `bodyZones.ts` e' generato, e un giorno potrebbe
 * portarne una nuova — si ripiega sull'etichetta inglese generata. Meglio
 * "Right quad" in mezzo all'italiano che `front_quad_r`.
 */
const ETICHETTE: Record<string, string> = Object.fromEntries(
  [...FRONT_ZONES, ...BACK_ZONES].map((z) => [z.id, z.label]),
)

/** "Quadricipite destro", dal codice zona: `front_quad_r`. */
export function nomeCodice(codice: string, zone: Record<string, string>): string {
  return nomeZona(codice.split('_').slice(1).join('-'), zone)
}

/**
 * "Quadricipite destro", dall'id della zona: `quad-r`.
 *
 * Il nome non si tiene da parte insieme alla sensazione: e' l'unica cosa
 * della sensazione che cambia con la lingua, e tenerlo scritto vorrebbe dire
 * che chi cambia lingua a meta' giornata si ritrova il check-out che parla
 * del "quadricipite destro" in mezzo a una pagina inglese.
 */
export function nomeZona(id: string, zone: Record<string, string>): string {
  return zone[id] ?? ETICHETTE[id] ?? id
}

/** I passi che si vedono davvero, viste le risposte date finora. */
export function percorsoSessione(tipo: Tipo, d: Dati): PassoSessione[] {
  return PERCORSI[tipo].filter((p) => !p.salta?.(d))
}
