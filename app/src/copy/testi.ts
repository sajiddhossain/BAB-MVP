/**
 * Tutti i testi dell'onboarding, in italiano e in inglese.
 *
 * Vengono dai nomi dei livelli di testo del file Figma: in questo file i
 * livelli si chiamano come il testo che contengono, quindi la copia si legge
 * dai metadati senza aprire schermo per schermo.
 *
 * Due cose da sapere prima di fidarsi di quello che c'e' scritto qui:
 *
 * 1. Alcuni frame inglesi contengono ancora l'italiano (vedi DA_RIVEDERE).
 *    Li' l'inglese qui sotto l'abbiamo scritto noi: funziona, ma non e' ancora
 *    passato da chi scrive i testi.
 * 2. Su alcuni schermi i livelli si chiamano `headline`, `body-text`,
 *    `button-text`: sono segnaposto, il testo vero non sta nel nome. Quelli
 *    vanno riletti con get_design_context schermo per schermo.
 */

/** Gli schermi in cui il frame inglese di Figma contiene ancora l'italiano. */
export const DA_RIVEDERE = [
  // i quattro schermi della home: i frame inglesi (4126) sono un giro
  // indietro rispetto agli italiani (4141) — non hanno le pastiglie del
  // tempo, il badge "avevi previsto", la scheda riepilogo. Abbiamo costruito
  // sull'italiano e tradotto quello che mancava.
  'home-1-checkin-due',
  'home-2-checkout-due',
  'home-3-done-flagged',
  'home-4-rest-day',
  // i due schermi dell'accesso: in Figma parlano di un link, ma il link non
  // esiste piu' — si entra solo col codice a sei cifre
  '01-auth-login',
  '02-auth-link-sent',
  '11-cycle-question',
  '12-cycle-dates',
  '13b-first-period-date',
  // e i nomi dei giorni, che restano "Lun Mar Mer..." anche nel frame inglese
  '08-training/giorni',
  '09-pe/giorni',
] as const

const it = {
  comune: {
    continua: 'Continua',
    indietro: 'Indietro',
    si: 'Sì',
    no: 'No',
    salta: 'Salta',
  },

  accesso: {
    occhiello: 'ACCESSO',
    titolo: 'Entra in BAB',
    occhio: 'Inserisci la tua mail e ti mandiamo subito un codice per attivare BAB.',
    nota: 'Siamo felici che tu sia qui 🎉',
    etichetta: 'LA TUA EMAIL',
    segnaposto: 'nome@esempio.it',
    azione: 'Mandami il codice',
    invio: 'Sto mandando…',
    nonRiuscito: 'Non siamo riusciti a mandare la mail. Riprova fra un momento.',
    troppoLento: 'La mail ci sta mettendo troppo. Riprova fra qualche minuto.',
    aspetta: { uno: 'Aspetta {secondi} secondo e riprova.', molti: 'Aspetta {secondi} secondi e riprova.' },
  },

  linkMandato: {
    occhiello: 'ACCESSO',
    titolo: 'Guarda la posta',
    occhio: 'Abbiamo mandato un codice a {mail}. Scrivilo qui sotto ed è fatta.',
    rimanda: 'Non è arrivato? Rimandalo',
    rimandato: 'Rimandato. Guarda la posta.',
    spiegaCodice: 'Se non lo trovi, guarda nella posta indesiderata. Il codice vale un\'ora.',
    etichettaCodice: 'CODICE',
    codiceSbagliato: 'Questo codice non va. Controlla la mail.',
  },

  cosaEBab: {
    occhiello: 'BENVENUTA!',
    titolo: 'Impariamo i segnali del corpo',
    occhio:
      'Ogni giorno, il corpo ci manda dei messaggi — stanco, teso, riposato, carico. Ma coglierne e capirne il significato può essere complicato a volte. BAB ti insegna questo superpotere, un passo alla volta.',
    azione: 'Mostrami come',
    passi: [
      {
        titolo: 'Prima indovina',
        testo: 'Prova a indovinare come sta il tuo corpo oggi e quanto ha da dare.',
      },
      {
        titolo: 'Sintonizzati',
        testo: 'Soffermati ad ascoltare cosa ti sta dicendo il tuo corpo, un passo alla volta.',
      },
      {
        titolo: 'Impara dal confronto',
        testo:
          'Confronta come pensavi di stare con ciò che ti ha detto il corpo: è così che impari a leggere sempre meglio i suoi segnali.',
      },
    ],
  },

  nome: {
    occhiello: 'IL TUO PROFILO',
    titolo: 'Come ti chiamiamo?',
    occhio: "Il nome che vuoi leggere quando apri l'app. Puoi cambiarlo quando vuoi.",
    etichetta: 'IL TUO NOME',
    segnaposto: 'Il tuo nome',
  },

  compleanno: {
    occhiello: 'IL TUO PROFILO',
    titolo: 'Quando compi gli anni?',
    occhio:
      'BAB lo usa per capire la tua fase di crescita. Il corpo cambia un sacco in questi anni, e le stesse sensazioni possono significare cose diverse.',
    etichetta: 'DATA DI NASCITA',
    segnaposto: 'gg/mm/aaaa',
    troppoPiccola: 'BAB parte dai 12 anni.',
  },

  sport: {
    occhiello: 'IL TUO PROFILO',
    titolo: 'Quali sport fai?',
    occhio: 'Aggiungili tutti e poi seleziona quello principale',
    etichetta: 'CERCA UNO SPORT',
    segnaposto: 'Cerca uno sport',
    principale: 'PRINCIPALE',
    nessuno: 'Nessun risultato',
    /* i nomi che si vedono nella ricerca e nelle pastiglie */
    nomi: {
      atletica: 'Atletica',
      basket: 'Basket',
      calcio: 'Calcio',
      ciclismo: 'Ciclismo',
      danza: 'Danza',
      ginnastica: 'Ginnastica',
      judo: 'Judo',
      nuoto: 'Nuoto',
      pallamano: 'Pallamano',
      pallavolo: 'Pallavolo',
      rugby: 'Rugby',
      scherma: 'Scherma',
      sci: 'Sci',
      tennis: 'Tennis',
      equitazione: 'Equitazione',
      arrampicata: 'Arrampicata',
      corsa: 'Corsa',
      canottaggio: 'Canottaggio',
    },
  },

  allenamenti: {
    occhiello: 'IL TUO PROFILO',
    titolo: 'Quando ti alleni?',
    occhio: "Imposta i giorni e l'orario per ogni sport. Puoi sempre cambiarli dopo.",
    giorni: 'I TUOI GIORNI',
    orario: 'A CHE ORA DI SOLITO?',
    fasce: ['Mattina', 'Pomeriggio', 'Sera'],
  },

  edFisica: {
    occhiello: 'IL TUO PROFILO',
    titolo: 'Educazione fisica',
    occhio: 'Ogni giorno che fai attività fisica conta, pure la ricreazione, se corri.',
    etichetta: 'GIORNI DI ED. FISICA',
  },

  gare: {
    occhiello: 'IL TUO PROFILO',
    titolo: 'Gare e partite',
    occhio: "Se non sai ancora l'orario va benissimo: lo aggiungi dopo.",
    etichetta: 'LA PROSSIMA GARA, SE LA SAI GIÀ',
    segnaposto: 'gg/mm/aaaa',
  },

  cicloSiNo: {
    occhiello: 'IL TUO CICLO',
    titolo: 'Hai già il ciclo?',
    scelte: [
      { id: 'si', titolo: "Sì, ce l'ho", sotto: 'BAB ti supporta a gestirlo.' },
      { id: 'non-ancora', titolo: 'Non ancora', sotto: 'Ogni corpo ha il suo tempo.' },
      {
        id: 'preferisco-non-dirlo',
        titolo: 'Preferisco non dirlo',
        sotto: 'Va bene anche così. Questo spazio è tuo.',
      },
    ],
  },

  cicloDate: {
    occhiello: 'IL TUO CICLO',
    titolo: 'Quando sono iniziati i tuoi ultimi tre cicli?',
    occhio: 'Anche una sola data basta a BAB per partire.',
    etichette: ['IL PIÙ RECENTE', 'QUELLO PRIMA', 'E ANCORA PRIMA'],
    segnaposto: 'gg/mm/aaaa',
  },

  primoCiclo: {
    occhiello: 'IL TUO CICLO',
    titolo: 'Quando hai avuto il primo ciclo?',
    occhio: "Anche solo l'anno va benissimo, se non ricordi il mese.",
    mese: 'MESE',
    scegliMese: 'Seleziona mese',
    anno: 'ANNO',
    scegliAnno: 'Seleziona anno',
  },

  contraccettivo: {
    occhiello: 'IL TUO CICLO',
    titolo: 'Prendi un contraccettivo ormonale?',
    nota: 'Condividerlo aiuta BAB a darti insight più precisi, perché la contraccezione ormonale può influenzare alcuni dei parametri che monitorerai.',
  },

  riepilogo: {
    occhiello: 'RIEPILOGO',
    titolo: 'Ecco fatto',
    occhio: 'Questo è quello che BAB sa di te. Puoi cambiare tutto dalle impostazioni.',
    voci: {
      nome: 'COME TI CHIAMIAMO?',
      sport: 'IL TUO SPORT',
      allenamenti: 'ALLENAMENTI',
      edFisica: 'ED. FISICA A SCUOLA',
      ciclo: 'ULTIMO CICLO',
    },
    vuoto: '—',
    salvataggio: 'Sto salvando…',
    nonSalvato: 'Non siamo riusciti a salvare. Riprova.',
    sessioneScaduta: 'La sessione è scaduta. Rientra: ritrovi tutto com’era.',
  },

  consenso: {
    occhiello: 'CONSENSO',
    titolo: 'Prima di tutto il resto',
    occhio:
      'Hai meno di 18 anni, quindi servono due sì: il tuo e quello di un genitore o di chi si prende cura di te.',
    segnaposto:
      'Questo testo è un segnaposto: quello definitivo arriva prima che la app venga usata davvero.',
    caselle: ['Ho letto e ci sto', 'Un genitore o chi si prende cura di me ha letto e ci sta'],
  },

  primaRep: {
    occhiello: 'COME FUNZIONA',
    titolo: 'Indovina. Sintonizzati. Confronta',
    occhio: 'Tre step da fare ogni giorno:',
    chiusura:
      'Più ti alleni a farlo, più accurata sarà la tua lettura dei segnali del corpo.',
    passi: [
      {
        titolo: 'Prima indovina',
        testo: 'Prova a indovinare come sta il tuo corpo oggi e quanto ha da dare.',
      },
      {
        titolo: 'Sintonizzati',
        testo: 'Soffermati ad ascoltare cosa ti sta dicendo il tuo corpo, un passo alla volta.',
      },
      {
        titolo: 'Impara dal confronto',
        testo:
          'Confronta come pensavi di stare con ciò che ti ha detto il corpo: è così che impari a leggere sempre meglio i suoi segnali.',
      },
    ],
  },

  casa: {
    saluto: 'Ciao {nome}',
    giorni: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'],
    nav: { home: 'Home', percorso: 'Percorso', storico: 'Storico', profilo: 'Profilo' },
    tempi: { carica: 'Scattante', costante: 'Stabile', leggero: 'Tranquillo' },

    checkin: {
      etichetta: 'Allenamento oggi · {ora}',
      titolo: 'Facciamo il check-in.',
      corpo: 'Prima di iniziare la sessione, prenditi un momento per ascoltare il tuo corpo.',
      azione: 'Inizia check-in',
    },

    checkout: {
      etichetta: 'Check-in fatto prima della sessione',
      titolo: "Com'è andata?",
      corpo: 'Prenditi un minuto ora, a caldo — guarda come ne sei uscita e come si sente il tuo corpo.',
      previsto: 'Avevi previsto',
      azione: 'Check out',
    },

    fatto: {
      etichetta: 'Streak +1 · brava!',
      titolo: 'Oggi, in una frase.',
      segnalazione:
        'Da segnalare: stesso punto, stesso gesto, più di una volta. Parlane col tuo coach o un genitore.',
    },

    riposo: {
      etichetta: 'Giorno di riposo',
      titolo: 'Un attimo per ascoltarti.',
      corpo:
        'Niente allenamento oggi, nessun tempo da indovinare — ma il tuo corpo merita comunque un minuto. Veloce e leggero.',
      campi: {
        sonno: 'Sonno',
        energia: 'Energia',
        scuola: 'Scuola',
        umore: 'Umore',
        bodymap: 'Body-Map',
        ciclo: 'Ciclo',
        antidolorifici: 'Antidolorifici presi?',
      },
      azione: 'Inizia body check-in',
    },

    percorsoCard: {
      occhiello: 'BODY LANGUAGE · LEZIONE 5',
      occhielloRiposo: 'BODY LANGUAGE · 4/8 LEZIONI',
      occhielloFatto: 'BODY LANGUAGE',
      titolo: 'Sblocca "acuto" e "lancinante"',
      titoloFatto: 'Continua Lezione 5',
      sotto: '2 min · 2 parole ti aspettano nel check-in',
      sottoRiposo: '2 min',
      sottoFatto: '"acuto" è comparso oggi — scopri cosa significa',
    },

    /*
     * Cosa dice la home quando non e' ora.
     *
     * Il check-in si fa la mattina e il check-out dopo l'allenamento: fuori
     * da quelle ore il bottone non c'e', e al suo posto c'e' una di queste
     * righe. `{ora}` lo mette l'app dalle finestre in `lib/finestre.ts`, non
     * si scrive a mano: se un giorno si spostano gli orari, una scritta a
     * mano resterebbe indietro senza che nessuno se ne accorga.
     */
    finestra: {
      checkinPresto: 'Il check-in apre alle {ora}.',
      checkinRitardo: 'Il momento del check-in era stamattina, ma puoi ancora farlo.',
      checkinChiuso: 'Il check-in di oggi si è chiuso. Riapre domani alle {ora}.',
      checkoutPresto: 'Il check-out apre alle {ora}, dopo l’allenamento.',
      checkoutRitardo: 'Il momento del check-out è passato, ma puoi ancora farlo.',
      fatto: 'Fatto per oggi.',
    },

    sezioni: {
      intanto: 'INTANTO CHE SEI QUI',
      nientaltro: "NIENT'ALTRO PER OGGI",
      percorso: 'IL TUO PERCORSO',
    },

    settimana: {
      titolo: 'Questa settimana',
      righe: {
        checkin: 'Check-in',
        tempo: 'Tempo più frequente',
        parole: 'Parole registrate',
      },
      valori: {
        checkin: '{fatti} su {su} giorni di allenamento',
        nessuna: '—',
      },
    },
  },

  giorni: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
  mesi: [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre',
  ],

  /*
   * Lo schermo di una sezione che c'e' ma non e' ancora aperta.
   *
   * Il nome della sezione non sta qui: e' quello della barra in fondo, cioe'
   * la parola che ha appena toccato. Scriverlo una seconda volta vorrebbe dire
   * poterlo cambiare in un posto e non nell'altro.
   *
   * `quando` non promette una data. Dice l'unica cosa che le serve davvero
   * sapere: che non deve fare niente per averla.
   */
  prossimamente: {
    occhiello: 'IN ARRIVO',
    etichettaCosa: 'CHE COS’È',
    etichettaQuando: 'QUANDO',
    azione: 'Torna alla home',
    sezioni: {
      percorso: {
        cosa: 'Otto lezioni brevi che ti mettono in mano sedici parole per dire cosa senti: quali segnali vogliono dire che il corpo sta lavorando, quali vogliono dire che ti sta avvisando, e cosa fare in tutti e due i casi.',
        quando: 'Lo stiamo provando con le prime atlete. Quando è pronto lo trovi qui: non devi aggiornare niente, non devi fare niente.',
      },
      parole: {
        cosa: 'Le sedici parole in un posto solo: cosa vuol dire ognuna, quando usarla, e cosa dice del tuo corpo.',
        quando: 'Si apre insieme al percorso.',
      },
      storico: {
        cosa: 'I tuoi check-in messi in fila: come cambia la tua energia settimana dopo settimana, quali zone del corpo tornano più spesso, cosa succede intorno al ciclo.',
        quando: 'Prima serve un po’ di storia da mostrare. I check-in che fai adesso li stiamo già tenendo da parte: quando lo storico si apre, ci trovi dentro anche questi.',
      },
      profilo: {
        cosa: 'I tuoi sport, i tuoi allenamenti, la lingua — e cosa BAB sa di te, con il modo per cambiarlo o per portartelo via.',
        quando: 'Arriva insieme allo storico.',
      },
    },
  },
}

/**
 * Deve avere esattamente la stessa forma dell'italiano: se manca una chiave o
 * ne avanza una, il typecheck si ferma qui invece che a schermo acceso.
 */
const en: typeof it = {
  comune: {
    continua: 'Continue',
    indietro: 'Back',
    si: 'Yes',
    no: 'No',
    salta: 'Skip',
  },

  accesso: {
    occhiello: 'ACCESS',
    titolo: 'Enter BAB',
    occhio: 'Enter your email and we will send you a code to activate BAB right away.',
    nota: 'We are happy to have you here 🎉',
    etichetta: 'YOUR EMAIL',
    segnaposto: 'name@example.com',
    azione: 'Send me the code',
    invio: 'Sending…',
    nonRiuscito: 'We could not send the email. Try again in a moment.',
    troppoLento: 'The email is taking too long. Try again in a few minutes.',
    aspetta: { uno: 'Wait {secondi} second and try again.', molti: 'Wait {secondi} seconds and try again.' },
  },

  linkMandato: {
    occhiello: 'ACCESS',
    titolo: 'Check your inbox',
    occhio: "We have sent a code to {mail}. Type it in below and you're all set.",
    rimanda: 'Did it not arrive? Resend it.',
    rimandato: 'Sent again. Check your inbox.',
    spiegaCodice: 'If you cannot find it, check your spam folder. The code lasts an hour.',
    etichettaCodice: 'CODE',
    codiceSbagliato: 'That code does not work. Check the email.',
  },

  cosaEBab: {
    occhiello: 'WELCOME!',
    titolo: "Let's learn your body's signals",
    occhio:
      "Every day, your body sends you messages — tired, tense, rested, charged. But catching them and working out what they mean can be tricky. BAB teaches you that superpower, one step at a time.",
    azione: 'Show me how',
    passi: [
      {
        titolo: 'Predict first',
        testo: "Take a quick guess about how much your body's got to give today.",
      },
      {
        titolo: 'Tune in',
        testo: "Slow down and actually sense what's going on, bit by bit.",
      },
      {
        titolo: 'Learn the gap',
        testo:
          'The space between your guess and your body’s tempo is where you get sharper at decoding its signals. Being "off" isn’t a fail.',
      },
    ],
  },

  nome: {
    occhiello: 'YOUR PROFILE',
    titolo: 'What shall we call you?',
    occhio: 'The name you want to see when you open the app. You can change it whenever you like.',
    etichetta: 'YOUR NAME',
    segnaposto: 'Your name',
  },

  compleanno: {
    occhiello: 'YOUR PROFILE',
    titolo: 'When is your birthday?',
    occhio:
      'BAB uses this to understand your growth phase. Your body changes a lot during these years, and the same feelings can mean different things.',
    etichetta: 'DATE OF BIRTH',
    segnaposto: 'dd/mm/yyyy',
    troppoPiccola: 'BAB starts at 12.',
  },

  sport: {
    occhiello: 'YOUR PROFILE',
    titolo: 'What sports do you play?',
    occhio: 'Add them all and then select the main one',
    etichetta: 'SEARCH FOR A SPORT',
    segnaposto: 'Search for a sport',
    principale: 'MAIN',
    nessuno: 'No results',
    /* i nomi che si vedono nella ricerca e nelle pastiglie */
    nomi: {
      atletica: 'Athletics',
      basket: 'Basketball',
      calcio: 'Football',
      ciclismo: 'Cycling',
      danza: 'Dance',
      ginnastica: 'Gymnastics',
      judo: 'Judo',
      nuoto: 'Swimming',
      pallamano: 'Handball',
      pallavolo: 'Volleyball',
      rugby: 'Rugby',
      scherma: 'Fencing',
      sci: 'Skiing',
      tennis: 'Tennis',
      equitazione: 'Horse riding',
      arrampicata: 'Climbing',
      corsa: 'Running',
      canottaggio: 'Rowing',
    },
  },

  allenamenti: {
    occhiello: 'YOUR PROFILE',
    titolo: 'When do you train?',
    occhio: 'Set the days and times for each sport. You can always change them later.',
    giorni: 'YOUR DAYS',
    orario: 'AT WHAT TIME USUALLY?',
    fasce: ['Morning', 'Afternoon', 'Evening'],
  },

  edFisica: {
    occhiello: 'YOUR PROFILE',
    titolo: 'Physical education',
    occhio: 'Every day you do physical activity counts, even playtime, if you run.',
    etichetta: 'PE DAYS',
  },

  gare: {
    occhiello: 'YOUR PROFILE',
    titolo: 'Matches and games',
    occhio: "If you don't know the time yet, that's perfectly fine: you can add it later.",
    etichetta: 'THE NEXT MATCH, IF YOU ALREADY KNOW IT',
    segnaposto: 'dd/mm/yyyy',
  },

  // --- da qui in giu' il frame inglese di Figma contiene ancora l'italiano:
  //     questo inglese l'abbiamo scritto noi. Vedi DA_RIVEDERE.
  cicloSiNo: {
    occhiello: 'YOUR CYCLE',
    titolo: 'Have you started your period?',
    scelte: [
      { id: 'si', titolo: 'Yes, I have', sotto: 'BAB helps you keep track of it.' },
      { id: 'non-ancora', titolo: 'Not yet', sotto: 'Every body has its own timing.' },
      {
        id: 'preferisco-non-dirlo',
        titolo: "I'd rather not say",
        sotto: 'That is fine too. This space is yours.',
      },
    ],
  },

  cicloDate: {
    occhiello: 'YOUR CYCLE',
    titolo: 'When did your last three periods start?',
    occhio: 'Even one date is enough for BAB to get going.',
    etichette: ['THE MOST RECENT', 'THE ONE BEFORE', 'AND THE ONE BEFORE THAT'],
    segnaposto: 'dd/mm/yyyy',
  },

  primoCiclo: {
    occhiello: 'YOUR CYCLE',
    titolo: 'When did you have your first period?',
    occhio: "Even just the year is fine, if you don't remember the month.",
    mese: 'MONTH',
    scegliMese: 'Select month',
    anno: 'YEAR',
    scegliAnno: 'Select year',
  },
  // --- fine della parte tradotta da noi

  contraccettivo: {
    occhiello: 'YOUR CYCLE',
    titolo: 'Taking any hormonal contraception?',
    nota: "Sharing it helps BAB give you more accurate insights, as hormonal contraception can affect some of the metrics you'll track.",
  },

  riepilogo: {
    occhiello: 'SUMMARY',
    titolo: 'Done',
    occhio: 'This is what BAB knows about you. You can change everything in the settings.',
    voci: {
      nome: 'WHAT SHALL WE CALL YOU?',
      sport: 'YOUR SPORT',
      allenamenti: 'TRAINING SESSIONS',
      edFisica: 'PE AT SCHOOL',
      ciclo: 'LAST CYCLE',
    },
    vuoto: '—',
    salvataggio: 'Saving…',
    nonSalvato: 'We could not save. Try again.',
    sessioneScaduta: 'Your session expired. Log back in: everything is still here.',
  },

  consenso: {
    occhiello: 'CONSENT',
    titolo: 'Before we proceed',
    occhio: 'You are under 18, so we need two yeses: yours and one from a parent or guardian.',
    segnaposto:
      'This text is a placeholder: the final version will arrive before the app is actually used.',
    caselle: ['I have read and agree.', 'A parent or guardian has read and agrees.'],
  },

  primaRep: {
    occhiello: 'HOW IT WORKS',
    titolo: 'Guess. Tune in. Compare',
    occhio: 'Three steps to do every day:',
    chiusura: 'The more you practise, the sharper your reading of your body will get.',
    passi: [
      {
        titolo: 'Predict first',
        testo: "Take a quick guess about how much your body's got to give today.",
      },
      { titolo: 'Tune in', testo: "Slow down and actually sense what's going on, bit by bit." },
      {
        titolo: 'Learn the gap',
        testo:
          'Compare how you thought you felt with what your body told you: that is how you get better at reading its signals.',
      },
    ],
  },

  casa: {
    saluto: 'Hey {nome}',
    giorni: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    nav: { home: 'Home', percorso: 'Journey', storico: 'History', profilo: 'Profile' },
    tempi: { carica: 'Upbeat', costante: 'Steady', leggero: 'Gentle' },

    checkin: {
      etichetta: 'Training today · {ora}',
      titolo: "Let's check in.",
      corpo: "Before the session starts, take a moment to listen to your body's signals.",
      azione: "I'm ready",
    },

    checkout: {
      etichetta: 'Checked in before your session',
      titolo: 'How did it go?',
      corpo:
        "Before you move on, let's pause to look back and notice how you feel, while it's still fresh.",
      previsto: 'You predicted',
      azione: 'Check out',
    },

    fatto: {
      etichetta: 'Streak +1 · nice work',
      titolo: 'Today, in one line.',
      segnalazione:
        'Worth flagging: same spot, same movement, more than once. Talk to your coach or a parent.',
    },

    riposo: {
      etichetta: 'Rest day',
      titolo: 'Just a quick attunement.',
      corpo: "No training today, but your body's still worth a minute. Quick and light.",
      campi: {
        sonno: 'Sleep',
        energia: 'Energy',
        scuola: 'School',
        umore: 'Mood',
        bodymap: 'Body-Map',
        ciclo: 'Period',
        antidolorifici: 'Painkillers taken?',
      },
      azione: 'Start body check-in',
    },

    percorsoCard: {
      occhiello: 'BODY LANGUAGE · LESSON 5',
      occhielloRiposo: 'BODY LANGUAGE · 4/8 LESSONS',
      occhielloFatto: 'BODY LANGUAGE',
      titolo: 'Unlock "sharp" and "stabbing"',
      titoloFatto: 'Continue Lesson 5',
      sotto: '2 min · 2 words waiting in your check-in',
      sottoRiposo: '2 min',
      sottoFatto: '"sharp" came up today — find out what it means',
    },

    /*
     * Cosa dice la home quando non e' ora.
     *
     * Il check-in si fa la mattina e il check-out dopo l'allenamento: fuori
     * da quelle ore il bottone non c'e', e al suo posto c'e' una di queste
     * righe. `{ora}` lo mette l'app dalle finestre in `lib/finestre.ts`, non
     * si scrive a mano: se un giorno si spostano gli orari, una scritta a
     * mano resterebbe indietro senza che nessuno se ne accorga.
     */
    finestra: {
      checkinPresto: 'Check-in opens at {ora}.',
      checkinRitardo: 'The morning check-in has passed, but you can still do it.',
      checkinChiuso: 'Today’s check-in has closed. It opens again tomorrow at {ora}.',
      checkoutPresto: 'Check-out opens at {ora}, after training.',
      checkoutRitardo: 'The check-out window has passed, but you can still do it.',
      fatto: 'Done for today.',
    },

    sezioni: {
      intanto: "WHILE YOU'RE HERE",
      nientaltro: 'NOTHING ELSE FOR TODAY',
      percorso: 'YOUR JOURNEY',
    },

    settimana: {
      titolo: 'This week',
      righe: {
        checkin: 'Check-ins',
        tempo: 'Most frequent tempo',
        parole: 'Words logged',
      },
      valori: {
        checkin: '{fatti} of {su} training days',
        nessuna: '—',
      },
    },
  },

  giorni: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  mesi: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],

  prossimamente: {
    occhiello: 'COMING SOON',
    etichettaCosa: 'WHAT IT IS',
    etichettaQuando: 'WHEN',
    azione: 'Back to home',
    sezioni: {
      percorso: {
        cosa: 'Eight short lessons that hand you sixteen words for what you feel: which signals mean your body is working, which ones mean it is warning you, and what to do in either case.',
        quando: 'We are trying it out with the first athletes. When it is ready you will find it here: nothing to update, nothing to do.',
      },
      parole: {
        cosa: 'The sixteen words in one place: what each one means, when to use it, and what it tells you about your body.',
        quando: 'It opens together with the path.',
      },
      storico: {
        cosa: 'Your check-ins in a row: how your energy shifts week after week, which parts of your body come back most often, what happens around your period.',
        quando: 'It needs some history to show first. The check-ins you do now are already being kept: when your history opens, these will be in it.',
      },
      profilo: {
        cosa: 'Your sports, your training, your language — and what BAB knows about you, with the way to change it or to take it with you.',
        quando: 'It arrives together with your history.',
      },
    },
  },
}

export const TESTI = { it, en }
