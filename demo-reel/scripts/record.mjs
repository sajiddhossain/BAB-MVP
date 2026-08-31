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
  window.__ghost = (() => {
    /*
     * Due elementi, non uno: fuori la posizione, dentro il cerchio.
     * Se la pressione e la posizione stessero sullo stesso transform, la
     * transizione della pressione rallenterebbe anche gli spostamenti, e
     * durante un trascinamento il dito resterebbe indietro rispetto al tocco.
     */
    let box, dot, x = 0, y = 0
    const build = () => {
      box = document.createElement('div')
      box.id = '__ghost'
      box.style.cssText =
        'position:fixed;left:0;top:0;z-index:99999;pointer-events:none;opacity:0;' +
        'will-change:transform;transition:opacity 200ms ease-out'
      dot = document.createElement('div')
      dot.style.cssText =
        'width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;' +
        'background:radial-gradient(circle,rgba(44,44,58,0.30) 0%,rgba(44,44,58,0.15) 62%,rgba(44,44,58,0) 72%);' +
        'border:2px solid rgba(44,44,58,0.34);' +
        'transition:transform 110ms cubic-bezier(0.4,0,0.2,1),background 110ms,border-color 110ms'
      box.appendChild(dot)
      document.body.appendChild(box)
    }
    const paint = () => { box.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)' }
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    return {
      at(nx, ny) { if (!box) build(); x = nx; y = ny; paint() },
      show(on) { if (!box) build(); box.style.opacity = on ? '1' : '0' },
      pos() { return { x, y } },
      /*
       * Il viaggio non e' una retta: una mano descrive un arco. Il punto di
       * mezzo viene spostato di lato, perpendicolarmente, e il percorso e' la
       * bezier che ne esce.
       */
      travel(tx, ty, ms, bow) {
        if (!box) build()
        const x0 = x, y0 = y
        const dx = tx - x0, dy = ty - y0
        const len = Math.hypot(dx, dy) || 1
        const cx = (x0 + tx) / 2 - (dy / len) * bow
        const cy = (y0 + ty) / 2 + (dx / len) * bow
        const t0 = performance.now()
        return new Promise((done) => {
          const step = () => {
            const t = Math.min(1, (performance.now() - t0) / ms)
            const e = ease(t)
            const u = 1 - e
            x = u * u * x0 + 2 * u * e * cx + e * e * tx
            y = u * u * y0 + 2 * u * e * cy + e * e * ty
            paint()
            if (t < 1) requestAnimationFrame(step)
            else { x = tx; y = ty; paint(); done() }
          }
          requestAnimationFrame(step)
        })
      },
      /* appoggiato: piu' piccolo e piu' scuro. Lasciato: si allarga e rientra. */
      press(on) {
        if (!box) build()
        if (on) {
          dot.style.transform = 'scale(0.78)'
          dot.style.background =
            'radial-gradient(circle,rgba(44,44,58,0.44) 0%,rgba(44,44,58,0.24) 62%,rgba(44,44,58,0) 72%)'
          dot.style.borderColor = 'rgba(44,44,58,0.5)'
          return
        }
        dot.style.transform = 'scale(1.2)'
        dot.style.background =
          'radial-gradient(circle,rgba(44,44,58,0.30) 0%,rgba(44,44,58,0.15) 62%,rgba(44,44,58,0) 72%)'
        dot.style.borderColor = 'rgba(44,44,58,0.34)'
        setTimeout(() => {
          dot.style.transition = 'transform 260ms cubic-bezier(0.22,1,0.36,1),background 110ms,border-color 110ms'
          dot.style.transform = 'scale(1)'
          setTimeout(() => {
            dot.style.transition =
              'transform 110ms cubic-bezier(0.4,0,0.2,1),background 110ms,border-color 110ms'
          }, 280)
        }, 90)
      },
    }
  })()
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
    /*
     * Portarlo in vista SOLO se non si vede: scrollIntoView fa saltare lo
     * scorrimento di netto, e nel video quel salto e' identico a un bot.
     */
    let r = el.getBoundingClientRect()
    if (r.top < 8 || r.bottom > window.innerHeight - 8) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' })
      r = el.getBoundingClientRect()
    }
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
  }, text)

const findCta = (page) =>
  page.evaluate(() => {
    // l'ultimo: col pannello aperto ce ne sono due, e vale quello sopra
    const el = [...document.querySelectorAll('[data-cta]')].pop()
    if (!el) return null
    let r = el.getBoundingClientRect()
    if (r.top < 8 || r.bottom > window.innerHeight - 8) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' })
      r = el.getBoundingClientRect()
    }
    return { x: r.x + r.width / 2, y: r.y + Math.min(28, r.height / 2) }
  })

const findZone = (page, id) =>
  page.evaluate((z) => {
    // data-zone ce l'ha solo la figura che si vede: le due sono sovrapposte
    const path = document.querySelector(`path[data-zone="${z}"]`)
    if (!path) return null
    const svg = path.ownerSVGElement
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
    let anchor = p.getBoundingClientRect()
    if (anchor.top < 8 || anchor.bottom > window.innerHeight - 8) {
      p.scrollIntoView({ block: 'center', behavior: 'instant' })
      anchor = p.getBoundingClientRect()
    }
    let best = null
    for (const el of document.querySelectorAll('div')) {
      if (el.style.touchAction !== 'none') continue
      const r = el.getBoundingClientRect()
      const d = Math.abs(r.top - anchor.top) + Math.abs(r.left - anchor.left)
      if (!best || d < best.d) best = { d, r: { x: r.x, y: r.y, w: r.width, h: r.height } }
    }
    return best?.r ?? null
  }, near)

/**
 * Numeri casuali sempre uguali.
 *
 * Il movimento ha bisogno di irregolarita' — se ogni pausa e ogni atterraggio
 * sono identici si vede subito che e' una macchina — ma due registrazioni
 * dello stesso copione devono venire uguali, altrimenti non si puo' piu'
 * confrontare niente.
 */
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

async function playScript(page, cdp, steps, log) {
  const touch = (type, x, y) =>
    cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x, y, radiusX: 12, radiusY: 12, force: 1 }],
    })
  const rand = rng(20260831)
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))
  /** nessuna pausa umana e' un numero tondo */
  const about = (ms, amount = 0.12) => Math.round(ms * (1 - amount + rand() * amount * 2))
  const pause = (ms) => wait(about(ms))

  const g = {
    at: (x, y) => page.evaluate(([a, b]) => window.__ghost.at(a, b), [x, y]),
    travel: (x, y, ms, bow) =>
      page.evaluate(([a, b, c, d]) => window.__ghost.travel(a, b, c, d), [x, y, ms, bow]),
    press: (on) => page.evaluate((o) => window.__ghost.press(o), on),
    show: (on) => page.evaluate((o) => window.__ghost.show(o), on),
  }

  /* la mano entra da sotto lo schermo, come quando prendi il telefono in mano */
  let hand = { x: (STAGE.w / 2) * SCALE, y: (STAGE.h + 90) * SCALE }
  await g.at(hand.x, hand.y)
  await g.show(true)

  /**
   * Quanto ci mette ad arrivare: piu' lontano, piu' tempo, ma non in
   * proporzione — una mano copre in fretta le grandi distanze e rallenta
   * sull'ultimo pezzo. `fast` e' per i tasti, dove le dita saltano vicino.
   */
  const travelMs = (to, fast) => {
    const d = Math.hypot(to.x - hand.x, to.y - hand.y) / SCALE
    return fast ? Math.min(88, 36 + d * 0.22) : Math.max(185, Math.min(460, 150 + d * 0.36))
  }
  const goTo = async (pt, fast = false) => {
    const d = Math.hypot(pt.x - hand.x, pt.y - hand.y) / SCALE
    const bow = fast ? 0 : Math.min(26, d * 0.13) * SCALE
    await g.travel(pt.x, pt.y, about(travelMs(pt, fast)), bow)
    hand = pt
  }
  /** il dito non atterra mai al centro esatto */
  const near = (pt) => ({
    x: pt.x + (rand() - 0.5) * 7 * SCALE,
    y: pt.y + (rand() - 0.5) * 7 * SCALE,
  })
  const pressHere = async (pt, fast = false) => {
    await g.press(true)
    await touch('touchStart', pt.x, pt.y)
    await wait(about(fast ? 32 : 70))
    await touch('touchEnd', pt.x, pt.y)
    await g.press(false)
  }
  const tapAt = async (pt, { hover = 0, fast = false } = {}) => {
    const t = near(pt)
    await goTo(t, fast)
    await pause(hover || (fast ? 14 : 55))
    await pressHere(t, fast)
  }

  const findField = () =>
    page.evaluate(() => {
      const t = document.querySelector('textarea, input.bab-field')
      if (!t) return null
      const r = t.getBoundingClientRect()
      return { x: r.x + 40, y: r.y + r.height / 2, gia: document.activeElement === t }
    })
  const findKey = (id) =>
    page.evaluate((k) => {
      const el = [...document.querySelectorAll('[data-key]')].find((e) => e.dataset.key === k)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
    }, id)

  const dove = async () => `schermo ${await page.evaluate(() => window.__step)}`

  for (const s of steps) {
    if (s.tap || s.cta || s.close || s.zone) {
      const pt = s.tap
        ? await findByText(page, s.tap)
        : s.cta
          ? await findCta(page)
          : s.close
            ? await findByText(page, '✕')
            : await findZone(page, s.zone)
      if (!pt) log(`  ⚠ non trovato: ${JSON.stringify(s)} (${await dove()})`)
      else await tapAt(pt, { hover: s.hover })
    } else if (s.hesitate) {
      /*
       * Il dito va verso la risposta che si aspettava, si ferma, e sceglie
       * l'altra. E' l'unica esitazione del video, e sta dove significa
       * qualcosa: la schermata dopo dice "avevi indovinato X, era Y".
       */
      const a = await findByText(page, s.hesitate.from)
      const b = await findByText(page, s.hesitate.to)
      if (!a || !b) log(`  ⚠ esitazione non montabile: ${JSON.stringify(s)} (${await dove()})`)
      else {
        await goTo(near(a))
        await pause(560)
        const t = near(b)
        await goTo(t)
        await pause(200)
        await pressHere(t)
      }
    } else if (s.slide) {
      const box = await findSlide(page, s.slide.near)
      if (!box) log(`  ⚠ slider non trovato vicino a "${s.slide.near}" (${await dove()})`)
      else {
        const y = box.y + box.h / 2
        const x0 = box.x + 12
        const x1 = box.x + 12 + (box.w - 24) * s.slide.to
        await goTo({ x: x0, y })
        await pause(120)
        await g.press(true)
        await touch('touchStart', x0, y)
        const N = 18
        for (let i = 1; i <= N; i++) {
          const t = i / N
          /* frena verso la fine e sfonda di un soffio: poi si assesta */
          const e = 1 - Math.pow(1 - t, 2.4)
          const over = Math.sin(Math.PI * t) * 0.035
          const x = x0 + (x1 - x0) * (e + over)
          await touch('touchMove', x, y)
          await g.at(x, y)
          await wait(about(20))
        }
        await touch('touchMove', x1, y)
        await g.at(x1, y)
        await wait(60)
        await touch('touchEnd', x1, y)
        await g.press(false)
        hand = { x: x1, y }
      }
    } else if (s.write) {
      const f = await findField()
      if (!f) log(`  ⚠ campo di testo non trovato (${await dove()})`)
      else {
        if (!f.gia) {
          await tapAt(f)
          await pause(460) // la tastiera sale
        }
        let prima = null
        for (const ch of s.write) {
          const id = ch === ' ' ? 'space' : ch.toLowerCase()
          const pt = await findKey(id)
          if (!pt) continue
          await tapAt(pt, { fast: true })
          /* dentro una parola si corre, fra una parola e l'altra si respira */
          await pause(ch === ' ' ? 24 : prima === ' ' ? 100 : 26)
          prima = ch
        }
        await pause(520)
        const done = await findKey('Done')
        if (done) await tapAt(done)
      }
    } else if (s.flick) {
      /*
       * Un lancio, non una trascinata: parte deciso, rallenta appena, e il
       * dito si stacca mentre e' ancora in movimento. Prima lo schermo
       * scorreva da solo, senza nessun dito in vista.
       */
      const x = (STAGE.w / 2 + (rand() - 0.5) * 46) * SCALE
      const y0 = (STAGE.h - 250) * SCALE
      const y1 = y0 - s.flick.by * SCALE
      await goTo({ x, y: y0 })
      await pause(90)
      await g.press(true)
      await touch('touchStart', x, y0)
      const N = 20
      for (let i = 1; i <= N; i++) {
        const t = i / N
        const y = y0 + (y1 - y0) * (1 - Math.pow(1 - t, 1.7))
        await touch('touchMove', x, y)
        await g.at(x, y)
        await wait(about(14))
      }
      await touch('touchEnd', x, y1)
      await g.press(false)
      hand = { x, y: y1 }
    } else if (s.lift) {
      /* la mano esce di scena: gli ultimi fotogrammi restano puliti */
      await goTo({ x: hand.x, y: (STAGE.h + 110) * SCALE })
      await g.show(false)
    }
    if (s.hold) await pause(s.hold)
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
