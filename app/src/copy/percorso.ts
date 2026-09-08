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
    occhiello?: string
    titolo: string
    cesto: string
    /** la riga sotto al cesto; assente vuol dire quella di `comune` */
    aiuto?: string
    righe: string[]
    esche: string[]
    azione: string
  }

  gemelle: {
    occhiello: string
    /** il titolo sopra allo scenario: ce l'ha solo la veste classica */
    titolo?: string
    badge: string
    scenario: string
    domanda: string
    /** una riga per risposta, mostrata dopo la verifica */
    glosse: string[]
    esito: string
    azione: string
  }

  storia: {
    occhiello: string
    titolo?: string
    badge: string
    scenario: string
    domanda: string
    esito: string
    azione: string
  }

  mossa: {
    occhiello: string
    titolo: string
    /** la pastiglia e lo scenario sopra alle tre carte: solo veste classica */
    badge?: string
    scenario?: string
    /** una riga per mossa, nell'ordine spingi / calibra / sostegno */
    scelte: string[]
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
    nota: string
    azione: string
  }

  frase: {
    occhiello: string
    titolo: string
    /** l'etichetta dentro alla scheda: ce l'ha solo la veste classica */
    etichetta?: string
    cesto: string
    /** i buchi portano dentro il nome della parola giusta: `{forte}` */
    modello: string
    nota: string
    esche: string[]
    azione: string
  }

  fatto: {
    titolo: string
    /** la riga sotto al titolo: ce l'ha solo la veste classica */
    sotto?: string
    /** l'etichetta sopra alle due parole: solo la veste della lezione 1 */
    etichetta?: string
    /** una riga per parola: solo la veste della lezione 1 */
    righe?: string[]
    etichettaProgresso: string
    conteggio: string
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
  } as Record<number, ContenutoLezione>,
}

export const TESTI_PERCORSO = { it, en }
export type TestiPercorso = typeof it
/** I testi di una lezione, come li riceve ogni esercizio. */
export type TestiLezione = ContenutoLezione
