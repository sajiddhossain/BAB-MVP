/**
 * Copy dell'interfaccia, in italiano. FONTE DI VERITÀ DELLA FORMA:
 * il tipo `Copy` si deriva da qui, quindi ogni altra lingua deve avere
 * esattamente queste chiavi.
 *
 * Qui dentro va SOLO copy di interfaccia. Non ci vanno:
 *   - il contenuto del percorso        → content/journey.ts
 *   - il lessico delle sensazioni      → content/lexicon.ts
 *   - le regioni della mappa corporea  → content/bodymap.ts
 *   - i testi clinici (Care, RED-S)    → content/clinical.ts  🔴 da firmare
 * Vedi docs/06-implementazione/04-i18n-e-copy.md
 *
 * Chiavi: descrivono IL POSTO, non il testo. `predict.title` resta valida se il
 * testo cambia; `beforeYouTuneIn` diventa bugiarda al primo ritocco.
 */
export const it = {
  app: {
    name: 'BAB',
    tagline: 'Impara a leggere i segnali del tuo corpo',
  },

  /**
   * Il nome di questa lingua, NELLA lingua stessa. Un elenco di lingue scritto
   * nella lingua che non capisci non serve a niente.
   */
  langName: 'Italiano',

  tabs: {
    today: 'Oggi',
    journey: 'Percorso',
    me: 'Me',
    ariaLabel: 'Navigazione principale',
  },

  journey: {
    lede: 'Otto settimane, una competenza al mese: prima impari a riconoscere i tuoi segnali, poi a capirli. Ogni settimana si sblocca quando arriva il suo turno.',
    monthLabel: 'Mese',
    weekLabel: 'Settimana {n}',
    now: 'ora',
    backToList: 'Torna al percorso',
    missionLabel: 'La tua missione',
    missionDone: 'Fatta ✓',
    howBabHelpsLabel: 'Come BAB aiuta',
    reflectLabel: 'Rifletti',
    reflectPlaceholder: 'Se ti va, scrivilo qui. Lo leggi solo tu.',
    reflectSave: 'Salva',
    reflectSaved: 'Salvato ✓',
  },

  /**
   * La struttura dei flussi a passi: check-in e onboarding. Sta qui e non
   * dentro `checkin` perché è la cornice, non il contenuto — e la cornice è la
   * stessa dovunque si chieda una cosa alla volta.
   */
  flow: {
    next: 'Avanti',
    back: 'Indietro',
    close: 'Chiudi',
    skip: 'Salta questa',
    progress: 'A che punto sei',
    /** Le posizioni in mezzo a una scala, per chi la sente invece di vederla. */
    scaleMiddle: 'a metà',
    scaleToward: 'verso «{label}»',
    leaveTitle: 'Esci dal check-in?',
    leaveBody: 'Quello che hai risposto finora non è ancora salvato: si salva tutto insieme alla fine. Se esci adesso lo perdi.',
    leaveYes: 'Esci e perdi tutto',
    leaveNo: 'Resta qui',
  },

  /**
   * R12 · Il link via email è la strada principale, non un ripiego: Google ha
   * un'età minima che una dodicenne spesso non raggiunge, e gli account
   * scolastici bloccano spesso l'accesso OAuth di terze parti.
   * Apple è stato valutato e scartato — vedi R12 nella revisione.
   */
  auth: {
    title: 'Ciao, pronta per entrare in BAB?',
    lede: 'Inserisci la tua mail, clicca sul link che ti arriverà e si parte',
    emailLabel: 'La tua email',
    emailPlaceholder: 'nome@esempio.it',
    sendLink: 'Mandami il link',
    sending: 'Sto mandando…',
    sentTitle: 'Inserisci il codice',
    sentBody: 'Te l\'abbiamo mandato a **{email}**: sono 6 cifre, dentro la stessa email del link.',
    sentAgain: 'Non è arrivato? Rimandalo',
    /**
     * 🔴 La seconda strada, non un dettaglio. Su iPhone il link aperto dalla
     * posta finisce spesso in un browser diverso da quello dove c'è BAB: la
     * sessione si apre nel posto sbagliato e da lì sembra che non funzioni
     * niente. Il codice si copia e si incolla dove sei già.
     */
    /** Preferisci il link? Sta nella stessa email — qui il codice è la strada principale. */
    codeHint: 'Preferisci il link? È nella stessa email.',
    codeLabel: 'Codice',
    /** {i} e {n} sono numeri: "Cifra 3 di 6". Un\'etichetta per casella. */
    codeDigitLabel: 'Cifra {i} di {n}',
    codeSubmit: 'Entra',
    codeChecking: 'Controllo…',
    codeWrong: 'Codice sbagliato o scaduto. Rimanda la mail e riprova.',
    /** {time} è già formattato, tipo "0:45" o "2:00". */
    codeLocked: 'Troppi codici sbagliati. Riprova tra {time}.',
    sendLocked: 'Hai già chiesto il link da poco. Riprova tra {time}.',
    or: 'oppure',
    google: 'Continua con Google',
    /** Detto prima di toccare il bottone, non dopo. */
    socialNote: 'Con Google, Google saprà che usi BAB. Con il link via email, no.',
    ageNote: 'Google ha un\'età minima, quindi potrebbe non funzionare per te — e va benissimo. Il link via email funziona sempre.',
    trouble: 'Qualcosa non ha funzionato',
    troubleBody: 'Non siamo riusciti a mandare il link. Controlla l\'indirizzo e riprova — se continua, dillo a noi.',
    signOut: 'Esci',
  },

  /** La segnalazione immediata è sempre a un tocco, da ogni schermata (§5). */
  hurt: {
    button: 'Mi sono fatta male',
    title: 'È successo qualcosa',
    lede: 'Non devi aspettare il check-in. Dimmi dove, e cosa senti — basta questo per sapere cosa fare adesso.',
    whereStep: 'Dov\'è?',
    whatStep: 'Cosa senti?',
    whereFreeholder: 'Oppure scrivi dove — polso, mandibola, costole…',
    close: 'Chiudi',
  },

  /** La mappa corporea. Un componente solo, usato nei due check-in e nel Care. */
  bodymap: {
    sideLabel: 'Fronte o retro',
    /**
     * 🔴 Va detto, non lasciato intuire. Se legge la figura al contrario indica
     * il ginocchio sbagliato, e chi la ascolta guarda dalla parte opposta.
     */
    mirrorHint: 'Come allo specchio: la tua sinistra sta a sinistra.',
    tapHint: 'Tocca la zona dove lo senti.',
    chosen: 'Hai scelto: {region}',
    onFront: 'sta sul fronte',
    onBack: 'sta sul retro',
    legendMarked: 'già segnata',
    /** In lettura la tinta è graduata, e va detto cosa vuol dire più scuro. */
    legendHeat: 'quante volte l\'hai segnata',
    legendFlag: 'da far vedere',
    listOpen: 'Preferisci un elenco?',
    /** Quando la mappa sta in una schermata sola, la riga in fondo deve restare una riga. */
    listShort: 'Elenco',
    listCloseShort: 'Figura',
    listClose: 'Torna alla figura',
  },

  /**
   * Il primo accesso su un dispositivo. È l'UNICO momento in cui BAB pretende
   * la rete, e va detto invece di lasciarla davanti a una rotella.
   */
  hydration: {
    title: 'Un attimo, preparo BAB',
    body: 'Sto portando su questo dispositivo quello che c\'è già. Succede solo la prima volta che entri da qui.',
    errorTitle: 'Non riesco a recuperare i tuoi dati',
    errorBody: 'Serve la rete solo adesso: da qui in poi BAB funziona anche senza campo, e i tuoi check-in si salvano comunque. Controlla la connessione e riprova.',
    retry: 'Riprova',
  },

  /**
   * §9 · I due diritti: portarsi via i propri dati, e farli sparire.
   * Il tono resta quello di sempre — nessuna minaccia, nessun ricatto — ma la
   * cancellazione non si ammorbidisce: è per sempre e va detto così.
   */
  settings: {
    title: 'Tu e i tuoi dati',
    open: 'I tuoi dati e il tuo account',
    back: 'Indietro',
    /** Le voci dell'indice mostrano il valore che hanno dentro, non una freccia. */
    notSet: 'Non l\'hai ancora detto',
    dataTitle: 'I tuoi dati',
    dataHint: 'Scaricali, e guarda cosa non è ancora partito',
    accountTitle: 'Il tuo account',
    accountHint: 'Esci da questo telefono, oppure cancella tutto',
    accountHintOffline: 'Cancella tutto',
    indexNote: 'Quello che scrivi in BAB è tuo. Da qui te lo porti via quando vuoi, e lo fai sparire quando vuoi.',
    langNote: 'La scelta viaggia con te: su un telefono nuovo BAB parte già in questa lingua.',
    rhythmPrivacy: 'Le date del tuo ciclo non compaiono mai in una card che condividi, a meno che non sia tu a spuntarlo ogni volta.',

    agendaTitle: 'La mia settimana',
    agendaHelp: 'Serve a BAB per chiederti il check-in nei giorni giusti — e per sapere che il carico c\'era anche quando non l\'hai scritto.',
    agendaNone: 'Niente per ora',
    agendaNoDays: 'Nessun giorno scelto. Salvando così, questi giorni spariscono dalla tua settimana.',
    agendaNoEvents: 'Nessuna gara in programma.',
    agendaEventsHelp: 'Le date che contano: BAB le usa per capire perché una settimana è andata come è andata.',
    agendaEventsOne: 'Una in programma',
    agendaEventsMany: '{n} in programma',
    agendaAddEvent: 'Aggiungine una',
    agendaEventName: 'Come si chiama (facoltativo)',
    agendaKindLabel: 'Che cos\'è',
    agendaKindCompetition: 'Gara',
    agendaKindMatch: 'Partita',
    agendaKindOther: 'Altro',
    agendaPast: 'Già passate',
    /** 🔴 Le passate non si tolgono: spiegano perché quella settimana è andata così. */
    agendaPastNote: 'Quelle già passate restano: servono a capire perché quella settimana è andata come è andata.',
    agendaNote: 'Togliere un giorno lo cancella davvero, qui e sul server. I tuoi check-in restano dove sono.',

    profileTitle: 'Il tuo profilo',
    profileName: 'Come ti chiamiamo',
    profileSport: 'Il tuo sport',
    profileBirth: 'Data di nascita',
    profileSave: 'Salva',
    profileSaving: 'Salvo…',
    profileSaved: 'Salvato.',
    profileQueued: 'Salvato qui. Parte da solo appena c\'è rete.',
    profileError: 'Non sono riuscita a salvare. Riprova.',

    rhythmTitle: 'Il tuo ritmo',
    profileCycleHint: 'Sta in una sua schermata, separata: è la cosa più privata che teniamo.',
    rhythmBody: 'Puoi cambiare idea quando vuoi, in tutt\'e due i sensi.',
    /** 🔴 R3: la domanda sulla contraccezione esiste solo dai 15 in su. */
    rhythmContraception: 'Prendi la pillola o un altro contraccettivo ormonale?',

    langTitle: 'Lingua',

    signOutTitle: 'Esci da BAB',
    /** 🔴 Uscire cancella l'archivio locale, e va detto prima. */
    signOutBody: 'I tuoi dati restano al sicuro sul server: quando rientri tornano qui. Da questo telefono spariscono, così se lo usa qualcun altro non trova le tue cose.',
    signOutCta: 'Esci',
    signOutWorking: 'Esco…',
    signOutPendingOne: 'Aspetta: c\'è ancora una cosa che non è partita. Se esci adesso la perdi.',
    signOutPending: 'Aspetta: {n} cose non sono ancora partite. Se esci adesso le perdi.',
    signOutAnywayOne: 'Esci lo stesso e perdi quella cosa',
    signOutAnyway: 'Esci lo stesso e perdi {n} cose',
    signOutWait: 'Aspetto',

    queueTitle: 'In attesa di partire',
    queueBodyOne: 'Una cosa è salvata qui e aspetta la rete. Non si perde.',
    queueBody: '{n} cose sono salvate qui e aspettano la rete. Non si perdono.',
    queueParkedOne: 'Una non è riuscita a partire. Resta salvata qui ed è dentro il file che scarichi — se la cosa non si sblocca, scrivici.',
    queueParked: '{n} non sono riuscite a partire. Restano salvate qui e sono dentro il file che scarichi — se la cosa non si sblocca, scrivici.',

    exportTitle: 'Porta via i tuoi dati',
    exportBody: 'Sono tuoi. Scarichi un file con tutto quello che BAB ha di te: i check-in, le sensazioni sulla mappa, le date del ciclo, i consensi che hai dato e quando.',
    exportCta: 'Scarica tutto',
    exportWorking: 'Preparo il file…',
    exportDone: 'Fatto: il file è nei tuoi download.',
    exportFromDevice: 'Non c\'era rete, quindi il file contiene quello che sta su questo dispositivo.',
    exportPendingOne: 'Una cosa non era ancora arrivata al server: è nel file, in fondo, segnata come non ancora inviata.',
    exportPending: '{n} cose non erano ancora arrivate al server: sono nel file, in fondo, segnate come non ancora inviate.',
    exportError: 'Non sono riuscita a preparare il file. Riprova fra poco.',

    deleteTitle: 'Cancella il tuo account',
    deleteBody: 'Sparisce tutto: i check-in, le sensazioni, le date del ciclo, il tuo profilo. Non viene archiviato da qualche parte — viene cancellato, e non possiamo recuperarlo.',
    /** 🔴 Va detto prima, non dopo: una body-story è un\'immagine già partita. */
    deleteShared: 'Quello che hai già mandato a qualcuno — una body-story, un messaggio — resta a chi l\'ha ricevuto: cancellare qui non lo riprende indietro.',
    deleteExportFirst: 'Se vuoi tenerli, scaricali prima.',
    deleteCta: 'Voglio cancellare tutto',
    deleteConfirm: 'Scrivi {word} qui sotto per confermare.',
    deleteWord: 'CANCELLA',
    deleteGo: 'Cancella per sempre',
    deleteAbort: 'Lascia stare',
    deleteWorking: 'Sto cancellando…',
    deleteOffline: 'Serve la rete: voglio essere sicura che sparisca davvero anche dal server, non solo da questo telefono.',
    deleteError: 'Non sono riuscita a cancellare. I tuoi dati sono ancora al loro posto, non è successo niente a metà — riprova, o scrivici.',
  },

  today: {
    greetingMorning: 'Buongiorno, {name}',
    greetingEvening: 'Buonasera, {name}',
    greetingBack: 'Ciao, che bello rivederti',

    fresh: {
      title: 'Sintonizzati prima di andare',
      body: 'Indovina come sarà oggi, poi controlla. Circa un minuto.',
      cta: 'Inizia il check-in',
      secondary: 'Oggi non mi alleno',
    },
    mid: {
      body: 'La tua scelta di stamattina. Qualità invece che quantità.',
      cta: 'Chiudi il cerchio dopo l\'allenamento',
      secondary: 'Cambia la mia andatura',
      hint: 'Torna qualche minuto dopo aver finito — è quando i tuoi segnali sono più forti.',
    },
    closed: {
      title: 'Per oggi hai finito',
      body: 'Ti sei letta, ti sei allenata, e hai chiuso il cerchio. Non c\'è altro da fare qui.',
      recapLabel: 'Oggi',
      predicted: 'Prevista',
      trained: 'Allenata',
    },
    rest: {
      title: 'Giorno di riposo',
      body: 'Oggi non c\'è niente da fare. Se ti va, una sola occhiata a come stai recuperando — nient\'altro.',
      cta: 'Una riflessione veloce',
      secondary: 'Salta — goditi il giorno libero',
      hint: 'Il riposo è dove l\'allenamento funziona davvero. 🌿',
    },
    /** Nessuno streak rotto, nessun contatore azzerato: §7, gioco a bassa posta. */
    back: {
      title: 'Bentornata',
      body: 'Sei stata via un po\' — va benissimo. Non si perde niente, e niente si azzera. Ripartiamo da oggi.',
      cta: 'Sintonizzati',
      hint: 'La tua missione della settimana è ancora lì, esattamente dov\'era.',
    },
  },

  /** Il Care mode è deliberatamente CALMO: un'adolescente allarmata segnala meno (§10). */
  care: {
    bannerTitle: 'Il tuo {region} è in Care',
    askedTold: 'L\'hai detto a un adulto?',
    askedHow: 'Come va oggi?',
    stillTrain: 'Puoi comunque allenarti tenendone conto — il check-in ne terrà conto.',
  },

  checkin: {
    common: {
      next: 'Avanti',
      back: 'Indietro',
      skip: 'Salta',
      dontKnow: 'Non lo so',
      addThis: 'Aggiungi',
      remove: 'Togli',
      reviewDifference: 'Rivedi la differenza',
      nothingYet: 'Ancora niente — tocca un punto per iniziare.',
      /** Non rispondere alla mappa è una risposta piena: si dice così. */
      nothingHere: 'Oggi è tutto tranquillo',
      needChannels: 'Manca ancora qualche canale. Torna indietro a completarli: senza, l\'andatura non si può calcolare.',
      andAnother: 'Ce n\'è un\'altra',
      thatsAll: 'Basta così',
      /** R3 · Solo nei giorni che il suo calendario segna come educazione fisica. */
      peAsk: 'Oggi hai fatto educazione fisica?',
      peAskHelp: 'Capita di non andarci, e cambia parecchio il carico della giornata.',
    },
    pre: {
      title: 'Leggi i tuoi segnali',
      steps: ['Prevedi', 'Sintonizzati', 'Confronta', 'Aggiusta'],
      /** L'ultima domanda del pre: si insegna cos'è un dolore, poi si chiede. */
      decodeLabel: 'Decodifica',
      predict: {
        label: 'Prevedi',
        title: 'Prima di sintonizzarti — qual è la tua andatura oggi?',
        help: 'La tua "andatura" è quanto ha da dare il tuo corpo oggi. Tira a indovinare adesso — lo confermerai alla fine. Indovinare prima allena la tua lettura interiore, e "sbagliare" non è un fallimento: è tutto il punto.',
        confidence: 'Quanto sei sicura?',
        confidenceOptions: ['Tiro a indovinare', 'Abbastanza', 'Sicura'],
        sleepHours: 'Quanto hai dormito?',
        sleepHoursOptions: ['Meno di 6h', '6–7h', '7–8h', '8–9h', 'Più di 9h'],
      },
      tuneIn: {
        label: 'Sintonizzati',
        title: 'I tuoi canali',
        /** 🔴 La VAS: una riga fra due estremi, nessun numero. Gli estremi sono
         *  quelli della spec — «il peggio» e «il meglio» che ha mai provato. */
        mood: 'Come ti senti, dentro?',
        moodHelp: 'Trascina dove ti trovi oggi. Non c\'è un punto giusto.',
        moodLow: 'Il peggio che abbia mai provato',
        moodHigh: 'Il meglio che abbia mai provato',
        schoolLoad: 'Com\'è la scuola in questi giorni?',
        schoolOptions: ['Tranquilla', 'Impegnativa', 'Settimana d\'esami'],
        period: 'Oggi hai il ciclo?',
        periodHelp: 'Serve solo a leggere meglio gli altri segnali. Puoi saltarla.',
        painkillers: 'Hai preso un antidolorifico oggi?',
        painkillersHelp: 'Per qualunque motivo, anche non legato allo sport.',
      },
      pinpoint: {
        label: 'Individua e nomina',
        title: 'Dove lo senti?',
        /** Sulla mappa serve una riga, non un paragrafo: lo spazio va alla figura. */
        mapHint: 'Quante ne noti, o nessuna se è tutto tranquillo.',
        /** Il perché sta sulla schermata dove si dà il nome, che è dove serve. */
        help: 'Fermarsi a trovare dove sta una sensazione, e metterci una parola sopra, è il cuore della competenza: è come un vago "mi sento strana" diventa qualcosa che capisci davvero.',
        front: 'Fronte',
        back: 'Retro',
        allOver: 'Dappertutto',
        elsewhere: 'Da un\'altra parte',
        where: 'Dove',
        whatLike: 'Come si sente?',
        showHints: 'Cosa vogliono dire?',
        hideHints: 'Nascondi',
        howStrong: 'Quanto è forte?',
        whatDoes: 'E cosa fa?',
      },
      result: {
        compareLabel: 'Confronta — la tua lettura contro il tuo corpo',
        planLabel: 'Aggiusta — il tuo piano di oggi',
        /** 🔴 Sbagliare la previsione non è un errore: è il meccanismo che lavora. */
        matched: 'Avevi indovinato: **{tempo}**.',
        differed: 'Avevi previsto **{predicted}**, i tuoi segnali dicono **{suggested}**.',
        gapNote: 'Questo scarto è la cosa più utile di tutto il check-in — è così che impari a leggerti. Non è un errore.',
        swapLabel: 'Il tuo corpo, la tua chiamata. Vuoi cambiare andatura?',
        copyForCoach: 'Copia cosa dire al coach',
        again: 'Nuovo check-in',
      },
    },
    post: {
      title: 'Chiudi il cerchio',
      steps: ['Guarda indietro', 'Senti', 'Impara', 'Recupera'],
      lookBack: {
        label: 'Guarda indietro',
        title: 'Con che andatura ti sei allenata davvero?',
        effort: 'Quanto è stata dura davvero?',
        satisfaction: 'Come ti senti di come è andata?',
        satisfactionHelp: 'Nessuna di queste è quella giusta: sono cinque modi legittimi di uscire da un allenamento.',
        sessionType: 'Che tipo di sessione?',
        sessionTypeOptions: ['Allenamento', 'Gara o partita', 'Educazione fisica', 'Palestra', 'Altro'],
      },
      senseLabel: 'Senti — una lettura veloce',
      learnLabel: 'Impara',
      /** 🔴 Niente "3/5": il §7 vieta i punteggi davanti all'atleta. */
      readSpot: 'Stamattina avevi previsto **{predicted}**, ed è andata proprio così.',
      readGap: 'Stamattina avevi previsto **{predicted}**, e ti sei allenata in **{actual}**.',
      readGapNote: 'Quello scarto non è un errore: è la cosa che stiamo allenando. Più lo noti, più si accorcia.',
      noPre: 'Non trovo il check-in di stamattina, quindi oggi non c\'è niente da confrontare. Va bene lo stesso — quello che scrivi qui conta comunque.',
      recapSignalsOne: 'Ti sei fermata e hai nominato una sensazione. Farlo — trovare dove sta e darle una parola — è esattamente il muscolo che stiamo allenando.',
      recapSignals: 'Ti sei fermata e hai nominato {n} sensazioni. Farlo — trovare dove sta e darle una parola — è esattamente il muscolo che stiamo allenando.',
      openQuestion: 'Una domanda tranquilla su cui vale la pena fermarsi: cosa ti ha sorpresa di più di oggi — e quale segnale te l\'ha detto per primo?',
      notePlaceholder: 'Se ti va, scrivilo qui. Lo leggi solo tu.',
      broughtHome: {
        title: 'Cosa ti sei portata a casa?',
        help: 'Scegli quello che ti somiglia oggi — o nessuno.',
      },
      communicate: {
        title: 'C\'è qualcosa che vale la pena dire a qualcuno?',
        help: 'Non sei obbligata — ma se ti va, eccoti due modi per dirlo. Tocca per copiare.',
        phrase1: 'Oggi ho sentito {sensation} — {region}. Ne parliamo quando hai un minuto?',
        phrase2: '{region}: {sensation}. Voglio tenerlo d\'occhio, te lo dico così lo sai anche tu.',
        copied: 'Copiata — incollala dove vuoi.',
        notToday: 'Non oggi',
      },
      recoverLabel: 'Recupera — cosa chiede il tuo corpo adesso',
      bodySenseCta: 'Allena la tua consapevolezza',
      saving: 'Salvo…',
      saved: 'Salvato. Anche senza campo: parte da solo quando torna.',
    },
  },

  /**
   * «Il mio corpo» — la mappa corporea riletta.
   *
   * 🔴 Niente soglie e niente verdetti (§7): si contano le volte e si ripetono
   * le parole che ha scelto lei. «Quattro volte, e tre le hai chiamate fitta» è
   * un fatto; «zona a rischio» sarebbe una diagnosi.
   */
  body: {
    title: 'Il mio corpo',
    lede: 'Dove il tuo corpo ti ha parlato, e con che parole.',
    windowLabel: 'Quanto indietro guardare',
    windowOption: 'Ultimi {n} giorni',
    pickHint: 'Tocca una zona per vedere cosa ci hai sentito.',
    heatNote: 'Più scura è la zona, più volte l\'hai segnata in questo periodo.',
    emptyTitle: 'Ancora niente da rileggere',
    emptyBody: 'Quando durante un check-in segni qualcosa sulla mappa, torna qui: dopo qualche giorno cominci a vedere cosa si ripete e cosa era solo di passaggio.',
    quietTitle: 'Niente in questi {days} giorni',
    quietBody: 'Non hai segnato nessuna sensazione. Va benissimo così: non c\'è niente da recuperare.',
    topTitle: 'Le zone che tornano di più',
    timesOne: 'una volta',
    times: '{n} volte',
    lastToday: 'oggi',
    lastYesterday: 'ieri',
    lastAgo: '{n} giorni fa',
    summaryOne: 'Una volta in {days} giorni, {when}.',
    summary: '{n} volte in {days} giorni — l\'ultima {when}.',
    flaggedOne: 'Una volta l\'avevi segnata come da far vedere a qualcuno.',
    flagged: '{n} volte l\'avevi segnata come da far vedere a qualcuno.',
    wordsTitle: 'Come l\'hai chiamata',
    entriesTitle: 'Una per una',
    nothingHere: 'Qui non hai segnato niente in questo periodo.',
    undatedOne: 'Un segnale più vecchio non ha una data e resta fuori da questo conto.',
    undated: '{n} segnali più vecchi non hanno una data e restano fuori da questo conto.',
  },

  /**
   * «Come sta l'app». La apre lei quando qualcosa non si salva, non solo noi:
   * per questo il testo sta qui e non nella console di chi amministra.
   *
   * 🔴 Dice cosa sta succedendo senza chiedere di capirlo. «In coda ci sono tre
   * cose» è un fatto che può leggere ad alta voce al telefono; «PGRST301» no.
   */
  diag: {
    title: 'Come sta l\'app',
    open: 'Qualcosa non si salva?',
    lede: 'Se ti sembra che qualcosa non venga salvato, qui c\'è cosa sta succedendo davvero. Puoi copiarlo e mandarcelo: non contiene niente di quello che hai scritto.',
    serverTitle: 'Il server',
    serverOn: 'Collegato.',
    serverOff: 'Non collegato. BAB continua a funzionare e salva tutto qui, ma niente parte.',
    sessionOn: 'Sei entrata.',
    sessionOff: 'Non sei entrata: quello che scrivi resta su questo dispositivo.',
    storageTitle: 'L\'archivio su questo dispositivo',
    storageOn: 'Funziona.',
    storageOff: 'Non riesco a leggerlo. Succede in navigazione privata, o se lo spazio è finito.',
    storageCount: '{n} cose salvate qui.',
    queueTitle: 'In attesa di partire',
    queueNone: 'Niente in attesa: è tutto arrivato.',
    queueWaitingOne: 'Una cosa aspetta la rete.',
    queueWaiting: '{n} cose aspettano la rete.',
    queueStuckOne: 'Una non è riuscita a partire.',
    queueStuck: '{n} non sono riuscite a partire.',
    push: 'Prova a mandare adesso',
    pushing: 'Sto provando…',
    pushDone: 'Partite {n}. Ne restano {left}.',
    copy: 'Copia il rapporto',
    copied: 'Copiato.',
    /** 🔴 Detto qui perché è il momento in cui verrebbe da svuotare tutto. */
    dontWipe: 'Non cancellare l\'app né i dati del browser finché resta qualcosa in attesa: quello che non è partito sta solo qui.',
  },

  rhythm: {
    title: 'Il mio ritmo',
    rightNow: 'In questo momento sei in',
    aroundDay: 'circa il giorno {n} del tuo ciclo',
    mapNotTimetable: 'È una mappa, non un orario. 🗺️',
    updateDates: 'Aggiorna le mie date',
    turnOff: 'Disattiva',
    learnPhases: 'Come possono sentirsi le quattro fasi',
    /** L'incertezza si mostra, non si nasconde. */
    uncertainOne: 'Finora hai dato **una data sola**, quindi questa è una stima larga. Aggiungine un\'altra o due e migliora parecchio.',
    uncertainVariable: 'I tuoi ultimi cicli erano **{spread} giorni di differenza** nel punto più largo — normalissimo alla tua età, e significa che questa è una lettura larga, non precisa.',
    uncertainOk: 'In base alle **{n} date** che hai dato, il tuo ciclo dura circa **{len} giorni**. Continuerà a spostarsi: è normale mentre si assesta.',
    staleTitle: 'È passato un po\'',
    staleBody: 'La tua ultima data è di più di un ciclo intero fa, quindi BAB non prova a indovinare dove sei — indovinare sarebbe solo inventare. Metti la data più recente e la mappa torna.',
    staleCta: 'Aggiungi la mia ultima data',
    notYetTitle: 'Niente da tracciare per ora — ed è del tutto normale',
    notYetBody: 'I corpi iniziano ai loro tempi, in un punto qualsiasi di questi anni. Quando arriva il tuo, puoi attivare questa parte e BAB inizia a mappare il tuo ritmo.',
    notYetCta: 'È arrivato — configuralo',
    offTitle: 'Questa parte è spenta',
    offBody: 'Hai scelto di non condividere il tuo ciclo, e tutto il resto di BAB funziona esattamente uguale. Puoi attivarla quando vuoi dalle impostazioni — senza fretta, e senza che ti ricordiamo niente.',
  },

  me: {
    title: 'Me',
    readingTitle: 'La tua lettura si sta affinando',
    readingLabel: 'Quanto bene ti leggi',
    collectingTitle: 'Stiamo ancora imparando come sei fatta',
    collectingBody: 'Ogni check-in è un puntino. Quando ce ne sono abbastanza, i puntini iniziano a mostrare pattern che sono solo tuoi.',
    collectingCount: '{done} di {total} giornate chiuse',
    collectingLeftOne: 'Ancora uno e la tua lettura inizia a mostrarsi.',
    collectingLeft: 'Ancora {n} e la tua lettura inizia a mostrarsi.',
    /** 🔴 Nessuno dei tre è un voto: lo scarto è il meccanismo, non la pagella. */
    readingDown: 'Il tuo divario si sta accorciando. Stai imparando a sentirlo prima di controllarlo.',
    readingFlat: 'Il tuo divario è più o meno stabile. Va benissimo: leggersi non migliora in linea retta.',
    readingUp: 'In questi giorni le previsioni sono state più distanti. Capita, e di solito vuol dire che qualcosa è cambiato — non che stai andando peggio.',
    readingNoAxis: 'Nessun numero: conta la forma, non il voto.',
    daysTitle: 'Le mie giornate',
    daysHelp: 'Le ultime quattro settimane. Ci sono anche i giorni in cui non hai fatto il check-in — perché sono informazione anche quelli, e nasconderli sarebbe più gentile ma meno vero.',
    dayBoth: 'cerchio chiuso',
    dayHalf: 'solo il prima',
    dayNone: 'niente',
    /** Sopra OGNI insight, sempre. */
    insightCaveat: 'Sono idee, non fatti. L\'esperta di te sei tu: tieni quelle che ti sembrano vere, e metti in dubbio quelle che non ti tornano.',
    insightYes: 'Mi sembra proprio io',
    insightNo: 'Non mi torna',
    bodyTitle: 'Il mio corpo',
    bodyBody: 'Quello che hai segnato sulla mappa, rimesso insieme: quali zone tornano, e con che parole le hai chiamate.',
    bodyCta: 'Guarda la mappa',
    storyTitle: 'La tua storia della settimana',
    storyBody: 'Qualcosa da far vedere a un coach o a un genitore',
    storyCta: 'Preparane una',
    storyLocked: 'Si sblocca dopo la tua prima settimana intera',
    journalTitle: 'Il mio diario',
    journalBody: 'Qualcos\'altro che vuoi condividere con BAB? Puoi scriverlo qui — lo vedi solo tu.',
    journalCta: 'Apri il diario',
  },

  /** Note libere, quando vuole lei — non solo dopo un allenamento. Le vede solo lei: mai una vista coach/admin la legge. */
  journal: {
    title: 'Il mio diario',
    help: 'Puoi scrivere quando vuoi, non solo dopo un allenamento. Lo vedi solo tu — nessun coach, nessun admin.',
    placeholder: 'Qualcos\'altro che vuoi condividere con BAB?',
    save: 'Salva',
    empty: 'Ancora niente qui. Quando ti va di scrivere qualcosa, questo è il posto.',
    deleteLabel: 'Elimina',
    deleteConfirmTitle: 'Eliminare questa nota?',
    deleteConfirmBody: 'Non si può annullare.',
    deleteConfirmYes: 'Sì, elimina',
    deleteConfirmNo: 'Annulla',
  },

  story: {
    title: 'La mia settimana',
    chooseTitle: 'Cosa ci metti?',
    chooseHelp: 'Niente viene condiviso finché non lo dici tu. Tocca per aggiungere o togliere — la card qui sotto si aggiorna mentre scegli.',
    blocks: {
      tempos: 'Le mie andature',
      temposHelp: 'Con che andatura ti sei allenata ogni giorno',
      spots: 'Dove ho sentito cose',
      spotsHelp: 'I punti che sono venuti fuori più spesso, e come si sentivano',
      energy: 'La mia energia nella settimana',
      energyHelp: 'Una linea semplice — nessun numero, nessun punteggio',
      note: 'Quello che ho scritto',
      noteHelp: 'La nota che hai lasciato dopo l\'allenamento',
      cycle: 'Il mio ciclo',
      cycleHelp: 'In che fase eri — spento a meno che non lo accenda tu',
    },
    /** 🔴 Il ciclo resta escluso di default dalla card: questa parte non si tocca. */
    cycleNote: 'Il ciclo non entra mai in una card da solo, e accenderlo qui vale **solo per questa** — mai per la prossima. Il tuo staff vede comunque le date dai check-in: questa spunta riguarda solo cosa mandi tu, e a chi.',
    previewTitle: 'Questo è esattamente quello che vedranno',
    previewHelp: 'Quello che mandi è un\'immagine, non un accesso. Chi la riceve vede esattamente questa — nessun link da seguire, niente altro da andare a guardare.',
    send: 'Manda',
    keep: 'Tienila per me',
    saidTitle: 'E queste sono le parole per iniziare il discorso',
    saidHelp: 'Copiale se ti aiutano — o dille a modo tuo, che è meglio.',
    copyWords: 'Copia queste parole',
    copied: 'Copiate ✓',
    stuckTitle: 'Non sai da dove iniziare?',
    stuckPhrases: [
      'Vorrei farti vedere una cosa su come sto messa questa settimana.',
      'Ho notato qualcosa nel mio corpo e volevo dirtelo prima che diventi un problema.',
      'Ho bisogno di parlarti di come mi sento, hai due minuti dopo l\'allenamento?',
    ],
    saved: 'Salvata',
    download: 'Salva l\'immagine',
    emptyState: 'Non hai ancora scelto niente — spunta almeno una cosa qui sopra e apparirà qui.',
  },

  /**
   * L'esercizio del battito — subito dopo il benvenuto, prima di chiederle
   * qualsiasi dato. Non salva niente: è solo il concetto di BAB (indovina,
   * poi senti davvero, impara lo scarto) provato una volta con le mani,
   * invece che solo raccontato. I "gear" finali sono le andature vere di
   * `content/tempo.ts`, non un'invenzione a sé.
   */
  heart: {
    conceptTitle: 'Indovina. Poi senti davvero.',
    conceptHelp: 'Il gioco è uno solo, e lo farai ogni giorno:',
    step1Title: 'Indovina prima',
    step1Body: 'Fai una stima veloce di come sta il tuo corpo, prima di controllare. Fissare una stima è quello che conta davvero.',
    step2Title: 'Poi senti per bene',
    step2Body: 'Rallenta e senti cosa sta succedendo, un pezzo alla volta.',
    step3Title: 'Impara lo scarto',
    step3Body: 'Lo spazio fra quello che avevi immaginato e quello che senti davvero è dove impari — sbagliare non è un fallimento, è il punto.',
    conceptFooter: 'Fallo abbastanza volte e le tue stime diventano sorprendentemente precise. È imparare a fidarti di te stessa.',

    settleTitle: 'Riesci a sentire il tuo battito?',
    settleBody: 'Fermati un attimo, in silenzio. Non toccarti ancora — prova solo a sentire il battito: magari nel petto, nel collo, o nelle orecchie.',
    settleNote: 'Alcuni giorni si sente subito, altri è più flebile. Va bene comunque — stai solo sintonizzandoti.',

    guessTitle: 'Quanto va veloce, secondo te?',
    guessHelp: 'Senza controllare — solo di pancia. In questo momento il tuo cuore ti sembra…',
    slow: 'Lento',
    slowHelp: 'calmo e tranquillo',
    medium: 'Medio',
    mediumHelp: 'va avanti così',
    fast: 'Veloce',
    fastHelp: 'su di giri',
    guessFooter: 'Fissare una stima è quello che lo trasforma in allenamento — scegli quella più vicina.',

    countTitle: 'Ora contiamolo.',
    countHelp: 'Metti due dita sul collo o dentro il polso, finché senti il battito. Quando parti, tocca il cerchio a ogni battito che senti, per 15 secondi.',
    tapStart: 'Inizia',
    tapReady: 'tocca per iniziare',
    tapAriaLabel: 'Tocca il cerchio a ogni battito',
    tapGo: 'TOCCA',
    tapGoSub: 'a ogni battito',
    tapCounting: 'Sto contando…',
    tapDone: 'Fatto! Hai sentito',
    tapBeatsCounted: 'Battiti contati',
    tapBeats: 'battiti',

    revealMatchTitle: 'Bel colpo!',
    revealMissTitle: 'Interessante — un po\' diverso.',
    bpmLabel: 'battiti al minuto (quelli che hai contato)',
    yourGuess: 'La tua stima',
    youCounted: 'Hai contato',
    revealMatchNote: 'La tua stima e quello che hai contato sono nella stessa fascia. Vuol dire che stai già leggendo un segnale vero da dentro — **ricordati come ci si sente**, è il tuo punto di riferimento.',
    revealMissNote: 'La tua stima e quello che hai contato sono finiti in fasce diverse. **È del tutto normale il primo giorno**, ed è esattamente lo scarto che imparerai a chiudere. Hai appena trovato il tuo punto di partenza.',
    revealFooter: 'Quella sensazione — sentire qualcosa dentro di te, e poi controllarlo — si chiama interocezione. È un muscolo, e questo era il tuo primo allenamento.',

    wrapReady: 'Sei pronta',
    wrapTitle: 'Questo è tutto il gioco.',
    wrapBody: 'Farai lo stesso giro — indovina, senti, impara lo scarto — in due momenti veloci a ogni allenamento:',
    checkinTitle: 'Check-in',
    checkinBody: 'Nei 30 minuti prima di allenarti — indovina la tua giornata, poi sintonizzati.',
    checkoutTitle: 'Check-out',
    checkoutBody: 'Nei 30 minuti dopo — guarda com\'è andata davvero.',
    gearsIntro: 'Tutt\'e due ti aiutano a trovare la tua andatura di giornata:',
    wrapNote: 'La tua andatura è solo quanto ha da dare il tuo corpo oggi. Nessuna andatura è giusta o sbagliata — la noti e la rispetti.',
  },

  bodySense: {
    entryTitle: 'Piccoli esercizi',
    entryBody: 'Indovina → senti → controlla. 60-90 secondi per allenare quanto ti leggi bene.',
    entryCta: 'Provane uno',
    title: 'Piccoli esercizi',
    lead: 'Esercizi brevi di indovina → senti → controlla, 60-90 secondi l\'uno. Niente sensori, niente punteggi — solo il tuo corpo, le tue mani, e la tua attenzione. Fanne uno quando vuoi.',
    filterAll: 'Tutti',
    close: 'Chiudi',
    next: 'Avanti →',
    finish: 'Fine ✓',
    finishToast: 'Bella prova — la tua lettura interna si sta affinando.',
    heartbeatName: 'Battito',
    heartbeatTrains: 'Precisione',
    heartbeatDur: '60 sec',
    scaleLowShort: 'basso',
    scaleHighShort: 'alto',
    twosidesMatch: 'Precisa.',
    twosidesMiss: 'Sorpresa — ed è utile.',
    twosidesMatchNote: 'Riuscivi a sentire la differenza fra i tuoi due lati prima ancora di controllare — è una lettura fine.',
    twosidesMissNote: 'I corpi non sono sempre simmetrici, e il lato più teso è facile da perdere. Notarlo presto ti tiene un passo avanti sui piccoli fastidi.',
    twosidesYourGuess: 'La tua stima',
    twosidesActual: 'In realtà',
    zoneBefore: 'Prima',
    zoneAfter: 'Dopo',
    zoneSame: 'La tua manopola è rimasta ferma.',
    zoneDown: 'La tua manopola è scesa di {n} {unit}.',
    zoneUp: 'La tua manopola è salita di {n} {unit}.',
    zoneNotchOne: 'tacca',
    zoneNotch: 'tacche',
    zoneNote: 'Il punto non è il numero — è che puoi muoverla apposta. Prima di una gara, punta alla tua zona migliore: sveglia e pronta, non piatta, non a mille.',
  },

  onboarding: {
    welcomeTitle: 'Qui si impara a leggersi',
    welcomeBody: 'Quasi tutte le app sportive ti misurano da fuori e ti dicono cosa fare. BAB fa l\'opposto: ti aiuta a capire cosa ti sta dicendo il tuo corpo — così sai quando spingere, quando riposare, e come dirlo ad alta voce.',
    back: 'Indietro',
    consentAthlete: 'Ho letto e ci sto',
    consentGuardian: 'Dichiaro che un genitore o chi si prende cura di me ha letto questo testo insieme a me e acconsente',
    consentGuardianNameLabel: 'Nome di chi ha detto sì con te',
    consentGuardianNamePlaceholder: 'Nome e cognome',
    consentGuardianContactLabel: 'Email o telefono di questa persona (facoltativo)',
    consentGuardianContactPlaceholder: 'Così possiamo ricontattarla se serve',
    consentGuardianNote: 'Questa è una tua dichiarazione, non una firma: stai confermando che l\'hai letto insieme a un adulto responsabile e che è d\'accordo.',
    consentVersion: 'v1-bozza',
    /** 🔴 Segnaposto dichiarato: il testo legale vero non c'è ancora. */
    consentDraftWarning: 'Questo testo è un segnaposto: quello definitivo arriva prima che la app venga usata davvero.',
    weekdays: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    timeLabel: 'A che ora, di solito',
    eventDateLabel: 'La prossima gara, se la sai già',
    letsGo: 'Andiamo',
    continue: 'Continua',
    consentTitle: 'Prima di tutto il resto',
    consentHelp: 'Hai meno di 18 anni, quindi servono due sì — il tuo e quello di un genitore o di chi si prende cura di te. Leggeteli insieme se potete.',

    nameTitle: 'Come ti chiamiamo?',
    nameHelp: 'Il nome che vuoi leggere quando apri l\'app. Puoi cambiarlo quando vuoi.',
    namePlaceholder: 'Il tuo nome',
    birthdayTitle: 'Quando sei nata?',
    birthdayHelp: 'Serve a due cose: farti gli auguri e creare un percorso adatto a te',
    birthdayTooYoung: 'BAB è pensata per chi ha 12 anni o più. Se hai meno di 12 anni, per ora non puoi continuare da qui.',
    sportTitle: 'Che sport fai?',
    sportHelp: 'Puoi anche inserirne più di uno. Cambia il vocabolario che BAB usa con te — gare o partite, e cosa conta come sessione.',
    sportLabel: 'Il tuo sport',
    sportOtherPlaceholder: 'Scrivi il tuo sport',
    setUpLater: 'Lo imposto dopo',

    /** R3 · "La mia settimana": il calendario, chiamato come lo chiamerebbe lei. */
    weekTraining: 'Allenamenti',
    weekTrainingHelp: 'Seleziona i giorni e l\'orario. Puoi sempre modificarli se cambia qualcosa.',
    /** Una schermata per sport (onboarding, sport multipli): {sport} è già tradotto. */
    trainDayTitle: 'Quando alleni {sport}?',
    trainStartTitle: 'A che ora inizi, di solito?',
    trainEndTitle: 'E a che ora finisci, di solito?',
    trainEndHelp: 'Anche solo indicativo — lo correggi quando vuoi',
    weekPe: 'Educazione fisica a scuola',
    weekPeHelp: 'Conta come carico anche se non sembra',
    weekEvents: 'Gare e partite',
    weekEventsHelp: 'Se non sai ancora l\'orario va benissimo: lo aggiungi dopo',

    /** R2 · Detto prima che lei scriva qualsiasi cosa, non sepolto nelle impostazioni. */
    whoSeesTitle: 'Chi vede cosa',
    whoSeesTeam: 'Il tuo staff vede i tuoi check-in: le andature, i canali, dove senti le cose, e le date del ciclo. Serve a loro per allenarti meglio, e a te per non dover ripetere tutto a voce.',
    whoSeesPrivate: 'Quello che scrivi con parole tue resta tuo. Le note che lasci dopo l\'allenamento non le legge nessun altro.',
    whoSeesYou: 'E i dati sono tuoi: puoi portarteli via o cancellarli tutti, quando vuoi, dalle impostazioni.',
    rhythmTitle: 'Hai già il ciclo?',
    rhythmBody: 'Dopo il primo ciclo, anche il tuo corpo comincia a muoversi a modo suo. Il ciclo attraversa quattro fasi diverse, e crea un ritmo che tocca tutto — energia, umore, sonno, concentrazione — in un modo che è unico per te. BAB ti aiuta a capirlo.',
    rhythmYes: 'Sì, ce l\'ho',
    rhythmYesHelp: 'BAB mapperà le tue fasi dalle date che le dai',
    firstPeriodAgeTitle: 'Se ti ricordi, quanti anni avevi quando ti è venuto la prima volta?',
    firstPeriodAgeHelp: 'Solo se lo sai — non è un problema se non te lo ricordi.',
    firstPeriodAgePlaceholder: 'Anni',
    rhythmNotYet: 'Non ancora',
    rhythmSkip: 'Preferisco non dirlo',
    datesTitle: 'Quando è stato il tuo ultimo ciclo?',
    datesHelp: 'Tocca tutti i giorni in cui hai sanguinato. Anche solo una stima va bene.',
    /** Le due date precedenti: aiutano BAB a stimare quanto dura il tuo ciclo, ma sono saltabili. */
    datesPrevTitle: 'E prima ancora, più o meno quando?',
    datesPrevHelp: 'Basta il giorno in cui è iniziato — anche solo una stima.',
    datesBeforeTitle: 'E prima di quello?',
    datesBeforeHelp: 'Ultima, promesso.',
    datesSkip: 'Non me lo ricordo',
    contraceptionTitle: 'Prendi qualche contraccettivo ormonale?',
    contraceptionHelp: 'I contraccettivi ormonali possono influenzare i segnali che il corpo ti manda. Per questo è importante prenderne nota.',
    contraceptionUndisclosed: 'Preferisco non dirlo',
    /**
     * 🔴 Diceva "non viene mai condiviso con un coach". Con R2 non è più vero, e
     * lo leggerebbe una tredicenne. Una promessa di privacy sbagliata è peggio
     * di nessuna promessa: qui si dice cosa succede davvero, e dove sta lo
     * spegnimento.
     */
    cyclePrivacy: '**Il tuo staff vede le date del ciclo**, non quello che scrivi tu. Si spegne quando vuoi.',
    doneTitle: 'Ecco fatto, {name}',
    doneBody: 'Questo è quello che BAB sa di te. Puoi cambiare tutto dalle impostazioni.',
    doneLastCycle: 'Ultimo ciclo',
    doneCycleYearsOne: 'Ha il ciclo da circa {n} anno',
    doneCycleYears: 'Ha il ciclo da circa {n} anni',
    doneCta: 'Inizia il mio primo check-in',
  },

  /**
   * La dashboard squadra (R5). Il tono cambia: qui legge un adulto, e serve
   * chiarezza, non incoraggiamento. Ma non diventa mai un cruscotto di
   * sorveglianza: niente classifiche, niente confronti fra atlete.
   */
  coach: {
    title: 'La squadra',
    subtitle: 'Oggi, in un colpo d\'occhio',
    notConnected: 'La dashboard ha bisogno della connessione: legge i dati di tutta la squadra dal server, non da questo dispositivo.',
    noTeams: 'Questo account non è associato a nessuna squadra. Se dovrebbe esserlo, scrivici.',
    redFlagsTitle: '🚩 Da guardare adesso',
    redFlagsHelp: 'Segnalazioni aperte, dalla più vecchia. Non aspettano il prossimo allenamento.',
    redFlagsNone: 'Nessuna segnalazione aperta.',
    /** 🔴 §11: "non sono riuscito a controllare" non è "non ce ne sono" — vanno dette diverse. */
    redFlagsError: 'Non sono riuscito a controllare le segnalazioni aperte — non vuol dire che non ce ne siano. Riprova appena puoi.',
    toldAdult: 'l\'ha detto a un adulto',
    notToldAdult: 'non risulta detto a nessuno',
    markToldAdult: 'L\'ha detto a un adulto',
    markResolve: 'Chiudi',
    markConfirmTitle: 'Chiudere questa segnalazione?',
    markConfirmBody: 'Non si riapre da qui — se serve, contatta chi amministra.',
    markConfirmYes: 'Sì, chiudi',
    markConfirmNo: 'Annulla',
    openedToday: 'oggi',
    openedDay: 'da un giorno',
    openedDays: 'da {n} giorni',
    rosterTitle: 'Chi c\'è',
    checkedInNo: 'nessun check-in oggi',
    onlyPre: 'solo il prima',
    predicted: 'prevista',
    trained: 'allenata',
    effort: 'sforzo',
    peYes: 'ed. fisica ✓',
    peNo: 'ed. fisica ✗',
    back: '← La squadra',
    historyTitle: 'Le ultime due settimane',
    cycleTitle: 'Date del ciclo',
    /** 🔴 Il coach le vede (R2). Come le legge non è ovvio, quindi si scrive. */
    cycleNote: 'Sono le date che ha inserito lei, non una previsione. Alla sua età i cicli spesso non sono ancora regolari: servono come contesto per capire una giornata, mai per programmare o per farne un tema di conversazione se non è lei ad aprirlo.',
    cycleNone: 'Nessuna data inserita.',
    nothingYet: 'Ancora nessun check-in.',
    fetchError: 'Non sono riuscito a caricare questi dati.',
    retry: 'Riprova',
  },

  common: {
    yes: 'Sì',
    no: 'No',
    cancel: 'Annulla',
    save: 'Salva',
    done: 'Fatto',
    offline: 'Sei offline — quello che scrivi si salva qui e parte da solo dopo.',
    loading: 'Un attimo…',
  },

  /** Viaggia con ogni versione del prodotto. */
  disclaimer:
    'BAB ti aiuta a capire te stessa — non sostituisce il tuo coach, un fisioterapista o un medico, che possono vedere e controllare cose che uno schermo non può. Se qualcosa non va nel tuo corpo o nella tua testa, dillo a un adulto di cui ti fidi. È sempre la mossa forte.',
}
