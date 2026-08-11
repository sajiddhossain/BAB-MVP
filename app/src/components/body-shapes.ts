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
 * Il disegno è UNA SAGOMA, non venti pezzi accostati.
 *
 *   1. `UPPER` e `LOWER` sono metà del profilo esterno come ELENCO DI PUNTI.
 *      Una spline li trasforma in curve morbide. Scritto così, correggere le
 *      proporzioni vuol dire cambiare un numero in una tabella, non indovinare
 *      un punto di controllo di Bézier.
 *
 *   2. L'altra metà è la stessa, riflessa. La simmetria è esatta per
 *      costruzione e non può sbilanciarsi con una modifica distratta.
 *
 *   3. Quella sagoma diventa una `clipPath`. Le zone sono quindi FASCE che
 *      sbordano di proposito: il ritaglio le taglia sul profilo. Nessuna
 *      fessura bianca fra due zone, nessun bordo da far combaciare a mano, e
 *      il contorno spesso resta uno solo — quello vero.
 *
 *   4. Le cuciture fra le fasce sono CURVE, non righe. Dritte tagliavano la
 *      figura da parte a parte e tutto il disegno si leggeva come strisce di
 *      carta incollate. Curve seguono il corpo: le clavicole scendono sulle
 *      spalle, l'arcata costale scende sullo sterno, l'inguine sale al centro.
 *      È la differenza fra un disegno e uno schema di montaggio.
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
  | { k: 'rect'; x: number; y: number; w: number; h: number; cx: number; cy: number }
  /**
   * Forma libera. `mirror` la ribalta su x=100 invece di riscriverla; `hit`
   * dà il bersaglio del dito quando la forma è troppo sottile per fare da sé.
   */
  | {
      k: 'path'; d: string; cx: number; cy: number; mirror?: boolean
      hit?: { x: number; y: number; w: number; h: number }
    }

/** Il riquadro del disegno. Tutte le coordinate qui sotto vivono dentro questo. */
export const VIEW = { w: 200, h: 356 }

type P = [number, number]

const rev = (pts: P[]): P[] => [...pts].reverse()
const flip = (pts: P[]): P[] => pts.map(([x, y]): P => [VIEW.w - x, y])

/**
 * Catmull-Rom → Bézier: fa passare una curva morbida per TUTTI i punti dati.
 *
 * È la ragione per cui il profilo può essere una tabella di coordinate invece
 * di punti di controllo: i punti si leggono («la vita sta a 30 dal centro»),
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
   Figura di ~7 teste: testa 12→60, ascelle 104, vita 156, inguine 188,
   ginocchio 261, terra 343.

   NON sono le proporzioni di un manichino anatomico, ed è voluto. La prima
   versione ne aveva 7,6 — corretta da manuale, e sullo schermo sembrava un
   manichino da vetrina: lunga, magra, la testa in cima a un collo che non
   finiva mai. Un corpo più tozzo si legge meglio in piccolo, ha arti
   abbastanza larghi da colorarsi in modo visibile, e a dodici anni è più
   facile riconoscercisi. Fra l'esattezza anatomica e una figura che si legge,
   qui vince la seconda: i dati stanno nei codici, non nelle proporzioni.

   Il punto dove le due liste si toccano — l'ASCELLA — è uno spigolo vero:
   sopra, braccio e tronco sono un pezzo solo; sotto si aprono e in mezzo c'è
   aria. Per questo sono due spline separate e non una sola: una curva morbida
   che ci passa dentro arrotonderebbe l'unica angolazione che deve restare
   secca.
   ────────────────────────────────────────────────────────────────────────── */

/** Cima della testa → braccio → ascella. */
const UPPER: P[] = [
  [100, 12],
  [86, 13.5], [78.5, 22], [76.5, 34], [79, 47], [84, 56],      // testa
  [85.8, 62], [85, 72],                                        // collo
  [77, 74], [66, 79], [55, 88],                                // trapezio
  [50, 97], [49.5, 108],                                       // deltoide
  [48, 122], [46.5, 140], [45.5, 156],                         // braccio, fuori
  [45, 166], [45, 172],                                        // polso
  [39, 179], [37.5, 191], [41, 200], [49, 203], [55.5, 197],   // mano
  [57.5, 185], [58.5, 172],                                    // polso, dentro
  [60, 158], [62, 140], [64, 122],                             // braccio, dentro
  [65.5, 104],                                                 // ⟵ ASCELLA
]

/** Ascella → fianco → gamba → inguine. */
const LOWER: P[] = [
  [65.5, 104],
  [67, 118], [69.5, 132], [71, 146], [70, 156],                // costole → vita
  [64, 166], [58, 176], [57.5, 188],                           // bacino
  [58, 202], [59.5, 222], [61.5, 242],                         // coscia, fuori
  [62.5, 252], [62.5, 270],                                    // ginocchio, fuori
  [58.5, 284], [59, 298], [63.5, 310],                         // polpaccio, fuori
  [67.5, 316], [68.5, 321],                                    // caviglia
  [64.5, 327], [61, 335], [62, 340],                           // piede, fuori
  [69, 343], [83, 343], [85.5, 340],                           // pianta
  [86, 333], [84.5, 321],                                      // piede, dentro
  [84, 311], [86.5, 299], [88, 286], [85.5, 272],              // polpaccio, dentro
  [84, 270], [83.8, 252],                                      // ginocchio, dentro
  [85, 238], [87.5, 216], [90, 200], [94, 191],                // coscia, dentro
  [97, 189], [100, 188],                                       // inguine
]

/** Metà profilo. Tracciato APERTO: si richiude da solo sulla linea mediana. */
export const HALF = `M100,12 ${spline(UPPER)} ${spline(LOWER)}`

/** La trasformazione che riflette una forma sull'asse del corpo. */
export const MIRROR = `translate(${VIEW.w},0) scale(-1,1)`

/** Dove poggia la figura: l'ombra a terra, l'unica cosa che non è corpo. */
export const GROUND = { cy: 350, rx: 48, ry: 5 }

/* ── Le cuciture ───────────────────────────────────────────────────────────
   Una cucitura è una curva che attraversa il corpo. `sag` è di quanto cade al
   centro: positivo scende (arcata costale, vita), negativo sale (il carré
   delle clavicole, l'inguine).
   ────────────────────────────────────────────────────────────────────────── */

function seam(y: number, sag: number): P[] {
  const half: P[] = [[6, y - sag], [40, y - sag * 0.35], [72, y + sag * 0.6]]
  return [...half, [100, y + sag], ...rev(flip(half))]
}

/** La fascia di corpo fra due cuciture. Sborda ai lati: ci pensa il ritaglio. */
function band(top: P[], bottom: P[]): string {
  const end = bottom[bottom.length - 1]
  return `M${top[0][0]},${top[0][1]} ${spline(top)} L${end[0]},${end[1]} ${spline(rev(bottom))} Z`
}

const S_CHIN = seam(58, 3)      // testa / collo
const S_NECK = seam(74, 2)      // collo / spalle
const S_YOKE = seam(102, -8)    // spalle / petto — il carré delle clavicole
const S_RIBS = seam(146, 5)     // petto / pancia — l'arcata costale
const S_WAIST = seam(168, 3)    // pancia / fianchi
const S_CROTCH = seam(190, -6)  // fianchi / cosce — l'inguine sale al centro

const S_RIBS_B = seam(150, 4)   // schiena alta / schiena bassa
const S_WAIST_B = seam(170, 3)  // schiena bassa / sedere
const S_FOLD = seam(198, -5)    // 🔴 la piega gluteale sta SOTTO l'inguine

/**
 * Il taglio braccio/tronco.
 *
 * È il bordo interno del braccio spostato di 1,6 verso il corpo: sopra
 * l'ascella coincide con la cucitura vera, sotto passa NELL'ARIA fra braccio e
 * fianco — dove basta che ci resti dentro, perché il ritaglio butta via tutto
 * quello che finisce fuori dalla sagoma. Deriva dagli stessi punti del
 * profilo, quindi non può scollarsi da esso.
 */
const YOKE_L: P[] = S_YOKE.slice(0, 4)
const ARM_INNER: P[] = UPPER.slice(UPPER.length - 5)   // da [57,170] all'ascella
const SPLIT: P[] = [
  YOKE_L[YOKE_L.length - 1],
  // L'ascella resta esatta: lì è una cucitura vera, non una linea nell'aria.
  ...rev(ARM_INNER).map(([x, y], i): P => (i === 0 ? [x, y] : [x + 1.6, y])),
]

/** Il braccio sinistro: sopra segue il carré, dentro `SPLIT`, fuori sborda. */
const ARM = `M6,110 ${spline(YOKE_L)} ${spline(SPLIT)} L6,170 Z`

/** La coscia sinistra: sopra segue l'inguine, sotto taglia dritto al ginocchio. */
const thigh = (top: P[], bottom: number) =>
  `M6,${top[0][1]} ${spline(top.slice(0, 4))} L100,${bottom} L6,${bottom} Z`

/* ── Le fasce ──────────────────────────────────────────────────────────────
   Le quote in y sono punti di repere del corpo, e sono le STESSE davanti e
   dietro: 58 mento, 74 base del collo, 102 carré, 188 inguine, 252 ginocchio.
   Se le due viste divergessero, la stessa altezza toccata sul fronte e sul
   retro darebbe due parti diverse.

   L'ordine dei campi conta: si disegnano in quest'ordine, e le braccia stanno
   DOPO il tronco perché il loro bordo interno è quello che deve vincere.
   ────────────────────────────────────────────────────────────────────────── */

const HEAD_NECK: Partial<Record<RegionCode, Shape>> = {
  head: {
    k: 'path', cx: 100, cy: 35,
    d: `M6,0 L194,0 L194,55 ${spline(rev(S_CHIN))} Z`,
  },
  neck: {
    k: 'path', cx: 100, cy: 67,
    d: band(S_CHIN, S_NECK),
    hit: { x: 64, y: 56, w: 72, h: 22 },
  },
}

const SHOULDERS: Partial<Record<RegionCode, Shape>> = {
  shoulders: { k: 'path', cx: 100, cy: 86, d: band(S_NECK, S_YOKE) },
}

const ARMS: Partial<Record<RegionCode, Shape>> = {
  arm_l: { k: 'path', d: ARM, cx: 50, cy: 134 },
  arm_r: { k: 'path', d: ARM, cx: 150, cy: 134, mirror: true },
  hand_l: { k: 'rect', x: 6, y: 170, w: 50, h: 36, cx: 44, cy: 189 },
  hand_r: { k: 'rect', x: 144, y: 170, w: 50, h: 36, cx: 156, cy: 189 },
}

export const FRONT: Partial<Record<RegionCode, Shape>> = {
  ...HEAD_NECK,
  ...SHOULDERS,
  chest: { k: 'path', cx: 100, cy: 124, d: band(S_YOKE, S_RIBS) },
  core: {
    k: 'path', cx: 100, cy: 157, d: band(S_RIBS, S_WAIST),
    hit: { x: 24, y: 146, w: 152, h: 24 },
  },
  hips: {
    k: 'path', cx: 100, cy: 180, d: band(S_WAIST, S_CROTCH),
    hit: { x: 24, y: 168, w: 152, h: 24 },
  },
  ...ARMS,
  quad_l: { k: 'path', cx: 76, cy: 218, d: thigh(S_CROTCH, 252), hit: { x: 52, y: 186, w: 48, h: 66 } },
  quad_r: { k: 'path', cx: 124, cy: 218, d: thigh(S_CROTCH, 252), mirror: true, hit: { x: 100, y: 186, w: 48, h: 66 } },
  knee_l: { k: 'rect', x: 52, y: 252, w: 48, h: 18, cx: 73, cy: 261 },
  knee_r: { k: 'rect', x: 100, y: 252, w: 48, h: 18, cx: 127, cy: 261 },
  shin_l: { k: 'rect', x: 52, y: 270, w: 48, h: 46, cx: 74, cy: 292 },
  shin_r: { k: 'rect', x: 100, y: 270, w: 48, h: 46, cx: 126, cy: 292 },
  foot_l: { k: 'rect', x: 46, y: 316, w: 54, h: 40, cx: 72, cy: 332 },
  foot_r: { k: 'rect', x: 100, y: 316, w: 54, h: 40, cx: 128, cy: 332 },
}

export const BACK: Partial<Record<RegionCode, Shape>> = {
  ...HEAD_NECK,
  ...SHOULDERS,
  upper_back: { k: 'path', cx: 100, cy: 126, d: band(S_YOKE, S_RIBS_B) },
  lower_back: {
    k: 'path', cx: 100, cy: 160, d: band(S_RIBS_B, S_WAIST_B),
    hit: { x: 24, y: 150, w: 152, h: 22 },
  },
  glutes: {
    k: 'path', cx: 100, cy: 184, d: band(S_WAIST_B, S_FOLD),
    hit: { x: 24, y: 170, w: 152, h: 28 },
  },
  ...ARMS,
  ham_l: { k: 'path', cx: 76, cy: 222, d: thigh(S_FOLD, 252), hit: { x: 52, y: 194, w: 48, h: 58 } },
  ham_r: { k: 'path', cx: 124, cy: 222, d: thigh(S_FOLD, 252), mirror: true, hit: { x: 100, y: 194, w: 48, h: 58 } },
  knee_l: { k: 'rect', x: 52, y: 252, w: 48, h: 18, cx: 73, cy: 261 },
  knee_r: { k: 'rect', x: 100, y: 252, w: 48, h: 18, cx: 127, cy: 261 },
  calf_l: { k: 'rect', x: 52, y: 270, w: 48, h: 42, cx: 74, cy: 290 },
  calf_r: { k: 'rect', x: 100, y: 270, w: 48, h: 42, cx: 126, cy: 290 },
  ankle_l: { k: 'rect', x: 46, y: 312, w: 54, h: 44, cx: 74, cy: 328 },
  ankle_r: { k: 'rect', x: 100, y: 312, w: 54, h: 44, cx: 126, cy: 328 },
}

export const GEOMETRY: Record<Side, Partial<Record<RegionCode, Shape>>> = {
  front: FRONT,
  back: BACK,
}

/** Il bersaglio dichiarato di una forma, prima di allargarlo. */
const raw = (s: Shape) => (s.k === 'rect' ? s : s.hit)

/**
 * Area del bersaglio, per decidere chi sta sopra nello strato dei tocchi.
 *
 * Le zone piccole (collo, ginocchio, mano) vanno disegnate PER ULTIME: il loro
 * bersaglio viene allargato fino a 44px e finisce per sovrapporsi a quelle
 * grandi. Stare sopra vuol dire che il dito che punta al ginocchio prende il
 * ginocchio, non la coscia — che è quattro volte più grande e vincerebbe
 * sempre. Le forme senza bersaglio dichiarato sono le più larghe: stanno sotto.
 */
export function area(s: Shape): number {
  const r = raw(s)
  return r ? r.w * r.h : Number.POSITIVE_INFINITY
}

/**
 * Il bersaglio invisibile: la forma stessa, allargata al minimo che un dito
 * riesce a prendere. 44px CSS su una mappa larga 250px sono ~35 unità qui.
 */
export const MIN_HIT = 36

export function hitBox(s: Shape): { x: number; y: number; w: number; h: number } | null {
  const r = raw(s)
  if (!r) return null
  const w = Math.max(r.w, MIN_HIT)
  const h = Math.max(r.h, MIN_HIT)
  return { x: s.cx - w / 2, y: s.cy - h / 2, w, h }
}
