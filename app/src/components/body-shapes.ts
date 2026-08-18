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
export const VIEW = { w: 200, h: 400 }

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
   Figura di ~7,5 teste: testa 12→58, ascelle 108, vita 175, inguine 198,
   ginocchio 274, terra 385.

   🔴 Cambio deliberato (su richiesta esplicita, sapendo il rischio): la
   versione precedente era volutamente tozza — ~6 teste — perché una prova
   più anatomica sembrava "un manichino da vetrina" a schermo piccolo. Questa
   torna verso proporzioni più verosimili: spalle e fianchi più stretti,
   gambe e collo più lunghi. Se in piccolo si legge peggio di prima, il primo
   posto dove tornare a stringere è la larghezza (i fattori qui sotto), non le
   proporzioni testa/corpo.

   Il punto dove le due liste si toccano — l'ASCELLA — è uno spigolo vero:
   sopra, braccio e tronco sono un pezzo solo; sotto si aprono e in mezzo c'è
   aria. Per questo sono due spline separate e non una sola: una curva morbida
   che ci passa dentro arrotonderebbe l'unica angolazione che deve restare
   secca.
   ────────────────────────────────────────────────────────────────────────── */

/** Cima della testa → braccio → ascella. */
const UPPER: P[] = [
  [100, 12],
  [88.1, 13.5], [81.7, 22], [80, 34], [82.2, 47], [86.4, 56],  // testa
  [87.9, 62.6], [87.2, 74.1],                                  // collo
  [80.5, 76.4], [74.5, 81.7], [66.2, 91.1],                    // trapezio
  [62.5, 100.6], [62.1, 112.1],                                // deltoide
  // 🔴 Il braccio sta un po' più in fuori di quanto vorrebbe l'anatomia,
  // stessa ragione di prima: con l'ombra dura uno spiraglio troppo stretto fra
  // braccio e fianco sembra una sbarra nera, non un'apertura.
  [59.5, 126.8], [58.4, 145.7], [57.6, 162.5],                 // braccio, fuori
  [57.2, 173], [57.2, 179.3],                                  // polso
  [52.8, 186.7], [48.4, 199.4], [51.2, 210.4], [57.6, 214.1], [62.8, 206.7], // mano
  [66.6, 193], [67.4, 179.3],                                  // polso, dentro
  [68.5, 164.6], [70, 145.7], [71.5, 126.8],                   // braccio, dentro
  [74.1, 107.9],                                                // ⟵ ASCELLA
]

/** Ascella → fianco → gamba → inguine. */
const LOWER: P[] = [
  [74.1, 107.9],
  [75.2, 122.6], [77.1, 137.3], [78.2, 152], [77.5, 162.5],    // costole → vita
  [73, 173], [68.5, 183.5], [68.1, 196.1],                     // bacino
  [66.4, 212.8], [67.6, 237.2], [69.2, 261.6],                 // coscia, fuori
  [70, 273.8], [70, 295.8],                                    // ginocchio, fuori
  [66.8, 312.9], [67.2, 330], [70.8, 344.6],                   // polpaccio, fuori
  [74, 351.9], [74.8, 358],                                    // caviglia
  [71.6, 365.3], [68.8, 375.1], [69.6, 381.2],                 // piede, fuori
  [75.2, 384.9], [86.4, 384.9], [88.4, 381.2],                 // pianta
  [88.8, 372.7], [87.6, 358],                                  // piede, dentro
  [87.2, 345.8], [89.2, 331.2], [90.4, 315.3], [88.4, 298.2],  // polpaccio, dentro
  [87.2, 295.8], [87, 273.8],                                  // ginocchio, dentro
  [88, 256.8], [90, 229.9], [92, 210.4], [95.2, 199.4],        // coscia, dentro
  [97.8, 197.2], [100, 196.1],                                 // inguine
]

/** Metà profilo. Tracciato APERTO: si richiude da solo sulla linea mediana. */
export const HALF = `M100,12 ${spline(UPPER)} ${spline(LOWER)}`

/** La trasformazione che riflette una forma sull'asse del corpo. */
export const MIRROR = `translate(${VIEW.w},0) scale(-1,1)`

/**
 * Lo scostamento dell'ombra dura.
 *
 * 🔴 BAB non sfuma mai un'ombra: è la cosa più riconoscibile del marchio, e
 * vale anche qui. La figura è la stessa sagoma disegnata due volte, la copia
 * sotto piena d'inchiostro e spostata — come ogni card dell'app. Prima c'era
 * un'ellisse grigia sfumata sotto i piedi: teneva la figura per terra, ma era
 * l'unica cosa in tutta l'app che assomigliasse a un'ombra vera.
 */
export const SHADOW = { dx: 4, dy: 5 }

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

const S_CHIN = seam(58, 3)        // testa / collo
const S_NECK = seam(76, 2.3)      // collo / spalle
const S_YOKE = seam(106, -8.4)    // spalle / petto — il carré delle clavicole
const S_RIBS = seam(152, 5.3)     // petto / pancia — l'arcata costale
const S_WAIST = seam(175, 3.2)    // pancia / fianchi
const S_CROTCH = seam(198, -6.3)  // fianchi / cosce — l'inguine sale al centro

const S_RIBS_B = seam(156, 4.2)   // schiena alta / schiena bassa
const S_WAIST_B = seam(177, 3.2)  // schiena bassa / sedere
const S_FOLD = seam(208, -5.3)    // 🔴 la piega gluteale sta SOTTO l'inguine

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
  ...rev(ARM_INNER).map(([x, y], i): P => (i === 0 ? [x, y] : [x + 1.3, y])),
]

/** Il braccio sinistro: sopra segue il carré, dentro `SPLIT`, fuori sborda. */
const ARM = `M6,114 ${spline(YOKE_L)} ${spline(SPLIT)} L6,177 Z`

/** La coscia sinistra: sopra segue l'inguine, sotto taglia dritto al ginocchio. */
const thigh = (top: P[], bottom: number) =>
  `M6,${top[0][1]} ${spline(top.slice(0, 4))} L100,${bottom} L6,${bottom} Z`

/* ── Le fasce ──────────────────────────────────────────────────────────────
   Le quote in y sono punti di repere del corpo, e sono le STESSE davanti e
   dietro: 58 mento, 76 base del collo, 106 carré, 198 inguine, 274 ginocchio.
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
    k: 'path', cx: 100, cy: 68,
    d: band(S_CHIN, S_NECK),
    hit: { x: 69, y: 56, w: 61, h: 25 },
  },
}

const SHOULDERS: Partial<Record<RegionCode, Shape>> = {
  shoulders: { k: 'path', cx: 100, cy: 89, d: band(S_NECK, S_YOKE) },
}

const ARMS: Partial<Record<RegionCode, Shape>> = {
  arm_l: { k: 'path', d: ARM, cx: 63, cy: 139 },
  arm_r: { k: 'path', d: ARM, cx: 137, cy: 139, mirror: true },
  hand_l: { k: 'rect', x: 30, y: 177, w: 38, h: 41, cx: 49, cy: 197 },
  hand_r: { k: 'rect', x: 132, y: 177, w: 38, h: 41, cx: 151, cy: 197 },
}

export const FRONT: Partial<Record<RegionCode, Shape>> = {
  ...HEAD_NECK,
  ...SHOULDERS,
  chest: { k: 'path', cx: 100, cy: 129, d: band(S_YOKE, S_RIBS) },
  core: {
    k: 'path', cx: 100, cy: 164, d: band(S_RIBS, S_WAIST),
    hit: { x: 43, y: 152, w: 114, h: 25 },
  },
  hips: {
    k: 'path', cx: 100, cy: 188, d: band(S_WAIST, S_CROTCH),
    hit: { x: 43, y: 175, w: 114, h: 26 },
  },
  ...ARMS,
  quad_l: { k: 'path', cx: 81, cy: 232, d: thigh(S_CROTCH, 274), hit: { x: 64, y: 194, w: 36, h: 80 } },
  quad_r: { k: 'path', cx: 119, cy: 232, d: thigh(S_CROTCH, 274), mirror: true, hit: { x: 100, y: 194, w: 36, h: 80 } },
  knee_l: { k: 'rect', x: 62, y: 274, w: 38, h: 22, cx: 81, cy: 285 },
  knee_r: { k: 'rect', x: 100, y: 274, w: 38, h: 22, cx: 119, cy: 285 },
  shin_l: { k: 'rect', x: 62, y: 296, w: 38, h: 56, cx: 81, cy: 324 },
  shin_r: { k: 'rect', x: 100, y: 296, w: 38, h: 56, cx: 119, cy: 324 },
  foot_l: { k: 'rect', x: 57, y: 352, w: 43, h: 49, cx: 78, cy: 376 },
  foot_r: { k: 'rect', x: 100, y: 352, w: 43, h: 49, cx: 122, cy: 376 },
}

export const BACK: Partial<Record<RegionCode, Shape>> = {
  ...HEAD_NECK,
  ...SHOULDERS,
  upper_back: { k: 'path', cx: 100, cy: 131, d: band(S_YOKE, S_RIBS_B) },
  lower_back: {
    k: 'path', cx: 100, cy: 167, d: band(S_RIBS_B, S_WAIST_B),
    hit: { x: 43, y: 156, w: 114, h: 23 },
  },
  glutes: {
    k: 'path', cx: 100, cy: 192, d: band(S_WAIST_B, S_FOLD),
    hit: { x: 43, y: 177, w: 114, h: 31 },
  },
  ...ARMS,
  ham_l: { k: 'path', cx: 81, cy: 237, d: thigh(S_FOLD, 274), hit: { x: 62, y: 203, w: 38, h: 71 } },
  ham_r: { k: 'path', cx: 119, cy: 237, d: thigh(S_FOLD, 274), mirror: true, hit: { x: 100, y: 203, w: 38, h: 71 } },
  knee_l: { k: 'rect', x: 62, y: 274, w: 38, h: 22, cx: 81, cy: 285 },
  knee_r: { k: 'rect', x: 100, y: 274, w: 38, h: 22, cx: 119, cy: 285 },
  calf_l: { k: 'rect', x: 62, y: 296, w: 38, h: 51, cx: 81, cy: 321 },
  calf_r: { k: 'rect', x: 100, y: 296, w: 38, h: 51, cx: 119, cy: 321 },
  ankle_l: { k: 'rect', x: 57, y: 347, w: 43, h: 54, cx: 78, cy: 374 },
  ankle_r: { k: 'rect', x: 100, y: 347, w: 43, h: 54, cx: 122, cy: 374 },
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
 *
 * 🔴 «Su una mappa larga 250px» era il punto debole: la regola dei 44px sta in
 * pixel dello schermo, questa costante in unità di disegno, e le due cose
 * coincidono solo a quella larghezza precisa. Da quando la figura si adatta
 * all'altezza che le resta, la larghezza cambia con il telefono — e su uno
 * schermo corto 36 unità diventano 30px, cioè un bersaglio che il pollice
 * manca. Chi disegna la mappa misura quanto è larga davvero e passa il minimo
 * giusto; questo resta il valore per il caso più comodo.
 */
export const MIN_HIT = 36

export function hitBox(
  s: Shape, min: number = MIN_HIT,
): { x: number; y: number; w: number; h: number } | null {
  const r = raw(s)
  if (!r) return null
  const w = Math.max(r.w, min)
  const h = Math.max(r.h, min)
  return { x: s.cx - w / 2, y: s.cy - h / 2, w, h }
}
