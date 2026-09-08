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
    ritmi: { carica: 'Carica', costante: 'Costante', leggero: 'Leggero' } as Record<Tempo, string>,
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

  segnali: {
    occhiello: 'PRIMA DI INIZIARE',
    titolo: 'Considera questi segnali',
    decifra: 'Decifriamo la sensazione',
    affaticamento: {
      titolo: 'Dolore da affaticamento',
      corpo: 'Si allevia mentre ti riscaldi. Presente in entrambi i lati.',
    },
    protettivo: {
      titolo: 'Dolore protettivo',
      corpo:
        "Acuto, improvviso o profondo in un'articolazione. Solo da un lato. Peggiora muovendolo.",
    },
    prova: 'Prova questo oggi',
    /*
     * Quello che c'e' dentro alla scheda quando si apre. Due liste, non una:
     * il consiglio cambia se le parole che ha scelto assomigliano a un dolore
     * che protegge o a uno che ha solo lavorato.
     */
    provaOggi: {
      affaticamento: [
        'Allunga il riscaldamento di cinque minuti e parti piano: questo tipo di dolore di solito si scioglie mentre ti muovi.',
        'Se a metà sessione è ancora lì uguale, dillo a chi ti allena — non aspettare la fine.',
      ],
      protettivo: [
        'Oggi evita il gesto che lo fa peggiorare. Il resto dell’allenamento puoi farlo.',
        'Dillo a chi ti allena PRIMA di cominciare, e a un genitore o al medico se stasera è ancora lì.',
      ],
    },
    nota: 'BAB ti aiuta a tradurre i segnali del corpo in informazioni chiare, senza sostituire il tuo sistema di supporto. Rivolgiti sempre al tuo allenatore, medico o un genitore se qualcosa non va.',
    azione: 'Capito! Iniziamo',
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
      piu: (previsto: string, sentito: string) =>
        `Pensavi che il ritmo del tuo corpo fosse ${previsto}, ma si è rivelato ${sentito}.`,
      meno: (previsto: string, sentito: string) =>
        `Pensavi che il ritmo del tuo corpo fosse ${previsto}, e ne aveva da dare di più: si è rivelato ${sentito}.`,
      uguale: (previsto: string) => `L'avevi indovinato: il ritmo era ${previsto}.`,
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
      titolo: (prima: number) => `Questa mattina eri a ${prima}.`,
      corpo: "L'energia che diminuisce dopo una sessione è normale.",
      /* quando non ha fatto il check-in, un confronto non c'e' */
      senzaPrima:
        'Non hai fatto il check-in stamattina, quindi oggi non c’è un prima da confrontare.',
    },
    azione: 'Individua come ti senti',
  },

  rendiconto: {
    occhiello: 'PASSO 4 · IL TUO RENDICONTO',
    titolo: "Ecco cos'hai imparato oggi.",
    previsione: 'Previsione',
    richiesta: 'richiesta del corpo',
    frase: {
      piu: 'Ti aspettavi di più di quanto il tuo corpo potesse dare oggi e lo hai notato: ben fatto! ',
      meno: 'Il tuo corpo aveva più da dare di quanto pensassi, e te ne sei accorta: ben fatto! ',
      uguale: 'Avevi previsto esattamente il ritmo che il tuo corpo ha seguito. ',
      chiusa: 'Stai allenando la tua consapevolezza corporea.',
    },
    decodifica: {
      titolo: 'Decodifica il dolore',
      occhio: 'Alcuni segnali si manifestano solo quando ti fermi.',
      affaticamento: {
        titolo: 'Dolore da affaticamento',
        corpo:
          'Bruciore o stanchezza nei muscoli che hanno lavorato, abbastanza uniforme su entrambi i lati, che diminuisce mentre ti raffreddi.',
      },
      protettivo: {
        titolo: 'Dolore protettivo',
        corpo:
          "Acuto o improvviso, all'interno di un'articolazione, solo da un lato, che non ti fa dormire.",
      },
      domanda: 'Senti un dolore di tipo protettivo?',
    },
    nota: "Il recupero non è la parte noiosa dopo l'allenamento, ma dove l'allenamento si trasforma in progresso. Per dolore protettivo o qualsiasi cosa che sembri insolita, coinvolgi il tuo allenatore, medico o un genitore.",
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
    soloDopo: (dopo: string) => `Il tuo corpo oggi ha chiesto un ritmo ${dopo.toLowerCase()}.`,
    uguale: (prima: string, dopo: string) =>
      `Avevi previsto ${prima}, ed era ${dopo.toLowerCase()}.`,
    diverso: (prima: string, dopo: string) =>
      `Avevi previsto ${prima}, il tuo corpo ha chiesto ${dopo.toLowerCase()}.`,
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
    conteggio: (n: number) => (n === 1 ? '1 sensazione aggiunta' : `${n} sensazioni aggiunte`),
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
      sordo: 'dolore sordo',
      teso: 'teso',
      rigido: 'rigido',
      pungente: 'pungente',
      trafittivo: 'trafittivo (fitta)',
      crampo: 'crampo',
      morsa: 'a morsa',
      bruciante: 'bruciante',
      formicolante: 'formicolante',
      intorpidito: 'intorpidito',
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
        muovo: 'Solo quando la muovo',
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
      },
    },
    cosaVuolDire: 'Cosa vuol dire?',
    intensita: 'Intensità:',
    lieve: 'Lieve',
    atroce: 'Atroce',
    aggiungi: 'Aggiungi questa sensazione',
    chiudi: 'Chiudi',
    togli: 'Togli questa sensazione',
  },
}

const en: typeof it = {
  comune: {
    si: 'Yes',
    no: 'No',
    avanti: 'Next',
    ritmi: { carica: 'Upbeat', costante: 'Steady', leggero: 'Gentle' } as Record<Tempo, string>,
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
    occhiello: 'BEFORE KICKING OFF',
    titolo: 'Mind these signals',
    decifra: 'Let’s decode it',
    affaticamento: {
      titolo: 'Working ache',
      corpo: 'Muscle burn or tightness from previous sessions which eases as you warm up.',
    },
    protettivo: {
      titolo: 'Protective pain',
      corpo:
        'Sharp, sudden or deep in a joint. One side only. Moving it makes you limp, or worsens the pain.',
    },
    prova: 'Try this today',
    provaOggi: {
      affaticamento: [
        'Add five minutes to your warm-up and start easy: this kind of ache usually loosens off once you get moving.',
        'If it’s still exactly the same halfway through, tell your coach — don’t wait until the end.',
      ],
      protettivo: [
        'Skip the movement that makes it worse today. You can still do the rest of the session.',
        'Tell your coach BEFORE you start, and a parent or a doctor if it’s still there tonight.',
      ],
    },
    nota: 'BAB helps you translate body signals into clear information, without replacing your support system. Always consult your coach, doctor, or a parent if something feels wrong.',
    azione: 'Got it! Let’s start',
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
      piu: (previsto: string, sentito: string) =>
        `You guessed ${previsto} — your body’s tempo was ${sentito}.`,
      meno: (previsto: string, sentito: string) =>
        `You guessed ${previsto} — your body’s tempo was ${sentito}.`,
      uguale: (previsto: string) =>
        `You guessed ${previsto} — and that’s exactly the tempo your body followed.`,
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
      titolo: (prima: number) => `This morning you were at ${prima}.`,
      corpo: 'Energy dropping after a session is normal and expected.',
      senzaPrima:
        'You didn’t check in this morning, so there’s no before to compare today with.',
    },
    azione: 'Pinpoint how it feels',
  },

  rendiconto: {
    occhiello: 'STEP 4 · YOUR READ',
    titolo: 'Here’s what today taught you.',
    previsione: 'Prediction',
    richiesta: 'body’s ask',
    frase: {
      piu: 'You expected more than your body could give today, and you noticed it: well done! ',
      meno: 'Your body had more to give than you thought, and you noticed it: well done! ',
      uguale: 'You called exactly the tempo your body followed. ',
      chiusa: 'Your read is getting sharper.',
    },
    decodifica: {
      titolo: 'Decode the ache',
      occhio:
        'Some things only show up once you stop. Naming it comes first — deciding what to do comes after.',
      affaticamento: {
        titolo: 'Working ache',
        corpo:
          'Burn or tiredness in muscles that worked, fairly even on both sides, easing as you cool down.',
      },
      protettivo: {
        titolo: 'Protective pain',
        corpo:
          'Sharp or sudden, inside a joint or bone, one side only, makes you limp, or does not settle.',
      },
      domanda: 'Feeling any of the protective kind?',
    },
    nota: 'Recovery isn’t the boring bit after training — it’s where the training actually works. For protective pain or anything that feels off, loop in your coach, physio or a parent.',
    azione: 'Done for today',
  },

  giorno: {
    soloDopo: (dopo: string) => `Your body asked for a ${dopo.toLowerCase()} tempo today.`,
    uguale: (prima: string, _dopo: string) => `You guessed ${prima}, and that’s what it was.`,
    diverso: (prima: string, dopo: string) =>
      `You guessed ${prima}, your body asked for ${dopo.toLowerCase()}.`,
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
    conteggio: (n: number) => (n === 1 ? '1 spot added' : `${n} spots added`),
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
      },
    },
    cosaVuolDire: 'What does it mean?',
    intensita: 'Intensity:',
    lieve: 'No pain',
    atroce: 'Worst possible pain',
    aggiungi: 'Add this sensation',
    chiudi: 'Close',
    togli: 'Remove this sensation',
  },
}

const TESTI_SESSIONE = { it, en }

/** I testi della sessione nella lingua chiesta. */
export function testiSessione(lingua: 'it' | 'en') {
  return TESTI_SESSIONE[lingua]
}

export type TestiSessione = typeof it
