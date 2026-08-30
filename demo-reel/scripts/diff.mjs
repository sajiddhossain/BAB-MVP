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
/** oltre questa soglia lo schermo non e' considerato allineato */
const THRESHOLD_PCT = 2.0

const argv = process.argv.slice(2)
const ids = argv.filter((a) => !a.startsWith('--'))

/* Il registry e' TypeScript: ne leggiamo i campi senza compilarlo. */
function readRegistry() {
  const src = readFileSync(pres(ROOT, 'src/ui/registry.ts'), 'utf8')
  const out = {}
  const re =
    /'([^']+)':\s*\{[^}]*?width:\s*(\d+),\s*height:\s*(\d+),\s*reference:\s*'([^']+)'/gs
  let m
  while ((m = re.exec(src))) out[m[1]] = { width: +m[2], height: +m[3], reference: m[4] }
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
async function renderReference(browser, svgRelPath, width, height) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  })
  await page.goto(`${BASE}/${svgRelPath.replace(/^src\//, 'src/')}`, {
    waitUntil: 'networkidle',
  })
  const buf = await page.screenshot({ type: 'png' })
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

  const refBuf = await renderReference(browser, meta.reference, meta.width, meta.height)
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
  let worst = 0
  for (const r of rows) {
    const ok = r.pct <= THRESHOLD_PCT
    worst = Math.max(worst, r.pct)
    console.log(
      `${ok ? '✓' : '✗'} ${r.id.padEnd(30)} ${r.pct.toFixed(2).padStart(6)}%  (${r.bad} px su ${r.total})`,
    )
  }
  console.log(`\ndiff in out/diff/  ·  soglia ${THRESHOLD_PCT}%`)
  process.exit(worst <= THRESHOLD_PCT ? 0 : 1)
}

main().catch((e) => {
  console.error('\n✖', e.message)
  process.exit(2)
})
