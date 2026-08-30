import type { Clip } from './timeline'

/*
 * Le coordinate dei tap sono state estratte dai <rect> degli SVG esportati,
 * non stimate a occhio: ogni bersaglio e' il centro reale del suo bottone.
 * Sono espresse nello spazio del CONTENUTO (lo scroll viene sottratto a runtime).
 */

export const CHECKIN: Clip = {
  id: 'checkin',
  title: 'Check-in',
  steps: [
    {
      screen: 'ci1',
      dur: 5200,
      caption: 'Step 1 · Predict',
      taps: [
        { at: 1500, x: 80, y: 415 }, // chip "Upbeat": e' quello acceso nel frame
        { at: 3500, x: 202, y: 806 }, // CTA "Now let's tune in"
      ],
    },
    {
      screen: 'ci2',
      dur: 8200,
      enter: 'push',
      caption: 'Step 2 · Tune in',
      // il frame e' alto 1262: lo schermo scorre davvero
      scroll: [0, 388],
      scrollWindow: [1900, 5200],
      taps: [
        { at: 1400, x: 225, y: 442 }, // chip nella prima card
        { at: 6100, x: 116, y: 1097 }, // card in fondo
        { at: 7200, x: 200, y: 1193 }, // CTA
      ],
    },
    {
      screen: 'ci3',
      dur: 6800,
      enter: 'push',
      caption: 'Step 3 · Pinpoint',
      taps: [
        { at: 1300, x: 172, y: 508, r: 34 }, // spalla/braccio sinistro
        { at: 3100, x: 224, y: 552, r: 34 }, // quadricipite destro
        { at: 5300, x: 202, y: 806 }, // CTA "Almost done"
      ],
    },
    {
      screen: 'ci4',
      dur: 6000,
      enter: 'sheet',
      caption: 'Step 3 · Name it',
      taps: [
        { at: 1500, x: 201, y: 307 }, // campo in alto
        { at: 3000, x: 106, y: 612 }, // chip selezionato
        { at: 4600, x: 201, y: 806 }, // CTA
      ],
    },
    {
      screen: 'ci5',
      dur: 6400,
      enter: 'push',
      caption: 'Step 3 · Body scan',
      taps: [
        { at: 1800, x: 202, y: 478 }, // accordion "Try this today"
        { at: 4400, x: 202, y: 806 }, // CTA "Got it! Let's start"
      ],
    },
  ],
}

export const CHECKOUT: Clip = {
  id: 'checkout',
  title: 'Check-out',
  steps: [
    {
      screen: 'co1a',
      dur: 5000,
      caption: 'Step 1 · Pick tempo',
      taps: [
        { at: 1600, x: 83, y: 372 }, // chip di sinistra
        { at: 3400, x: 196, y: 806 }, // CTA
      ],
    },
    {
      screen: 'co1b',
      dur: 4600,
      enter: 'fade',
      caption: 'Step 1 · Reveal',
      taps: [{ at: 3000, x: 196, y: 806 }],
    },
    {
      screen: 'co2',
      dur: 5000,
      enter: 'push',
      caption: 'Step 2 · Effort',
      taps: [
        { at: 1500, x: 239, y: 321 }, // il pallino dello slider Effort
        { at: 3400, x: 201, y: 806 },
      ],
    },
    {
      screen: 'co3',
      dur: 5600,
      enter: 'push',
      caption: 'Step 3 · Satisfaction',
      taps: [
        { at: 1400, x: 201, y: 345 },
        { at: 2900, x: 145, y: 636 }, // chip selezionato (#E5F5F2)
        { at: 4200, x: 201, y: 806 },
      ],
    },
    {
      screen: 'co4',
      dur: 5000,
      enter: 'push',
      caption: 'Step 4 · Energy',
      taps: [
        { at: 1500, x: 232, y: 414 }, // il pallino dello slider Energy
        { at: 3400, x: 201, y: 806 },
      ],
    },
    {
      screen: 'co5',
      dur: 6200,
      enter: 'push',
      caption: 'Step 5 · Pinpoint',
      taps: [
        { at: 1300, x: 150, y: 271 }, // toggle "Back": il frame mostra la vista posteriore
        { at: 3000, x: 214, y: 558, r: 34 }, // unica zona rossa -> "1 spots added"
        { at: 4800, x: 202, y: 806 },
      ],
    },
    {
      screen: 'co6',
      dur: 5800,
      enter: 'sheet',
      caption: 'Step 5 · Name it',
      // questo export e' 442x890 con il bleed dell'ombra: gia' compensato in screens.ts
      taps: [
        { at: 1500, x: 201, y: 307 },
        { at: 3000, x: 106, y: 612 },
        { at: 4500, x: 201, y: 808 },
      ],
    },
    {
      screen: 'co7',
      dur: 6400,
      enter: 'push',
      caption: 'Step 6 · Close the loop',
      taps: [
        { at: 1600, x: 274, y: 618 }, // "No" a "Feeling any of the protective kind?"
        { at: 4200, x: 207, y: 812 },
      ],
    },
  ],
}

export const CLIPS: Record<string, Clip> = {
  checkin: CHECKIN,
  checkout: CHECKOUT,
}
