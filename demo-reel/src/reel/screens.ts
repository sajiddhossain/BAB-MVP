// Registro degli schermi. Gli SVG esportati da Figma sono la VERITA' visiva:
// entrano cosi come sono, non li ricostruiamo. Qui li normalizziamo soltanto.

import ci1 from '../assets/checkin/checkin-1-predict.svg?raw'
import ci2 from '../assets/checkin/checkin-2-tune-in.svg?raw'
import ci3 from '../assets/checkin/checkin-3-body-map.svg?raw'
import ci4 from '../assets/checkin/checkin-4-sensation-sheet.svg?raw'
import ci5png from '../assets/checkin/checkin-5-make-sense.png'

import co1a from '../assets/checkout/checkout-1a-pick-tempo.svg?raw'
import co1b from '../assets/checkout/checkout-1b-reveal-comparison.svg?raw'
import co2 from '../assets/checkout/checkout-2-rpe.svg?raw'
import co3 from '../assets/checkout/checkout-3-satisfaction.svg?raw'
import co4 from '../assets/checkout/checkout-4-energy.svg?raw'
import co5 from '../assets/checkout/checkout-5-body-map.svg?raw'
import co6 from '../assets/checkout/checkout-6-sensation-sheet.svg?raw'
import co7 from '../assets/checkout/checkout-7-close-loop.svg?raw'

export const VIEWPORT = { w: 402, h: 874 }

export type Screen = {
  key: string
  kind: 'svg' | 'img'
  /** markup SVG gia normalizzato, oppure src dell'immagine */
  content: string
  /** dimensioni native del frame esportato */
  w: number
  h: number
  /**
   * Alcuni export includono il bleed dell'ombra: il contenuto reale e' spostato.
   * Compensiamo qui cosi tutti gli schermi sono allineati sullo stesso viewport.
   */
  offsetX: number
  offsetY: number
  /** altezza scrollabile: > VIEWPORT.h significa che lo schermo scorre */
  contentH: number
}

/**
 * Figma riusa i prefissi id (filter0_d_, paint0_linear_, pattern0_) dentro ogni file.
 * Inlinando piu SVG nello stesso DOM gli id collidono e i filtri/gradienti
 * del secondo schermo si prendono quelli del primo. Prefissiamo tutto per file.
 */
function namespaceIds(svg: string, ns: string): string {
  return svg
    .replace(/\bid="([^"]+)"/g, (_m, id) => `id="${ns}__${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_m, id) => `url(#${ns}__${id})`)
    .replace(/(xlink:href|href)="#([^"]+)"/g, (_m, attr, id) => `${attr}="#${ns}__${id}"`)
}

/** Toglie width/height dal tag root: la misura la decide il layout, non il file. */
function fluidRoot(svg: string): string {
  return svg.replace(
    /<svg\b([^>]*)>/,
    (_m, attrs: string) =>
      `<svg${attrs
        .replace(/\swidth="[^"]*"/, '')
        .replace(/\sheight="[^"]*"/, '')} width="100%" height="100%" preserveAspectRatio="xMidYMin meet">`,
  )
}

function dims(svg: string): { w: number; h: number } {
  const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)
  return m ? { w: parseFloat(m[1]), h: parseFloat(m[2]) } : { w: VIEWPORT.w, h: VIEWPORT.h }
}

type Def = { key: string; raw: string; offsetX?: number; offsetY?: number }

function svgScreen({ key, raw, offsetX = 0, offsetY = 0 }: Def): Screen {
  const { w, h } = dims(raw)
  return {
    key,
    kind: 'svg',
    content: fluidRoot(namespaceIds(raw, key.replace(/[^a-z0-9]/gi, '_'))),
    w,
    h,
    offsetX,
    offsetY,
    contentH: h,
  }
}

const list: Screen[] = [
  svgScreen({ key: 'ci1', raw: ci1, offsetX: -1 }), // esportato 404 di larghezza, centriamo
  svgScreen({ key: 'ci2', raw: ci2, offsetX: -1 }), // 404x1262 -> schermo che scorre
  svgScreen({ key: 'ci3', raw: ci3 }),
  svgScreen({ key: 'ci4', raw: ci4 }),
  {
    key: 'ci5',
    kind: 'img',
    content: ci5png,
    w: 404,
    h: 874,
    offsetX: -1,
    offsetY: 0,
    contentH: 874,
  },
  svgScreen({ key: 'co1a', raw: co1a }),
  svgScreen({ key: 'co1b', raw: co1b }),
  svgScreen({ key: 'co2', raw: co2 }),
  svgScreen({ key: 'co3', raw: co3 }),
  svgScreen({ key: 'co4', raw: co4 }),
  svgScreen({ key: 'co5', raw: co5 }),
  // 442x890: Figma ha incluso il bleed dell'ombra del bottom sheet.
  // Il contenuto reale parte a +20,+3 -> lo riportiamo a zero.
  svgScreen({ key: 'co6', raw: co6, offsetX: -20, offsetY: -3 }),
  svgScreen({ key: 'co7', raw: co7 }),
]

export const SCREENS: Record<string, Screen> = Object.fromEntries(
  list.map((s) => [s.key, s]),
)

export type ScreenKey = keyof typeof SCREENS & string
