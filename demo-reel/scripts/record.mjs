#!/usr/bin/env node
/**
 * Cattura deterministica del reel.
 *
 * Non registra "a tempo reale": per ogni fotogramma chiama window.__seek(ms),
 * aspetta il paint e scatta. Cosi il video non dipende dalla velocita' della
 * macchina e non ha jitter. I PNG vanno in pipe dentro ffmpeg, niente disco.
 *
 *   node scripts/record.mjs [checkin|checkout|all] [--fps 30] [--scale 2] [--no-gif]
 */
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve as pres } from 'node:path'
import { fileURLToPath } from 'node:url'

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

const STAGE = { w: 480, h: 952 } // il telefono e' 426x898, il resto e' aria

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

/* ------------------------------------------------------------------ record */

async function recordClip(browser, clipId) {
  const page = await browser.newPage({
    viewport: { width: STAGE.w, height: STAGE.h },
    deviceScaleFactor: SCALE,
  })
  await page.goto(`${BASE}/?clip=${clipId}&capture=1`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 20_000 })

  const duration = await page.evaluate(() => window.__duration)
  const total = Math.ceil((duration / 1000) * FPS)
  const mp4 = pres(OUT, `bab-${clipId}.mp4`)
  const ff = ffmpegPipe(mp4, FPS)

  process.stdout.write(`\n▶ ${clipId}: ${(duration / 1000).toFixed(1)}s · ${total} frame\n`)

  for (let f = 0; f <= total; f++) {
    const t = (f / FPS) * 1000
    await page.evaluate((ms) => window.__seek(ms), t)
    const buf = await page.screenshot({ type: 'png' })
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r))
    if (f % 30 === 0 || f === total) {
      const pct = Math.round((f / total) * 100)
      process.stdout.write(`\r  ${String(pct).padStart(3)}%  ${f}/${total}   `)
    }
  }
  ff.stdin.end()
  await new Promise((ok, ko) => ff.on('exit', (c) => (c === 0 ? ok() : ko(new Error('ffmpeg fallito')))))
  await page.close()
  process.stdout.write(`\r  100%  → out/bab-${clipId}.mp4          \n`)

  if (MAKE_GIF) {
    const gif = pres(OUT, `bab-${clipId}.gif`)
    await toGif(mp4, gif)
    process.stdout.write(`         → out/bab-${clipId}.gif\n`)
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
