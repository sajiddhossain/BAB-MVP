/**
 * Le parole del percorso.
 *
 * ── L'INGLESE VIENE DAL DISEGNO, L'ITALIANO ANCHE ──────────────────────────
 * Questa e' la prima parte dell'app disegnata in tutte e due le lingue: i 69
 * frame esistono due volte, una volta in italiano e una in inglese. Quindi
 * qui non c'e' quasi niente di tradotto da noi — c'e' quello che c'e' scritto
 * in Figma, da una parte e dall'altra.
 *
 * Le due versioni NON dicono la stessa cosa. L'inglese e' una riscrittura
 * piu' recente e piu' asciutta ("Strong is loud and yours"), l'italiano e' il
 * primo giro, piu' didattico. Non le abbiamo allineate: allinearle vuol dire
 * scegliere quale delle due buttare, e non e' una decisione da prendere
 * mentre si scrive codice.
 *
 * ── LE QUATTRO COSE CHE ABBIAMO SCRITTO NOI ────────────────────────────────
 * Sono poche e vanno rilette prima del pilota:
 *
 * 1. `comune`: verifica, continua, giusto, non ancora. In Figma non ci sono
 *    perche' i frame mostrano un solo stato per schermo.
 * 2. I nomi delle parole dentro alle frasi italiane sono buchi — `{uno}`,
 *    `{due}`, `{forte}` — e non le parole inglesi che ci sono in Figma. Nei
 *    frame italiani si legge 'Usa "strong" quando...', ma nell'app italiana
 *    quella parola si chiama "forte": lasciarla in inglese vorrebbe dire che
 *    la lezione insegna una parola e il check-in ne chiede un'altra.
 * 3. L'occhiello della mossa: in Figma e' "YOUR MOVE" anche in italiano.
 * 4. La nota sotto alle tre mosse in italiano: in Figma li' c'e' due volte la
 *    stessa frase del riscontro. Quella qui e' tradotta dall'inglese, dove
 *    invece dice una cosa che serve — quando una sensazione leggera smette di
 *    essere leggera.
 *
 * ── I NOMI DELLE UNITA' NON DICONO LE PAROLE ───────────────────────────────
 * Sotto a ogni unita' il disegno elenca le sue quattro parole
 * ("forte • leggero / indolenzito • affaticato"). Quelle NON stanno qui: si
 * costruiscono dalle sedici parole che l'app ha gia', cosi' cambiandone una
 * cambia in tutti e due i posti invece che in uno solo.
 */

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
          etichetta: 'TIPO DI ALLENAMENTO',
          nota: 'Usa «{uno}» quando il tuo corpo si sente pronto a sprigionare energia e a gestire carichi pesanti.',
          azione: 'Parola successiva',
        },
        {
          occhiello: 'PAROLA 2 DI 2',
          metafora: 'Una piuma.',
          descrizione:
            'Appena percettibile. Lo dimenticheresti se non stessi facendo il check-in.',
          citazione: '«Sento i piedi che volano sul terreno.»',
          etichetta: 'LA DIFFERENZA',
          nota: '«{uno}» è la potenza del motore. «{due}» è il peso che non senti. Puoi sentirli tutti e due insieme.',
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
      },

      gemelle: {
        occhiello: 'FALSI AMICI',
        badge: 'SCENARIO',
        scenario: 'Metà allenamento e le gambe sembrano avere una batteria in più.',
        domanda: 'Quale segnale descrive meglio questa sensazione?',
        glosse: ['Potenza muscolare al massimo', 'Leggera, senza attrito'],
      },

      storia: {
        occhiello: 'SCENARIO DI VITA REALE',
        badge: 'SCENARIO',
        scenario:
          'Due giorni prima del ciclo. Le tue gambe si sentono piene e leggermente pesanti, entrambe, come il mese scorso.',
        domanda: 'SELEZIONA IL SEGNALE CORRETTO:',
      },

      mossa: {
        occhiello: 'LA TUA MOSSA',
        titolo: 'Il tuo corpo si sente «{due}». Cosa fai?',
        scelte: ['Aumenta il carico o spingi di più', "Mantieni l'intensità attuale", ''],
        esito:
          'Quando ti senti agile e leggera, è il momento migliore per calibrare lo sforzo e goderti la sessione fluida.',
        nota: 'Se lo stesso segnale «{due}» torna nello stesso punto a ogni allenamento per due settimane, non è più «{due}». Dillo a qualcuno.',
      },

      frase: {
        occhiello: 'COMPONI LA TUA FRASE',
        titolo: 'Completa il tuo check-in giornaliero',
        cesto: 'TRASCINA LE PAROLE',
        /* i buchi portano dentro il nome della parola giusta: `{forte}` */
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
  },
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
          citazione: "Like carrying heavy shopping bags up the stairs: hard, but you're in charge of it.",
          etichetta: 'TRAINING',
          nota: 'The muscle doing its job under load. This is what training is supposed to feel like.',
          azione: 'Next word',
        },
        {
          occhiello: 'WORD 2 OF 2',
          metafora: 'A feather.',
          descrizione: "Barely there. You'd forget it existed if you weren't checking in.",
          citazione: 'The difference between someone tapping your shoulder and someone grabbing it.',
          etichetta: 'THE SPLIT',
          nota: '{uno} is loud and yours. {due} is quiet and easy to lose. Both are green. This lesson exists so you learn green feels like something, not like nothing.',
          azione: "Let's practise",
        },
      ],

      abbina: {
        titolo: 'Put the word on its picture.',
        cesto: 'WORD BANK',
        righe: [
          'The engine sound',
          'A feather',
          'A sudden electric charge',
          'A calm, regular beat',
        ],
        esche: ['heavy'],
      },

      gemelle: {
        occhiello: 'FALSE FRIENDS',
        badge: 'SCENARIO',
        scenario:
          "Halfway through the set your legs feel like they've got extra battery. You could do two more.",
        domanda: 'Which one is this?',
        glosse: ['the engine sound', 'a feather'],
      },

      storia: {
        occhiello: 'REAL LIFE',
        badge: 'CYCLE · TRAINING',
        scenario:
          'Two days before your period. Your legs feel full and slightly heavy, both of them, same as last month.',
        domanda: 'WHICH WORD?',
      },

      mossa: {
        occhiello: 'YOUR MOVE',
        titolo: 'Same day. What do you do?',
        scelte: ['Train it as planned', 'Adjust something, then check it again', ''],
        esito:
          "Both sides, no reason to act, and you've seen it before. It fades. Train, log it, keep noticing.",
        nota: 'If the same "{due}" thing shows up in the same spot every session for two weeks, it isn\'t {due} any more. Mention it.',
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
  },
}

export const TESTI_PERCORSO = { it, en }
export type TestiPercorso = typeof it
/** I testi di una lezione, come li riceve ogni esercizio. */
export type TestiLezione = TestiPercorso['lezioni'][1]
