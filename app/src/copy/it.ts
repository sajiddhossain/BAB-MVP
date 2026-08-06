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
      secondary: 'Cambia il mio tempo',
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
    },
    pre: {
      title: 'Leggi i tuoi segnali',
      steps: ['Prevedi', 'Sintonizzati', 'Confronta', 'Aggiusta'],
      predict: {
        label: 'Passo 1 · Prevedi',
        title: 'Prima di sintonizzarti — qual è il tuo tempo oggi?',
        help: 'Il tuo "tempo" è quanto ha da dare il tuo corpo oggi. Tira a indovinare adesso — lo confermerai alla fine. Indovinare prima allena la tua lettura interiore, e "sbagliare" non è un fallimento: è tutto il punto.',
        confidence: 'Quanto sei sicura?',
        confidenceOptions: ['Tiro a indovinare', 'Abbastanza', 'Sicura'],
        sleepHours: 'Quanto hai dormito?',
      },
      tuneIn: {
        label: 'Passo 2 · Sintonizzati',
        title: 'I tuoi canali',
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
        swapLabel: 'Il tuo corpo, la tua chiamata. Vuoi cambiare tempo?',
        copyForCoach: 'Copia cosa dire al coach',
        again: 'Nuovo check-in',
      },
    },
    post: {
      title: 'Chiudi il cerchio',
      steps: ['Guarda indietro', 'Senti', 'Impara', 'Recupera'],
      lookBack: {
        label: 'Passo 1 · Guarda indietro',
        title: 'In che tempo ti sei allenata davvero?',
        effort: 'Quanto è stata dura davvero?',
        duration: 'Quanto è durata?',
        sessionType: 'Che tipo di sessione?',
      },
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
    collectingCount: '{done} di {total} check-in',
    collectingLeft: 'Ancora circa {n} e iniziano ad apparire i primi pattern.',
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
      tempos: 'I miei tempi',
      temposHelp: 'In che tempo ti sei allenata ogni giorno',
      spots: 'Dove ho sentito cose',
      spotsHelp: 'I punti che sono venuti fuori più spesso, e come si sentivano',
      energy: 'La mia energia nella settimana',
      energyHelp: 'Una linea semplice — nessun numero, nessun punteggio',
      note: 'Quello che ho scritto',
      noteHelp: 'La nota che hai lasciato dopo l\'allenamento',
      cycle: 'Il mio ciclo',
      cycleHelp: 'In che fase eri — spento a meno che non lo accenda tu',
    },
    /** 🔴 Il ciclo è escluso di default e questa nota non si tocca. */
    cycleNote: 'Il tuo ciclo è la cosa più privata che BAB tiene. Non viene mai incluso da solo, non viaggia mai insieme ad altro, e accenderlo qui vale **solo per questa card** — mai per la prossima.',
    previewTitle: 'Questo è esattamente quello che vedranno',
    previewHelp: 'Nessun link, nessuna dashboard, nessun accesso. Solo questa immagine — così quello che mandi è tutto quello che ricevono.',
    send: 'Manda',
    keep: 'Tienila per me',
    saidTitle: 'E queste sono le parole per iniziare il discorso',
    saidHelp: 'Copiale se ti aiutano — o dille a modo tuo, che è meglio.',
    copyWords: 'Copia queste parole',
    emptyState: 'Non hai ancora scelto niente — spunta almeno una cosa qui sopra e apparirà qui.',
  },

  onboarding: {
    welcomeTitle: 'Qui si impara a leggersi',
    welcomeBody: 'Quasi tutte le app sportive ti misurano da fuori e ti dicono cosa fare. BAB fa l\'opposto: ti aiuta a capire cosa ti sta dicendo il tuo corpo — così sai quando spingere, quando riposare, e come dirlo ad alta voce.',
    isTitle: 'Cos\'è',
    isNotTitle: 'Cosa non è',
    letsGo: 'Andiamo',
    continue: 'Continua',
    consentTitle: 'Prima di tutto il resto',
    consentHelp: 'Hai meno di 18 anni, quindi servono due sì — il tuo e quello di un genitore o di chi si prende cura di te. Leggeteli insieme se potete.',
    ageTitle: 'Quanti anni hai?',
    ageHelp: 'Cambia come BAB ti parla e quanto è dettagliata la mappa del corpo — nient\'altro.',
    sportTitle: 'Cosa fai, e quando?',
    sportHelp: 'Così BAB sa in che giorni aspettarsi un check-in — e sta zitta negli altri.',
    sportLabel: 'Il tuo sport',
    daysLabel: 'Giorni di allenamento',
    setUpLater: 'Lo imposto dopo',
    rhythmTitle: 'Hai già il ciclo?',
    rhythmBody: 'Se ce l\'hai, BAB può usarlo come sfondo dietro tutti gli altri segnali — la cosa che quasi nessuna app sportiva fa. È tuo, resta tuo, e puoi spegnerlo quando vuoi.',
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
    /** 🔴 Promessa contrattuale: non si annacqua. */
    cyclePrivacy: 'Questa è la cosa più privata qui dentro. Il tuo ciclo non viene mai condiviso con un coach, non viene mai mostrato a nessuno, e non viene mai incluso in niente che mandi — a meno che non lo spunti tu, ogni singola volta.',
    doneTitle: 'Ecco fatto — circa 90 secondi',
    doneBody: 'Questo è quello che BAB sa di te. Puoi cambiare tutto dalle impostazioni.',
    doneCta: 'Inizia il mio primo check-in',
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
