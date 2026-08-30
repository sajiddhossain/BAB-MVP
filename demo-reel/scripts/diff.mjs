#!/usr/bin/env node
/**
 * Confronta il render React di uno schermo con l'export Figma, pixel per pixel.
 *
 * "Fedele" smette di essere un'opinione: esce una percentuale di pixel diversi
 * e un'immagine che evidenzia in rosso dove sbagliamo.
 *
 *   node scripts/diff.mjs [id...]        # tutti gli schermi del registry se omesso
 *   node scripts/diff.mjs checkin-1-predict --open
 */
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve as pres } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const ROOT = pres(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = pres(ROOT, 'out/diff')
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 5199
const BASE = `http://localhost:${PORT}`
/**
 * Soglia indicativa, non un voto: la percentuale cresce con la QUANTITA' di testo
 * sullo schermo, perche' ogni glifo porta il suo antialiasing. checkout-3 ha 40+
 * blocchi di testo e sta a ~2.1% pur essendo visivamente identico.
 * Il vero cancello e' measure.mjs: scostamento massimo <= 2px.
 */
const THRESHOLD_PCT = 2.5

const argv = process.argv.slice(2)
const ids = argv.filter((a) => !a.startsWith('--'))

/*
 * Il registry e' TypeScript: ne leggiamo i campi senza compilarlo.
 * Parsiamo blocco per blocco e poi ogni chiave da sola: cosi' un commento
 * fra due campi non rompe tutto (e' successo).
 */
function readRegistry() {
  const src = readFileSync(pres(ROOT, 'src/ui/registry.ts'), 'utf8')
  const body = src.slice(src.indexOf('export const UI_SCREENS'))
  const out = {}
  const entry = /'([a-z0-9-]+)':\s*\{/g
  let m
  while ((m = entry.exec(body))) {
    // ritaglia il blocco bilanciando le graffe
    let depth = 1
    let i = entry.lastIndex
    while (i < body.length && depth > 0) {
      if (body[i] === '{') depth++
      else if (body[i] === '}') depth--
      i++
    }
    const block = body.slice(entry.lastIndex, i - 1)
    const num = (k) => {
      const r = new RegExp(`\\b${k}:\\s*(-?[\\d.]+)`).exec(block)
      return r ? +r[1] : null
    }
    const ref = /\breference:\s*'([^']+)'/.exec(block)
    if (!ref) continue
    const cx = /refClip:\s*\{[^}]*?\bx:\s*(-?[\d.]+)/.exec(block)
    const cy = /refClip:\s*\{[^}]*?\by:\s*(-?[\d.]+)/.exec(block)
    out[m[1]] = {
      width: num('width'),
      height: num('height'),
      reference: ref[1],
      clip: cx && cy ? { x: +cx[1], y: +cy[1] } : null,
      tolerance: num('tolerance'),
    }
  }
  return out
}

async function serverUp() {
  try {
    return (await fetch(BASE, { signal: AbortSignal.timeout(800) })).ok
  } catch {
    return false
  }
}

function startServer() {
  const p = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return new Promise((ok, ko) => {
    const to = setTimeout(() => ko(new Error('vite non e partito')), 30_000)
    p.stdout.on('data', (d) => {
      if (String(d).includes('Local:')) {
        clearTimeout(to)
        setTimeout(() => ok(p), 500)
      }
    })
    p.on('exit', (c) => (clearTimeout(to), ko(new Error(`vite uscito con ${c}`))))
  })
}

/**
 * L'export Figma va rasterizzato NELLO STESSO Chrome del render React.
 *
 * Prima usavo Inkscape: cosi' pero' il diff misurava anche la differenza fra due
 * rasterizzatori diversi, e ogni bordo di ogni glifo risultava "sbagliato".
 * Con lo stesso motore su entrambi i lati, cio' che resta e' differenza vera.
 */
async function renderReference(browser, svgRelPath, width, height, clip) {
  const page = await browser.newPage({
    viewport: { width: width + (clip?.x ?? 0), height: height + (clip?.y ?? 0) },
    deviceScaleFactor: 1,
  })
  await page.goto(`${BASE}/${svgRelPath.replace(/^src\//, 'src/')}`, {
    waitUntil: 'networkidle',
  })
  const buf = await page.screenshot({
    type: 'png',
    ...(clip ? { clip: { x: clip.x, y: clip.y, width, height } } : {}),
  })
  await page.close()
  return buf
}

/** Appiattisce su bianco: il render React ha alfa, l'export no. */
function flatten(png) {
  for (let i = 0; i < png.data.length; i += 4) {
    const a = png.data[i + 3] / 255
    if (a === 1) continue
    for (let c = 0; c < 3; c++) png.data[i + c] = Math.round(png.data[i + c] * a + 255 * (1 - a))
    png.data[i + 3] = 255
  }
  return png
}

async function diffOne(browser, id, meta) {
  const page = await browser.newPage({
    viewport: { width: meta.width, height: meta.height },
    deviceScaleFactor: 1,
  })
  await page.goto(`${BASE}/?probe=${id}`, { waitUntil: 'networkidle' })
  // i webfont devono essere pronti, altrimenti il testo diffa sempre
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(120)
  const mineBuf = await page.screenshot({ type: 'png' })
  await page.close()

  const refBuf = await renderReference(browser, meta.reference, meta.width, meta.height, meta.clip)
  writeFileSync(pres(OUT, `${id}.ref.png`), refBuf)

  const mine = flatten(PNG.sync.read(mineBuf))
  const ref = flatten(PNG.sync.read(refBuf))

  const w = Math.min(mine.width, ref.width)
  const h = Math.min(mine.height, ref.height)
  const out = new PNG({ width: w, height: h })
  const bad = pixelmatch(mine.data, ref.data, out.data, w, h, {
    threshold: 0.12,
    includeAA: false,
    alpha: 0.06,
  })

  writeFileSync(pres(OUT, `${id}.mine.png`), PNG.sync.write(mine))
  writeFileSync(pres(OUT, `${id}.diff.png`), PNG.sync.write(out))

  const pct = (bad / (w * h)) * 100
  return { id, bad, total: w * h, pct }
}

const main = async () => {
  mkdirSync(OUT, { recursive: true })
  if (!existsSync(CHROME)) throw new Error('Google Chrome non trovato')

  const registry = readRegistry()
  const targets = ids.length ? ids : Object.keys(registry)
  const missing = targets.filter((t) => !registry[t])
  if (missing.length) throw new Error(`non nel registry: ${missing.join(', ')}`)

  let server = null
  if (!(await serverUp())) server = await startServer()

  const browser = await chromium.launch({ executablePath: CHROME })
  const rows = []
  try {
    for (const id of targets) rows.push(await diffOne(browser, id, registry[id]))
  } finally {
    await browser.close()
    if (server) server.kill('SIGTERM')
  }

  console.log('')
  let failed = 0
  for (const r of rows) {
    // una soglia propria vale solo se il registry dice perche' (vedi tolerance)
    const limit = registry[r.id].tolerance ?? THRESHOLD_PCT
    const ok = r.pct <= limit
    if (!ok) failed++
    const note = limit !== THRESHOLD_PCT ? `  (soglia sua: ${limit}%)` : ''
    console.log(
      `${ok ? '✓' : '✗'} ${r.id.padEnd(30)} ${r.pct.toFixed(2).padStart(6)}%  (${r.bad} px su ${r.total})${note}`,
    )
  }
  console.log(`\ndiff in out/diff/  ·  soglia ${THRESHOLD_PCT}%`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error('\n✖', e.message)
  process.exit(2)
})
