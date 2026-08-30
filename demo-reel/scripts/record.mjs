#!/usr/bin/env node
/**
 * Registra il reel USANDO l'app, non una sua riproduzione.
 *
 * Prima il video si montava dagli export SVG di Figma, con un cursore finto che
 * ci passava sopra: mostrava il disegno, non il prodotto. Ora un copione
 * (reel-script.mjs) tocca il prototipo vero via CDP — gli stessi eventi touch di
 * un dito — e Chrome ci manda i fotogrammi che compone davvero. Nel video ci
 * sono quindi le animazioni, le transizioni e gli stati veri.
 *
 * Il prezzo: non si "cerca" piu' un istante come faceva window.__seek, perche'
 * le animazioni CSS e lo stato di React non tornano indietro. Si registra quello
 * che succede e lo si ricampiona a passo fisso (vedi resample), cosi' il video
 * resta senza jitter anche se la macchina va a scatti.
 *
 * (Il tempo virtuale di Chrome darebbe la determinismo piena, ma con l'HMR
 * aperto Page.captureScreenshot resta appeso: non vale il prezzo.)
 *
 *   node scripts/record.mjs [checkin|checkout|all] [--fps 30] [--scale 2] [--no-gif]
 */
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve as pres } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SCRIPTS } from './reel-script.mjs'

const ROOT = pres(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = pres(ROOT, 'out')

const argv = process.argv.slice(2)
const flag = (name, dflt) => {
  const i = argv.indexOf(`--${name}`)
  return i === -1 ? dflt : argv[i + 1]
}
const target = argv.find((a) => !a.startsWith('--')) ?? 'all'
const FPS = Number(flag('fps', 30))
const SCALE = Number(flag('scale', 2))
const MAKE_GIF = !argv.includes('--no-gif')

const STAGE = { w: 480, h: 952 } // la cornice del telefono e' 426x898, il resto e' aria

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 5199
const BASE = `http://localhost:${PORT}`

/* --------------------------------------------------------------- dev server */

function startServer() {
  const p = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return new Promise((ok, ko) => {
    const to = setTimeout(() => ko(new Error('vite non e partito in 30s')), 30_000)
    p.stdout.on('data', (d) => {
      if (String(d).includes('ready in') || String(d).includes('Local:')) {
        clearTimeout(to)
        setTimeout(() => ok(p), 400)
      }
    })
    p.stderr.on('data', (d) => process.stderr.write(`[vite] ${d}`))
    p.on('exit', (c) => {
      clearTimeout(to)
      ko(new Error(`vite uscito con ${c}`))
    })
  })
}

async function serverAlreadyUp() {
  try {
    const r = await fetch(BASE, { signal: AbortSignal.timeout(800) })
    return r.ok
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ ffmpeg */

function ffmpegPipe(outFile, fps) {
  const args = [
    '-y',
    '-f', 'image2pipe',
    '-framerate', String(fps),
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    // h264 vuole dimensioni pari
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    '-movflags', '+faststart',
    outFile,
  ]
  const p = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'pipe'] })
  let err = ''
  p.stderr.on('data', (d) => (err += d))
  p.on('exit', (c) => {
    if (c !== 0) console.error(err.split('\n').slice(-25).join('\n'))
  })
  return p
}

function run(cmd, args) {
  return new Promise((ok, ko) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let err = ''
    p.stderr.on('data', (d) => (err += d))
    p.on('exit', (c) => (c === 0 ? ok() : ko(new Error(err.split('\n').slice(-20).join('\n')))))
  })
}

async function toGif(mp4, gif) {
  const palette = `${gif}.palette.png`
  const fps = 20
  const filters = `fps=${fps},scale=440:-1:flags=lanczos`
  await run('ffmpeg', ['-y', '-i', mp4, '-vf', `${filters},palettegen=stats_mode=diff`, palette])
  await run('ffmpeg', [
    '-y', '-i', mp4, '-i', palette,
    '-lavfi', `${filters}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
    gif,
  ])
  await run('rm', ['-f', palette])
}

/* -------------------------------------------------------------------- dito */

/**
 * Il pallino che segna dove tocca il dito.
 *
 * Lo inietta il registratore, non vive nell'app: un indicatore di tocco e' roba
 * da video, e non ha senso spedirlo a chi apre il prototipo sul telefono.
 */
const GHOST = `
  window.__ghost = (x, y) => {
    let g = document.getElementById('__ghost')
    if (!g) {
      g = document.createElement('div')
      g.id = '__ghost'
      g.style.cssText =
        'position:fixed;z-index:99999;width:46px;height:46px;margin:-23px 0 0 -23px;' +
        'border-radius:50%;pointer-events:none;opacity:0;' +
        'background:radial-gradient(circle,rgba(44,44,58,0.28) 0%,rgba(44,44,58,0.14) 62%,rgba(44,44,58,0) 72%);' +
        'border:2px solid rgba(44,44,58,0.32);' +
        'transition:opacity 130ms ease-out,transform 130ms ease-out'
      document.body.appendChild(g)
    }
    if (x === null) {
      g.style.opacity = '0'
      g.style.transform = 'scale(1.55)'
      return
    }
    g.style.left = x + 'px'
    g.style.top = y + 'px'
    g.style.opacity = '1'
    g.style.transform = 'scale(1)'
  }
`

/* ----------------------------------------------------------------- copione */

/**
 * Dove sta, sullo schermo, il comando che porta questa scritta.
 *
 * L'etichetta non e' sempre DENTRO al comando: le faccine di checkout-3 hanno il
 * nome come sorella del bottone, e mirare alla scritta voleva dire toccare nove
 * pixel di testo invece del bersaglio. Quindi se non e' dentro, si sale finche'
 * non si trova un antenato che contiene un comando solo.
 */
const findByText = (page, text) =>
  page.evaluate((t) => {
    const p = [...document.querySelectorAll('p')].find((e) => e.textContent.trim() === t)
    if (!p) return null
    let el = p.closest('.bab-touch')
    for (let n = p.parentElement; n && !el; n = n.parentElement) {
      const near = n.querySelectorAll('.bab-touch')
      if (near.length === 1) el = near[0]
      else if (near.length > 1) break
    }
    el = el ?? p
    el.scrollIntoView({ block: 'center' })
    const r = el.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
  }, text)

const findCta = (page) =>
  page.evaluate(() => {
    // l'ultimo: col pannello aperto ce ne sono due, e vale quello sopra
    const el = [...document.querySelectorAll('[data-cta]')].pop()
    if (!el) return null
    el.scrollIntoView({ block: 'center' })
    const r = el.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + Math.min(28, r.height / 2) }
  })

const findZone = (page, id) =>
  page.evaluate((z) => {
    const svg = document.querySelector('svg[viewBox]')
    const path = svg?.querySelector(`path[data-zone="${z}"]`)
    if (!path) return null
    const b = path.getBBox()
    const p = new DOMPoint(b.x + b.width / 2, b.y + b.height / 2).matrixTransform(svg.getScreenCTM())
    return { x: p.x, y: p.y }
  }, id)

/**
 * Lo slider piu' vicino a un'etichetta.
 *
 * Si riconosce da `touch-action: none`, che ce l'ha solo lui: e' il modo di
 * dire al browser "questo gesto me lo gestisco io". Cercarlo per posizione
 * assoluta avrebbe voluto dire riscrivere il copione a ogni ritocco di layout.
 */
const findSlide = (page, near) =>
  page.evaluate((label) => {
    const p = [...document.querySelectorAll('p')].find((e) => e.textContent.trim() === label)
    if (!p) return null
    p.scrollIntoView({ block: 'center' })
    const anchor = p.getBoundingClientRect()
    let best = null
    for (const el of document.querySelectorAll('div')) {
      if (el.style.touchAction !== 'none') continue
      const r = el.getBoundingClientRect()
      const d = Math.abs(r.top - anchor.top) + Math.abs(r.left - anchor.left)
      if (!best || d < best.d) best = { d, r: { x: r.x, y: r.y, w: r.width, h: r.height } }
    }
    return best?.r ?? null
  }, near)

async function playScript(page, cdp, steps, log) {
  const touch = (type, x, y) =>
    cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x, y, radiusX: 12, radiusY: 12, force: 1 }],
    })
  const ghost = (x, y) => page.evaluate(([a, b]) => window.__ghost(a, b), [x, y])
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))

  const tapAt = async (pt) => {
    await ghost(pt.x, pt.y)
    await wait(150)
    await touch('touchStart', pt.x, pt.y)
    await wait(90)
    await touch('touchEnd', pt.x, pt.y)
    await ghost(null, null)
  }

  for (const s of steps) {
    if (s.tap || s.cta || s.close || s.zone) {
      const pt = s.tap
        ? await findByText(page, s.tap)
        : s.cta
          ? await findCta(page)
          : s.close
            ? await findByText(page, '✕')
            : await findZone(page, s.zone)
      if (!pt) log(`  ⚠ non trovato: ${JSON.stringify(s)} (schermo ${await page.evaluate(() => window.__step)})`)
      else await tapAt(pt)
    } else if (s.slide) {
      const box = await findSlide(page, s.slide.near)
      if (!box)
        log(`  ⚠ slider non trovato vicino a "${s.slide.near}" (schermo ${await page.evaluate(() => window.__step)})`)
      else {
        const y = box.y + box.h / 2
        const x0 = box.x + 12
        const x1 = box.x + 12 + (box.w - 24) * s.slide.to
        await ghost(x0, y)
        await touch('touchStart', x0, y)
        for (let i = 1; i <= 14; i++) {
          const x = x0 + ((x1 - x0) * i) / 14
          await touch('touchMove', x, y)
          await ghost(x, y)
          await wait(22)
        }
        await touch('touchEnd', x1, y)
        await ghost(null, null)
      }
    } else if (s.scroll) {
      const x = (STAGE.w / 2) * SCALE
      const y0 = (STAGE.h - 260) * SCALE
      const y1 = y0 - s.scroll.by * SCALE
      await touch('touchStart', x, y0)
      for (let i = 1; i <= 18; i++) {
        await touch('touchMove', x, y0 + ((y1 - y0) * i) / 18)
        await wait(16)
      }
      await touch('touchEnd', x, y1)
    }
    if (s.hold) await wait(s.hold)
  }
}

/* ------------------------------------------------------------------ record */

/**
 * Dai fotogrammi che Chrome ha composto (a intervalli irregolari) a un video a
 * passo fisso: per ogni istante si prende l'ultimo fotogramma gia' disponibile.
 * Se l'app e' rimasta ferma il fotogramma si ripete, ed e' giusto cosi'.
 */
function resample(frames, fps) {
  const t0 = frames[0].t
  const span = frames[frames.length - 1].t - t0
  const out = []
  let i = 0
  for (let f = 0; f <= Math.ceil(span * fps); f++) {
    const t = t0 + f / fps
    while (i + 1 < frames.length && frames[i + 1].t <= t) i++
    out.push(frames[i].buf)
  }
  return out
}

async function recordClip(browser, clipId) {
  /*
   * Il viewport e' gia' grande SCALE volte e la pagina viene ingrandita di
   * altrettanto (?zoom=): lo screencast di Chrome ignora il deviceScaleFactor e
   * manda i fotogrammi alla risoluzione CSS, quindi a 2x veniva fuori un video
   * grande la meta'. Cosi' invece il contenuto viene rasterizzato piu' grande.
   */
  const page = await browser.newPage({
    viewport: { width: STAGE.w * SCALE, height: STAGE.h * SCALE },
    hasTouch: true,
    isMobile: true,
  })
  await page.addInitScript(GHOST)
  await page.goto(`${BASE}/?reel=1&flow=${clipId}&zoom=${SCALE}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(600)

  const cdp = await page.context().newCDPSession(page)
  const frames = []
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    frames.push({ t: metadata.timestamp, buf: Buffer.from(data, 'base64') })
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  })
  await cdp.send('Page.startScreencast', {
    format: 'png',
    everyNthFrame: 1,
    maxWidth: STAGE.w * SCALE,
    maxHeight: STAGE.h * SCALE,
  })

  process.stdout.write(`\n▶ ${clipId}\n`)
  await playScript(page, cdp, SCRIPTS[clipId], (m) => process.stdout.write(`${m}\n`))
  await cdp.send('Page.stopScreencast')
  await page.waitForTimeout(200)

  if (frames.length < 2) throw new Error('Chrome non ha mandato fotogrammi')
  const shots = resample(frames, FPS)
  const secs = frames[frames.length - 1].t - frames[0].t
  process.stdout.write(
    `  ${frames.length} fotogrammi in ${secs.toFixed(1)}s → ${shots.length} a ${FPS}fps\n`,
  )

  const mp4 = pres(OUT, `bab-${clipId}.mp4`)
  const ff = ffmpegPipe(mp4, FPS)
  for (const buf of shots) {
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r))
  }
  ff.stdin.end()
  await new Promise((ok, ko) => ff.on('exit', (c) => (c === 0 ? ok() : ko(new Error('ffmpeg fallito')))))
  await page.close()
  process.stdout.write(`  → out/bab-${clipId}.mp4\n`)

  if (MAKE_GIF) {
    const gif = pres(OUT, `bab-${clipId}.gif`)
    await toGif(mp4, gif)
    process.stdout.write(`  → out/bab-${clipId}.gif\n`)
  }
  return mp4
}

/* -------------------------------------------------------------------- main */

const main = async () => {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })
  if (!existsSync(CHROME)) throw new Error(`Google Chrome non trovato in ${CHROME}`)

  let server = null
  if (!(await serverAlreadyUp())) {
    process.stdout.write('avvio vite…\n')
    server = await startServer()
  } else {
    process.stdout.write(`riuso il server gia attivo su ${BASE}\n`)
  }

  const browser = await chromium.launch({ executablePath: CHROME, args: ['--force-color-profile=srgb'] })
  try {
    const clips = target === 'all' ? ['checkin', 'checkout'] : [target]
    for (const c of clips) await recordClip(browser, c)
  } finally {
    await browser.close()
    if (server) server.kill('SIGTERM')
  }
  process.stdout.write('\nfatto.\n')
}

main().catch((e) => {
  console.error('\n✖', e.message)
  process.exit(1)
})
