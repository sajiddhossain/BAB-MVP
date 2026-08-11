import type { RegionCode } from '@/content/bodymap'

/**
 * La geometria della mappa corporea.
 *
 * Sta in un file suo, separata da `BodyMap.tsx`, per due motivi: i numeri si
 * possono guardare senza leggere React, e `scripts/preview-bodymap.mjs` importa
 * QUESTO modulo per disegnare l'anteprima — quindi l'anteprima non è una copia
 * che può divergere, è la stessa geometria.
 *
 * 🔴 I codici (`knee_l`) stanno in `content/bodymap.ts` e finiscono nel
 * database: non si toccano. Qui c'è solo dove sono disegnati, che è
 * presentazione e si può cambiare quando si vuole.
 *
 * ── Come è fatta ────────────────────────────────────────────────────────────
 *
 * Il disegno è UNA SAGOMA, non venti pezzi accostati. La prima versione era
 * fatta di trapezi che si toccavano: ogni pezzo aveva il suo contorno, e da
 * lontano si leggeva come un robot. Una ragazzina che ha male e deve indicare
 * dove deve riconoscere un corpo, non un diagramma di montaggio.
 *
 *   1. `PROFILE` è metà del profilo esterno come ELENCO DI PUNTI — dalla cima
 *      della testa all'inguine, lato sinistro. Una spline lo trasforma in curve
 *      morbide. Scritto così, correggere le proporzioni vuol dire cambiare un
 *      numero in una tabella, non indovinare un punto di controllo di Bézier:
 *      è il motivo per cui questa figura ha una vita e un polpaccio e la
 *      versione scritta a mano no.
 *
 *   2. L'altra metà è la stessa, riflessa. La simmetria è esatta per
 *      costruzione e non può sbilanciarsi con una modifica distratta.
 *
 *   3. Quella sagoma diventa una `clipPath`. Le regioni sono quindi FASCE
 *      RETTANGOLARI che sbordano di proposito: il ritaglio le taglia sul
 *      profilo. Nessuna fessura bianca fra due zone, nessun bordo da far
 *      combaciare a mano, e il contorno spesso resta uno solo — quello vero.
 *
 * ── Convenzione sinistra/destra ─────────────────────────────────────────────
 *
 * 🔴 La sua sinistra sta a SINISTRA dello schermo, in tutt'e due le viste.
 * È la convenzione dello specchio, quella già provata nei prototipi. Non è il
 * disegno anatomico da manuale (dove il fronte è speculare), ma è l'unica che
 * non le chiede un ribaltamento mentale mentre ha male. I codici salvati
 * restano corretti a prescindere da dove sono disegnati.
 */

export type Side = 'front' | 'back'

export type Shape =
  /** Fascia orizzontale: sborda, ci pensa il ritaglio. */
  | { k: 'rect'; x: number; y: number; w: number; h: number; cx: number; cy: number }
  /** Forma libera. `mirror` la ribalta su x=100 invece di riscriverla. */
  | { k: 'path'; d: string; cx: number; cy: number; mirror?: boolean }

/** Il riquadro del disegno. Tutte le coordinate qui sotto vivono dentro questo. */
export const VIEW = { w: 200, h: 390 }

type P = [number, number]

/**
 * Catmull-Rom → Bézier: fa passare una curva morbida per TUTTI i punti dati.
 *
 * È la ragione per cui il profilo può essere una tabella di coordinate invece
 * di punti di controllo: i punti si leggono («la vita sta a 27 dal centro»),
 * i punti di controllo di Bézier no.
 */
function spline(pts: P[]): string {
  const out: string[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    const p3 = pts[i + 2] ?? pts[i + 1]
    const c1 = [x1 + (x2 - p0[0]) / 6, y1 + (y2 - p0[1]) / 6]
    const c2 = [x2 - (p3[0] - x1) / 6, y2 - (p3[1] - y1) / 6]
    out.push(`C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${x2},${y2}`)
  }
  return out.join(' ')
}

/* ── Il profilo ────────────────────────────────────────────────────────────
   Figura di 8 teste: testa 8→54, ascelle 106, vita 152, inguine 192,
   ginocchio 283, terra 377. Sono le proporzioni di un corpo che cresce, non
   di un manichino da vetrina: spalle larghe, vita corta, gambe lunghe.

   Il punto dove le due liste si toccano — l'ASCELLA — è uno spigolo vero:
   sopra, braccio e tronco sono un pezzo solo; sotto si aprono e in mezzo c'è
   aria. Per questo sono due spline separate e non una sola: una curva morbida
   che ci passa dentro arrotonderebbe l'unica angolazione che deve restare
   secca.
   ────────────────────────────────────────────────────────────────────────── */

const rev = (pts: P[]): P[] => [...pts].reverse()
const flip = (pts: P[]): P[] => pts.map(([x, y]): P => [VIEW.w - x, y])

/** Cima della testa → braccio → ascella. */
const UPPER: P[] = [
  [100, 10],
  [86, 12.5], [78.5, 23], [78, 35], [81, 45], [87, 52],        // testa
  [88.5, 58], [88.5, 68], [88, 76],                            // collo
  [80, 79], [71, 82], [62, 87],                                // trapezio, in discesa
  [56, 95], [52.5, 105], [52, 118],                            // deltoide
  [51, 130], [49, 148], [47, 168],                             // braccio, fuori
  [45, 184], [43.5, 196],                                      // avambraccio → polso
  [38.5, 203], [36.5, 214], [39.5, 223], [46, 226], [51.5, 221], // mano
  [53.5, 210], [54.5, 198],                                    // polso, dentro
  [56.5, 186], [59, 170], [62, 150], [64.5, 130],              // braccio, dentro
  [66, 116],                                                   // ⟵ ASCELLA
]

/** Ascella → fianco → gamba → inguine. */
const LOWER: P[] = [
  [66, 116],
  [67.5, 128], [70, 144], [74, 158], [73, 168],                // costole → vita
  [66, 178], [62, 188], [61, 196], [61, 202],                  // bacino
  [61.5, 214], [62, 236], [63, 260], [64.5, 280],              // coscia, fuori
  [65.5, 288], [65.5, 298],                                    // ginocchio, fuori
  [63.5, 310], [63.5, 322], [65.5, 334], [68.5, 344],          // polpaccio, fuori
  [71, 350], [72, 356],                                        // caviglia
  [69, 361], [65, 368], [66, 372],                             // piede, fuori
  [73, 374], [82, 374], [85.5, 371],                           // pianta
  [86, 364], [85.2, 356],                                      // piede, dentro
  [85, 348], [86, 336], [87, 322], [85.5, 308],                // polpaccio, dentro
  [84.5, 298], [84.3, 288],                                    // ginocchio, dentro
  [85.5, 274], [87.5, 252], [90, 228], [93.5, 212],            // coscia, dentro
  [97, 206], [100, 202],                                       // inguine
]

/** Metà profilo. Tracciato APERTO: si richiude da solo sulla linea mediana. */
export const HALF = `M100,10 ${spline(UPPER)} ${spline(LOWER)}`

/** La trasformazione che riflette una forma sull'asse del corpo. */
export const MIRROR = `translate(${VIEW.w},0) scale(-1,1)`

/**
 * Il carré delle spalle: il bordo fra spalle e petto/schiena.
 *
 * È l'unica cucitura curva, e non è vezzo. Dritta taglia la figura da parte a
 * parte come una riga su un foglio, e da lì in poi tutto il disegno si legge
 * come strisce incollate invece che come un corpo. Curva segue le clavicole:
 * scende sui deltoidi, risale allo sterno.
 */
const YOKE_L: P[] = [[6, 124], [32, 117], [54, 110], [65.5, 106.5]]
const YOKE: P[] = [...YOKE_L, [100, 104], ...rev(flip(YOKE_L))]

/**
 * Il taglio braccio/tronco.
 *
 * È il bordo interno del braccio spostato di 1,6 verso il corpo: sopra
 * l'ascella coincide con la cucitura vera, sotto passa NELL'ARIA fra braccio e
 * fianco — dove basta che ci resti dentro, perché il ritaglio butta via tutto
 * quello che finisce fuori dalla sagoma. Deriva dagli stessi punti del
 * profilo, quindi non può scollarsi da esso.
 */
const ARM_INNER: P[] = UPPER.slice(UPPER.length - 6)   // da [54.5,198] all'ascella
const SPLIT: P[] = [
  [65.5, 106.5],
  // L'ascella resta esatta: lì è una cucitura vera, non una linea nell'aria.
  ...rev(ARM_INNER).map(([x, y], i): P => (i === 0 ? [x, y] : [x + 1.6, y])),
]

/** Il braccio sinistro: sopra segue il carré, dentro `SPLIT`, fuori sborda. */
const ARM = `M6,124 ${spline(YOKE_L)} ${spline(SPLIT)} L6,200 Z`

/* ── Le fasce ──────────────────────────────────────────────────────────────
   Le quote in y sono punti di repere del corpo, e sono le STESSE davanti e
   dietro: 52 mento, 74 base del collo, 100 ascelle, 192 inguine, 274
   ginocchio. Se le due viste divergessero, la stessa altezza toccata sul
   fronte e sul retro darebbe due parti diverse.

   L'ordine dei campi conta: si disegnano in quest'ordine, e le braccia stanno
   DOPO il tronco perché il loro bordo interno è quello che deve vincere.
   ────────────────────────────────────────────────────────────────────────── */

const HEAD_NECK: Partial<Record<RegionCode, Shape>> = {
  head: { k: 'rect', x: 30, y: 0, w: 140, h: 52, cx: 100, cy: 31 },
  neck: { k: 'rect', x: 60, y: 52, w: 80, h: 26, cx: 100, cy: 65 },
}

const SHOULDERS: Partial<Record<RegionCode, Shape>> = {
  shoulders: {
    k: 'path', cx: 100, cy: 92,
    d: `M6,78 L194,78 L194,124 ${spline(rev(YOKE))} Z`,
  },
}

const ARMS: Partial<Record<RegionCode, Shape>> = {
  arm_l: { k: 'path', d: ARM, cx: 52, cy: 155 },
  arm_r: { k: 'path', d: ARM, cx: 148, cy: 155, mirror: true },
  hand_l: { k: 'rect', x: 8, y: 200, w: 48, h: 40, cx: 42, cy: 214 },
  hand_r: { k: 'rect', x: 144, y: 200, w: 48, h: 40, cx: 158, cy: 214 },
}

/** Petto e schiena alta condividono il carré: stessa cucitura, due nomi. */
const TORSO_TOP = (bottom: number) => `M6,124 ${spline(YOKE)} L194,${bottom} L6,${bottom} Z`

export const FRONT: Partial<Record<RegionCode, Shape>> = {
  ...HEAD_NECK,
  ...SHOULDERS,
  chest: { k: 'path', d: TORSO_TOP(158), cx: 100, cy: 134 },
  core: { k: 'rect', x: 20, y: 158, w: 160, h: 26, cx: 100, cy: 171 },
  hips: { k: 'rect', x: 20, y: 184, w: 160, h: 18, cx: 100, cy: 193 },
  ...ARMS,
  quad_l: { k: 'rect', x: 56, y: 202, w: 44, h: 86, cx: 77, cy: 243 },
  quad_r: { k: 'rect', x: 100, y: 202, w: 44, h: 86, cx: 123, cy: 243 },
  knee_l: { k: 'rect', x: 56, y: 288, w: 44, h: 20, cx: 75, cy: 298 },
  knee_r: { k: 'rect', x: 100, y: 288, w: 44, h: 20, cx: 125, cy: 298 },
  shin_l: { k: 'rect', x: 56, y: 308, w: 44, h: 48, cx: 75, cy: 332 },
  shin_r: { k: 'rect', x: 100, y: 308, w: 44, h: 48, cx: 125, cy: 332 },
  foot_l: { k: 'rect', x: 50, y: 356, w: 50, h: 30, cx: 75, cy: 368 },
  foot_r: { k: 'rect', x: 100, y: 356, w: 50, h: 30, cx: 125, cy: 368 },
}

export const BACK: Partial<Record<RegionCode, Shape>> = {
  ...HEAD_NECK,
  ...SHOULDERS,
  upper_back: { k: 'path', d: TORSO_TOP(160), cx: 100, cy: 135 },
  lower_back: { k: 'rect', x: 20, y: 160, w: 160, h: 26, cx: 100, cy: 173 },
  // 🔴 Il sedere arriva più giù dell'inguine: la piega gluteale sta sotto,
  // quindi la fascia sconfina sulla cima delle cosce. È giusto così.
  glutes: { k: 'rect', x: 20, y: 186, w: 160, h: 30, cx: 100, cy: 200 },
  ...ARMS,
  ham_l: { k: 'rect', x: 56, y: 216, w: 44, h: 72, cx: 77, cy: 250 },
  ham_r: { k: 'rect', x: 100, y: 216, w: 44, h: 72, cx: 123, cy: 250 },
  knee_l: { k: 'rect', x: 56, y: 288, w: 44, h: 20, cx: 75, cy: 298 },
  knee_r: { k: 'rect', x: 100, y: 288, w: 44, h: 20, cx: 125, cy: 298 },
  calf_l: { k: 'rect', x: 56, y: 308, w: 44, h: 42, cx: 75, cy: 328 },
  calf_r: { k: 'rect', x: 100, y: 308, w: 44, h: 42, cx: 125, cy: 328 },
  ankle_l: { k: 'rect', x: 50, y: 350, w: 50, h: 36, cx: 76, cy: 364 },
  ankle_r: { k: 'rect', x: 100, y: 350, w: 50, h: 36, cx: 124, cy: 364 },
}

export const GEOMETRY: Record<Side, Partial<Record<RegionCode, Shape>>> = {
  front: FRONT,
  back: BACK,
}

/** Dove poggia la figura: l'ombra a terra, l'unica cosa che non è corpo. */
export const GROUND = { cy: 381, rx: 46, ry: 5 }

/**
 * Area di una forma, per decidere chi sta sopra nello strato dei tocchi.
 *
 * Le zone piccole (collo, ginocchio, mano) vanno disegnate PER ULTIME: il loro
 * bersaglio viene allargato fino a 44px e finisce per sovrapporsi a quelle
 * grandi. Stare sopra vuol dire che il dito che punta al ginocchio prende il
 * ginocchio, non la coscia — che è quattro volte più grande e vincerebbe
 * sempre.
 */
export function area(s: Shape): number {
  return s.k === 'rect' ? s.w * s.h : Number.POSITIVE_INFINITY
}

/**
 * Il bersaglio invisibile: la forma stessa, allargata al minimo che un dito
 * riesce a prendere. 44px CSS su una mappa larga 250px sono ~35 unità qui.
 */
export const MIN_HIT = 36

export function hitBox(s: Shape): { x: number; y: number; w: number; h: number } | null {
  if (s.k !== 'rect') return null
  const w = Math.max(s.w, MIN_HIT)
  const h = Math.max(s.h, MIN_HIT)
  return { x: s.cx - w / 2, y: s.cy - h / 2, w, h }
}
