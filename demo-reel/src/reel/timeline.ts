import { SCREENS, VIEWPORT } from './screens'

export { VIEWPORT }

/* ---------------------------------------------------------------- easing */

export const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3)
export const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
/** curva "push" tipo iOS: parte decisa, si posa piano */
export const easeIOS = (p: number) => 1 - Math.pow(1 - p, 4)

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const lerp = (a: number, b: number, p: number) => a + (b - a) * p

/* ------------------------------------------------------------ definizioni */

export type Transition = 'push' | 'back' | 'fade' | 'sheet' | 'none'

export type Tap = {
  /** ms dall'inizio dello step */
  at: number
  /** coordinate nello spazio del CONTENUTO (non del viewport): lo scroll viene sottratto */
  x: number
  y: number
  /** raggio dell'alone; utile per bersagli grandi tipo body map */
  r?: number
}

export type Step = {
  screen: string
  dur: number
  enter?: Transition
  /** [da, a] in px di scroll del contenuto */
  scroll?: [number, number]
  /** finestra temporale dello scroll dentro lo step, in ms */
  scrollWindow?: [number, number]
  taps?: Tap[]
  /** didascalia opzionale, fuori dal telefono */
  caption?: string
}

export type Clip = {
  id: string
  title: string
  steps: Step[]
}

export const TRANSITION_MS = 460
export const CURSOR_MOVE_MS = 520
export const PRESS_MS = 130
export const RIPPLE_MS = 620

/* ------------------------------------------------------------- risoluzione */

export type ResolvedTap = Tap & { abs: number; step: number }

export type Timeline = {
  clip: Clip
  starts: number[]
  duration: number
  taps: ResolvedTap[]
}

export function buildTimeline(clip: Clip): Timeline {
  const starts: number[] = []
  const taps: ResolvedTap[] = []
  let t = 0
  clip.steps.forEach((s, i) => {
    starts.push(t)
    for (const tap of s.taps ?? []) taps.push({ ...tap, abs: t + tap.at, step: i })
    t += s.dur
  })
  taps.sort((a, b) => a.abs - b.abs)
  return { clip, starts, duration: t, taps }
}

export type LayerState = {
  screen: string
  /** traslazione X in px del layer, per il push */
  tx: number
  /** traslazione Y in px del layer, per il bottom sheet */
  ty: number
  opacity: number
  scale: number
  scrollY: number
  /** velo scuro sopra il layer uscente */
  dim: number
}

export type CursorState = {
  x: number
  y: number
  opacity: number
  visible: boolean
  /** 0..1, quanto e' schiacciato il dito. Calcolato, non affidato a una transition CSS:
   *  in cattura il tempo lo detta lo script e una transition sarebbe fuori sincrono. */
  press: number
  /** 0..1, un alone per ogni tap recente */
  ripples: { x: number; y: number; p: number; r: number }[]
}

export type Frame = {
  stepIndex: number
  caption?: string
  layers: LayerState[]
  cursor: CursorState
  progress: number
}

function scrollAt(step: Step, local: number): number {
  if (!step.scroll) return 0
  const [from, to] = step.scroll
  const [ws, we] = step.scrollWindow ?? [TRANSITION_MS + 250, step.dur - 600]
  if (local <= ws) return from
  if (local >= we) return to
  return lerp(from, to, easeInOutCubic((local - ws) / (we - ws)))
}

function stepIndexAt(tl: Timeline, t: number): number {
  const { starts } = tl
  for (let i = starts.length - 1; i >= 0; i--) if (t >= starts[i]) return i
  return 0
}

/** Posizione del contenuto a schermo, tenendo conto dello scroll dello step. */
function tapViewportY(tl: Timeline, tap: ResolvedTap): number {
  const step = tl.clip.steps[tap.step]
  const local = tap.abs - tl.starts[tap.step]
  return tap.y - scrollAt(step, local)
}

export function resolve(tl: Timeline, tRaw: number): Frame {
  const t = Math.max(0, Math.min(tRaw, tl.duration))
  const i = stepIndexAt(tl, t)
  const step = tl.clip.steps[i]
  const local = t - tl.starts[i]

  /* --- layer: schermo corrente + eventuale schermo uscente in transizione --- */

  const layers: LayerState[] = []
  const enter = i === 0 ? 'none' : (step.enter ?? 'push')
  const inTransition = enter !== 'none' && local < TRANSITION_MS
  const p = inTransition ? easeIOS(clamp01(local / TRANSITION_MS)) : 1

  if (inTransition && i > 0) {
    const prev = tl.clip.steps[i - 1]
    const prevScroll = scrollAt(prev, prev.dur)
    const out: LayerState = {
      screen: prev.screen,
      tx: 0,
      ty: 0,
      opacity: 1,
      scale: 1,
      scrollY: prevScroll,
      dim: 0,
    }
    if (enter === 'push') {
      out.tx = lerp(0, -VIEWPORT.w * 0.28, p)
      out.dim = lerp(0, 0.16, p)
    } else if (enter === 'back') {
      out.tx = lerp(0, VIEWPORT.w, p)
    } else if (enter === 'sheet') {
      out.dim = lerp(0, 0.34, p)
      out.scale = lerp(1, 0.965, p)
    } else if (enter === 'fade') {
      out.opacity = lerp(1, 0, p)
      out.scale = lerp(1, 1.03, p)
    }
    layers.push(out)
  }

  const cur: LayerState = {
    screen: step.screen,
    tx: 0,
    ty: 0,
    opacity: 1,
    scale: 1,
    scrollY: scrollAt(step, local),
    dim: 0,
  }
  if (inTransition && i > 0) {
    if (enter === 'push') cur.tx = lerp(VIEWPORT.w, 0, p)
    else if (enter === 'back') cur.tx = lerp(-VIEWPORT.w * 0.28, 0, p)
    else if (enter === 'fade') {
      cur.opacity = p
      cur.scale = lerp(1.02, 1, p)
    }
    if (enter === 'sheet') cur.ty = lerp(VIEWPORT.h, 0, p)
  }
  layers.push(cur)

  /* ----------------------------------- cursore: si muove verso il tap dopo */

  const taps = tl.taps
  let prevTap: ResolvedTap | undefined
  let nextTap: ResolvedTap | undefined
  for (const tp of taps) {
    if (tp.abs <= t) prevTap = tp
    else {
      nextTap = tp
      break
    }
  }

  let cx = VIEWPORT.w / 2
  let cy = VIEWPORT.h * 0.72
  let visible = false

  if (prevTap) {
    cx = prevTap.x
    cy = tapViewportY(tl, prevTap)
    visible = true
  }
  if (nextTap) {
    const moveStart = Math.max(
      nextTap.abs - CURSOR_MOVE_MS,
      prevTap ? prevTap.abs + PRESS_MS : 0,
    )
    const nx = nextTap.x
    const ny = tapViewportY(tl, nextTap)
    if (t >= moveStart) {
      const mp = easeInOutCubic(clamp01((t - moveStart) / (nextTap.abs - moveStart || 1)))
      if (prevTap) {
        cx = lerp(prevTap.x, nx, mp)
        cy = lerp(tapViewportY(tl, prevTap), ny, mp)
      } else {
        // prima apparizione: entra dal basso
        cx = lerp(nx, nx, mp)
        cy = lerp(VIEWPORT.h + 60, ny, mp)
      }
      visible = true
    }
  }

  // durante un cambio schermo il dito sparisce: non ha senso vederlo volare
  const cursorFade = inTransition ? clamp01((local - TRANSITION_MS * 0.55) / 220) : 1
  if (inTransition) visible = visible && cursorFade > 0.02

  const press = taps.reduce((m, tp) => {
    const d = t - tp.abs
    if (d < -PRESS_MS || d > RIPPLE_MS * 0.4) return m
    const v =
      d < 0
        ? easeOutCubic((d + PRESS_MS) / PRESS_MS)
        : 1 - easeOutCubic(Math.min(1, d / (RIPPLE_MS * 0.4)))
    return Math.max(m, v)
  }, 0)
  const ripples = taps
    .filter((tp) => t >= tp.abs && t < tp.abs + RIPPLE_MS)
    .map((tp) => ({
      x: tp.x,
      y: tapViewportY(tl, tp),
      p: (t - tp.abs) / RIPPLE_MS,
      r: tp.r ?? 46,
    }))

  return {
    stepIndex: i,
    caption: step.caption,
    layers,
    cursor: { x: cx, y: cy, opacity: visible ? cursorFade : 0, visible, press, ripples },
    progress: t / tl.duration,
  }
}

export function screenOf(key: string) {
  const s = SCREENS[key]
  if (!s) throw new Error(`schermo sconosciuto: ${key}`)
  return s
}
