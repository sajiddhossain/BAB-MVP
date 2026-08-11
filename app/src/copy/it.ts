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

  tabs: {
    today: 'Oggi',
    journey: 'Percorso',
    me: 'Me',
    ariaLabel: 'Navigazione principale',
  },

  /**
   * R12 · Il link via email è la strada principale, non un ripiego: Google ha
   * un'età minima che una dodicenne spesso non raggiunge, e gli account
   * scolastici bloccano spesso l'accesso OAuth di terze parti.
   * Apple è stato valutato e scartato — vedi R12 nella revisione.
   */
  auth: {
    title: 'Entra in BAB',
    lede: 'Ti mandiamo un link via email. Nessuna password da ricordare, e nessuna da farsi rubare.',
    emailLabel: 'La tua email',
    emailPlaceholder: 'nome@esempio.it',
    sendLink: 'Mandami il link',
    sending: 'Sto mandando…',
    sentTitle: 'Guarda la posta',
    sentBody: 'Abbiamo mandato un link a **{email}**. Aprilo da questo telefono ed è fatta.',
    sentAgain: 'Non è arrivato? Rimandalo',
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
    legendFlag: 'da far vedere',
    listOpen: 'Preferisci un elenco?',
    listClose: 'Torna alla figura',
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
      /** R3 · Solo nei giorni che il suo calendario segna come educazione fisica. */
      peAsk: 'Oggi hai fatto educazione fisica?',
      peAskHelp: 'Capita di non andarci, e cambia parecchio il carico della giornata.',
    },
    pre: {
      title: 'Leggi i tuoi segnali',
      steps: ['Prevedi', 'Sintonizzati', 'Confronta', 'Aggiusta'],
      predict: {
        label: 'Passo 1 · Prevedi',
        title: 'Prima di sintonizzarti — qual è la tua andatura oggi?',
        help: 'La tua "andatura" è quanto ha da dare il tuo corpo oggi. Tira a indovinare adesso — lo confermerai alla fine. Indovinare prima allena la tua lettura interiore, e "sbagliare" non è un fallimento: è tutto il punto.',
        confidence: 'Quanto sei sicura?',
        confidenceOptions: ['Tiro a indovinare', 'Abbastanza', 'Sicura'],
        sleepHours: 'Quanto hai dormito?',
        sleepHoursOptions: ['Meno di 6h', '6–7h', '7–8h', '8–9h', 'Più di 9h'],
      },
      tuneIn: {
        label: 'Passo 2 · Sintonizzati',
        title: 'I tuoi canali',
        /** Resta in inglese: è vocabolario del prodotto, come i nomi delle andature. */
        headspace: '🧠 Headspace',
        headspaceHelp: 'tocca quelle che ti somigliano',
        headspaceOther: '➕ Altro',
        headspaceOtherPlaceholder: 'Con parole tue…',
        surprise: 'Qualcosa ti ha sorpresa?',
        surpriseOptions: ['No, come pensavo', 'Sì, un po\'', 'Sì, parecchio'],
        schoolLoad: 'Com\'è la scuola in questi giorni?',
        schoolOptions: ['Tranquilla', 'Impegnativa', 'Settimana d\'esami'],
      },
      pinpoint: {
        label: 'Passo 2 · Individua e nomina',
        title: 'Dove lo senti? Dagli un nome.',
        help: 'Fermarsi a trovare dove sta una sensazione, e metterci una parola sopra, è il cuore della competenza — è come un vago "mi sento strana" diventa qualcosa che capisci davvero. Tocca un punto, passa tra fronte e retro, poi scegli come si sente. Aggiungine quante ne noti, o nessuna se è tutto tranquillo.',
        front: 'Fronte',
        back: 'Retro',
        allOver: 'Dappertutto',
        elsewhere: 'Da un\'altra parte',
        where: 'Dove',
        whatLike: 'Come si sente?',
        howStrong: 'Quanto è forte?',
        whatDoes: 'E cosa fa?',
      },
      result: {
        compareLabel: 'Passo 3 · Confronta — la tua lettura contro il tuo corpo',
        planLabel: 'Passo 4 · Aggiusta — il tuo piano di oggi',
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
        label: 'Passo 1 · Guarda indietro',
        title: 'Con che andatura ti sei allenata davvero?',
        effort: 'Quanto è stata dura davvero?',
        duration: 'Quanto è durata?',
        durationOptions: ['Meno di 30 min', '30–60 min', '1–2 ore', 'Più di 2 ore'],
        sessionType: 'Che tipo di sessione?',
        sessionTypeOptions: ['Allenamento', 'Gara o partita', 'Educazione fisica', 'Palestra', 'Altro'],
      },
      senseLabel: 'Passo 2 · Senti — una lettura veloce',
      learnLabel: 'Passo 3 · Impara',
      /** 🔴 Niente "3/5": il §7 vieta i punteggi davanti all'atleta. */
      readSpot: 'Stamattina avevi previsto **{predicted}**, ed è andata proprio così.',
      readGap: 'Stamattina avevi previsto **{predicted}**, e ti sei allenata in **{actual}**.',
      readGapNote: 'Quello scarto non è un errore: è la cosa che stiamo allenando. Più lo noti, più si accorcia.',
      noPre: 'Non trovo il check-in di stamattina, quindi oggi non c\'è niente da confrontare. Va bene lo stesso — quello che scrivi qui conta comunque.',
      recapSignals: 'Ti sei fermata e hai nominato {n} sensazioni. Farlo — trovare dove sta e darle una parola — è esattamente il muscolo che stiamo allenando.',
      openQuestion: 'Una domanda tranquilla su cui vale la pena fermarsi: cosa ti ha sorpresa di più di oggi — e quale segnale te l\'ha detto per primo?',
      notePlaceholder: 'Se ti va, scrivilo qui. Lo leggi solo tu.',
      broughtHome: {
        title: 'Cosa ti sei portata a casa?',
        help: 'Scegli quello che ti somiglia oggi — o nessuno.',
      },
      communicate: {
        title: 'C\'è qualcosa che vale la pena dire a qualcuno?',
        copy: 'Copia una frase per il coach',
        notToday: 'Non oggi',
      },
      recoverLabel: 'Passo 4 · Recupera — cosa chiede il tuo corpo adesso',
      saving: 'Salvo…',
      saved: 'Salvato. Anche senza campo: parte da solo quando torna.',
    },
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
    storyTitle: 'La tua storia della settimana',
    storyBody: 'Qualcosa da far vedere a un coach o a un genitore',
    storyCta: 'Preparane una',
    storyLocked: 'Si sblocca dopo la tua prima settimana intera',
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
    saved: 'Salvata',
    download: 'Salva l\'immagine',
    emptyState: 'Non hai ancora scelto niente — spunta almeno una cosa qui sopra e apparirà qui.',
  },

  onboarding: {
    welcomeTitle: 'Qui si impara a leggersi',
    welcomeBody: 'Quasi tutte le app sportive ti misurano da fuori e ti dicono cosa fare. BAB fa l\'opposto: ti aiuta a capire cosa ti sta dicendo il tuo corpo — così sai quando spingere, quando riposare, e come dirlo ad alta voce.',
    isTitle: 'Cos\'è',
    isItems: [
      'Un modo per capire cosa ti dice il tuo corpo',
      'Uno spazio dove "oggi vado piano" è una risposta giusta',
      'Le parole per dirlo a chi ti allena',
    ],
    isNotTitle: 'Cosa non è',
    isNotItems: [
      'Un voto sulla tua giornata',
      'Un modo per confrontarti con le altre',
      'Qualcosa che parla di cibo o di peso',
    ],
    back: 'Indietro',
    consentAthlete: 'Ho letto e ci sto',
    consentGuardian: 'Un genitore o chi si prende cura di me ha letto e ci sta',
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
    birthdayTitle: 'Quando compi gli anni?',
    birthdayHelp: 'Serve a due cose: farti gli auguri, e sapere quali domande ha senso farti e quali no.',
    sportTitle: 'Che sport fai?',
    sportHelp: 'Cambia il vocabolario che BAB usa con te — gare o partite, e cosa conta come sessione.',
    sportLabel: 'Il tuo sport',
    setUpLater: 'Lo imposto dopo',

    /** R3 · "La mia settimana": il calendario, chiamato come lo chiamerebbe lei. */
    weekTitle: 'La mia settimana',
    weekHelp: 'Segna quando ti alleni, quando hai educazione fisica, e le gare che già sai. Così BAB sa quando aspettarti — e sta zitta negli altri giorni.',
    weekTraining: 'Allenamenti',
    weekTrainingHelp: 'Giorni e orario, così sa quando chiederti il prima e il dopo',
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
    rhythmBody: 'Se ce l\'hai, BAB può usarlo come sfondo dietro tutti gli altri segnali — la cosa che quasi nessuna app sportiva fa. Puoi spegnerlo quando vuoi, e prima di decidere ti diciamo esattamente chi lo vede.',
    rhythmYes: 'Sì, ce l\'ho',
    rhythmYesHelp: 'BAB mapperà le tue fasi dalle date che le dai',
    rhythmNotYet: 'Non ancora',
    rhythmNotYetHelp: 'Del tutto normale — i corpi iniziano ai loro tempi, in un punto qualsiasi di questi anni',
    rhythmSkip: 'Preferisco non dirlo',
    rhythmSkipHelp: 'Va bene anche così. Tutto il resto funziona esattamente uguale',
    datesTitle: 'Quando sono iniziati i tuoi ultimi cicli?',
    datesHelp: 'Basta una stima. Anche una sola data permette a BAB di partire; due o tre la rendono migliore. Alla tua età i cicli spesso si stanno ancora assestando, quindi BAB la tratta come una mappa larga, mai come un orario.',
    dateMostRecent: 'Il più recente',
    datePrevious: 'Quello prima',
    dateBefore: 'E ancora prima',
    contraceptionTitle: 'Prendi qualche contraccettivo ormonale?',
    contraceptionHelp: 'Pillola, impianto, spirale, cerotto, iniezione. Circa metà delle atlete lo fa, e cambia cosa significano i tuoi segnali — quindi BAB deve saperlo per leggerli bene.',
    whyDatesTitle: 'Perché BAB chiede le date invece di "in che fase sei?"',
    whyDatesBody: 'Perché ricavarlo dalle date è il modo affidabile — indovinare la propria fase non lo è, soprattutto nei primi anni. Non dovrai mai classificarti da sola.',
    /**
     * 🔴 Diceva "non viene mai condiviso con un coach". Con R2 non è più vero, e
     * lo leggerebbe una tredicenne. Una promessa di privacy sbagliata è peggio
     * di nessuna promessa: qui si dice cosa succede davvero, e dove sta lo
     * spegnimento.
     */
    cyclePrivacy: 'Questa è la cosa più delicata che ti chiediamo, quindi te lo diciamo chiaro: **il tuo staff vede le date del ciclo**, insieme al resto dei tuoi check-in. Non vede quello che scrivi tu. E se preferisci di no, questa parte si spegne quando vuoi — il resto di BAB funziona esattamente uguale.',
    doneTitle: 'Ecco fatto',
    doneBody: 'Questo è quello che BAB sa di te. Puoi cambiare tutto dalle impostazioni.',
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
    toldAdult: 'l\'ha detto a un adulto',
    notToldAdult: 'non risulta detto a nessuno',
    openedToday: 'oggi',
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
  },

  settings: {
    title: 'Impostazioni',
    profile: 'Profilo',
    rhythm: 'Il mio ritmo',
    privacy: 'Privacy e dati',
    notifications: 'Promemoria',
    help: 'Aiuto',
    exportData: 'Esporta i miei dati',
    deleteAccount: 'Cancella il mio account',
    deleteConfirm: 'Cancella davvero tutto? Non si torna indietro.',
    language: 'Lingua',
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
