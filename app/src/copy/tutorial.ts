/**
 * Le parole del tutorial, in italiano e in inglese.
 *
 * Vengono dai sette frame Figma del giro che segue l'onboarding
 * (`16-how-it-works` … `training-overview`). Dove i due frame di una lingua
 * dicevano cose diverse, la differenza è annotata qui sotto.
 *
 * ── QUATTRO COSE CHE ABBIAMO SCRITTO NOI ───────────────────────────────────
 * Vanno rilette da chi scrive i testi prima del pilota. Sono tutte visibili
 * nel pannello, gruppo «Tutorial».
 *
 * 1. Il riscontro del confronto in tutt'e due gli esiti. Il frame italiano
 *    mostra solo il caso azzeccato («vicini — bel fatto!»), quello inglese
 *    solo il caso mancato («different bands»). Ognuna delle due lingue aveva
 *    quindi metà del testo: l'altra metà è tradotta da noi, tenendo il tono
 *    di quella che c'era.
 *
 * 2. Il conto alla rovescia mentre conta. Il disegno mostra solo lo schermo
 *    fermo, con scritto «Pronta quando vuoi»: quello che si legge mentre i
 *    quindici secondi scorrono non c'era, e senza si resta senza sapere
 *    quanto manca.
 *
 * 3. «Riprova» quando il conteggio non sta in piedi, e la parola sul bottone
 *    che lo rifà. Se tocca due volte in quindici secondi non le si può dire
 *    che il suo cuore fa otto battiti al minuto: si rifà, e basta.
 *
 * 4. Nella scheda del confronto, a destra, il frame italiano ripete il numero
 *    («72 BPM») e quello inglese scrive la banda («Slow»). Abbiamo tenuto la
 *    banda in tutt'e due: il numero grande sta già sopra, e quello che va
 *    confrontato con la sua ipotesi è la banda, non la cifra.
 */

const it = {
  comeFunziona: {
    occhiello: 'COME FUNZIONA',
    titolo: 'Indovina. Sintonizzati. Confronta',
    occhio: 'Tre step da fare ogni giorno:',
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
    chiusa: 'Più ti alleni a farlo, più accurata sarà la tua lettura dei segnali del corpo.',
    azione: 'Proviamolo adesso →',
  },

  primaRep: {
    occhiello: 'LA TUA PRIMA REP · 60 SECONDI',
    titolo: 'Senti il tuo battito?',
    corpo:
      'Siediti comoda e in silenzio per un momento. Vedi se riesci a sentire il tuo cuore battere — nel petto, nel collo, o anche nelle orecchie.',
    nota: 'Certi giorni è facile sentirlo, certi giorni no. Va bene comunque, stai imparando a sintonizzarti.',
    azione: 'Sono pronta →',
  },

  indovina: {
    occhiello: 'STEP 1 · INDOVINA',
    titolo: 'Quanto veloce ti sembra?',
    corpo: 'Non pensarci troppo. Il tuo battito ti sembra:',
    carte: [
      { emoji: '🐢', nome: 'Lento', sotto: 'calmo' },
      { emoji: '🚶‍♀️', nome: 'Medio', sotto: 'tiene il ritmo' },
      { emoji: '🐇', nome: 'Veloce', sotto: 'su di giri' },
    ],
    nota: 'Soffermarsi ad ascoltare cosa ti sta dicendo il tuo corpo è il primo passo per imparare a gestirlo.',
    azione: 'Avanti 🔒',
  },

  conta: {
    occhiello: 'STEP 2 · SINTONIZZATI',
    titolo: 'Ora contiamo i battiti.',
    corpo:
      "Appoggia l'indice e il medio all'interno del polso, finché senti il battito del cuore.\n\nPremi TAP e, per {secondi} secondi, tocca il cerchio per ogni battito che senti.",
    pronta: 'Pronta quando vuoi',
    via: 'TAP',
    inCorso: 'Mancano {secondi} secondi',
    finito: 'Fatto.',
    conteggio: 'Battiti contati: {battiti}',
    riprova: 'Sono pochi per essere un battito. Riprova con calma.',
    daccapo: 'Ricomincia',
    azione: "Guarda cos'hai sentito",
  },

  confronto: {
    occhiello: 'CONFRONTATI',
    titolo: 'Hai appena letto il tuo corpo.',
    unita: 'BATTITI AL MINUTO',
    tuaIpotesi: 'LA TUA IPOTESI',
    haiContato: 'HAI CONTATO',
    azzeccato:
      'La tua sensazione e il tuo conteggio sono vicini — bel fatto! Con la pratica diventerai ancora più brava a leggere il tuo corpo.',
    mancato:
      'La tua sensazione e il tuo conteggio sono finiti in due bande diverse. Il primo giorno è normalissimo, ed è proprio la distanza che imparerai a chiudere. Hai appena trovato il tuo punto di partenza.',
    chiusa:
      'Imparare a leggere rapidamente i segnali del corpo è come allenare un muscolo: hai appena fatto la tua prima rep.',
    azione: 'Cosa succede adesso?',
  },

  ritmi: {
    occhiello: 'IL RITMO DEL CORPO',
    titolo: 'Qual è il ritmo di oggi?',
    forte: 'È il messaggio speciale che il tuo corpo ti manda.',
    corpo:
      "Non c'è un ritmo giusto o sbagliato: ascoltalo, rispettalo e allenati a lavorarci insieme, un check-in alla volta.",
    carte: ['Scattante', 'Stabile', 'Tranquillo'],
    azione: 'Capito',
  },

  andiamo: {
    occhiello: 'SEI PRONTA',
    titolo: 'Andiamo!',
    corpo:
      'Farai lo stesso loop — indovina, sintonizzati, confronta — prima e dopo ogni sessione, per imparare a capire quanto il tuo corpo ha da dare.',
    checkin: {
      titolo: 'Check-in',
      testo:
        "Nei 30 minuti prima dell'allenamento, prevedi come sta il tuo corpo e sintonizzati.",
    },
    checkout: {
      titolo: 'Check-out',
      testo: "Nei 30 minuti dopo, osserva e rifletti su com'è andata e su come ti senti.",
    },
    azione: 'Fai il mio primo check-in →',
  },
}

/**
 * Deve avere esattamente la stessa forma dell'italiano: se manca una chiave o
 * ne avanza una, il typecheck si ferma qui invece che a schermo acceso.
 */
const en: typeof it = {
  comeFunziona: {
    occhiello: 'HOW IT WORKS',
    titolo: 'Guess. Tune in. Decode.',
    occhio: 'A simple daily loop:',
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
          'The space between your guess and your body’s tempo is where you get sharper at decoding its signals. Being “off” isn’t a fail.',
      },
    ],
    chiusa: 'The more you practice, the more accurate your read gets.',
    azione: "Let's try it!",
  },

  primaRep: {
    occhiello: 'YOUR FIRST REP · 60 SECONDS',
    titolo: 'Can you feel your own heartbeat?',
    corpo:
      'Sit comfortably and quietly for a moment. See if you can feel your heart beating — maybe in your chest, your neck, even your ears.',
    nota: "Some days it's easy to feel, some days it's faint. Either is fine, you're just tuning in.",
    azione: "I'm tuned in",
  },

  indovina: {
    occhiello: 'STEP 1 · GUESS',
    titolo: 'How fast is it going?',
    corpo: 'Follow your gut. Right now, your heartbeat feels:',
    carte: [
      { emoji: '🐢', nome: 'Slow', sotto: 'Calm & settled' },
      { emoji: '🚶‍♀️', nome: 'Medium', sotto: 'Ticking along' },
      { emoji: '🐇', nome: 'Fast', sotto: 'Up & going' },
    ],
    nota: 'Pausing to guess your body’s signals is the first step to learn its language.',
    azione: 'Lock it in',
  },

  conta: {
    occhiello: 'STEP 2 · TUNE IN',
    titolo: "Now let's count!",
    corpo:
      'Place your index and middle finger on the inside of your wrist, until you feel your heartbeat.\n\nClick start, and tap the circle once for every beat you feel, for {secondi} seconds.',
    pronta: 'Ready when you are',
    via: 'START',
    inCorso: '{secondi} seconds to go',
    finito: 'Done.',
    conteggio: 'Beats counted: {battiti}',
    riprova: "That's too few to be a heartbeat. Take your time and try again.",
    daccapo: 'Start over',
    azione: 'See what I sensed',
  },

  confronto: {
    occhiello: 'STEP 3 · DECODE',
    titolo: 'You just read your own body.',
    unita: 'BEATS PER MINUTE (YOU COUNTED)',
    tuaIpotesi: 'Your prediction',
    haiContato: 'You counted',
    azzeccato:
      'Your feeling and your count landed in the same band — nicely done! With practice you’ll get even better at reading your body.',
    mancato:
      'Your guess and your count landed in different bands. That is completely normal on day one, and it is exactly the gap you will get better at closing. You just found your starting point.',
    chiusa:
      'Learning to quickly read your body’s signals is like training a muscle: you’ve just done your first rep.',
    azione: "What's next",
  },

  ritmi: {
    occhiello: "YOUR BODY'S TEMPO",
    titolo: 'What’s today’s tempo?',
    forte: "It’s your body's unique message for you.",
    corpo:
      'No tempo is good or bad: you notice it, honour it, and learn to work with it through each check.',
    carte: ['Upbeat', 'Steady', 'Gentle'],
    azione: 'Got it',
  },

  andiamo: {
    occhiello: "YOU'RE ALL SET",
    titolo: "Let's do it!",
    corpo:
      'Practice the same guess — tune in — decode loop in two quick checks per session, to understand how much your body’s got to give each day.',
    checkin: {
      titolo: 'Check-in',
      testo: 'In the 30 minutes before training: guess how your body feels, then tune in.',
    },
    checkout: {
      titolo: 'Check-out',
      testo: 'In the 30 minutes after, see how it went and how it feels now.',
    },
    azione: 'To my first check-in!',
  },
}

export const TESTI_TUTORIAL = { it, en }
export type TestiTutorial = typeof it
