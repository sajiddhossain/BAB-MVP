/**
 * Cosa fa il dito, nelle due clip.
 *
 * Non sono fotogrammi da montare: sono gesti veri, che record.mjs esegue
 * sull'app come farebbe una persona. Il video e' la conseguenza, non la fonte.
 *
 * Azioni:
 *   { hold }              aspetta e basta (lascia respirare)
 *   { tap: 'Testo' }      tocca il comando che porta quella scritta
 *   { cta: true }         tocca il bottone principale in cima alla pila
 *   { zone: 'quad-r' }    tocca una zona del corpo
 *   { close: true }       tocca la ✕ del pannello
 *   { slide: {…} }        trascina uno slider
 *   { scroll: {…} }       scorre lo schermo col dito
 * Ogni azione puo' portarsi dietro `hold`: quanto restare fermi dopo.
 */

export const SCRIPTS = {
  checkin: [
    { hold: 1400 },
    { tap: 'Steady', hold: 900 },
    { cta: true, hold: 1500 },

    // tune-in: uno slider, la durata del sonno, poi giu' fino al bottone
    { slide: { near: 'Barely slept', to: 0.78 }, hold: 700 },
    { tap: '6–7h', hold: 900 },
    { scroll: { by: 430 }, hold: 900 },
    { slide: { near: 'Running empty', to: 0.34 }, hold: 800 },
    { scroll: { by: 460 }, hold: 800 },
    { cta: true, hold: 1500 },

    // la mappa del corpo: due punti, ognuno col suo nome
    { zone: 'quad-r', hold: 1200 },
    { tap: 'sore', hold: 500 },
    { tap: 'tight', hold: 700 },
    { slide: { near: 'No pain', to: 0.62 }, hold: 900 },
    { cta: true, hold: 1300 },

    { zone: 'shoulder-l', hold: 1200 },
    { tap: 'stiff', hold: 800 },
    { cta: true, hold: 1400 },

    { cta: true, hold: 2600 },
  ],

  checkout: [
    { hold: 1400 },
    { tap: 'Gentle', hold: 900 },
    { cta: true, hold: 1800 },
    { cta: true, hold: 1400 },

    { slide: { near: 'Nothing at all', to: 0.7 }, hold: 1000 },
    { cta: true, hold: 1400 },

    { tap: 'Proud', hold: 800 },
    { tap: 'Learned something new', hold: 700 },
    { tap: 'Showed kindness to myself', hold: 900 },
    { cta: true, hold: 1400 },

    { slide: { near: 'Drained', to: 0.55 }, hold: 1000 },
    { cta: true, hold: 1500 },

    { tap: 'Back', hold: 900 },
    { zone: 'ham-l', hold: 1300 },
    { tap: 'achy', hold: 500 },
    { tap: 'tight', hold: 800 },
    { cta: true, hold: 1300 },
    { cta: true, hold: 1500 },

    { tap: 'Yes', hold: 2600 },
  ],
}
