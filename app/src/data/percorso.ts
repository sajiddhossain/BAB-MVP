import type { Livello, Parola } from './sessione'

/**
 * Il percorso: sedici parole, otto lezioni, quattro unita'.
 *
 * ── COSA C'E' QUI E COSA NO ────────────────────────────────────────────────
 * Qui c'e' solo la FORMA: quali parole stanno in quale lezione, quali lezioni
 * in quale unita', quali esercizi in quale ordine, e — dentro a ogni
 * esercizio — qual e' la risposta giusta. Le parole che si leggono a schermo
 * stanno in `copy/percorso.ts`, come per tutto il resto dell'app, cosi' si
 * cambiano dal pannello senza toccare codice.
 *
 * La riga di confine e' questa: se cambiandolo cambia quello che l'app
 * CONSIDERA giusto, sta qui; se cambia solo quello che si legge, sta nei
 * testi. Un indice non e' una scritta, e nel pannello non deve comparire.
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

/** Le icone che compaiono dentro alle lezioni, da `assets/percorso/`. */
export type IconaLezione =
  | 'manubrio'
  | 'piuma'
  | 'fulmine'
  | 'battito'
  | 'bicipite'
  | 'onde'
  | 'frecce'
  | 'cerniera'

/**
 * I due impaginati.
 *
 * In Figma la lezione 1 (i frame senza prefisso) e le lezioni 2-8 (`bl-l2-*`
 * e seguenti) sono disegnate in due modi diversi: schede centrate contro
 * schede orizzontali, l'abbinamento con le icone contro l'abbinamento a
 * righe, uno schermo finale con la scheda del progresso contro uno con la
 * barra. Non e' una differenza di contenuto, e' proprio un altro impaginato
 * per gli stessi sei esercizi.
 *
 * Li teniamo tutti e due, come sta nel file. `veste` dice quale.
 */
export type Veste = 'uno' | 'classico'

/*
 * ── PERCHE' OGNI ESERCIZIO HA UNA `forma` ──────────────────────────────────
 * Perche' in Figma ogni lezione e' disegnata a se'. Lo schermo finale esiste
 * in cinque versioni, l'abbinamento in tre, lo scenario in quattro. Non e'
 * una svista: e' un file cresciuto una lezione alla volta.
 *
 * `forma` dice quale versione, e i componenti hanno un ramo per ognuna. E'
 * piu' onesto di trenta file quasi uguali, e quando due lezioni finiranno
 * per assomigliarsi davvero, condivideranno un ramo invece di due copie.
 */

/**
 * I riquadri sotto alla scheda-parola, nella veste classica.
 *
 * Cambiano da schermo a schermo: la prima parola della lezione 2 ha una nota
 * sciolta e un riquadro con la pastiglia, la seconda ha un riquadro titolato
 * ("QUAL E' LA DIFFERENZA?") e uno con la riga di colore. Il tipo sta qui
 * perche' e' forma; cosa c'e' scritto dentro sta nei testi.
 */
export type Blocco =
  /** un paragrafo sciolto, senza riquadro */
  | 'nota'
  /** un riquadro con la pastiglia del livello e il testo sotto */
  | 'pastiglia'
  /** un riquadro con un'etichetta in maiuscolo e il testo sotto */
  | 'titolato'
  /** un riquadro con la riga di colore a sinistra */
  | 'accento'

/**
 * Un esercizio, con quello che serve per correggerlo.
 *
 * `giusta` e' sempre un indice o un identificativo, mai un testo: cosi' chi
 * riscrive una risposta dal pannello non puo' spostare per sbaglio qual e'
 * quella giusta.
 */
export type Passo =
  /** conosci la parola: la scheda grande, una per volta */
  | { tipo: 'incontra'; parola: Parola; icona: IconaLezione; blocchi: Blocco[] }
  /**
   * abbina ogni parola alla sua immagine.
   *
   * `giusta` e' l'indice nel cesto, oppure `null` per le righe che nella
   * lezione non hanno nessuna parola giusta — sono la meta' dell'esercizio:
   * imparare a NON usare una parola che non c'entra.
   *
   * Il cesto e' `parole` (che prendono il nome da quello dell'app) piu'
   * `esche` pastiglie che esistono solo nei testi, e quindi non vanno da
   * nessuna parte.
   */
  | {
      tipo: 'abbina'
      /**
       * `icone`   le righe hanno il cerchio con l'icona, e il cesto e' una
       *           scheda semplice (lezione 1)
       * `largo`   righe senza icone, casella larga, cesto dentro a una scheda
       *           con la riga di colore e l'aiuto in fondo (lezione 2)
       * `stretto` righe senza icone, casella piccola come una pastiglia, e il
       *           cesto e' solo un'etichetta con sotto le parole (lezione 3)
       */
      forma: 'icone' | 'largo' | 'stretto'
      /** l'icona c'e' solo nella forma `icone` */
      righe: { icona?: IconaLezione; giusta: number | null }[]
      parole: Parola[]
      esche: number
    }
  /**
   * Due parole che si somigliano, o uno scenario di vita vera.
   *
   * `forma` dice come si presenta lo scenario: come titolo grosso, dentro a
   * una scheda, come testo sciolto, o dentro a una scheda che si porta
   * dentro anche la pastiglia.
   */
  | { tipo: 'gemelle'; forma: FormaScenario; risposte: Parola[]; giusta: number }
  | { tipo: 'storia'; forma: FormaScenario; risposte: Parola[]; giusta: number }
  /** cosa fai adesso: e' il segnale che decide, non la parola */
  | { tipo: 'mossa'; giusta: Livello }
  /**
   * La bandiera rossa: certe parole vanno dette a un adulto, subito.
   *
   * Non e' un esercizio — non c'e' niente da rispondere. E' l'unico schermo
   * del percorso che esiste per essere letto e basta, e sta solo dove il
   * disegno lo mette: dopo le parole che possono voler dire che serve
   * qualcuno.
   */
  | { tipo: 'allarme'; parola: Parola }
  /**
   * completa la frase.
   *
   * Quanti buchi ci sono e cosa ci va NON sta qui: sta nel modello, dove i
   * buchi si scrivono `{forte}` col nome della parola giusta dentro. E'
   * l'unico modo in cui l'italiano puo' avere due buchi e l'inglese uno —
   * come succede, perche' le due frasi vengono da due disegni diversi.
   */
  | {
      tipo: 'frase'
      /**
       * `scheda` la frase e la nota dentro alla stessa scheda (lezioni 1 e 2)
       * `intro`  una riga sopra alla scheda, e dentro solo la frase (lezione 3)
       */
      forma: 'scheda' | 'intro'
      /**
       * Le pastiglie, nell'ordine in cui stanno nel disegno.
       *
       * Una pastiglia e' una parola dell'app — e allora il nome lo prende da
       * li' — oppure un'esca scritta nei testi. Dalla terza lezione le esche
       * non sono piu' parole singole ma pezzi di frase ("entrambe le
       * caviglie"), e servono a comporre una frase intera invece di
       * riempire un buco solo.
       */
      cesto: ({ parola: Parola } | { esca: number })[]
    }
  /**
   * La lezione e' finita.
   *
   * `stat`      la coppa in un cerchio sfumato e la scheda del progresso
   *             (lezione 1)
   * `scintilla` la scintilla, le due parole come pastiglie e la barra
   *             (lezione 2)
   * `coppa`     la coppa piccola in alto a sinistra e gli otto pallini
   *             U1..U8 (lezione 3)
   */
  | { tipo: 'fatto'; forma: 'stat' | 'scintilla' | 'coppa' }

/** Come si presenta lo scenario di uno schermo a scelta multipla. */
export type FormaScenario =
  /** grosso come un titolo, senza scheda */
  | 'titolo'
  /** dentro a una scheda bianca con la riga di colore */
  | 'carta'
  /** testo sciolto sotto alla pastiglia */
  | 'testo'
  /** dentro a una scheda che contiene anche la pastiglia */
  | 'zona'

export type Lezione = {
  /** da 1 a 8 */
  numero: number
  /** le due parole, con l'identificativo che hanno gia' nel check-in */
  parole: [Parola, Parola]
  /** quale dei due impaginati usa */
  veste: Veste
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
  { numero: 1, parole: ['forte', 'leggero'], veste: 'uno' },
  { numero: 2, parole: ['indolenzito', 'sordo'], veste: 'classico' },
  { numero: 3, parole: ['teso', 'rigido'], veste: 'classico' },
  { numero: 4, parole: ['crampo', 'morsa'], veste: 'classico' },
  { numero: 5, parole: ['pungente', 'trafittivo'], veste: 'classico' },
  { numero: 6, parole: ['bruciante', 'formicolante'], veste: 'classico' },
  { numero: 7, parole: ['intorpidito', 'instabile'], veste: 'classico' },
  { numero: 8, parole: ['gonfio', 'caldo'], veste: 'classico' },
]

/** L'impaginato di una lezione. */
export function vesteDi(numero: number): Veste {
  return LEZIONI.find((l) => l.numero === numero)?.veste ?? 'classico'
}

/**
 * Gli esercizi di ogni lezione, nell'ordine del disegno.
 *
 * L'ordine viene dalla barra di avanzamento dei frame: si conoscono le due
 * parole, si abbinano, si distinguono l'una dall'altra, si riconoscono in uno
 * scenario, si decide cosa fare, si scrive la frase, e si e' finito.
 *
 * ── PERCHE' SOLO LA PRIMA ──────────────────────────────────────────────────
 * Una lezione senza questa tabella non si apre: nel percorso resta segnata
 * "in arrivo" e non si tocca. E' meglio di una lezione vuota che si apre e
 * non ha niente dentro — e vuol dire che le prossime sette si aggiungono qui,
 * senza toccare una riga di codice del riproduttore.
 */
export const PASSI: Record<number, Passo[]> = {
  1: [
    { tipo: 'incontra', parola: 'forte', icona: 'manubrio', blocchi: ['pastiglia'] },
    { tipo: 'incontra', parola: 'leggero', icona: 'piuma', blocchi: ['titolato'] },
    {
      tipo: 'abbina',
      righe: [
        { icona: 'manubrio', giusta: 0 },
        { icona: 'piuma', giusta: 1 },
        /* la scarica elettrica e il battito calmo sono di lezioni che non ha
           ancora fatto: qui non ci va niente, ed e' il punto */
        { icona: 'fulmine', giusta: null },
        { icona: 'battito', giusta: null },
      ],
      parole: ['forte', 'leggero'],
      esche: 1,
      forma: 'icone',
    },
    { tipo: 'gemelle', forma: 'titolo', risposte: ['forte', 'leggero'], giusta: 0 },
    { tipo: 'storia', forma: 'carta', risposte: ['leggero', 'forte', 'indolenzito', 'sordo'], giusta: 0 },
    { tipo: 'mossa', giusta: 'calibra' },
    {
      tipo: 'frase',
      forma: 'scheda',
      cesto: [{ parola: 'forte' }, { parola: 'leggero' }, { esca: 0 }, { esca: 1 }],
    },
    { tipo: 'fatto', forma: 'stat' },
  ],

  2: [
    { tipo: 'incontra', parola: 'indolenzito', icona: 'bicipite', blocchi: ['nota', 'pastiglia'] },
    { tipo: 'incontra', parola: 'sordo', icona: 'onde', blocchi: ['titolato', 'accento'] },
    {
      /*
       * Qui non ci sono esche e nessuna riga resta vuota: le quattro parole
       * sono le due di oggi piu' le due della lezione 1. E' il primo ripasso
       * che il percorso fa, ed e' il disegno a chiederlo.
       */
      tipo: 'abbina',
      righe: [{ giusta: 0 }, { giusta: 1 }, { giusta: 2 }, { giusta: 3 }],
      parole: ['indolenzito', 'sordo', 'forte', 'leggero'],
      esche: 0,
      forma: 'largo',
    },
    { tipo: 'gemelle', forma: 'testo', risposte: ['indolenzito', 'sordo'], giusta: 0 },
    { tipo: 'storia', forma: 'testo', risposte: ['indolenzito', 'sordo', 'forte'], giusta: 1 },
    { tipo: 'mossa', giusta: 'calibra' },
    {
      tipo: 'frase',
      forma: 'scheda',
      cesto: [{ parola: 'indolenzito' }, { parola: 'sordo' }, { esca: 0 }, { esca: 1 }],
    },
    { tipo: 'fatto', forma: 'scintilla' },
  ],

  3: [
    { tipo: 'incontra', parola: 'teso', icona: 'frecce', blocchi: ['nota', 'pastiglia'] },
    { tipo: 'incontra', parola: 'rigido', icona: 'cerniera', blocchi: ['accento', 'pastiglia'] },
    {
      /* si ripassano anche le due parole della lezione 2 */
      tipo: 'abbina',
      forma: 'stretto',
      righe: [{ giusta: 0 }, { giusta: 1 }, { giusta: 2 }, { giusta: 3 }],
      parole: ['teso', 'rigido', 'indolenzito', 'sordo'],
      esche: 0,
    },
    { tipo: 'gemelle', forma: 'testo', risposte: ['teso', 'rigido'], giusta: 0 },
    { tipo: 'storia', forma: 'zona', risposte: ['teso', 'rigido'], giusta: 1 },
    { tipo: 'mossa', giusta: 'calibra' },
    {
      /*
       * Tre buchi, e due su tre non sono parole del vocabolario ma pezzi di
       * frase: e' il primo esercizio in cui non si sceglie una parola, si
       * scrive un referto.
       */
      tipo: 'frase',
      forma: 'intro',
      cesto: [{ esca: 0 }, { parola: 'rigido' }, { esca: 1 }],
    },
    { tipo: 'fatto', forma: 'coppa' },
  ],
}

/** Gli esercizi di una lezione, o niente se non e' ancora stata scritta. */
export function passiDi(numero: number): Passo[] | null {
  return PASSI[numero] ?? null
}

/** Vero se la lezione ha un contenuto e quindi si puo' aprire. */
export function lezionePronta(numero: number): boolean {
  return passiDi(numero) !== null
}

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

/**
 * Le tinte delle carte-risposta, nell'ordine in cui compaiono.
 *
 * Nel disegno il cerchio della lettera e il bordo della carta hanno due
 * tinte leggermente diverse su alcune carte. Qui e' una sola: sono due
 * sfumature dello stesso colore, e tenerle separate vorrebbe dire due
 * tabelle da tenere allineate a mano per una differenza che non si vede.
 */
export const TINTE_RISPOSTA = ['#ffd1c1', '#e9d5ff', '#e9d5ff', '#d1fae5']

/** Tutte le parole del percorso, nell'ordine in cui si sbloccano. */
export function paroleInOrdine(): Parola[] {
  return LEZIONI.flatMap((l) => l.parole)
}

/** In che lezione si sblocca una parola. */
export function lezioneDi(parola: Parola): number | null {
  return LEZIONI.find((l) => l.parole.includes(parola))?.numero ?? null
}
