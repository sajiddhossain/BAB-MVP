import type { Livello } from '../data/sessione'
/**
 * Le parole del percorso.
 *
 * ── L'INGLESE VIENE DAL DISEGNO, L'ITALIANO ANCHE ──────────────────────────
 * Questa e' la prima parte dell'app disegnata in tutte e due le lingue: i 69
 * frame esistono due volte, una volta in italiano e una in inglese. Quindi
 * qui non c'e' quasi niente di tradotto da noi — c'e' quello che c'e' scritto
 * in Figma, da una parte e dall'altra.
 *
 * Le due versioni NON dicono la stessa cosa. L'inglese e' piu' asciutto
 * ("Strong is loud and yours"), l'italiano piu' didattico. Non le abbiamo
 * allineate: allinearle vuol dire scegliere quale delle due buttare, e non e'
 * una decisione da prendere mentre si scrive codice.
 *
 * ── COSA ABBIAMO SCRITTO NOI ───────────────────────────────────────────────
 * Va riletto prima del pilota:
 *
 * 1. `comune`: verifica, continua, giusto, non ancora. In Figma non ci sono
 *    perche' i frame mostrano un solo stato per schermo.
 * 2. I nomi delle parole dentro alle frasi sono buchi — `{uno}`, `{due}`,
 *    `{forte}` — e non le parole inglesi che ci sono nei frame italiani. La'
 *    si legge 'Usa "strong" quando...', ma nell'app italiana quella parola si
 *    chiama "forte": lasciarla in inglese vorrebbe dire che la lezione
 *    insegna una parola e il check-in ne chiede un'altra. Dove la parola
 *    entra in una frase italiana sta fra virgolette basse, perche' "le gambe
 *    erano leggero" non e' italiano e "«leggero»" invece si legge.
 * 3. Gli occhielli rimasti in inglese nei frame italiani: "YOUR MOVE",
 *    "REAL LIFE".
 * 4. La frase da comporre della lezione 2 in italiano: in Figma e' la stessa
 *    identica della lezione 1 e parla di correre, non di indolenzimento.
 *    Riscritta sul modello di quella inglese.
 * 5. Le note sotto alle mosse in italiano, dove Figma ripeteva due volte la
 *    stessa frase.
 * 6. Le frasi da comporre delle lezioni 3, 4 e 8, in tutte e due le lingue.
 *    Il tassello e' la parola dell'app, che non si piega: "sento entrambe le
 *    caviglie rigido", "my both ankles" e "le caviglie gonfie" col tassello
 *    che dice "gonfio" non stanno in piedi. Riscritte perche' il buco cada
 *    dove la parola ci entra com'e'.
 * 7. Il riscontro della storia della lezione 8 in italiano. Nel frame dice
 *    due cose opposte: prima spiega che il gonfiore da tutte e due le parti
 *    prima del ciclo e' normale, e subito dopo che la risposta giusta e'
 *    "trauma articolare unilaterale". La scena raccontata e' bilaterale e
 *    ciclica, quindi la risposta giusta e' «gonfio»: insegnare il contrario
 *    manderebbe un'atleta dal medico per una cosa che le succede ogni mese,
 *    e le farebbe ignorare la cosa da guardare davvero — una caviglia sola,
 *    dopo un colpo. VA RILETTO DA CHI SCRIVE I CONTENUTI PRIMA DEL PILOTA.
 *
 * ── I NOMI DELLE UNITA' NON DICONO LE PAROLE ───────────────────────────────
 * Sotto a ogni unita' il disegno elenca le sue quattro parole
 * ("forte • leggero / indolenzito • affaticato"). Quelle NON stanno qui: si
 * costruiscono dalle sedici parole che l'app ha gia', cosi' cambiandone una
 * cambia in tutti e due i posti invece che in uno solo.
 */

/**
 * Un riquadro sotto alla scheda-parola.
 *
 * Che forma ha — nota sciolta, riquadro titolato, riquadro con la pastiglia —
 * lo dice `blocchi` in `data/percorso.ts`: qui c'e' solo cosa c'e' scritto.
 */
export type BloccoTesto = {
  /** l'etichetta in maiuscolo sopra al testo, dove il riquadro ce l'ha */
  etichetta?: string
  /**
   * La pastiglia colorata in alto a destra.
   *
   * Vuota o assente vuol dire "il nome del livello": e' quello che fa la
   * lezione 1, dove la pastiglia dice "Spingi" ed e' la stessa parola che
   * l'atleta vede sulle sedici schede. La lezione 2 in inglese invece ci
   * scrive una frase, e allora vince quella.
   */
  pastiglia?: string
  testo: string
}

export type TestiIncontra = {
  /** la riga sopra all'occhiello ("BODY LANGUAGE"): ce l'hanno solo alcune lezioni */
  sopra?: string
  occhiello: string
  /** il titolo sopra alla scheda: ce l'ha solo la veste delle lezioni 2-8 */
  titolo?: string
  metafora: string
  descrizione: string
  /** la frase citata sotto alla riga: ce l'ha solo la veste della lezione 1 */
  citazione?: string
  blocchi: BloccoTesto[]
  azione: string
}

/**
 * I testi di una lezione.
 *
 * Il tipo e' scritto a mano invece di essere dedotto dall'italiano perche'
 * le lezioni non hanno tutte le stesse parti — la bandiera rossa c'e' solo
 * in due, l'occhiello dell'abbinamento solo nella veste classica — e con un
 * tipo dedotto la prima lezione scritta avrebbe deciso la forma di tutte.
 */
export type ContenutoLezione = {
  incontra: TestiIncontra[]

  abbina: {
    sopra?: string
    occhiello?: string
    titolo: string
    /** la riga fra il titolo e le righe, dove c'e' */
    intro?: string
    cesto: string
    /** la riga sotto al cesto; assente vuol dire quella di `comune` */
    aiuto?: string
    righe: string[]
    esche: string[]
    azione: string
  }

  gemelle: {
    sopra?: string
    occhiello: string
    /** il titolo sopra allo scenario: ce l'ha solo la veste classica */
    titolo?: string
    badge: string
    scenario: string
    domanda: string
    /** una riga per risposta, mostrata dopo la verifica */
    glosse: string[]
    /**
     * Cosa c'e' scritto sulle carte, quando non e' la parola.
     *
     * Dalla terza lezione le risposte sono frasi intere ("Sofia si sente
     * «rigido»") invece di una parola sola. Dove manca, la carta dice il nome
     * della parola, che e' quello che l'app sa gia'.
     */
    etichette?: string[]
    /**
     * Quale risposta e' quella giusta, quando non e' la stessa nelle due
     * lingue.
     *
     * Di norma questo sta nei dati e non nei testi: un indice non e' una
     * scritta. Ma dalla lezione 4 le due versioni del file raccontano due
     * scene diverse — la risata che scuote la pancia da una parte, il gluteo
     * che non molla dall'altra — e la risposta giusta cambia con la scena.
     * Tenerne una sola vorrebbe dire buttare una delle due scene.
     *
     * Dove manca, vale quella dei dati.
     */
    giusta?: number
    esito: string
    azione: string
  }

  storia: {
    sopra?: string
    occhiello: string
    titolo?: string
    badge: string
    scenario: string
    domanda: string
    etichette?: string[]
    /** vedi `gemelle.giusta` */
    giusta?: number
    esito: string
    azione: string
  }

  mossa: {
    sopra?: string
    occhiello: string
    titolo: string
    /** la pastiglia e lo scenario sopra alle tre carte: solo veste classica */
    badge?: string
    scenario?: string
    /** una riga per mossa, nell'ordine spingi / calibra / sostegno */
    scelte: string[]
    /** cosa c'e' scritto sulle carte, quando non e' il nome del livello */
    etichette?: string[]
    /** la mossa giusta, dove le due lingue non scelgono la stessa — vedi `gemelle.giusta` */
    giusta?: Livello
    esito: string
    /** la riga sotto alle tre carte, dove c'e' */
    nota?: string
    azione: string
  }

  /** la bandiera rossa: c'e' solo dove il disegno la mette */
  allarme?: {
    occhiello: string
    titolo: string
    intestazione: string
    testo: string
    /** il riquadro con dentro cosa fare adesso */
    dafare: string
    /** la riga sotto alla scheda rossa, dove c'e' */
    nota?: string
    azione: string
  }

  frase: {
    sopra?: string
    occhiello: string
    titolo: string
    /** l'etichetta dentro alla scheda, dove c'e' */
    etichetta?: string
    /** un'intestazione per buco: ce l'ha solo la forma `schema` */
    etichette?: string[]
    /** la riga sopra alla scheda, dove la nota non sta dentro */
    intro?: string
    cesto: string
    /**
     * I buchi si scrivono `{forte}` col nome della parola giusta, oppure
     * `{0}` col numero della pastiglia. Il nome quando si puo', perche' si
     * legge; il numero per i pezzi di frase, che una parola non ce l'hanno.
     */
    modello: string
    nota?: string
    esche: string[]
    azione: string
  }

  fatto: {
    /** l'occhiello sopra al titolo: ce l'ha solo la forma `nudo` */
    occhiello?: string
    titolo: string
    /** la riga sotto al titolo: ce l'ha solo la veste classica */
    sotto?: string
    /** l'etichetta sopra alle due parole: solo la veste della lezione 1 */
    etichetta?: string
    /** una riga per parola: solo la veste della lezione 1 */
    righe?: string[]
    etichettaProgresso: string
    conteggio: string
    /** la riga sotto al conteggio, dentro alla stessa scheda */
    extra?: string
    /** la riga in fondo allo schermo */
    nota?: string
    azione: string
  }
}

const it = {
  occhiello: 'BODY LANGUAGE',
  titolo: '16 parole per descrivere cosa senti.',
  intro: 'Ogni parola sbloccata si aggiunge al tuo check-in quotidiano. 8 lezioni da 3 minuti.',

  progresso: {
    etichetta: 'IL TUO PROGRESSO',
    /* `{fatte}` e `{tutte}` li mette l'app: non si scrivono a mano */
    conteggio: '{fatte} / {tutte} sbloccate',
  },

  regola: {
    titolo: 'La regola dei 3 segnali corporei',
    sotto: 'Scopri come classificare quello che provi',
  },

  unita: {
    1: 'Unità 1: Funziona',
    2: 'Unità 2: Resiste',
    3: 'Unità 3: Ti avvisa',
    4: 'Unità 4: È un allarme',
  },

  azione: 'Vai al vocabolario',
  nav: { percorso: 'Percorso', parole: 'Mie Parole' },

  /* le scritte che si ripetono in tutte le lezioni */
  comune: {
    verifica: 'Verifica',
    continua: 'Continua',
    giusto: 'GIUSTO!',
    sbagliato: 'NON ANCORA',
    riprova: 'Guarda di nuovo e prova a cambiare.',
    posa: 'Posa qui',
    aiuto: 'Tocca una parola, poi tocca dove va. Oppure trascinala.',
    inArrivo: 'In arrivo',
  },

  lezioni: {
    1: {
      incontra: [
        {
          occhiello: 'PAROLA 1 DI 2',
          metafora: 'Il suono del motore.',
          descrizione:
            'Lo sforzo che senti e che puoi guidare. Inizia quando inizi tu e si ferma quando ti fermi.',
          citazione: '«Sento le gambe cariche e reattive.»',
          blocchi: [
            {
              etichetta: 'TIPO DI ALLENAMENTO',
              testo:
                'Usa «{uno}» quando il tuo corpo si sente pronto a sprigionare energia e a gestire carichi pesanti.',
            },
          ],
          azione: 'Parola successiva',
        },
        {
          occhiello: 'PAROLA 2 DI 2',
          metafora: 'Una piuma.',
          descrizione: 'Appena percettibile. Lo dimenticheresti se non stessi facendo il check-in.',
          citazione: '«Sento i piedi che volano sul terreno.»',
          blocchi: [
            {
              etichetta: 'LA DIFFERENZA',
              testo:
                '«{uno}» è la potenza del motore. «{due}» è il peso che non senti. Puoi sentirli tutti e due insieme.',
            },
          ],
          azione: 'Facciamo pratica',
        },
      ],

      abbina: {
        titolo: 'Abbina la parola alla sua immagine.',
        cesto: 'TRASCINA LE PAROLE',
        righe: [
          'Energia da spingere, reattiva',
          'Senza peso, fluida',
          'Carica elettrica improvvisa',
          'Battito calmo, regolare',
        ],
        esche: ['pesante'],
        azione: 'Verifica',
      },

      gemelle: {
        occhiello: 'FALSI AMICI',
        badge: 'SCENARIO',
        scenario: 'Metà allenamento e le gambe sembrano avere una batteria in più.',
        domanda: 'Quale segnale descrive meglio questa sensazione?',
        glosse: ['Potenza muscolare al massimo', 'Leggera, senza attrito'],
        esito: '',
        azione: 'Verifica',
      },

      storia: {
        occhiello: 'SCENARIO DI VITA REALE',
        badge: 'SCENARIO',
        scenario:
          'Due giorni prima del ciclo. Le tue gambe si sentono piene e leggermente pesanti, entrambe, come il mese scorso.',
        domanda: 'SELEZIONA IL SEGNALE CORRETTO:',
        esito: '',
        azione: 'Verifica',
      },

      mossa: {
        occhiello: 'LA TUA MOSSA',
        titolo: 'Il tuo corpo si sente «{due}». Cosa fai?',
        scelte: ['Aumenta il carico o spingi di più', "Mantieni l'intensità attuale", ''],
        esito:
          'Quando ti senti agile e leggera, è il momento migliore per calibrare lo sforzo e goderti la sessione fluida.',
        nota: 'Se lo stesso segnale «{due}» torna nello stesso punto a ogni allenamento per due settimane, non è più «{due}». Dillo a qualcuno.',
        azione: 'Verifica',
      },

      frase: {
        occhiello: 'COMPONI LA TUA FRASE',
        titolo: 'Completa il tuo check-in giornaliero',
        cesto: 'TRASCINA LE PAROLE',
        modello:
          'Oggi mi sento {forte} perché ho corso con energia, ma il passo era {leggero} sul traguardo.',
        nota: 'Questa frase cattura il tuo stato fisico completo e lo salva nel tuo diario.',
        esche: ['pesante', 'rigida'],
        azione: 'Salva e termina',
      },

      fatto: {
        titolo: 'Lezione 1 completata!',
        etichetta: 'PAROLE AGGIUNTE AL TUO DIZIONARIO:',
        righe: ['Pronta e carica per lo sforzo massimo', 'Leggera, fluida, senza attrito'],
        etichettaProgresso: 'PROGRESSO TOTALE',
        conteggio: '{fatte} / {tutte} parole sbloccate',
        azione: 'Torna al percorso',
      },
    },

    2: {
      incontra: [
        {
          occhiello: 'PAROLA 1 DI 2',
          titolo: 'Incontra «{uno}»',
          metafora: 'La ricevuta del giorno dopo.',
          descrizione:
            'È quel risentimento muscolare localizzato che si presenta dopo aver fatto un movimento o uno sforzo a cui non eri abituata.',
          blocchi: [
            {
              testo:
                "Solitamente ha un picco tra le 24 e le 48 ore dopo l'attività (il cosiddetto DOMS) e scompare gradualmente da solo.",
            },
            {
              testo:
                'Non è un segnale di stop o pericolo. Il corpo si sta solo adattando allo sforzo. È sicuro muoversi con dolcezza.',
            },
          ],
          azione: 'Prossima parola',
        },
        {
          occhiello: 'PAROLA 2 DI 2',
          titolo: 'E ora, «{due}»',
          metafora: 'Un ronzio di fondo che non si spegne.',
          descrizione:
            'Un fastidio diffuso, sordo, come un rumore di fondo. Ti svegli e lo senti, anche senza aver fatto alcuno sforzo evidente.',
          blocchi: [
            {
              etichetta: 'QUAL È LA DIFFERENZA?',
              testo:
                '• «{uno}» ha una causa chiara e svanisce in pochi giorni.\n• «{due}» spesso non ha una causa diretta e persiste come un ronzio.',
            },
            {
              testo:
                "Spesso il corpo usa «{due}» per segnalarci stanchezza generale, stress o l'arrivo delle mestruazioni.",
            },
          ],
          azione: 'Mettiamoci alla prova',
        },
      ],

      abbina: {
        occhiello: 'ESERCIZIO 1',
        titolo: 'Associa il termine alla sua descrizione',
        cesto: 'BANCO DELLE PAROLE',
        aiuto: 'Trascina o tocca le parole per associarle correttamente.',
        righe: ['Sforzo recente', 'Rumore di fondo', 'Pieno di energia', 'Nessun peso'],
        esche: [],
        azione: 'Verifica associazione',
      },

      gemelle: {
        occhiello: 'FALSI AMICI',
        titolo: 'Cosa provi davvero?',
        badge: 'SCENARIO',
        scenario:
          "È mercoledì. Lunedì hai fatto squat per la prima volta dopo mesi. Oggi entrambe le cosce sono pesanti e sedersi è un'impresa divertente.",
        domanda: 'COME DEFINIRESTI QUESTO SEGNALE?',
        glosse: [
          "C'è uno sforzo chiaro fatto 48 ore fa.",
          "Qui il fastidio ha un'origine meccanica ben definita.",
        ],
        esito:
          'Ricorda: «{uno}» è il termine più adatto quando il fastidio arriva dopo uno sforzo chiaro (DOMS).',
        azione: 'Conferma risposta',
      },

      storia: {
        occhiello: 'VITA VERA',
        titolo: 'Il diario di Sofia',
        badge: 'SCENARIO',
        scenario:
          "«Stamattina mi sono svegliata con una specie di ronzio sordo che va dalla parte bassa della schiena fino alle cosce. Non ho fatto allenamenti intensi ieri, ma mi sento tutta un po' affaticata.»",
        domanda: 'Quale parola descrive meglio questo ronzio di fondo?',
        esito:
          'Ottimo! Un dolore diffuso e sordo che non riesci a indicare con un dito è «{due}». Il ronzio di fondo senza causa chiara né localizzazione precisa è tipico di questo segnale.',
        azione: 'Avanti',
      },

      mossa: {
        occhiello: 'LA TUA MOSSA',
        titolo: 'Cosa fai oggi?',
        badge: 'LA TUA MOSSA',
        scenario:
          'La schiena fa «{due}» per il ciclo. Quale strategia scegli per assecondare il corpo oggi?',
        scelte: [
          'Ignora il ronzio e mantieni il programma originale.',
          'Riduci il carico di sforzo, fai stretching leggero.',
          "Riposo totale, borsa dell'acqua calda o relax.",
        ],
        esito:
          'Quando la schiena fa «{due}» per il ciclo, calibrare lo sforzo aiuta a mantenere la sessione fluida senza forzare.',
        azione: 'Conferma strategia',
      },

      frase: {
        occhiello: 'COMPONI LA TUA FRASE',
        titolo: 'Componi la frase',
        etichetta: 'IL TUO CHECK-IN',
        cesto: 'TRASCINA LE PAROLE',
        modello:
          'La zona lombare è «{sordo}» da stamattina, è un 4 su 10, e sono al terzo giorno di ciclo.',
        nota: 'Costruisci il tuo report quotidiano associando i tag sbloccati.',
        esche: ['pesante', 'rigida'],
        azione: 'Salva e termina',
      },

      fatto: {
        titolo: 'Lezione 2 completata!',
        sotto: 'Hai sbloccato 2 nuove parole per descrivere come sta il tuo corpo.',
        etichettaProgresso: 'IL TUO VOCABOLARIO',
        conteggio: '{fatte} / {tutte} parole sbloccate',
        azione: 'Torna al percorso',
      },
    },

    3: {
      incontra: [
        {
          sopra: 'BODY LANGUAGE',
          occhiello: 'PAROLA 1 DI 2',
          titolo: 'Incontra «{uno}»',
          metafora: 'Come un elastico.',
          descrizione:
            "È quella sensazione di tensione muscolare o accorciamento che senti tirare ma che, con un po' di movimento o riscaldamento, tende a sciogliersi e migliorare.",
          blocchi: [
            {
              testo:
                'Un muscolo «{uno}» ha solo bisogno di essere svegliato con dolcezza: non è bloccato né danneggiato.',
            },
            {
              testo:
                'Un allungamento leggero o un movimento circolare graduale è perfetto per far capire al sistema nervoso che può rilasciare la tensione.',
            },
          ],
          azione: 'Prossima parola',
        },
        {
          sopra: 'BODY LANGUAGE',
          occhiello: 'PAROLA 2 DI 2',
          titolo: 'Incontra «{due}»',
          metafora: 'Come una cerniera arrugginita.',
          descrizione:
            "È una resistenza che avverti soprattutto a livello dell'articolazione. Senti che il movimento è limitato, come se ci fosse un blocco fisico.",
          blocchi: [
            {
              etichetta: 'LA DIFFERENZA IN BREVE',
              testo:
                '• «{uno}» si sente come una tensione muscolare: tira.\n• «{due}» si sente come un blocco articolare: frena.',
            },
            {
              testo:
                "Usa mobilità dolce e passiva senza forzare l'angolo limite, per lubrificare l'articolazione.",
            },
          ],
          azione: 'Facciamo pratica',
        },
      ],

      abbina: {
        sopra: 'BODY LANGUAGE',
        occhiello: 'ESERCIZIO 1',
        titolo: 'Collega i segnali corporei',
        cesto: 'PAROLE DISPONIBILI',
        righe: [
          'Sensazione di elastico che tira',
          'Cerniera arrugginita che blocca',
          'Risentimento muscolare post-sforzo',
          'Dolore sordo e diffuso costante',
        ],
        esche: [],
        azione: 'Verifica',
      },

      gemelle: {
        sopra: 'BODY LANGUAGE',
        occhiello: 'ESERCIZIO 2 • FALSI AMICI',
        titolo: 'Il trucco del fisioterapista',
        badge: 'SCENARIO',
        scenario:
          "Sei sul lettino e l'allenatore ti solleva la gamba tesa. Senti tirare dietro la coscia, ma lui riesce a spingerla molto in alto senza sforzo.",
        domanda: 'Come definisci questa sensazione?',
        etichette: ['È una sensazione di «{uno}»', 'È una sensazione di «{due}»'],
        glosse: [],
        esito:
          "Ricorda: poiché l'articolazione si muove liberamente quando la guida qualcun altro, la restrizione non è strutturale («{due}») ma è una risposta di tensione attiva del muscolo («{uno}»).",
        azione: 'Verifica',
      },

      storia: {
        sopra: 'BODY LANGUAGE',
        occhiello: 'ESERCIZIO 3 • STORIE REALI',
        titolo: 'La storia di Sofia',
        badge: 'SCENARIO',
        scenario:
          "«Ogni mese, 3-4 giorni prima dell'inizio delle mestruazioni, mi sveglio sentendo le caviglie spesse, rigide e pesanti. Fare le scale la mattina presto sembra un'impresa, finché non inizio a camminare un po'.»",
        domanda: '',
        etichette: ['Sofia si sente «{uno}»', 'Sofia si sente «{due}»'],
        esito:
          "Ottimo! Le caviglie che si sentono spesse e lente nei primi minuti e migliorano col movimento sono un segnale «{due}». È l'articolazione che ha bisogno di lubrificazione, non il muscolo.",
        azione: 'Verifica',
      },

      mossa: {
        sopra: 'BODY LANGUAGE',
        occhiello: 'ESERCIZIO 4 • IL TUO CHECK-IN',
        titolo: 'Sintonizzati su di te',
        badge: 'LA TUA MOSSA',
        scenario:
          'Se anche tu avvertissi questa rigidità («{due}») alle caviglie prima del ciclo o al mattino, quale azione dovresti scegliere?',
        scelte: [],
        etichette: [
          'GO: allunga con forza finché non passa',
          'CALIBRA: mobilità dolce e lubrificazione',
          'STOP: non muoverti per evitare danni',
        ],
        esito:
          'Esatto! La rigidità articolare («{due}») risponde meglio alla mobilizzazione controllata e leggera.',
        azione: 'Verifica',
      },

      frase: {
        sopra: 'BODY LANGUAGE',
        occhiello: 'ESERCIZIO 5 • COMPONI LA FRASE',
        titolo: 'Componi il tuo report',
        intro:
          'Usa i tasselli per descrivere al tuo coach il segnale di oggi, con parole sue.',
        cesto: 'TRASCINA LE PAROLE',
        modello: 'Stamattina sento «{rigido}» in {0}, quindi preferisco {2}.',
        esche: ['entrambe le caviglie', 'iniziare la sessione con mobilità'],
        azione: 'Salva & finisci',
      },

      fatto: {
        titolo: 'Lezione 3 completata!',
        sotto: 'Hai imparato a distinguere «{uno}» da «{due}».',
        etichetta: 'PAROLE SBLOCCATE OGGI',
        etichettaProgresso: 'IL TUO PROGRESSO COMPLESSIVO',
        conteggio: '{fatte} / {tutte} sbloccate',
        azione: 'Torna al percorso',
      },
    },

    4: {
      incontra: [
        {
          occhiello: 'PAROLA 1 DI 2',
          titolo: 'Incontra «{uno}»',
          metafora: 'Un pugno che si stringe.',
          descrizione:
            'È quel dolore che va e viene, simile a un pugno che si stringe e si rilascia in modo ritmico. Tipico del periodo mestruale.',
          blocchi: [
            {
              testo:
                'Si presenta a ondate: momenti di tensione si alternano a pause di sollievo spontaneo.',
            },
            {
              testo:
                'Rilassare il respiro durante la fase di rilascio aiuta il corpo a non accumulare altra tensione protettiva.',
            },
          ],
          azione: 'Prossima parola',
        },
        {
          occhiello: 'PAROLA 2 DI 2',
          titolo: 'Incontra «{due}»',
          metafora: 'Una mano che non molla.',
          descrizione:
            'È una sensazione di stretta costante. Come una pinza che tiene forte senza mai allentare la presa, e blocca la zona.',
          blocchi: [
            {
              etichetta: '«{uno}» O «{due}»?',
              testo:
                'Il «{uno}» arriva e se ne va a ondate ritmiche. Il «{due}» è una pressione fissa, che resta.',
            },
          ],
          azione: 'Facciamo pratica',
        },
      ],

      abbina: {
        occhiello: 'ESERCIZIO 1',
        titolo: 'Associa le sensazioni',
        cesto: 'PAROLE DISPONIBILI',
        righe: [
          'Un pugno che si stringe e si rilascia',
          'Una pinza che tiene e non molla mai',
          'Una corda tirata al limite',
          'Una cerniera che si inceppa',
        ],
        esche: [],
        azione: 'Verifica',
      },

      gemelle: {
        occhiello: 'FALSI AMICI',
        titolo: 'Attenta ai dettagli',
        badge: 'Scenario',
        scenario:
          'Quando ridi fortissimo e la pancia ti fa male a ogni sobbalzo, che sensazione provi?',
        domanda: '',
        glosse: [],
        giusta: 0,
        esito:
          'Il sussulto della risata è una contrazione che va e viene a ritmo: è un «{uno}», non un «{due}».',
        azione: 'Verifica',
      },

      storia: {
        occhiello: 'LA TUA STORIA',
        titolo: 'Ascolta la scena',
        badge: 'SCENARIO',
        scenario:
          '«Durante l’ora di matematica sento un peso costante alla bassa schiena, fisso e sordo, come se qualcosa mi stesse stringendo forte senza mai mollare.»',
        domanda: '',
        etichette: ['«{uno}» (a ondate)', '«{due}» (stretta costante)'],
        giusta: 1,
        esito:
          'Un peso fisso che non molla mai è «{due}». Il «{uno}» invece stringe, lascia, e stringe di nuovo.',
        azione: 'Verifica',
      },

      mossa: {
        occhiello: 'CALIBRAZIONE',
        titolo: 'Cosa fare adesso?',
        badge: 'YOUR MOVE',
        scenario:
          'Se senti la bassa schiena «{due}» durante la lezione, quale strategia applichi?',
        etichette: [
          'Continuare camminando velocemente senza fermarti',
          'Muoverti dolcemente (Calibra)',
          'Fermarti del tutto (Stop)',
        ],
        scelte: [
          'Non è la scelta migliore in questo scenario.',
          'Il corpo si sta difendendo dallo sforzo: un movimento leggero scioglie la stretta.',
          'Solo in caso di fitta acuta o di dolore che impedisce ogni movimento.',
        ],
        esito:
          'Con la bassa schiena «{due}» durante la lezione la strategia migliore è muoverti dolcemente. Fermarti del tutto vale solo per una fitta acuta o un dolore che impedisce ogni movimento.',
        azione: 'Verifica',
      },

      frase: {
        occhiello: 'SALVA LA TUA PAROLA',
        titolo: 'Componi la frase',
        intro:
          'Trascina o scegli gli elementi per raccontare com’è andata oggi:',
        cesto: 'TRASCINA LE PAROLE',
        /*
         * Senza virgolette e senza articolo davanti alla parola: qui i
         * tasselli sono quattro di fila, e le virgolette basse finivano
         * spaiate a fine riga. E' un referto, non una frase di scuola.
         */
        modello: 'Oggi {0}: {morsa} {2} {3}.',
        esche: ['bassa schiena', 'durante', 'tutta la lezione'],
        azione: 'Salva & finisci',
      },

      fatto: {
        titolo: 'Ottimo lavoro! 🎉',
        occhiello: 'LEZIONE 4 COMPLETATA',
        sotto:
          'Hai sbloccato 2 nuove parole per descrivere i segnali della pancia e della schiena.',
        righe: ['Contrazione forte e improvvisa', 'Come se qualcosa stringesse forte'],
        etichettaProgresso: 'PROGRESSO TOTALE',
        conteggio: '{fatte} / {tutte} parole sbloccate',
        azione: 'Torna al percorso',
      },
    },

    5: {
      incontra: [
        {
          occhiello: 'PAROLA 1 DI 2',
          titolo: 'Incontra «{uno}»',
          metafora: 'Un taglio di carta, non un livido.',
          descrizione:
            'È quel dolore improvviso, rapido e localizzato. Come una puntura di spillo o una scossa elettrica.',
          blocchi: [
            {
              testo:
                'Si manifesta all’improvviso, spesso legato a un movimento preciso, e di solito sparisce subito dopo.',
            },
            {
              testo:
                'Se senti un dolore «{uno}», prova a rallentare o a cambiare il movimento. Spesso basta un piccolo aggiustamento.',
            },
          ],
          azione: 'Prossima parola',
        },
        {
          occhiello: 'PAROLA 2 DI 2',
          titolo: 'Incontra «{due}»',
          metafora: 'Acuto con la forza dietro.',
          descrizione:
            'È un dolore intenso, profondo e penetrante. Come una pugnalata, o una fitta forte che sembra trafiggere la zona.',
          blocchi: [
            {
              etichetta: 'QUAL È LA DIFFERENZA?',
              testo:
                '«{uno}» di solito è breve e superficiale, e svanisce in fretta.\n«{due}» è più profondo, intenso, e tende a restare.',
            },
          ],
          azione: 'Facciamo pratica',
        },
      ],

      abbina: {
        occhiello: 'COLLEGA LE PAROLE',
        titolo: 'Abbina la sensazione',
        intro: 'Collega ogni descrizione alla parola giusta della lingua del corpo:',
        cesto: 'TRASCINA LE PAROLE',
        righe: [
          'Un ago improvviso che punge',
          'Una lama profonda che trafigge',
          'Una morsa costante che stringe',
          'Un muscolo teso e dolorante',
        ],
        esche: [],
        azione: 'Verifica',
      },

      gemelle: {
        occhiello: 'FALSI AMICI',
        titolo: 'Occhio alla differenza',
        badge: 'Scenario',
        scenario: 'Ti storta improvvisamente la caviglia.',
        domanda:
          'Senti un flash doloroso e istantaneo che sparisce appena rimetti dritto il piede. È:',
        glosse: ['Istantaneo, superficiale, passa subito.', 'Profondo, persistente, come una fitta che continua.'],
        etichette: ['Dolore «{uno}»', 'Dolore «{due}»'],
        esito:
          '«{uno}» di solito ti dice che hai fatto un movimento azzardato sul momento; «{due}» indica qualcosa di più profondo.',
        azione: 'Verifica',
      },

      allarme: {
        occhiello: 'ATTENZIONE',
        titolo: 'Segnale d’allarme',
        intestazione: 'Bandiera rossa: «{due}»',
        testo:
          'Se il dolore che senti è davvero «{due}», e non sparisce nel giro di pochissimi minuti, o torna a ogni tentativo di muoverti…',
        dafare:
          'Fermati subito e dillo al tuo allenatore, al tuo medico o a un genitore.',
        nota:
          'Un segnale così vuol dire che insistere potrebbe fare un danno vero. Imparare a fermarsi fa parte dell’allenamento.',
        azione: 'Ho capito',
      },

      storia: {
        occhiello: 'STORIA DI KATIA',
        titolo: 'Cosa sente Katia?',
        badge: 'FASE CICLO: OVULAZIONE',
        scenario:
          'Katia sta correndo da 15 minuti. All’improvviso sente un dolore profondo al ginocchio destro, come se qualcosa lo trafiggesse dall’interno a ogni passo. Rallenta, ma la fitta non accenna a passare.',
        domanda: 'Scegli la definizione:',
        etichette: ['«{due}» (che trafigge)', '«{uno}» (acuto e di passaggio)'],
        esito:
          'È un dolore «{due}» che non passa: la cosa giusta da fare è fermarsi, per non farsi male davvero.',
        azione: 'Verifica',
      },

      mossa: {
        occhiello: 'DECIDERE L’AZIONE',
        titolo: 'Cosa dovrebbe fare?',
        badge: 'Scenario',
        scenario:
          'Katia sente un dolore «{due}» al ginocchio destro mentre corre, e non passa neanche rallentando.',
        etichette: [
          'Stringere i denti e finire la corsa programmata',
          'Continuare camminando, senza correre',
          'Fermarsi subito e avvertire allenatore o genitori',
        ],
        scelte: [],
        esito:
          'Un dolore «{due}» che non passa non si negozia: si smette, e lo si dice a qualcuno.',
        azione: 'Verifica',
      },

      frase: {
        occhiello: 'COMPILAZIONE CHECK-IN',
        titolo: 'Scrivi il tuo messaggio',
        intro: 'Completa il report per l’allenatore dicendo esattamente cosa senti:',
        cesto: 'TRASCINA LE PAROLE',
        modello:
          'Oggi durante la sessione ho sentito un dolore al {0}. Era una sensazione di tipo {trafittivo}, quindi ho deciso di {2} per sicurezza.',
        esche: ['ginocchio destro', 'fermarmi subito'],
        azione: 'Salva & finisci',
      },

      fatto: {
        titolo: 'Lezione 5 completata!',
        sotto:
          'Hai imparato a distinguere il dolore «{uno}» da quello «{due}», e quando far scattare l’allarme.',
        etichetta: 'NUOVE PAROLE SBLOCCATE',
        righe: ['acuto improvviso', 'fitta penetrante'],
        etichettaProgresso: 'PROGRESSO TOTALE',
        conteggio: '{fatte} / {tutte} parole sbloccate',
        azione: 'Torna al percorso',
      },
    },

    6: {
      incontra: [
        {
          occhiello: 'PAROLA 1 DI 2',
          titolo: 'Incontra «{uno}»',
          metafora: 'Un fiammifero, non un incendio.',
          descrizione:
            'È una sensazione di calore intenso, come se la pelle andasse a fuoco o toccasse una fonte di calore.',
          blocchi: [
            {
              testo:
                'Di solito lo scatena qualcosa da fuori — lo sfregamento — oppure è un’infiammazione in corso.',
            },
            {
              testo:
                'Non ignorarlo se dura per tutto l’esercizio. È il corpo che chiede protezione, acqua, o una barriera.',
            },
          ],
          azione: 'Prossima parola',
        },
        {
          occhiello: 'PAROLA 2 DI 2',
          titolo: 'Incontra «{due}»',
          metafora: 'Bibita frizzante sotto la pelle.',
          descrizione:
            'È una sensazione elettrica, come spilli, che spesso segnala un nervo schiacciato per un po’ o poco sangue che arriva.',
          blocchi: [
            {
              testo:
                'Comune quando resti nella stessa posizione troppo a lungo, o quando la circolazione si risveglia.',
            },
            {
              pastiglia: 'CONFRONTO',
              testo:
                '«{uno}» è calore e attrito. «{due}» è elettrico, ed è questione di nervi e di circolazione.',
            },
          ],
          azione: 'Facciamo pratica',
        },
      ],

      abbina: {
        occhiello: 'ATTIVITÀ',
        titolo: 'Collega i segnali',
        intro: 'Trascina ogni parola sulla descrizione che le somiglia.',
        cesto: 'TRASCINA LE PAROLE',
        righe: [
          'Calore intenso, come la pelle che va a fuoco',
          'Spilli elettrici sotto la pelle',
          'Una puntura di spillo, breve e precisa',
          'Una lama profonda che trafigge',
        ],
        esche: [],
        azione: 'Verifica',
      },

      gemelle: {
        occhiello: 'FALSI AMICI',
        titolo: 'Attenta a non confonderli',
        badge: 'Scenario',
        scenario:
          'Ti sei seduta a terra a gambe incrociate troppo a lungo. Appena ti alzi senti i piedi frizzare, pieni di piccoli aghi. Cos’è?',
        domanda: '',
        glosse: [],
        etichette: ['Sento un segnale «{uno}»', 'Sento un segnale «{due}»'],
        giusta: 1,
        esito:
          'È «{due}»: una sensazione elettrica, perché i nervi della gamba si stanno liberando.',
        azione: 'Verifica',
      },

      storia: {
        occhiello: 'SCENARIO',
        titolo: 'Storie di corsa',
        badge: 'SCENARIO',
        scenario:
          'Durante una lunga sessione di corsa d’estate l’interno coscia diventa rosso e senti la pelle andare a fuoco per lo sfregamento dei pantaloncini.',
        domanda: '',
        etichette: ['Sì, si tratta di «{uno}»', 'No, si tratta di «{due}»', 'Altro'],
        esito:
          'L’attrito e la pelle irritata fanno calore e bruciore: è «{uno}».',
        azione: 'Verifica',
      },

      mossa: {
        occhiello: 'COME REAGISCI?',
        titolo: 'Cosa fai adesso?',
        badge: 'YOUR MOVE',
        scenario:
          'Sei a metà allenamento e l’interno coscia brucia forte («{uno}»). Cosa decidi di fare?',
        etichette: [
          'Continua e aumenta il carico',
          'Fermati e metti una crema barriera',
          'Cambia esercizio',
        ],
        scelte: [
          'Cerchi di superare il bruciore e finire la sessione con più intensità.',
          'Una pausa breve per mettere una crema lenitiva o barriera, prima che l’irritazione peggiori.',
          'Sostituisci l’esercizio con uno che non stressi l’interno coscia.',
        ],
        esito:
          'Il segnale «{uno}» ti avvisa di intervenire prima che la pelle si rovini. Ottimo ascolto del tuo corpo.',
        azione: 'Verifica',
      },

      frase: {
        occhiello: 'LA TUA REGOLA',
        titolo: 'Crea la tua frase',
        intro: 'Completa lo schema con quello che hai visto, e la lezione finisce nel tuo diario.',
        cesto: 'TRASCINA LE PAROLE',
        etichette: ['QUANDO SENTO:', 'IL MIO CORPO RIFERISCE:', 'DECIDO QUINDI DI:'],
        modello: '{0}{bruciante}{2}',
        esche: [
          'sfregamento all’interno coscia',
          'mettere la crema barriera',
          'rigido',
        ],
        azione: 'Salva & finisci',
      },

      fatto: {
        occhiello: 'COMPLETATA',
        titolo: 'Lezione 6 completata!',
        sotto:
          'Hai sbloccato altre 2 parole importanti per raccontare bene i segnali del tuo corpo.',
        etichettaProgresso: 'IL TUO PROGRESSO',
        conteggio: '{fatte} / {tutte} sbloccate',
        extra: '+{nuove} parole sbloccate oggi 🎉',
        nota:
          'Ora sei pronta a metterle alla prova nei prossimi check-in.',
        azione: 'Torna al percorso',
      },
    },

    7: {
      incontra: [
        {
          occhiello: 'PAROLA 1 DI 2',
          titolo: 'Incontra «{uno}»',
          metafora: 'Il volume a zero.',
          descrizione:
            'È la sensibilità che si perde, in parte o del tutto. Come quando ti addormenti su un braccio e per un po’ non lo controlli.',
          blocchi: [
            {
              testo:
                'Nello sport può venire da un nervo schiacciato per poco, ma se arriva all’improvviso merita attenzione.',
            },
            {
              testo:
                'Non ignorare mai un intorpidimento completo che non se ne va muovendo piano l’arto per qualche minuto.',
            },
          ],
          azione: 'Prossima parola',
        },
        {
          occhiello: 'PAROLA 2 DI 2',
          titolo: 'Incontra «{due}»',
          metafora: 'Un tavolo che traballa.',
          descrizione:
            'È la sensazione che un’articolazione sia debole, che dondoli, o che stia per cedere sotto sforzo.',
          blocchi: [
            {
              etichetta: 'LA DIFFERENZA CHIAVE',
              testo:
                '«{uno}» = nessuna sensibilità. Non senti il contatto, la pelle è come anestetizzata.\n«{due}» = nessun controllo. L’articolazione cede, dondola, o non regge il carico.',
            },
          ],
          azione: 'Facciamo pratica',
        },
      ],

      abbina: {
        occhiello: 'ESERCIZIO 1',
        titolo: 'Associa le sensazioni',
        cesto: 'TRASCINA LE PAROLE',
        righe: [
          'La caviglia oscilla e sembra cedere',
          'Pizzicore diffuso come aghi sulla pelle',
          'Nessun calore e nessun tocco sentito sul braccio',
          'Calore intenso e interno, come fuoco',
        ],
        esche: [],
        azione: 'Verifica',
      },

      gemelle: {
        occhiello: 'FALSI AMICI',
        titolo: 'Cosa succede qui?',
        badge: 'Scenario',
        scenario:
          'Durante uno scatto laterale il ginocchio si piega di colpo all’interno e ti lascia senza appoggio. È un caso di:',
        domanda: '',
        glosse: [],
        esito:
          'Il ginocchio che cede o non tiene l’allineamento è la definizione esatta di «{due}».',
        azione: 'Verifica',
      },

      allarme: {
        occhiello: 'ATTENZIONE',
        titolo: 'Segnale d’allarme',
        intestazione: 'Bandiera rossa: «{uno}»',
        testo:
          'Se una parte del corpo diventa completamente insensibile durante o dopo l’allenamento, e non torna normale in pochi minuti…',
        dafare: 'Fermati e avvisa subito il tuo allenatore o un genitore.',
        nota:
          'Un intorpidimento improvviso che non passa può voler dire un nervo molto compresso, o un problema di circolazione: va guardato.',
        azione: 'Ho capito',
      },

      storia: {
        occhiello: 'STORIA REALE',
        titolo: 'La spalla di Katia',
        badge: 'PALLAVOLO',
        scenario:
          '«Durante il servizio a pallavolo sento che la spalla destra fa uno scatto strano e per un attimo dondola, come se fosse fuori posto.»',
        domanda: 'COME DEFINIRESTI QUESTA SENSAZIONE?',
        esito:
          'Quando un’articolazione cede o dondola sotto sforzo è «{due}». La cosa giusta è fermarsi e avvisare lo staff.',
        azione: 'Verifica',
      },

      mossa: {
        occhiello: 'COSA FARE ADESSO?',
        titolo: 'Spalla instabile',
        badge: 'YOUR MOVE',
        scenario:
          'Katia sente la spalla «{due}» durante i servizi alti. Qual è l’azione giusta da proporre?',
        etichette: [
          'Continuare a forzare per rinforzarla',
          'Continuare camminando velocemente senza fermarsi',
          'Evitare i servizi alti e avvisare lo staff',
        ],
        scelte: [],
        esito:
          'Evitare i servizi alti e avvisare lo staff è l’azione più sicura per non farsi male.',
        azione: 'Verifica',
      },

      frase: {
        occhiello: 'RIASSUNTO LEZIONE',
        titolo: 'Crea la tua regola',
        etichetta: 'REGOLA DI AUTOTUTELA',
        cesto: 'TRASCINA LE PAROLE',
        modello:
          'Se sento la mia {0} diventare particolarmente «{instabile}», preferisco {2} per oggi.',
        esche: ['spalla destra', 'saltare i servizi alti'],
        azione: 'Salva & finisci',
      },

      fatto: {
        titolo: 'Lezione 7 completata!',
        etichetta: 'PAROLE SBLOCCATE',
        righe: ['Perdita di sensibilità', 'Perdita di stabilità articolare'],
        etichettaProgresso: 'IL TUO PROGRESSO',
        conteggio: '{fatte} / {tutte} sbloccate',
        nota:
          'Ora hai gli strumenti per riconoscere e raccontare sia la perdita di sensibilità sia quella di stabilità.',
        azione: 'Torna al percorso',
      },
    },

    8: {
      incontra: [
        {
          occhiello: 'PAROLA 1 DI 2',
          titolo: 'Incontra «{uno}»',
          metafora: 'Un palloncino che si riempie.',
          descrizione:
            'È la sensazione di una parte che si riempie e si tende, spesso perché il liquido si ferma li’ per un po’.',
          blocchi: [
            {
              testo:
                'Può toccare le articolazioni dopo uno sforzo forte, oppure farsi vivo in certi giorni del ciclo.',
            },
            {
              testo:
                'Se non c’è dolore acuto e non c’è stato un colpo, il gonfiore da tutte e due le parti si gestisce muovendosi piano.',
            },
          ],
          azione: 'Prossima parola',
        },
        {
          occhiello: 'PAROLA 2 DI 2',
          titolo: 'Incontra «{due}»',
          metafora: 'Un termosifone acceso.',
          descrizione:
            'È il calore che senti uscire da dentro un’articolazione o da un muscolo, anche quando la pelle non è rossa.',
          blocchi: [
            {
              testo:
                'Spesso vuol dire più sangue che arriva li’, per riparare i tessuti dopo l’allenamento.',
            },
            {
              pastiglia: 'CONFRONTA',
              testo:
                'La differenza è semplice: «{uno}» è quanto è grosso, «{due}» è quanto scotta.',
            },
          ],
          azione: 'Facciamo pratica',
        },
      ],

      abbina: {
        occhiello: 'ESERCIZIO 1',
        titolo: 'Associa i segnali',
        intro: 'Trascina ogni parola sulla sensazione che le corrisponde:',
        cesto: 'TRASCINA LE PAROLE',
        righe: [
          'Tessuti gonfi o tesi',
          'Percezione di calore interno',
          'Mancanza di sensibilità al tatto',
          'La caviglia che oscilla o cede',
        ],
        esche: [],
        azione: 'Verifica',
      },

      gemelle: {
        occhiello: 'FALSI AMICI',
        titolo: 'Amici falsi?',
        badge: 'SCENARIO',
        scenario:
          'Il caso del lungo volo ✈️ — dopo 6 ore in aereo togli le scarpe e rimetterle è un’impresa. Le caviglie sembrano il doppio, e pesanti. Come lo chiami?',
        domanda: '',
        glosse: ['Liquidi in più, si vede il volume.', 'Rosso, che scotta, dolente.'],
        etichette: ['È «{uno}» (liquidi che si fermano)', 'È «{due}» (infiammazione da sforzo)'],
        esito:
          '«{uno}» è un cambiamento di volume, quello che si vede o si sente crescere. «{due}» è un cambiamento di temperatura.',
        azione: 'Verifica',
      },

      storia: {
        occhiello: 'STORIA REALE',
        titolo: 'La storia di Marta',
        badge: 'SCENARIO',
        scenario:
          'Marta nota che due giorni prima del ciclo le scarpe la stringono, e sente tutte e due le caviglie insolitamente piene e tese.',
        domanda: '',
        etichette: ['{uno}, da tutte e due le parti', 'Un colpo a una sola caviglia'],
        esito:
          'Da tutte e due le parti, prima del ciclo, uguale ogni mese: è «{uno}» e basta. Da una parte sola, dopo un momento che sai raccontare, sarebbe un’altra risposta.',
        azione: 'Verifica',
      },

      mossa: {
        occhiello: 'COSA FARE ADESSO?',
        titolo: 'Cosa deve fare Marta?',
        badge: 'YOUR MOVE',
        scenario:
          'Le caviglie sono «{uno}» per via del ciclo, ma non sente dolore alle articolazioni. Come dovrebbe comportarsi oggi?',
        scelte: [
          'Aumenta il carico o spingi di più',
          'Tieni l’intensità di adesso e segnalo',
          'Chiedi aiuto o cambia il piano',
        ],
        esito:
          'Il gonfiore da tutte e due le parti legato al ciclo è normale. Allenarsi con misura aiuta la circolazione.',
        azione: 'Verifica',
      },

      frase: {
        occhiello: 'LA REGOLA D’ORO',
        titolo: 'Costruisci la sintesi',
        intro: 'Metti i blocchi al posto giusto e la lezione finisce nel tuo diario:',
        etichetta: 'SINTESI',
        cesto: 'TRASCINA LE PAROLE',
        modello: 'Prima del ciclo, {0}: segnale {gonfio}. Posso {2} {3}.',
        esche: [
          'entrambe le caviglie',
          'allentare i lacci e continuare',
          'l’attività senza timore',
        ],
        azione: 'Salva & finisci',
      },

      fatto: {
        titolo: 'Lezione 8 completata!',
        sotto: 'Hai sbloccato tutte le {tutte} parole del percorso Body Language.',
        etichetta: 'PAROLE SBLOCCATE',
        righe: ['Volume che cresce', 'Temperatura che sale'],
        etichettaProgresso: 'PROGRESSO TOTALE',
        conteggio: '{fatte} / {tutte} parole sbloccate',
        nota:
          'Da oggi il tuo check-in parla tutta la tua lingua: sedici parole, e sai quando usarle.',
        azione: 'Torna al percorso',
      },
    },
  } as Record<number, ContenutoLezione>,
}

const en: typeof it = {
  occhiello: 'BODY LANGUAGE',
  titolo: '16 words for what you feel.',
  intro:
    'Every word you learn unlocks in your check-in. 8 lessons. Two words each. About three minutes a go.',

  progresso: {
    etichetta: 'words unlocked',
    conteggio: '{fatte} / {tutte}',
  },

  regola: {
    titolo: 'The only rule you memorise',
    sotto: 'Fades · Nags · Flags — two minutes',
  },

  unita: {
    1: "Unit 1: It's working",
    2: "Unit 2: It's holding on",
    3: "Unit 3: It's warning you",
    4: "Unit 4: It's an alarm",
  },

  azione: 'Go to vocabulary',
  nav: { percorso: 'Path', parole: 'My words' },

  comune: {
    verifica: 'Check',
    continua: 'Continue',
    giusto: 'CORRECT!',
    sbagliato: 'NOT YET',
    riprova: 'Look again and change one.',
    posa: 'drop here',
    aiuto: 'Tap a word, then tap where it goes. Or drag it.',
    inArrivo: 'Coming soon',
  },

  lezioni: {
    1: {
      incontra: [
        {
          occhiello: 'WORD 1 OF 2',
          metafora: 'The engine sound.',
          descrizione:
            'Effort you can feel and steer. It starts when you start and stops when you stop.',
          citazione:
            "Like carrying heavy shopping bags up the stairs: hard, but you're in charge of it.",
          blocchi: [
            {
              etichetta: 'TRAINING',
              testo:
                'The muscle doing its job under load. This is what training is supposed to feel like.',
            },
          ],
          azione: 'Next word',
        },
        {
          occhiello: 'WORD 2 OF 2',
          metafora: 'A feather.',
          descrizione: "Barely there. You'd forget it existed if you weren't checking in.",
          citazione:
            'The difference between someone tapping your shoulder and someone grabbing it.',
          blocchi: [
            {
              etichetta: 'THE SPLIT',
              testo:
                '{uno} is loud and yours. {due} is quiet and easy to lose. Both are green. This lesson exists so you learn green feels like something, not like nothing.',
            },
          ],
          azione: "Let's practise",
        },
      ],

      abbina: {
        titolo: 'Put the word on its picture.',
        cesto: 'WORD BANK',
        righe: ['The engine sound', 'A feather', 'A sudden electric charge', 'A calm, regular beat'],
        esche: ['heavy'],
        azione: 'Check',
      },

      gemelle: {
        occhiello: 'FALSE FRIENDS',
        badge: 'SCENARIO',
        scenario:
          "Halfway through the set your legs feel like they've got extra battery. You could do two more.",
        domanda: 'Which one is this?',
        glosse: ['the engine sound', 'a feather'],
        esito: '',
        azione: 'Check',
      },

      storia: {
        occhiello: 'REAL LIFE',
        badge: 'CYCLE · TRAINING',
        scenario:
          'Two days before your period. Your legs feel full and slightly heavy, both of them, same as last month.',
        domanda: 'WHICH WORD?',
        esito: '',
        azione: 'Check',
      },

      mossa: {
        occhiello: 'YOUR MOVE',
        titolo: 'Same day. What do you do?',
        scelte: ['Train it as planned', 'Adjust something, then check it again', ''],
        esito:
          "Both sides, no reason to act, and you've seen it before. It fades. Train, log it, keep noticing.",
        nota: 'If the same "{due}" thing shows up in the same spot every session for two weeks, it isn\'t {due} any more. Mention it.',
        azione: 'Check',
      },

      frase: {
        occhiello: 'SAY IT OUT LOUD',
        titolo: 'Build the sentence.',
        cesto: 'PICK A WORD',
        modello:
          "Both my legs feel {leggero} when I'm two days before my period, it's a 3/10, same as every month.",
        nota: 'Knowing the word only counts if you can hand it to someone. Tap each gap.',
        esche: ['heavy', 'stiff'],
        azione: 'Finish lesson',
      },

      fatto: {
        titolo: 'Lesson 1 done.',
        etichetta: 'WORDS UNLOCKED',
        righe: ['The engine sound.', 'A feather.'],
        etichettaProgresso: 'YOUR PROGRESS',
        conteggio: '{fatte} / {tutte} words unlocked',
        azione: 'Back to the path',
      },
    },

    2: {
      incontra: [
        {
          occhiello: 'WORD 1 OF 2',
          titolo: '{uno}',
          metafora: 'The day-after receipt.',
          descrizione: 'The bill your muscles send 24–48 hours after new or harder work.',
          blocchi: [
            { testo: 'Like a bruise you only feel when you press on it.' },
            {
              pastiglia: 'Push lightly — movement is the treatment',
              testo: 'You did something new, heavier, or more of. Completely normal.',
            },
          ],
          azione: 'Next word',
        },
        {
          occhiello: 'WORD 2 OF 2',
          titolo: '{due}',
          metafora: "A radio hum you can't turn off.",
          descrizione:
            "Deeper, vaguer, no edges. It doesn't need a reason and it doesn't need you to move.",
          blocchi: [
            { etichetta: 'THE SPLIT', testo: 'Sore has a cause and a fade. Achy has neither.' },
            {
              testo:
                'Sore is a receipt for something you did. Achy is background music that came on by itself.',
            },
          ],
          azione: "Let's practise",
        },
      ],

      abbina: {
        occhiello: 'MATCH',
        titolo: 'Put the word on its picture.',
        cesto: 'WORD BANK',
        aiuto: 'Tap a word, then tap where it belongs.',
        righe: [
          'The day-after receipt',
          "A radio hum you can't turn off",
          'The engine sound',
          'A feather',
        ],
        esche: [],
        azione: 'Check',
      },

      gemelle: {
        occhiello: 'FALSE FRIENDS',
        titolo: 'Which one is this?',
        badge: 'SCENARIO',
        scenario:
          "It's Wednesday. On Monday you squatted for the first time in months. Both legs feel heavy and sitting down on a chair is comedy.",
        domanda: 'Which signal fits this best?',
        glosse: [
          "There's a clear effort 48 hours ago.",
          'This discomfort has a clear mechanical origin.',
        ],
        esito:
          'Remember: {uno} is the right word when the discomfort comes after a clear effort (DOMS).',
        azione: 'Check',
      },

      storia: {
        occhiello: 'REAL LIFE',
        titolo: 'Name it.',
        badge: 'CYCLE · TRAINING',
        scenario:
          "Day 3 of your period. Your whole lower back and the tops of your thighs have a dull hum that's been there since you woke up. You can't point at it.",
        domanda: 'Which word?',
        esito: "Can you point to it with one finger? If not, it's {due}.",
        azione: 'Continue',
      },

      mossa: {
        occhiello: 'YOUR MOVE',
        titolo: 'Same day. What do you do?',
        badge: 'YOUR MOVE',
        scenario:
          'Day 3 of your period. Your whole lower back and the tops of your thighs have a dull hum. You called it {due}.',
        scelte: [
          'Train it as planned',
          'Adjust something, then check it again',
          'Tell someone — coach, physio, parent, doctor',
        ],
        esito:
          "It nags: it stays, it doesn't grow, and you can name the reason. That's an adjustment, not an alarm. Lighter session, good sleep, fuel and hydration.",
        azione: 'Check',
      },

      frase: {
        occhiello: 'SAY IT OUT LOUD',
        titolo: 'Build the sentence.',
        etichetta: 'YOUR SENTENCE',
        cesto: 'PICK A WORD',
        modello:
          "My low back feels {sordo} when I'm on day 3 of my period, it's 4/10, since this morning.",
        nota: 'Knowing the word only counts if you can hand it to someone. Tap each gap.',
        esche: ['heavy', 'stiff'],
        azione: 'Finish lesson',
      },

      fatto: {
        titolo: 'Lesson 2 done.',
        sotto: '{fatte} words down, {restano} to go. You just added two to your check-in.',
        etichettaProgresso: 'NOW AVAILABLE WHEN YOU CHECK IN',
        conteggio: '{fatte} / {tutte} words unlocked',
        azione: 'Back to the path',
      },
    },

    3: {
      incontra: [
        {
          sopra: 'BODY LANGUAGE',
          occhiello: 'WORD 1 OF 2',
          titolo: '{uno}',
          metafora: 'A guitar string tuned too high.',
          descrizione: 'The muscle feels short and pulling — and it loosens as you warm up.',
          blocchi: [
            { testo: 'Like jeans a size too small: restrictive, not painful.' },
            {
              pastiglia: 'Push — after a real warm-up',
              testo: 'Normal after hard work, long sitting, or a new range of movement.',
            },
          ],
          azione: 'Next word',
        },
        {
          sopra: 'BODY LANGUAGE',
          occhiello: 'WORD 2 OF 2',
          titolo: '{due}',
          metafora: 'A stuck zip.',
          descrizione:
            "It's the joint that won't move all the way, not the muscle that won't stretch.",
          blocchi: [
            { etichetta: 'THE SPLIT', testo: 'Tight feels like a pull. Stiff feels like a block.' },
            {
              pastiglia: "Calibrate — move it gently and often, don't force it",
              testo: "Tight lets go once you're warm. Stiff opens up the more times you move it.",
            },
          ],
          azione: "Let's practise",
        },
      ],

      abbina: {
        sopra: 'BODY LANGUAGE',
        occhiello: 'MATCH',
        titolo: 'Put the word on its picture.',
        cesto: 'WORD BANK',
        righe: [
          'A guitar string tuned too high',
          'A stuck zip',
          'The day-after receipt',
          "A radio hum you can't turn off",
        ],
        esche: [],
        azione: 'Check',
      },

      gemelle: {
        sopra: 'BODY LANGUAGE',
        occhiello: 'FALSE FRIENDS',
        titolo: 'Which one is this?',
        badge: 'SCENARIO',
        scenario:
          'You lie down, relax completely, and your coach lifts your leg — it goes up easily, even though it felt locked a minute ago.',
        domanda: '',
        glosse: [],
        esito:
          'Relax completely and let someone move the limb for you. If it moves easily, it was {uno}.',
        azione: 'Check',
      },

      storia: {
        sopra: 'BODY LANGUAGE',
        occhiello: 'REAL LIFE',
        titolo: 'Name it.',
        badge: 'CYCLE · TRAINING',
        scenario:
          "The days before your period your ankles feel thick and slow in the first minutes of every session. After ten minutes they're nearly normal.",
        domanda: '',
        esito:
          "Move it slowly, ten times. Does it go further on the tenth than on the first? That's {due}.",
        azione: 'Check',
      },

      mossa: {
        sopra: 'BODY LANGUAGE',
        occhiello: 'YOUR MOVE',
        titolo: 'Same day. What do you do?',
        badge: 'YOUR MOVE',
        scenario:
          'The days before your period your ankles feel thick and slow. You called it {due}.',
        scelte: [],
        esito:
          "The joint opens up the more you move it — that's {due} behaving normally. Calibrate: longer, gentler warm-up, don't force it, log where you are in your cycle.",
        azione: 'Check',
      },

      frase: {
        sopra: 'BODY LANGUAGE',
        occhiello: 'SAY IT OUT LOUD',
        titolo: 'Build the sentence.',
        intro: 'Knowing the word only counts if you can hand it to someone. Tap each gap.',
        cesto: 'PICK A WORD',
        modello: "This morning {0} feel {rigido}, so I'd rather {2}.",
        esche: ['both my ankles', 'start the session with mobility'],
        azione: 'Finish lesson',
      },

      fatto: {
        titolo: 'Lesson 3 done.',
        sotto: '{fatte} words down, {restano} to go. You just added two to your check-in.',
        etichetta: 'NOW AVAILABLE WHEN YOU CHECK IN',
        etichettaProgresso: 'TOTAL PROGRESS',
        conteggio: '{fatte} / {tutte} words unlocked',
        azione: 'Back to the path',
      },
    },

    4: {
      incontra: [
        {
          occhiello: 'WORD 1 OF 2',
          titolo: '{uno}',
          metafora: 'A fist clenching and unclenching.',
          descrizione: 'It comes in waves: grabs, lets go, grabs again.',
          blocchi: [
            {
              testo:
                'Your muscle grabbing on and forgetting to let go — then remembering, then forgetting again.',
            },
            {
              pastiglia: 'Calibrate — stop, lengthen slowly, drink, eat, get warm',
              testo: 'Does it pulse? Cramp pulses.',
            },
          ],
          azione: 'Next word',
        },
        {
          occhiello: 'WORD 2 OF 2',
          titolo: '{due}',
          metafora: "A hand that won't let go.",
          descrizione:
            'Same clench, but constant. One spot. It holds you in a position and you find yourself guarding it.',
          blocchi: [{ etichetta: 'THE SPLIT', testo: '{uno} pulses. {due} holds.' }],
          azione: "Let's practise",
        },
      ],

      abbina: {
        occhiello: 'MATCH',
        titolo: 'Put the word on its picture.',
        cesto: 'WORD BANK',
        righe: [
          'A fist clenching and unclenching',
          "A hand that won't let go",
          'A guitar string tuned too high',
          'A stuck zip',
        ],
        esche: [],
        azione: 'Check',
      },

      gemelle: {
        occhiello: 'FALSE FRIENDS',
        titolo: 'Which one is this?',
        badge: 'SCENARIO',
        scenario:
          "One spot in your left glute has been clenched since the warm-up. It hasn't let go once.",
        domanda: '',
        glosse: [],
        giusta: 1,
        esito: "Has it let go even once in the last minute? If no, it's {due}.",
        azione: 'Check',
      },

      storia: {
        occhiello: 'REAL LIFE',
        titolo: 'Name it.',
        badge: 'CYCLE · TRAINING',
        scenario:
          "Day 1. Low belly. It grips, lets go, grips again, in waves — and you've got a session in two hours.",
        domanda: '',
        etichette: ['{uno} (in waves)', '{due} (one constant hold)'],
        giusta: 0,
        esito: 'It lets go and comes back. That rhythm is {uno}, not {due}.',
        azione: 'Check',
      },

      mossa: {
        occhiello: 'YOUR MOVE',
        titolo: 'Same day. What do you do?',
        badge: 'YOUR MOVE',
        scenario: 'Day 1. Low belly. It grips, lets go, grips again. You called it {uno}.',
        scelte: [
          'Train it as planned',
          'Adjust something, then check it again',
          'Tell someone — coach, physio, parent, doctor',
        ],
        esito:
          "It nags: it stays, it doesn't grow, you know the reason. Warm up longer, eat and drink first, keep the plan but drop the intensity a notch.",
        azione: 'Check',
      },

      frase: {
        occhiello: 'SAY IT OUT LOUD',
        titolo: 'Build the sentence.',
        intro: 'Knowing the word only counts if you can hand it to someone. Tap each gap.',
        cesto: 'PICK A WORD',
        modello: "My {0} feels {morsa} {2} {3}, it's 5/10, since this morning.",
        esche: ['low belly', 'when', "I'm on day 1 of my period"],
        azione: 'Finish lesson',
      },

      fatto: {
        titolo: 'Lesson 4 done.',
        occhiello: 'NOW AVAILABLE WHEN YOU CHECK IN',
        sotto: '{fatte} words down, {restano} to go. You just added two to your check-in.',
        righe: ['A fist clenching and unclenching', "A hand that won't let go"],
        etichettaProgresso: 'TOTAL PROGRESS',
        conteggio: '{fatte} / {tutte} words unlocked',
        azione: 'Back to the path',
      },
    },

    5: {
      incontra: [
        {
          occhiello: 'WORD 1 OF 2',
          titolo: '{uno}',
          metafora: 'A paper cut, not a bruise.',
          descrizione:
            'Sudden, precise, and you can point at it with one finger. It arrives at a specific moment in a movement.',
          blocchi: [
            { testo: 'Sore highlights a whole page. Sharp underlines one word.' },
            {
              pastiglia: 'Calibrate — change the movement, change the load, check again',
              testo:
                'Usually a structure — tendon, joint edge, bone — rather than the belly of a muscle.',
            },
          ],
          azione: 'Next word',
        },
        {
          occhiello: 'WORD 2 OF 2',
          titolo: '{due}',
          metafora: 'Sharp with force behind it.',
          descrizione:
            "It makes you catch your breath, flinch, or stop mid-rep before you've decided to.",
          blocchi: [
            {
              etichetta: 'THE SPLIT',
              testo:
                "{uno} makes you change what you're doing.\n{due} makes you stop doing it.",
            },
          ],
          azione: "Let's practise",
        },
      ],

      abbina: {
        occhiello: 'MATCH',
        titolo: 'Put the word on its picture.',
        intro: 'Tap a word, then tap where it belongs.',
        cesto: 'WORD BANK',
        righe: [
          'A paper cut, not a bruise',
          'Sharp with force behind it',
          "A hand that won't let go",
          'A fist clenching and unclenching',
        ],
        esche: [],
        azione: 'Check',
      },

      gemelle: {
        occhiello: 'FALSE FRIENDS',
        titolo: 'Which one is this?',
        badge: 'SCENARIO',
        scenario:
          'Every time you land on your right leg, one exact spot on the front of your knee bites. You can cover it with one fingertip.',
        domanda: 'Which signal fits this best?',
        glosse: ['a paper cut, not a bruise', 'sharp with force behind it'],
        esito: 'One finger or a whole hand? One finger = {uno}.',
        azione: 'Check',
      },

      allarme: {
        occhiello: 'FLAG',
        titolo: 'Tell someone today.',
        intestazione: 'Red flag: {due}',
        testo:
          "Your right hamstring went ping mid-sprint and stopped you before you decided to. That's a {due} signal — it's not something to warm out or finish the session on.",
        dafare:
          "This isn't a diagnosis and it isn't drama. It's a signal that needs a second pair of eyes — and you noticing it is the skill working.",
        nota: 'I’ll tell one of them before my next session.',
        azione: 'Got it',
      },

      storia: {
        occhiello: 'REAL LIFE',
        titolo: 'Name it.',
        badge: 'TRAINING',
        scenario:
          "Third sprint. Your right hamstring goes ping and you've stopped before you decided to stop.",
        domanda: 'Which word?',
        esito: 'Did your body stop before your brain did? That’s {due}.',
        azione: 'Check',
      },

      mossa: {
        occhiello: 'YOUR MOVE',
        titolo: 'Same day. What do you do?',
        badge: 'YOUR MOVE',
        scenario:
          "Third sprint. Your right hamstring goes ping and you've stopped before you decided to stop. You called it {due}.",
        scelte: [
          'Train it as planned',
          'Adjust something, then check it again',
          'Tell someone — coach, physio, parent, doctor',
        ],
        esito:
          'Your body stopped before your brain did. That’s a flag, not drama. Stop the session and tell someone today.',
        azione: 'Check',
      },

      frase: {
        occhiello: 'SAY IT OUT LOUD',
        titolo: 'Build the sentence.',
        intro: 'Knowing the word only counts if you can hand it to someone. Tap each gap.',
        cesto: 'PICK A WORD',
        modello: "My {0} feels {trafittivo} {2}, it's 7/10, since just now.",
        esche: ['right hamstring', 'when I sprint'],
        azione: 'Finish lesson',
      },

      fatto: {
        titolo: 'Lesson 5 done.',
        sotto: '{fatte} words down, {restano} to go. You just added two to your check-in.',
        etichetta: 'WORDS UNLOCKED',
        righe: ['A paper cut, not a bruise.', 'Sharp with force behind it.'],
        etichettaProgresso: 'YOUR PROGRESS',
        conteggio: '{fatte} / {tutte} words unlocked',
        azione: 'Back to the path',
      },
    },

    6: {
      incontra: [
        {
          occhiello: 'WORD 1 OF 2',
          titolo: '{uno}',
          metafora: 'A match, not a fire.',
          descrizione:
            'A hot sting inside a muscle that builds through hard reps and leaves within a couple of minutes of stopping.',
          blocchi: [
            {
              testo:
                'It’s the hot sting in your thighs when you run up a long flight of stairs. It builds while you’re climbing, and it’s gone a minute after you stop at the top.',
            },
            {
              pastiglia: 'Push — if it fades',
              testo: 'This is the honest burn. The muscle working near its limit — a green light.',
            },
          ],
          azione: 'Next word',
        },
        {
          occhiello: 'WORD 2 OF 2',
          titolo: '{due}',
          metafora: 'Fizzy drink under the skin.',
          descrizione: 'Pins and needles. A nerve signal, not a muscle one.',
          blocchi: [
            {
              testo:
                'Exactly what your foot feels like after you’ve sat on it too long — turning up in training for no reason.',
            },
            {
              pastiglia: 'The split',
              testo:
                'Burning stays put and fades. Tingling travels and fizzes. Nerves do not respond to pushing through: effort fixes muscle problems and makes nerve problems worse.',
            },
          ],
          azione: "Let's practise",
        },
      ],

      abbina: {
        occhiello: 'MATCH',
        titolo: 'Put the word on its picture.',
        intro: 'Tap a word, then tap where it belongs.',
        cesto: 'WORD BANK',
        righe: [
          'A match, not a fire',
          'Fizzy drink under the skin',
          'A paper cut, not a bruise',
          'Sharp with force behind it',
        ],
        esche: [],
        azione: 'Check',
      },

      gemelle: {
        occhiello: 'FALSE FRIENDS',
        titolo: 'Which one is this?',
        badge: 'SCENARIO',
        scenario:
          'You sprint up four flights of stairs. At the top your thighs are on fire. Two minutes later it’s gone.',
        domanda: '',
        glosse: [],
        giusta: 0,
        esito: 'Gone within about two minutes of stopping? Green — that’s {uno}.',
        azione: 'Check',
      },

      storia: {
        occhiello: 'REAL LIFE',
        titolo: 'Name it.',
        badge: 'TRAINING',
        scenario:
          'Doing deadlifts, a fizzy pins-and-needles feeling runs from your left glute down the back of your leg into your foot.',
        domanda: '',
        giusta: 1,
        esito: 'Does it travel, fizz, or follow a line? Nerve — that’s {due}.',
        azione: 'Check',
      },

      mossa: {
        occhiello: 'YOUR MOVE',
        titolo: 'Same day. What do you do?',
        badge: 'YOUR MOVE',
        scenario:
          'Doing deadlifts, a fizzy pins-and-needles feeling runs from your left glute down the back of your leg into your foot. You called it {due}.',
        scelte: [
          'Train it as planned',
          'Adjust something, then check it again',
          'Tell someone — coach, physio, parent, doctor',
        ],
        giusta: 'sostegno',
        esito:
          'It travels in a line and it fizzes. That’s a nerve, not a muscle — and nerves don’t respond to pushing through. Stop that movement and tell someone.',
        azione: 'Check',
      },

      frase: {
        occhiello: 'SAY IT OUT LOUD',
        titolo: 'Build the sentence.',
        intro: 'Knowing the word only counts if you can hand it to someone. Tap each gap.',
        cesto: 'PICK A WORD',
        etichette: ['WHEN I FEEL:', 'MY BODY REPORTS:', 'SO I DECIDE TO:'],
        modello: '{0}{bruciante}{2}',
        esche: ['I sprint up four flights of stairs', 'keep going — it fades', 'stiff'],
        azione: 'Finish lesson',
      },

      fatto: {
        occhiello: 'COMPLETED',
        titolo: 'Lesson 6 done.',
        sotto: '{fatte} words down, {restano} to go. You just added two to your check-in.',
        etichettaProgresso: 'YOUR PROGRESS',
        conteggio: '{fatte} / {tutte} words unlocked',
        extra: '+{nuove} words unlocked today 🎉',
        nota: 'Now available when you check in.',
        azione: 'Back to the path',
      },
    },

    7: {
      incontra: [
        {
          occhiello: 'WORD 1 OF 2',
          titolo: '{uno}',
          metafora: 'The volume turned to zero.',
          descrizione:
            "Not pain — absence. The skin feels like it's behind a glove or a layer of clothing.",
          blocchi: [
            { testo: 'Tingling is a bad phone signal. Numb is no signal.' },
            {
              pastiglia: 'Support — same day',
              testo:
                'A nerve that has gone from shouting to silent. Quieter is worse, not better.',
            },
          ],
          azione: 'Next word',
        },
        {
          occhiello: 'WORD 2 OF 2',
          titolo: '{due}',
          metafora: 'A wobbly table leg.',
          descrizione:
            'The joint feels like it might give way, shift, or go. You don’t trust it under load — and often nothing hurts at all.',
          blocchi: [
            {
              etichetta: 'THE SPLIT',
              testo:
                '{uno} is a loss of feeling.\n{due} is a loss of trust. Like stepping onto a chair with one loose leg: nothing has broken yet, you just don’t trust it.\nNeither one hurts much. Both are red.',
            },
          ],
          azione: "Let's practise",
        },
      ],

      abbina: {
        occhiello: 'MATCH',
        titolo: 'Put the word on its picture.',
        cesto: 'WORD BANK',
        righe: [
          'A wobbly table leg',
          'Fizzy drink under the skin',
          'The volume turned to zero',
          'A match, not a fire',
        ],
        esche: [],
        azione: 'Check',
      },

      gemelle: {
        occhiello: 'FALSE FRIENDS',
        titolo: 'Which one is this?',
        badge: 'SCENARIO',
        scenario:
          "Your knee doesn't hurt. But you wouldn't land on it one-legged at full speed, and you know it.",
        domanda: '',
        glosse: [],
        esito:
          'Would you land on one leg on it right now, at full speed, without thinking? If you hesitated, that’s {due}.',
        azione: 'Check',
      },

      allarme: {
        occhiello: 'FLAG',
        titolo: 'Tell someone today.',
        intestazione: 'Red flag: {uno}',
        testo:
          'The outside of your thigh has lost feeling. That’s a {uno} signal — a nerve that has gone from shouting to silent. Quieter is worse, not better.',
        dafare:
          "This isn't a diagnosis and it isn't drama. It's a signal that needs a second pair of eyes — and you noticing it is the skill working.",
        azione: 'Got it',
      },

      storia: {
        occhiello: 'REAL LIFE',
        titolo: 'Name it.',
        badge: 'TRAINING',
        scenario:
          "The outside of your thigh feels like it's behind a layer of clothing. It doesn't hurt at all.",
        domanda: 'Which word?',
        giusta: 0,
        esito:
          'Run your fingertip over the same patch of skin on one side, then the other. {uno} is when one side feels like you’re touching it through your leggings.',
        azione: 'Check',
      },

      mossa: {
        occhiello: 'YOUR MOVE',
        titolo: 'Same day. What do you do?',
        badge: 'YOUR MOVE',
        scenario:
          "The outside of your thigh feels like it's behind a layer of clothing. It doesn't hurt at all. You called it {uno}.",
        scelte: [
          'Train it as planned',
          'Adjust something, then check it again',
          'Tell someone — coach, physio, parent, doctor',
        ],
        esito:
          'Nothing hurts — and that’s the point. A nerve going quiet is more serious than a nerve shouting. Support, same day.',
        azione: 'Check',
      },

      frase: {
        occhiello: 'SAY IT OUT LOUD',
        titolo: 'Build the sentence.',
        etichetta: 'YOUR SENTENCE',
        cesto: 'PICK A WORD',
        modello: "My {0} feels {instabile} when {2}, it's 3/10, since this morning.",
        esche: ['right knee', 'I land on one leg'],
        azione: 'Finish lesson',
      },

      fatto: {
        titolo: 'Lesson 7 done.',
        etichetta: 'WORDS UNLOCKED',
        righe: ['The volume turned to zero.', 'A wobbly table leg.'],
        etichettaProgresso: 'YOUR PROGRESS',
        conteggio: '{fatte} / {tutte} words unlocked',
        nota: 'Now available when you check in.',
        azione: 'Back to the path',
      },
    },

    8: {
      incontra: [
        {
          occhiello: 'WORD 1 OF 2',
          titolo: '{uno}',
          metafora: 'A water balloon under the skin.',
          descrizione:
            'The part has puffed up: it looks and feels bigger than the same part on your other side.',
          blocchi: [
            {
              testo:
                "A sock line on one ankle and not the other. A ring that won't turn. A shin pad that leaves a mark on one leg only.",
            },
            {
              pastiglia: 'One side → support · both sides → log it',
              testo: 'Compare to the same spot on the other side, in the same light.',
            },
          ],
          azione: 'Next word',
        },
        {
          occhiello: 'WORD 2 OF 2',
          titolo: '{due}',
          metafora: "The back of a laptop that's been running too long.",
          descrizione:
            'One area genuinely warmer to touch than the same spot on the other side.',
          blocchi: [
            { testo: 'Back of your hand, one side then the other, five seconds each.' },
            {
              pastiglia: 'The split',
              testo:
                '{uno} is about size. {due} is about temperature. Both are answered by touching the other side — the rule this whole journey has been building to.',
            },
          ],
          azione: "Let's practise",
        },
      ],

      abbina: {
        occhiello: 'MATCH',
        titolo: 'Put the word on its picture.',
        intro: 'Tap a word, then tap where it belongs.',
        cesto: 'WORD BANK',
        righe: [
          'A water balloon under the skin',
          "The back of a laptop that's been running too long",
          'The volume turned to zero',
          'A wobbly table leg',
        ],
        esche: [],
        azione: 'Check',
      },

      gemelle: {
        occhiello: 'FALSE FRIENDS',
        titolo: 'Which one is this?',
        badge: 'SCENARIO',
        scenario:
          "Your shin is warm to the back of your hand, and the other shin isn't. It's also red and it's getting worse.",
        domanda: '',
        glosse: ['a water balloon under the skin', "the back of a laptop that's been running too long"],
        giusta: 1,
        esito: 'Back of your hand, one side then the other, five seconds each. That’s {due}.',
        azione: 'Check',
      },

      storia: {
        occhiello: 'REAL LIFE',
        titolo: 'Name it.',
        badge: 'CYCLE · TRAINING',
        scenario:
          'Three days before your period your rings are tight and your hands, belly and legs all feel puffy. Same as every month.',
        domanda: '',
        esito: 'Compare to the same spot on the other side, in the same light. That’s {uno}.',
        azione: 'Check',
      },

      mossa: {
        occhiello: 'YOUR MOVE',
        titolo: 'Same day. What do you do?',
        badge: 'YOUR MOVE',
        scenario:
          'Three days before your period your rings are tight and your hands, belly and legs all feel puffy. Same as every month. You called it {uno}.',
        scelte: [
          'Train it as planned',
          'Adjust something, then check it again',
          'Tell someone — coach, physio, parent, doctor',
        ],
        esito:
          "Both sides, comes and goes with your cycle, same as every month. That's normal fluid — log it and train. The split is everything: one spot, one side, hours after a moment you can name would be a different answer.",
        azione: 'Check',
      },

      frase: {
        occhiello: 'SAY IT OUT LOUD',
        titolo: 'Build the sentence.',
        intro: 'Knowing the word only counts if you can hand it to someone. Tap each gap.',
        etichetta: 'YOUR SENTENCE',
        cesto: 'PICK A WORD',
        modello: "Both my {0} feel {gonfio} when {2}, it's 4/10, {3}.",
        esche: ['hands', "I'm three days before my period", 'every month'],
        azione: 'Finish lesson',
      },

      fatto: {
        titolo: 'Lesson 8 done.',
        sotto:
          "{fatte} words down, {restano} to go. That's all of them — your check-in speaks your whole language now.",
        etichetta: 'WORDS UNLOCKED',
        righe: ['A water balloon under the skin.', 'The back of a laptop left running.'],
        etichettaProgresso: 'YOUR PROGRESS',
        conteggio: '{fatte} / {tutte} words unlocked',
        azione: 'Back to the path',
      },
    },
  } as Record<number, ContenutoLezione>,
}

export const TESTI_PERCORSO = { it, en }
export type TestiPercorso = typeof it
/** I testi di una lezione, come li riceve ogni esercizio. */
export type TestiLezione = ContenutoLezione
