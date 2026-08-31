/**
 * Cosa fa la mano, nelle due clip.
 *
 * Non sono fotogrammi da montare: sono gesti veri, che record.mjs esegue
 * sull'app come farebbe una persona. Il video e' la conseguenza, non la fonte.
 *
 * Il copione ha una forma, non e' un elenco di cose da toccare. Ogni clip
 * apre, entra nel vivo, e chiude su quello che l'app ha da dire. I momenti che
 * valgono — la zona che si colora, il colpo di scena, la lettura finale — si
 * prendono il doppio del tempo di una spunta qualsiasi, e la mano esce di
 * scena prima dell'ultima inquadratura.
 *
 * Azioni:
 *   { hold }                 resta fermo (le pause vengono sporcate del ±12%)
 *   { tap: 'Testo' }         tocca il comando che porta quella scritta
 *   { hover: ms }            ...restandoci sopra un attimo prima di premere
 *   { cta: true }            tocca il bottone principale in cima alla pila
 *   { zone: 'quad-r' }       tocca una zona del corpo
 *   { close: true }          tocca la ✕ del pannello
 *   { hesitate: {from, to} } va verso una risposta, si ferma, ne sceglie un'altra
 *   { slide: {near, to} }    trascina uno slider, con frenata e assestamento
 *   { write: 'testo' }       scrive sulla tastiera, a ritmo variabile
 *   { flick: {by} }          lancia lo schermo con inerzia, dito in vista
 *   { lift: true }           la mano esce dallo schermo
 */

export const SCRIPTS = {
  /*
   * CHECK-IN — PREDICT, TUNE IN, PINPOINT, e la lettura personale.
   * Il centro e' la mappa del corpo: e' li' che si capisce cosa fa l'app,
   * quindi ha la pausa piu' lunga prima e dopo.
   */
  checkin: [
    { hold: 1400 }, // arriva e legge la domanda
    { tap: 'Steady', hover: 300, hold: 600 },
    { cta: true, hold: 1250 },

    // tune-in: il sonno, le ore, poi giu' fino in fondo
    { slide: { near: 'Barely slept', to: 0.78 }, hold: 600 },
    { tap: '6–7h', hold: 650 },
    { flick: { by: 480 }, hold: 700 },
    { flick: { by: 420 }, hold: 800 }, // tocca il fondo: si vede il rimbalzo
    { cta: true, hold: 1500 },

    // la mappa: sceglie dove, e gli da' un nome
    { zone: 'quad-r', hover: 460, hold: 1300 },
    { tap: 'sore', hold: 360 },
    { tap: 'tight', hold: 600 },
    { write: 'On the last set', hold: 650 },
    { slide: { near: 'No pain', to: 0.62 }, hold: 800 },
    { cta: true, hold: 1250 }, // conferma: il punto resta sulla mappa
    { cta: true, hold: 1700 },

    // la chiusa: "About that right quad."
    { tap: 'Try this today', hold: 750 },
    { lift: true, hold: 2400 },
  ],

  /*
   * CHECK-OUT — chiude il giro. Il colpo di scena e' la seconda schermata, e
   * l'esitazione che lo prepara e' l'unica di tutto il video: la mano va verso
   * "Steady", che e' quello che aveva indovinato stamattina, si ferma, e
   * sceglie "Gentle". Un secondo dopo lo schermo dice esattamente quello.
   */
  checkout: [
    { hold: 1500 },
    { hesitate: { from: 'Steady', to: 'Gentle' }, hold: 750 },
    { cta: true, hold: 2400 }, // "You guessed Steady — Your body's tempo was Gentle."
    { cta: true, hold: 1100 },

    { slide: { near: 'Nothing at all', to: 0.7 }, hold: 800 },
    { cta: true, hold: 1150 },

    // qui si scrive: la pillola tratteggiata e' un campo vero
    { tap: 'Proud', hover: 280, hold: 550 },
    { tap: 'Add your own...', hold: 240 },
    { write: 'Kept my head', hold: 700 },
    { cta: true, hold: 1100 },

    { slide: { near: 'Drained', to: 0.55 }, hold: 800 },
    { cta: true, hold: 1300 },

    // la mappa di spalle: la linguetta scorre e la figura si dissolve
    { tap: 'Back', hold: 900 },
    { zone: 'ham-l', hover: 420, hold: 1200 },
    { tap: 'achy', hold: 360 },
    { tap: 'tight', hold: 620 },
    { cta: true, hold: 1250 },

    // la chiusa: "Here's what today taught you."
    { cta: true, hold: 950 },
    { lift: true, hold: 2100 },
  ],
}
