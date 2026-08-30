#!/usr/bin/env node
/**
 * Trova il valore di una proprieta' CSS che fa combaciare la larghezza del testo.
 *
 * Serve quando measure.mjs dice "questo blocco e' largo N px di troppo": invece
 * di tentare a caso, misuriamo nel Chrome vero quale valore produce la larghezza
 * del riferimento.
 *
 *   node scripts/sweep.mjs "Where do you feel it?" --size 30 --font display \
 *        --prop letterSpacing --from -1 --to 0.4 --step 0.1 --target 293
 */
import { chromium } from 'playwright-core'

const argv = process.argv.slice(2)
const text = argv.find((a) => !a.startsWith('--')) ?? ''
const opt = (n, d) => {
  const i = argv.indexOf(`--${n}`)
  return i === -1 ? d : argv[i + 1]
}

const FONTS = {
  display: "'Bricolage Grotesque Variable', sans-serif",
  body: "'Space Grotesk', sans-serif",
  ui: "'Inter', sans-serif",
}

const size = opt('size', '16')
const weight = opt('weight', '700')
const font = FONTS[opt('font', 'body')] ?? opt('font', 'body')
const prop = opt('prop', 'letterSpacing')
const from = Number(opt('from', '-1'))
const to = Number(opt('to', '1'))
const step = Number(opt('step', '0.1'))
const target = Number(opt('target', 'NaN'))
const unit = opt('unit', 'px')

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
})
const page = await browser.newPage()
await page.goto('http://localhost:5199/?probe=checkin-1-predict', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

const rows = await page.evaluate(
  ({ text, size, weight, font, prop, from, to, step, unit }) => {
    const el = document.createElement('span')
    el.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font-family:${font};font-weight:${weight};font-size:${size}px`
    el.textContent = text
    document.body.appendChild(el)
    const out = []
    for (let v = from; v <= to + 1e-9; v += step) {
      el.style[prop] = `${v.toFixed(3)}${unit}`
      // la larghezza dell'inchiostro, non della scatola: CSS aggiunge spazio anche in coda
      const w = el.getBoundingClientRect().width - (prop === 'letterSpacing' ? v : 0)
      out.push([+v.toFixed(3), +w.toFixed(2)])
    }
    el.remove()
    return out
  },
  { text, size, weight, font, prop, from, to, step, unit },
)
await browser.close()

let best = null
for (const [v, w] of rows) {
  const line = `  ${prop} ${String(v).padStart(7)}${unit}  →  ${String(w).padStart(8)}px`
  if (!Number.isNaN(target)) {
    const d = Math.abs(w - target)
    if (!best || d < best.d) best = { v, w, d }
    console.log(`${line}   Δ ${(w - target).toFixed(2)}`)
  } else console.log(line)
}
if (best) console.log(`\n  migliore: ${prop} = ${best.v}${unit}  (${best.w}px, target ${target})`)
