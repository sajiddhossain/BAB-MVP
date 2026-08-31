/**
 * Cosa fa la mano, nelle due clip.
 *
 * Non sono fotogrammi da montare: sono gesti veri, che record.mjs esegue
 * sull'app come farebbe una persona. Il video e' la conseguenza, non la fonte.
 *
 * Due regole che tengono in piedi tutto il resto.
 *
 * Primo: non si lascia niente in bianco. Se uno schermo fa quattro domande,
 * il video risponde a quattro domande. Un modulo mezzo compilato mentre il
 * dito corre alla schermata dopo dice a chi guarda che quelle caselle non
 * contano davvero.
 *
 * Secondo: si va piano abbastanza da leggere. Ogni schermo nuovo si prende il
 * tempo del suo titolo prima che qualcuno lo tocchi, e lo scorrimento si ferma
 * un attimo prima che il dito si stacchi, invece di lanciare e far sfilare via
 * la pagina.
 *
 * Azioni:
 *   { hold }                 resta fermo (le pause vengono sporcate del ±12%)
 *   { tap: 'Testo' }         tocca il comando che porta quella scritta
 *   { hover: ms }            ...restandoci sopra un attimo prima di premere
 *   { answer: {q, pick} }    risponde a UNA domanda precisa (le coppie si/no)
 *   { cta: true }            tocca il bottone principale in cima alla pila
 *   { zone: 'quad-r' }       tocca una zona del corpo
 *   { close: true }          tocca la ✕ del pannello
 *   { hesitate: {from, to} } va verso una risposta, si ferma, ne sceglie un'altra
 *   { slide: {near, to} }    trascina uno slider, con frenata e assestamento
 *   { write: 'testo' }       scrive sulla tastiera, a ritmo variabile
 *   { flick: {by} }          scorre col dito in vista, e si ferma prima di staccare
 *   { lift: true }           la mano esce dallo schermo
 */

export const SCRIPTS = {
  /*
   * CHECK-IN — PREDICT, TUNE IN, PINPOINT, e la lettura personale.
   * Tune-in fa sei domande e questo copione risponde a tutte e sei: i quattro
   * slider, le ore di sonno, e le due domande in fondo.
   */
  checkin: [
    { hold: 1900 }, // arriva e legge la domanda
    { tap: 'Steady', hover: 340, hold: 800 },
    { cta: true, hold: 1700 },

    // tune-in, dall'alto in basso senza saltare niente
    { slide: { near: 'Sleep', to: 0.78 }, hold: 800 },
    { tap: '6–7h', hold: 850 },
    { flick: { by: 300 }, hold: 900 },
    { slide: { near: 'Energy', to: 0.34 }, hold: 800 },
    { slide: { near: 'Mood', to: 0.58 }, hold: 800 },
    { flick: { by: 320 }, hold: 900 },
    { slide: { near: 'School', to: 0.72 }, hold: 850 },
    { answer: { q: 'On your period?', pick: 'No' }, hold: 700 },
    { answer: { q: 'Taken pain relief?', pick: 'Yes' }, hold: 850 },
    { flick: { by: 260 }, hold: 900 }, // fino in fondo: si vede il rimbalzo
    { cta: true, hold: 1900 },

    // la mappa: dove fa male, e come si chiama
    { zone: 'quad-r', hover: 500, hold: 1600 },
    { tap: 'sore', hold: 450 },
    { tap: 'tight', hold: 800 },
    { write: 'On the last set', hold: 800 },
    { answer: { q: 'Only on one side?', pick: 'Yes' }, hold: 800 },
    { slide: { near: 'No pain', to: 0.62 }, hold: 1000 },
    { cta: true, hold: 1600 }, // conferma: il punto resta sulla mappa
    { cta: true, hold: 2000 },

    // la chiusa: "About that right quad."
    { tap: 'Try this today', hold: 1000 },
    { lift: true, hold: 3000 },
  ],

  /*
   * CHECK-OUT — chiude il giro. Il colpo di scena e' la seconda schermata, e
   * l'esitazione che lo prepara e' l'unica di tutto il video: la mano va verso
   * "Steady", che e' quello che aveva indovinato stamattina, si ferma, e
   * sceglie "Gentle". Un secondo dopo lo schermo dice esattamente quello.
   */
  checkout: [
    { hold: 2000 },
    { hesitate: { from: 'Steady', to: 'Gentle' }, hold: 900 },
    { cta: true, hold: 2900 }, // "You guessed Steady — Your body's tempo was Gentle."
    { cta: true, hold: 1400 },

    { slide: { near: 'Effort', to: 0.7 }, hold: 1000 },
    { cta: true, hold: 1500 },

    // qui si sceglie la faccia, si spuntano le cose portate a casa, e se ne
    // aggiunge una propria: la pillola tratteggiata e' un campo vero
    { tap: 'Proud', hover: 300, hold: 700 },
    { tap: 'Listened to my body', hold: 550 },
    { tap: 'Nailed an exercise', hold: 700 },
    { tap: 'Add your own...', hold: 280 },
    { write: 'Kept my head', hold: 900 },
    { cta: true, hold: 1400 },

    { slide: { near: 'Energy', to: 0.55 }, hold: 1000 },
    { cta: true, hold: 1700 },

    // la mappa di spalle: la linguetta scorre e la figura si dissolve
    { tap: 'Back', hold: 1100 },
    { zone: 'ham-l', hover: 440, hold: 1500 },
    { tap: 'achy', hold: 450 },
    { tap: 'tight', hold: 800 },
    { write: 'Only when I stretch', hold: 800 },
    { answer: { q: 'Only on one side?', pick: 'Yes' }, hold: 800 },
    { slide: { near: 'No pain', to: 0.48 }, hold: 1000 },
    { cta: true, hold: 1500 },
    { cta: true, hold: 1400 },

    // la chiusa: "Here's what today taught you." — con la sua domanda
    { answer: { q: 'Feeling any of the protective kind?', pick: 'No' }, hold: 1200 },
    { lift: true, hold: 2600 },
  ],
}
