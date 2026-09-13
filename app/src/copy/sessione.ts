import type { Tempo } from '../data/casa'

/**
 * I testi del check-in e del check-out.
 *
 * Sono in un file a parte da `testi.ts` per ragioni storiche: quando gli
 * schermi sono stati costruiti i frame inglesi non c'erano ancora, e li'
 * `en` e' tipato come `typeof it` — ogni chiave italiana avrebbe preteso
 * subito la sua inglese. Ora ci sono, e la forma e' la stessa di `testi.ts`:
 * due oggetti gemelli e una funzione che sceglie.
 *
 * ── COSA NON VIENE DAL DISEGNO ──────────────────────────────────────────────
 * Queste cose le abbiamo scritte noi, e vanno riviste da chi scrive i testi
 * prima di considerarle finite:
 *
 * 1. `confronto` e `rendiconto.frase` hanno tre versioni. Il disegno ne mostra
 *    una sola — quella di chi si aspettava piu' di quanto il corpo ha dato —
 *    ma i casi sono tre, e con una versione sola chi ci prende si sentirebbe
 *    dire che si era sbagliata. In inglese la frase del frame va bene in
 *    tutte e due le direzioni ("You guessed X — your body's tempo was Y"),
 *    quindi li' l'invenzione e' solo il caso in cui ci ha preso.
 * 2. `provaOggi`: nel disegno la scheda "Prova questo oggi" e' chiusa, quindi
 *    dentro non c'e' niente da leggere. In tutt'e due le lingue e' nostra.
 * 3. `mappa.altroveDomanda`, `mappa.altroveSegnaposto`, `mappa.salta`,
 *    `bottino.segnaposto`, `energia.nota.senzaPrima`, `foglio.chiudi` e
 *    `foglio.togli`: schermi e stati che il disegno non mostra.
 * 4. Refusi corretti: "Zoombie" -> "Zombie", "Alcune segnali" -> "Alcuni
 *    segnali", i toggle italiani che nel frame dicono ancora "Yes", e — nel
 *    frame inglese — l'umore che aveva "Worst I've fell" a tutt'e due gli
 *    estremi del cursore.
 */

const it = {
  comune: {
    si: 'Sì',
    no: 'No',
    avanti: 'Avanti',
    ritmi: { carica: 'Scattante', costante: 'Stabile', leggero: 'Tranquillo' } as Record<
      Tempo,
      string
    >,
    /*
     * Cosa vuol dire ognuno dei tre.
     *
     * Compaiono sotto alla fila: col mouse passandoci sopra, col dito
     * scegliendo. Stanno qui e non nei tre schermi che li mostrano — il
     * tutorial, il check-in, il check-out — perche' sono la stessa frase in
     * tre posti, e la stessa frase in tre posti si cambia in uno solo.
     */
    spiegaRitmi: {
      carica: 'Ti senti fresca e pronta a spingere.',
      costante: 'Ti senti bene, senza essere né particolarmente carica né stanca.',
      leggero: 'Ti senti fiacca o appesantita.',
    } as Record<Tempo, string>,
  },

  // ── CHECK-IN ──────────────────────────────────────────────────────────────

  ritmoPrima: {
    occhiello: 'PASSO 1 · INDOVINA',
    titolo: 'Qual è il ritmo di oggi?',
    occhio:
      "Il tuo ritmo è quanto il tuo corpo ha da dare oggi. Fai una stima ora e confrontala dopo l'allenamento per affinare la tua percezione interiore.",
    carta: {
      titolo: "Non c'è un ritmo giusto o sbagliato",
      corpo:
        'È un messaggio speciale che il tuo corpo ti manda: ascoltalo, rispettalo e allenati a lavorarci insieme, un check-in alla volta.',
    },
    azione: 'Ora sintonizziamoci',
  },

  sintonia: {
    occhiello: 'PASSO 2 · SINTONIZZATI',
    titolo: 'Cosa ti sta dicendo il corpo?',
    sonno: {
      titolo: 'Sonno',
      domanda: 'Quanto ti senti riposata dalla notte scorsa?',
      sinistra: 'Zombie',
      destra: 'Ben riposata',
      ore: 'Circa quanto hai dormito?',
    },
    energia: {
      titolo: 'Energia',
      domanda: 'Quanto sono cariche le batterie?',
      sinistra: 'Svuotata',
      destra: 'Carichissima',
    },
    umore: {
      titolo: 'Umore',
      domanda: 'Come va emotivamente?',
      sinistra: 'Peggio non si può',
      destra: 'Al top',
    },
    scuola: {
      titolo: 'Scuola',
      domanda: 'Come va la pressione in questo momento?',
      sinistra: 'Relax',
      destra: 'Massimo stress',
    },
    ciclo: 'Hai il ciclo?',
    antidolorifici: 'Preso antidolorifici?',
    azione: 'Individua ciò che senti',
  },

  /*
   * L'ultimo schermo del check-in, rifatto sul frame nuovo.
   *
   * Il vecchio elencava i punti e spiegava due tipi di dolore. Questo prende
   * le parole che ha scelto e le rimanda indietro: la frase che potrebbe
   * dire a un adulto, cosa dice ogni parola, come si legge un segnale
   * qualsiasi, e quattro cose da fare oggi. L'italiano e' nostro: il frame
   * nuovo esiste solo in inglese.
   */
  segnali: {
    occhiello: 'PASSO 4 · DAGLI UN SENSO',
    titolo: 'Parliamo di: {zonaMinuscola}.',
    titoloPiu: 'Parliamo di quello che hai segnato.',
    /*
     * La scheda con i punti segnati: uno per riga, con le sue parole e
     * quanto forte. Due punti gemelli uguali — quelli nati da "Solo da un
     * lato? No" — diventano una riga sola col nome al plurale, vedi
     * `zoneEntrambe`.
     */
    corpo: {
      titolo: 'Cosa comunica il tuo corpo',
      intensita: '{intensita} su 10',
    },
    prova: {
      titolo: 'Prova questo oggi',
      passi: [
        'Scalda bene quel punto, poi ricontrollalo prima della prima serie dura.',
        "Confrontalo con l'altro lato. Stesso punto, stesso tocco. È la cosa più utile che puoi fare, e non costa niente.",
        'Guarda se si scioglie, resta uguale o peggiora: te lo chiediamo al check-out, non adesso.',
        'Se una parola diventa pungente, trafittiva o formicolante, è un altro discorso: fermati con quel movimento e dillo a qualcuno.',
      ],
    },
    nota: 'Leggere il segnale è la bravura. Ignorarlo è da principianti. BAB non ti dice mai se allenarti o no, e non dà mai un nome a una malattia.',
    azione: 'Capito, si comincia',
  },

  // ── CHECK-OUT ─────────────────────────────────────────────────────────────

  ritmoDopo: {
    occhiello: 'PASSO 1 · CONFRONTATI',
    titolo: 'Come si sentiva il tuo corpo?',
    occhio:
      "Ripensando all'allenamento, scegli il ritmo che il tuo corpo ha effettivamente seguito.",
    /*
     * Il disegno ha solo il primo caso. Gli altri due li abbiamo scritti noi:
     * senza, chi ci prende leggerebbe che si e' sbagliata.
     */
    confronto: {
      piu: 'Pensavi che il ritmo del tuo corpo fosse {previsto}, ma si è rivelato {sentito}.',
      meno: 'Pensavi che il ritmo del tuo corpo fosse {previsto}, e ne aveva da dare di più: si è rivelato {sentito}.',
      uguale: "L'avevi indovinato: il ritmo era {previsto}.",
      corpo:
        'Confrontare la tua stima con quanto il tuo corpo aveva da dare oggi ti aiuta a decifrare i suoi segnali più in fretta.',
    },
    azione: 'Avanti',
  },

  sforzo: {
    occhiello: 'PASSO 2 · SINTONIZZATI',
    titolo: 'Quanto è stato intenso per il tuo corpo?',
    carta: 'Sforzo',
    sinistra: 'Niente affatto',
    destra: 'Massimo',
    nota: {
      titolo: 'Solo tu puoi rispondere a questa.',
      corpo:
        'Due persone possono fare esattamente la stessa sessione e sentirla in modo completamente diverso — e entrambe hanno ragione perché ogni corpo è unico.',
    },
    azione: 'Avanti',
  },

  soddisfazione: {
    occhiello: 'PASSO 2 · SINTONIZZATI',
    titolo: 'E come ti senti a riguardo?',
    domanda: 'Quanto sei soddisfatta?',
    facce: {
      disappointed: 'Delusa',
      frustrated: 'Frustrata',
      satisfied: 'Soddisfatta',
      confident: 'Fiera',
      proud: 'Orgogliosa',
    },
    bottino: {
      titolo: 'Cosa hai portato a casa?',
      aiuto: 'Puoi selezionarne più di una',
      voci: {
        imparato: 'Ho imparato qualcosa di nuovo',
        ascoltato: 'Ho ascoltato il mio corpo',
        aiutato: 'Ho aiutato una compagna di squadra',
        gentile: 'Sono stata gentile con me stessa',
        eseguito: 'Ho eseguito un esercizio molto bene',
      },
      tua: 'Aggiungi tu...',
      segnaposto: 'Cosa ti porti a casa?',
    },
    azione: 'Avanti',
  },

  energia: {
    occhiello: 'PASSO 2 · SINTONIZZATI',
    titolo: 'Quanta energia hai ora?',
    carta: 'Energia',
    sinistra: 'Sfinita',
    destra: 'Ancora carica',
    nota: {
      titolo: 'Questa mattina eri a {prima}.',
      corpo: "L'energia che diminuisce dopo una sessione è normale.",
      /* quando non ha fatto il check-in, un confronto non c'e' */
      senzaPrima:
        'Non hai fatto il check-in stamattina, quindi oggi non c’è un prima da confrontare.',
    },
    azione: 'Individua come ti senti',
  },

  /*
   * L'ultimo schermo del check-out, rifatto sul frame nuovo.
   *
   * Il vecchio confrontava previsione ed esito e spiegava due tipi di
   * dolore. Questo, in piu', mette accanto lo stesso punto stamattina e
   * adesso — stesse sedici parole, ed e' quello che li rende confrontabili.
   * L'italiano e' nostro: il frame nuovo esiste solo in inglese.
   */
  rendiconto: {
    occhiello: 'PASSO 4 · CHIUDI IL CERCHIO',
    titolo: "Ecco cos'hai imparato oggi.",
    prima: 'STAMATTINA',
    dopo: 'NE SEI USCITA',
    frase: {
      piu: 'Sei entrata aspettandoti più di quanto il tuo corpo avesse oggi, e te ne sei accorta. È la lettura che si affina, non una sessione andata male.',
      meno: 'Il tuo corpo aveva più da dare di quanto ti aspettassi entrando, e te ne sei accorta. È la lettura che si affina.',
      uguale: "L'avevi indovinato esattamente. È la lettura che si affina.",
    },
    /*
     * La scheda dei punti segnati, come quella della fine del check-in ma
     * con il prima e il dopo. `nonSegnata` sta al posto dei valori quando un
     * punto c'era solo prima o solo dopo.
     */
    confronto: {
      titolo: 'Cosa comunica il tuo corpo',
      prima: 'PRIMA',
      dopo: 'DOPO',
      intensita: '{intensita} su 10',
      nonSegnata: 'non segnata',
    },
    nota: 'Leggere il segnale è la bravura. Ignorarlo è da principianti. Sostegno non vuol mai dire una diagnosi: vuol dire dirlo a chi ti allena, a un fisioterapista, a un genitore o a un medico.',
    azione: 'Fatto per oggi',
  },

  /*
   * La frase che la home mostra a giornata finita.
   *
   * Non sta su nessuno schermo del check-out: e' il riassunto che resta
   * dopo, e il disegno della home non dice cosa ci vada dentro. L'abbiamo
   * scritta noi, ed e' l'unica cosa che la giornata ha davvero prodotto.
   */
  giorno: {
    soloDopo: 'Il tuo corpo oggi ha chiesto un ritmo {dopo}.',
    uguale: 'Avevi previsto {prima}, ed era {dopo}.',
    diverso: 'Avevi previsto {prima}, il tuo corpo ha chiesto {dopo}.',
  },

  // ── LA MAPPA E IL FOGLIO ──────────────────────────────────────────────────

  mappa: {
    occhiello: 'PASSO 3 · INDIVIDUA LE SENSAZIONI',
    titolo: 'Dove lo senti?',
    occhio: 'Tocca un punto, poi indica cosa senti.',
    davanti: 'Davanti',
    dietro: 'Dietro',
    altrove: 'Altrove',
    altroveDomanda: 'Dove, allora?',
    altroveSegnaposto: 'Testa, stomaco, gola…',
    nota: 'Fermarsi a localizzare una sensazione e descriverla ti aiuta a capire, gestire e comunicare meglio ciò che senti.',
    conteggio: { uno: '1 sensazione aggiunta', molte: '{n} sensazioni aggiunte' },
    azionePrima: 'Quasi fatto',
    azioneDopo: 'Quasi finito',
    /* si puo' anche non sentire niente, e non e' un fallimento */
    salta: 'Oggi non sento niente di particolare',
    /* un lato solo, come lo scrive il riassunto di una sensazione */
    unLato: 'un lato',
    dueLati: 'tutti e due i lati',
  },

  foglio: {
    come: 'Come la senti?',
    segnaposto: 'Descrivilo con parole tue...',
    aiuto: 'Un piccolo aiuto ✨',
    parole: {
      forte: 'forte',
      leggero: 'leggero',
      indolenzito: 'indolenzito',
      sordo: 'affaticato',
      teso: 'teso',
      rigido: 'rigido',
      pungente: 'acuto',
      trafittivo: 'fitta',
      crampo: 'crampo',
      morsa: 'bloccato',
      bruciante: 'bruciore',
      formicolante: 'formicolio',
      intorpidito: 'addormentato',
      instabile: 'instabile',
      gonfio: 'gonfio',
      caldo: 'caldo',
    },
    unLato: 'Solo da un lato?',
    /*
     * Le tre domande "when". Nel disegno stanno solo in inglese: l'italiano
     * qui sotto e' nostro e va riletto.
     */
    quando: {
      domanda: 'Quando la senti?',
      voci: {
        muovo: 'Solo quando mi muovo',
        premo: 'Quando ci premo sopra',
        ferma: 'Anche stando ferma',
      },
    },
    comparsa: {
      domanda: 'Quando è comparsa?',
      voci: {
        mattina: 'C’era già stamattina',
        durante: 'Durante l’allenamento',
        dopo: 'Appena mi sono fermata',
      },
    },
    effetto: {
      domanda: 'Cosa le ha fatto la sessione?',
      voci: {
        scaldata: 'Si è sciolta scaldandomi',
        uguale: 'È rimasta uguale',
        peggio: 'È peggiorata',
        nuova: 'È comparsa dopo',
      },
    },
    cosaVuolDire: 'Cosa vuol dire?',
    intensita: 'Intensità:',
    lieve: 'Lieve',
    atroce: 'Atroce',
    aggiungi: 'Aggiungi questa sensazione',
    /*
     * Perche' il bottone e' spento. Non c'era: il bottone diventava grigio e
     * basta, e chi lo toccava non capiva se era rotto o se mancava qualcosa.
     */
    manca: 'Scegli una parola, o scrivi con parole tue.',
    mancaDove: 'Scrivi dov’è, e scegli una parola o scrivi con parole tue.',
    chiudi: 'Chiudi',
    togli: 'Togli questa sensazione',
  },
  /*
   * I nomi delle zone del corpo.
   *
   * Uno per zona, scritto per intero. Prima si costruivano da una radice piu'
   * il lato ("Quadricipite" + "destro"), col genere della parola scritto
   * accanto: elegante, ma dal pannello si sarebbe potuto cambiare solo mezzo
   * nome, e in inglese la regola non vale nemmeno — "Right quad" mette il
   * lato davanti e accorcia la parola. Scritti per intero ogni lingua dice
   * quello che dice, e chi tocca "Petto destro" si ritrova "Petto destro".
   */
  zone: {
    'head': 'Collo e testa',
    'trap-r': 'Trapezio destro',
    'trap-l': 'Trapezio sinistro',
    'shoulder-r': 'Spalla destra',
    'shoulder-l': 'Spalla sinistra',
    'chest-r': 'Petto destro',
    'chest-l': 'Petto sinistro',
    'upperarm-r': 'Braccio destro',
    'upperarm-l': 'Braccio sinistro',
    'ribs-r': 'Costole destre',
    'ribs-l': 'Costole sinistre',
    'elbow-r': 'Gomito destro',
    'elbow-l': 'Gomito sinistro',
    'abs-r': 'Addominali destri',
    'abs-l': 'Addominali sinistri',
    'forearm-r': 'Avambraccio destro',
    'forearm-l': 'Avambraccio sinistro',
    'hip-r': 'Anca destra',
    'hip-l': 'Anca sinistra',
    'wrist-r': 'Polso destro',
    'wrist-l': 'Polso sinistro',
    'hand-r': 'Mano destra',
    'hand-l': 'Mano sinistra',
    'quad-r': 'Quadricipite destro',
    'quad-l': 'Quadricipite sinistro',
    'knee-r': 'Ginocchio destro',
    'knee-l': 'Ginocchio sinistro',
    'shin-r': 'Tibia destra',
    'shin-l': 'Tibia sinistra',
    'ankle-r': 'Caviglia destra',
    'ankle-l': 'Caviglia sinistra',
    'foot-r': 'Piede destro',
    'foot-l': 'Piede sinistro',
    'upperback-l': 'Schiena alta sinistra',
    'upperback-r': 'Schiena alta destra',
    'midback-l': 'Schiena media sinistra',
    'midback-r': 'Schiena media destra',
    'lowback-l': 'Zona lombare sinistra',
    'lowback-r': 'Zona lombare destra',
    'glute-l': 'Gluteo sinistro',
    'glute-r': 'Gluteo destro',
    'ham-l': 'Coscia posteriore sinistra',
    'ham-r': 'Coscia posteriore destra',
    'calf-l': 'Polpaccio sinistro',
    'calf-r': 'Polpaccio destro',
    'heel-l': 'Tallone sinistro',
    'heel-r': 'Tallone destro',
  },

  /*
   * Le zone quando sono segnate tutte e due, uguali: "Quadricipiti" invece di
   * "Quadricipite destro" e "Quadricipite sinistro" su due righe. La chiave e'
   * l'id senza il lato (`quad-r` -> `quad`). La testa non c'e': sta nel mezzo.
   */
  zoneEntrambe: {
    'trap': 'Trapezi',
    'shoulder': 'Spalle',
    'chest': 'Petto',
    'upperarm': 'Braccia',
    'ribs': 'Costole',
    'elbow': 'Gomiti',
    'abs': 'Addominali',
    'forearm': 'Avambracci',
    'hip': 'Anche',
    'wrist': 'Polsi',
    'hand': 'Mani',
    'quad': 'Quadricipiti',
    'knee': 'Ginocchia',
    'shin': 'Tibie',
    'ankle': 'Caviglie',
    'foot': 'Piedi',
    'upperback': 'Schiena alta',
    'midback': 'Schiena media',
    'lowback': 'Zona lombare',
    'glute': 'Glutei',
    'ham': 'Cosce posteriori',
    'calf': 'Polpacci',
    'heel': 'Talloni',
  } as Record<string, string>,
}

const en: typeof it = {
  comune: {
    si: 'Yes',
    no: 'No',
    avanti: 'Next',
    ritmi: { carica: 'Upbeat', costante: 'Steady', leggero: 'Gentle' } as Record<Tempo, string>,
    spiegaRitmi: {
      carica: 'You feel fresh and ready to push.',
      costante: 'You feel good — neither especially charged nor tired.',
      leggero: 'You feel sluggish or heavy.',
    } as Record<Tempo, string>,
  },

  // ── CHECK-IN ──────────────────────────────────────────────────────────────

  ritmoPrima: {
    occhiello: 'STEP 1 · PREDICT',
    titolo: 'What’s your tempo today?',
    occhio:
      'Your tempo is just how much your body’s got to give today. Take a guess now — you’ll check it again after training. Guessing first is how your inner read gets sharp.',
    carta: {
      titolo: 'No tempo is good or bad.',
      corpo:
        'It’s your body’s unique message for you — you notice it, honour it, and learn to work with it.',
    },
    azione: 'Now let’s tune in',
  },

  sintonia: {
    occhiello: 'STEP 2 · TUNE IN',
    titolo: 'What’s your body saying?',
    sonno: {
      titolo: 'Sleep',
      domanda: 'How rested do you feel from last night?',
      sinistra: 'Barely slept',
      destra: 'Well rested',
      ore: 'Roughly how long did you sleep?',
    },
    energia: {
      titolo: 'Energy',
      domanda: 'Where’s your energy gauge sitting?',
      sinistra: 'Running empty',
      destra: 'Fully charged',
    },
    umore: {
      titolo: 'Mood',
      domanda: 'Slide to where you are today.',
      /* nel frame l'estremo destro ripete quello sinistro: e' un refuso */
      sinistra: 'Worst I’ve felt',
      destra: 'Best I’ve felt',
    },
    scuola: {
      titolo: 'School',
      domanda: 'How’s the pressure right now?',
      sinistra: 'Chilled',
      destra: 'Exam week',
    },
    ciclo: 'On your period?',
    antidolorifici: 'Taken pain relief?',
    azione: 'Pinpoint how it feels',
  },

  segnali: {
    occhiello: 'STEP 4 · MAKE SENSE OF IT',
    titolo: 'About that {zonaMinuscola}.',
    titoloPiu: 'About what you flagged.',
    corpo: {
      titolo: 'What your body is telling you',
      intensita: '{intensita} out of 10',
    },
    prova: {
      titolo: 'Try this today',
      passi: [
        'Warm that spot up properly, then check it again before the first hard rep.',
        'Compare it to the other side. Same spot, same touch. It’s the most useful thing you can do and it costs nothing.',
        'Notice whether it warms out, stays, or gets worse — you’ll answer that at check-out, not now.',
        'If any word changes to sharp, stabbing or tingling, that’s a different conversation — stop that movement and tell someone.',
      ],
    },
    nota: 'Reading the signal is the skill. Ignoring it is the amateur move. BAB never tells you to train or not to train — and never names a condition.',
    azione: 'Got it — start training',
  },

  // ── CHECK-OUT ─────────────────────────────────────────────────────────────

  ritmoDopo: {
    occhiello: 'STEP 1 · LOOK BACK',
    titolo: 'How did your body feel?',
    occhio: 'Thinking back on training, pick the tempo your body actually followed.',
    /*
     * La frase del frame va bene in tutte e due le direzioni, quindi qui
     * `piu` e `meno` sono la stessa: l'unica scritta da noi e' `uguale`.
     */
    confronto: {
      piu: 'You guessed {previsto} — your body’s tempo was {sentito}.',
      meno: 'You guessed {previsto} — your body’s tempo was {sentito}.',
      uguale: 'You guessed {previsto} — and that’s exactly the tempo your body followed.',
      corpo:
        'The space between your guess and your body’s tempo is where you get sharper at decoding its signals. Being "off" isn’t a fail: it’s information.',
    },
    azione: 'Next',
  },

  sforzo: {
    occhiello: 'STEP 1 · LOOK BACK',
    titolo: 'How intense did it feel in your body?',
    carta: 'Effort',
    sinistra: 'Nothing at all',
    destra: 'All-out',
    nota: {
      titolo: 'Only you can answer this one.',
      corpo:
        'Two people can do the exact same session and feel it completely differently — and both are right because each body is unique.',
    },
    azione: 'Next',
  },

  soddisfazione: {
    occhiello: 'STEP 1 · LOOK BACK',
    titolo: 'And how do you feel about it?',
    domanda: 'How satisfied do you feel?',
    facce: {
      disappointed: 'Disappointed',
      frustrated: 'Frustrated',
      satisfied: 'Satisfied',
      confident: 'Confident',
      proud: 'Proud',
    },
    bottino: {
      titolo: 'What did you bring home?',
      aiuto: 'Select all that apply',
      voci: {
        imparato: 'Learned something new',
        ascoltato: 'Listened to my body',
        aiutato: 'Helped a teammate',
        gentile: 'Showed kindness to myself',
        eseguito: 'Nailed an exercise',
      },
      tua: 'Add your own...',
      segnaposto: 'What are you taking home?',
    },
    azione: 'Now let’s tune in',
  },

  energia: {
    occhiello: 'STEP 2 · TUNE IN',
    titolo: 'Where’s your energy now?',
    carta: 'Energy',
    sinistra: 'Drained',
    destra: 'Still buzzing',
    nota: {
      titolo: 'This morning you were at {prima}.',
      corpo: 'Energy dropping after a session is normal and expected.',
      senzaPrima:
        'You didn’t check in this morning, so there’s no before to compare today with.',
    },
    azione: 'Pinpoint how it feels',
  },

  rendiconto: {
    occhiello: 'STEP 4 · CLOSE THE LOOP',
    titolo: 'Here’s what today taught you.',
    prima: 'THIS MORNING',
    dopo: 'YOU CAME OUT',
    frase: {
      piu: 'You went in expecting more than your body had today — and you noticed it. That’s the read getting sharper, not a session gone wrong.',
      meno: 'Your body had more to give than you went in expecting — and you noticed it. That’s the read getting sharper.',
      uguale: 'You called it exactly. That’s the read getting sharper.',
    },
    confronto: {
      titolo: 'What your body is telling you',
      prima: 'BEFORE',
      dopo: 'AFTER',
      intensita: '{intensita} out of 10',
      nonSegnata: 'not marked',
    },
    nota: 'Reading the signal is the skill. Ignoring it is the amateur move. Support never means a diagnosis — it means tell a coach, a physio, a parent or a doctor.',
    azione: 'Done for today',
  },

  giorno: {
    soloDopo: 'Your body asked for a {dopo} tempo today.',
    uguale: 'You guessed {prima}, and that’s what it was.',
    diverso: 'You guessed {prima}, your body asked for {dopo}.',
  },

  // ── LA MAPPA E IL FOGLIO ──────────────────────────────────────────────────

  mappa: {
    occhiello: 'STEP 3 · PINPOINT',
    titolo: 'Where do you feel it?',
    occhio: 'Tap a spot, then name what you feel.',
    davanti: 'Front',
    dietro: 'Back',
    altrove: 'Somewhere else',
    altroveDomanda: 'Where, then?',
    altroveSegnaposto: 'Head, stomach, throat…',
    nota: 'Pausing to find where a sensation sits and putting a word to it helps you understand, manage and communicate it.',
    conteggio: { uno: '1 spot added', molte: '{n} spots added' },
    azionePrima: 'Almost done',
    azioneDopo: 'Next',
    salta: 'I don’t feel anything in particular today',
    unLato: 'one side',
    dueLati: 'both sides',
  },

  foglio: {
    come: 'What does it feel like?',
    segnaposto: 'Describe it in your own words...',
    aiuto: 'A little help ✨',
    parole: {
      forte: 'strong',
      leggero: 'light',
      indolenzito: 'sore',
      sordo: 'achy',
      teso: 'tight',
      rigido: 'stiff',
      pungente: 'sharp',
      trafittivo: 'stabbing',
      crampo: 'crampy',
      morsa: 'gripping',
      bruciante: 'burning',
      formicolante: 'tingling',
      intorpidito: 'numb',
      instabile: 'unstable',
      gonfio: 'swollen',
      caldo: 'hot',
    },
    unLato: 'Only on one side?',
    quando: {
      domanda: 'When do you notice it?',
      voci: {
        muovo: 'Only when I move it',
        premo: 'When I press it',
        ferma: 'Even sitting still',
      },
    },
    comparsa: {
      domanda: 'When did it show up?',
      voci: {
        mattina: 'It was there this morning',
        durante: 'During training',
        dopo: 'Once I stopped',
      },
    },
    effetto: {
      domanda: 'What did the session do to it?',
      voci: {
        scaldata: 'It warmed out',
        uguale: 'It stayed the same',
        peggio: 'It got worse',
        nuova: 'It showed up after',
      },
    },
    cosaVuolDire: 'What does it mean?',
    intensita: 'Intensity:',
    lieve: 'No pain',
    atroce: 'Worst possible pain',
    aggiungi: 'Add this sensation',
    manca: 'Pick a word, or write it in your own words.',
    mancaDove: 'Say where it is, and pick a word or write it in your own words.',
    chiudi: 'Close',
    togli: 'Remove this sensation',
  },
  /*
   * The names of the body zones. One per zone, spelled out — see the Italian
   * side for why they are not composed from a root plus a side.
   */
  zone: {
    'head': 'Head & neck',
    'trap-r': 'Right trap',
    'trap-l': 'Left trap',
    'shoulder-r': 'Right shoulder',
    'shoulder-l': 'Left shoulder',
    'chest-r': 'Right chest',
    'chest-l': 'Left chest',
    'upperarm-r': 'Right upper arm',
    'upperarm-l': 'Left upper arm',
    'ribs-r': 'Right ribs',
    'ribs-l': 'Left ribs',
    'elbow-r': 'Right elbow',
    'elbow-l': 'Left elbow',
    'abs-r': 'Right abs',
    'abs-l': 'Left abs',
    'forearm-r': 'Right forearm',
    'forearm-l': 'Left forearm',
    'hip-r': 'Right hip',
    'hip-l': 'Left hip',
    'wrist-r': 'Right wrist',
    'wrist-l': 'Left wrist',
    'hand-r': 'Right hand',
    'hand-l': 'Left hand',
    'quad-r': 'Right quad',
    'quad-l': 'Left quad',
    'knee-r': 'Right knee',
    'knee-l': 'Left knee',
    'shin-r': 'Right shin',
    'shin-l': 'Left shin',
    'ankle-r': 'Right ankle',
    'ankle-l': 'Left ankle',
    'foot-r': 'Right foot',
    'foot-l': 'Left foot',
    'upperback-l': 'Left upper back',
    'upperback-r': 'Right upper back',
    'midback-l': 'Left mid back',
    'midback-r': 'Right mid back',
    'lowback-l': 'Left lower back',
    'lowback-r': 'Right lower back',
    'glute-l': 'Left glute',
    'glute-r': 'Right glute',
    'ham-l': 'Left hamstring',
    'ham-r': 'Right hamstring',
    'calf-l': 'Left calf',
    'calf-r': 'Right calf',
    'heel-l': 'Left heel',
    'heel-r': 'Right heel',
  },

  zoneEntrambe: {
    'trap': 'Traps',
    'shoulder': 'Shoulders',
    'chest': 'Chest',
    'upperarm': 'Upper arms',
    'ribs': 'Ribs',
    'elbow': 'Elbows',
    'abs': 'Abs',
    'forearm': 'Forearms',
    'hip': 'Hips',
    'wrist': 'Wrists',
    'hand': 'Hands',
    'quad': 'Quads',
    'knee': 'Knees',
    'shin': 'Shins',
    'ankle': 'Ankles',
    'foot': 'Feet',
    'upperback': 'Upper back',
    'midback': 'Mid back',
    'lowback': 'Lower back',
    'glute': 'Glutes',
    'ham': 'Hamstrings',
    'calf': 'Calves',
    'heel': 'Heels',
  },
}

export const TESTI_SESSIONE = { it, en }

/** I testi della sessione nella lingua chiesta. */
export function testiSessione(lingua: 'it' | 'en') {
  return TESTI_SESSIONE[lingua]
}

export type TestiSessione = typeof it
