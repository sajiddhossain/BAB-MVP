/**
 * Uno screenshot per ogni schermata, camminando l'app come farebbe lei — dal
 * primo tocco dell'onboarding fino alle impostazioni.
 *
 * 🔴 A differenza di `shots.mjs` (che vuole un vero account e uno stub
 * Supabase mai scritto), questo passa dalle rotte `/dev/*` in App.tsx — DEV
 * soltanto, sparisce dal bundle di produzione — che rendono la schermata vera
 * senza bisogno di un login vero. Il profilo e i dati si scrivono comunque
 * per davvero, ma in locale (IndexedDB), con `window.bab` esposto da
 * `lib/devtest.ts`: niente di tutto questo tocca un server.
 *
 * Solo l'app dell'atleta: squadra e console admin sono un'altra persona, con
 * un altro accesso, e restano fuori da questo giro.
 *
 *   node scripts/walkthrough.mjs [--base http://localhost:5180] [--out ~/Desktop/...]
 */
import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  return i > -1 ? process.argv[i + 1] : d
}

const BASE = arg('base', 'http://localhost:5180')
const OUT = resolve(arg('out', `${process.env.HOME}/Desktop/BAB - Cammino App`))

/** iPhone 13/14: la misura su cui è disegnata l'app. */
const PHONE = { width: 390, height: 844 }

let n = 0
const done = []
const failed = []

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome' })
  const ctx = await browser.newContext({
    viewport: PHONE, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    locale: 'it-IT', colorScheme: 'light',
  })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.error('  ⚠ errore di pagina:', e.message))

  const S = makeShooter(page)

  await S.group('00-accesso')
  await run('la schermata d\'accesso', async () => {
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await wait(700)
    await S.shot('schermata-accesso')
  })

  await S.group('01-onboarding')
  await onboarding(page, S)

  await seed(page)

  await S.group('02-oggi')
  await run('oggi · niente ancora', async () => {
    await clearCheckIns(page)
    await reload(page, '/dev/today')
    await S.shot('oggi-nessun-checkin')
  })
  await run('oggi · pre fatto', async () => {
    await addCheckIn(page, { kind: 'pre', tempo_chosen: 'steady' })
    await reload(page, '/dev/today')
    await S.shot('oggi-pre-fatto')
  })
  await run('oggi · cerchio chiuso', async () => {
    await addCheckIn(page, { kind: 'post', tempo_predicted: 'steady', tempo_chosen: 'gentle' })
    await reload(page, '/dev/today')
    await S.shot('oggi-cerchio-chiuso')
  })
  await run('«mi sono fatta male» · dove', async () => {
    await page.getByRole('button', { name: /mi sono fatta male/i }).click()
    await wait(700)
    await S.shot('mi-sono-fatta-male-dove')
  })
  await run('«mi sono fatta male» · cosa senti', async () => {
    await tapRegion(page)
    await wait(700)
    await S.shot('mi-sono-fatta-male-cosa')
  })
  await run('«mi sono fatta male» · cosa fare adesso', async () => {
    const b = page.getByRole('button').filter({ hasText: /^(?!.*Chiudi).+/ })
    await b.nth(2).click().catch(() => {})
    await wait(800)
    await S.shot('mi-sono-fatta-male-care')
    await page.getByRole('button', { name: /chiudi/i }).first().click().catch(() => {})
    await wait(400)
  })

  await S.group('03-checkin-prima')
  const PRE = ['tempo_predicted', 'prediction_confidence', 'sleep_hours',
    'sleep', 'energy', 'mood', 'school_load', 'on_period', 'painkillers', 'body', 'pain']
  for (const [i, p] of PRE.entries()) {
    await run(`pre · ${p}`, async () => {
      await page.goto(`${BASE}/dev/checkin-pre?p=${p}`, { waitUntil: 'networkidle' })
      await wait(650)
      await S.shot(`${String(i + 1).padStart(2, '0')}-${p}`)
    })
  }
  await run('pre · foglio zona · la parola', async () => {
    await page.goto(`${BASE}/dev/checkin-pre?p=body`, { waitUntil: 'networkidle' })
    await wait(650)
    await tapRegion(page)
    await wait(700)
    await S.shot('12-foglio-zona-parola')
  })
  await run('pre · foglio zona · quanto e come', async () => {
    await pickFirstPill(page)
    await wait(700)
    await S.shot('13-foglio-zona-quanto')
  })

  await S.group('04-checkin-dopo')
  const POST = ['tempo_chosen', 'effort', 'satisfaction', 'session_type',
    'energy', 'body', 'brought_home', 'note']
  for (const [i, p] of POST.entries()) {
    await run(`post · ${p}`, async () => {
      await page.goto(`${BASE}/dev/checkin-post?p=${p}`, { waitUntil: 'networkidle' })
      await wait(650)
      await S.shot(`${String(i + 1).padStart(2, '0')}-${p}`)
    })
  }
  await run('post · segnala una sensazione', async () => {
    await page.goto(`${BASE}/dev/checkin-post?p=body`, { waitUntil: 'networkidle' })
    await wait(650)
    await tapRegion(page)
    await wait(500)
    await pickFirstPill(page)
    await wait(400)
    // Chiude il foglio e registra il segnale: senza, resta aperto e il
    // resto del check-in non è raggiungibile da qui.
    await page.getByRole('button', { name: /^Aggiungi$/ }).click().catch(() => {})
    await wait(600)
    await S.shot('09-segnalata')
  })
  await run('post · risultato + suggerimento coach', async () => {
    // `?seed=1` (solo DEV, vedi CheckInPost.tsx): mostra la schermata finale
    // già compilata, invece di un click-through fragile passo per passo.
    await page.goto(`${BASE}/dev/checkin-post?seed=1`, { waitUntil: 'networkidle' })
    await wait(700)
    await S.shot('10-post-risultato')
  })

  await S.group('05-me')
  await run('me · sta ancora imparando', async () => {
    await clearCheckIns(page)
    await reload(page, '/dev/me')
    await S.shot('me-sta-imparando')
  })
  await run('me · con la lettura', async () => {
    await seedHistory(page)
    await reload(page, '/dev/me')
    await S.shot('me-con-lettura')
  })

  await S.group('06-il-mio-corpo')
  await run('corpo · ancora niente', async () => {
    await clearSignals(page)
    await reload(page, '/dev/body')
    await S.shot('corpo-vuoto')
  })
  await run('corpo · con la storia', async () => {
    await seedSignals(page)
    await reload(page, '/dev/body')
    await S.shot('corpo-con-storia')
  })
  await run('corpo · zona scelta', async () => {
    await tapRegion(page)
    await wait(700)
    await S.shot('corpo-zona-scelta')
  })

  await S.group('07-percorso-e-storia')
  await run('percorso', async () => { await reload(page, '/dev/journey'); await S.shot('percorso') })
  await run('storia della settimana', async () => { await reload(page, '/dev/story'); await S.shot('storia') })

  await S.group('08-body-sense')
  await run('body-sense · libreria', async () => {
    await reload(page, '/dev/bodysense')
    await S.shot('libreria')
  })
  await run('body-sense · battito', async () => {
    await page.getByRole('button', { name: /^Battito/ }).click()
    await wait(500)
    await S.shot('battito-guess')
    await page.getByRole('button', { name: /Medio/ }).click().catch(() => {})
    await wait(400)
    await S.shot('battito-count')
    const tap = page.locator('button[aria-label="Tocca il cerchio a ogni battito"]')
    await tap.click().catch(() => {})
    await wait(400)
    for (let i = 0; i < 8; i++) { await tap.click().catch(() => {}); await wait(250) }
    await page.waitForFunction(() => {
      const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Avanti')
      return b && !b.disabled
    }, { timeout: 20000 }).catch(() => {})
    await S.shot('battito-conteggio-fatto')
    await page.getByRole('button', { name: /Avanti/ }).click().catch(() => {})
    await wait(500)
    await S.shot('battito-rivelazione')
  })
  await run('body-sense · due lati', async () => {
    await reload(page, '/dev/bodysense')
    await page.getByRole('button', { name: /^Due lati/ }).click()
    await wait(500)
    await page.getByRole('button', { name: /Avanti/ }).click().catch(() => {})
    await wait(400)
    await page.getByRole('button', { name: /Sinistro/ }).click().catch(() => {})
    await wait(300)
    await page.getByRole('button', { name: /Avanti/ }).click().catch(() => {})
    await wait(400)
    await page.getByRole('button', { name: /Avanti/ }).click().catch(() => {})
    await wait(400)
    await page.getByRole('button', { name: /Destro/ }).click().catch(() => {})
    await wait(300)
    await page.getByRole('button', { name: /Avanti/ }).click().catch(() => {})
    await wait(500)
    await S.shot('due-lati-rivelazione')
  })

  await S.group('09-diario')
  await run('diario · vuoto', async () => {
    await reload(page, '/dev/journal')
    await S.shot('diario-vuoto')
  })
  await run('diario · con una nota', async () => {
    await page.locator('textarea').fill('Oggi mi sono sentita bene, gambe leggere.')
    await page.getByRole('button', { name: 'Salva', exact: true }).click()
    await wait(500)
    await S.shot('diario-con-nota')
  })

  await S.group('10-impostazioni')
  const SET = [
    ['indice', '/dev/settings'],
    ['profilo', '/dev/settings/profilo'],
    ['ritmo', '/dev/settings/ritmo'],
    ['agenda', '/dev/settings/agenda'],
    ['agenda-allenamenti', '/dev/settings/agenda/allenamenti'],
    ['agenda-educazione-fisica', '/dev/settings/agenda/educazione-fisica'],
    ['agenda-gare', '/dev/settings/agenda/gare'],
    ['lingua', '/dev/settings/lingua'],
    ['dati', '/dev/settings/dati'],
    ['diagnostica', '/dev/settings/diagnostica'],
    ['account', '/dev/settings/account'],
  ]
  for (const [name, path] of SET) {
    await run(`impostazioni · ${name}`, async () => { await reload(page, path); await S.shot(name) })
  }
  await run('dati · esportazione fatta', async () => {
    await reload(page, '/dev/settings/dati')
    await page.locator('button').first().click()
    await wait(1500)
    await S.shot('dati-esportazione-fatta')
  })

  await browser.close()

  const report = [
    `# Cammino app — ${done.length} immagini`, '',
    ...done.map((d) => `- ${d}`),
    ...(failed.length ? ['', '## Non riusciti', ...failed.map((f) => `- ${f}`)] : []),
  ].join('\n')
  await writeFile(resolve(OUT, 'INDICE.md'), report + '\n')
  console.log(`\n✅ ${done.length} screenshot in ${OUT}`)
  if (failed.length) console.log(`⚠  ${failed.length} non riusciti — vedi INDICE.md`)
}

// ── attrezzi (adattati da scripts/shots.mjs) ─────────────────────────────────

function makeShooter(page) {
  let group = '00'
  return {
    async group(g) { group = g; await mkdir(resolve(OUT, g), { recursive: true }) },
    async shot(name) {
      n++
      const file = resolve(OUT, group, `${String(n).padStart(3, '0')}-${name}.png`)
      await page.screenshot({ path: file })
      done.push(`${group}/${String(n).padStart(3, '0')}-${name}.png`)
      const scrolls = await page.evaluate(() => document.body.scrollHeight > innerHeight + 24)
      if (scrolls) {
        const full = resolve(OUT, group, `${String(n).padStart(3, '0')}-${name}-intero.png`)
        await page.screenshot({ path: full, fullPage: true })
        done.push(`${group}/${String(n).padStart(3, '0')}-${name}-intero.png`)
      }
      console.log(`  ✓ ${group}/${name}`)
    },
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function run(label, fn) {
  try { await fn(); return false } catch (e) {
    failed.push(`${label} — ${e.message.split('\n')[0]}`)
    console.log(`  ✗ ${label}: ${e.message.split('\n')[0]}`)
    return true
  }
}

async function reload(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await wait(700)
}

/**
 * Il profilo: senza, il resto dell'app pensa che sia ancora da fare
 * l'onboarding. Nessun account vero — solo IndexedDB, via `window.bab`.
 */
async function seed(page) {
  await page.evaluate(async () => {
    const uid = crypto.randomUUID()
    window.bab.__uid = uid
    await window.bab.repo.saveProfile({
      id: uid, display_name: 'Giulia', sport: 'football',
      birth_date: '2011-04-12', cycle_status: 'tracking',
      contraception: 'undisclosed', locale: 'it',
    })
  })
  await wait(400)
}

async function addCheckIn(page, row) {
  await page.evaluate(async (r) => {
    await window.bab.repo.saveCheckIn({ athlete_id: window.bab.__uid, ...r })
  }, row)
}

async function clearCheckIns(page) {
  await page.evaluate(async () => {
    for (const r of await window.bab.db.list('check_ins')) await window.bab.db.remove('check_ins', r.id)
  })
}

async function clearSignals(page) {
  await page.evaluate(async () => {
    for (const r of await window.bab.db.list('body_signals')) await window.bab.db.remove('body_signals', r.id)
  })
}

async function seedHistory(page) {
  await page.evaluate(async () => {
    const uid = window.bab.__uid
    const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)
    const T = ['upbeat', 'steady', 'gentle']
    for (let i = 0; i < 14; i++) {
      await window.bab.repo.saveCheckIn({
        athlete_id: uid, kind: 'pre', local_date: day(i),
        tempo_chosen: T[i % 3], sleep: 5, energy: 5,
      })
      if (i % 4 !== 0) {
        await window.bab.repo.saveCheckIn({
          athlete_id: uid, kind: 'post', local_date: day(i),
          tempo_predicted: T[i % 3], tempo_chosen: T[(i + 1) % 3], effort: 5,
        })
      }
    }
  })
  await wait(600)
}

async function seedSignals(page) {
  await page.evaluate(async () => {
    const uid = window.bab.__uid
    const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)
    const spots = [
      ['knee_l', 'sharp', 2, 0], ['knee_l', 'sore', 2, 1], ['knee_l', 'burning', 3, 4],
      ['knee_l', 'tight', 2, 11], ['shoulder_r', 'tight', 1, 2], ['shoulder_r', 'sore', 2, 6],
      ['calf_l', 'crampy', 2, 3], ['lower_back', 'tight', 1, 8], ['calf_l', 'heavy', 1, 22],
    ]
    for (const [region, sensation, intensity, ago] of spots) {
      const id = crypto.randomUUID()
      await window.bab.db.put('body_signals', id, {
        id, athlete_id: uid, region, sensation, intensity,
        check_in_id: null, is_red_flag: region === 'knee_l' && ago === 4,
        created_at: new Date(Date.now() - ago * 864e5).toISOString(),
      }, `${day(ago)}:${id}`)
    }
  })
  await wait(600)
}

async function tapRegion(page) {
  const hit = page.locator('svg [role=button], svg g[data-region], svg rect[data-region], svg path[data-region]')
  if (await hit.count()) return hit.nth(6).click({ force: true })
  return page.locator('svg').first().click({ position: { x: 100, y: 250 }, force: true })
}

async function pickFirstPill(page) {
  const pills = page.getByRole('button')
  const total = await pills.count()
  for (let i = 0; i < total; i++) {
    const txt = (await pills.nth(i).textContent()) ?? ''
    if (/dolorante|tesa|fitta|brucia|crampi|gonfia|pesante/i.test(txt)) return pills.nth(i).click()
  }
}

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 44)

/**
 * L'onboarding non ha un indirizzo per passo — lo stato è interno — quindi si
 * attraversa a clic, senza sapere in anticipo dove si finisce. Vedi
 * `scripts/shots.mjs` per il perché il nome del file lo dà il TITOLO della
 * schermata, non una lista scritta qui.
 */
async function onboarding(page, S) {
  await page.goto(`${arg('base', 'http://localhost:5180')}/dev/onboarding`, { waitUntil: 'networkidle' })
  await wait(900)

  const title = () => page.locator('h1').first().innerText().catch(() => '')

  for (let i = 1; i <= 30; i++) {
    if (await page.locator('nav[aria-label]').count()) break
    const before = await title()
    if (!before) break
    const name = `${String(i).padStart(2, '0')}-${slug(before)}`

    const stop = await run(`onboarding · ${before}`, async () => {
      await S.shot(name)

      if (before === 'Ora contiamolo.') {
        const tap = page.locator('button[aria-label="Tocca il cerchio a ogni battito"]')
        await tap.click().catch(() => {})
        await wait(600)
        await S.shot(`${name}-conteggio`)
        for (let k = 0; k < 8; k++) { await tap.click().catch(() => {}); await wait(300) }
        await page.waitForFunction(() => {
          const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Continua')
          return b && !b.disabled
        }, { timeout: 20000 }).catch(() => {})
        await S.shot(`${name}-compilato`)
        const btn = page.getByRole('button', { name: 'Continua', exact: true })
        if (await btn.count() && !(await btn.isDisabled())) { await btn.click(); await wait(850) }
        return
      }

      const filled = await fillStep(page)
      const after = await title()
      if (after !== before) return
      if (filled) await S.shot(`${name}-compilato`)

      const go = page.getByRole('button', { name: 'Continua', exact: true })
      if (await go.count()) {
        if (await go.isDisabled()) throw new Error(`«Continua» disabilitato su «${before}»`)
        await go.click()
        await wait(850)
      }
    })
    if (stop) break
    if ((await title()) === before) {
      failed.push(`onboarding · fermo su «${before}»`)
      break
    }
  }
}

async function continueIndex(all, total) {
  for (let i = 0; i < total; i++) {
    if ((await all.nth(i).innerText().catch(() => '')).trim() === 'Continua') return i
  }
  return total
}

async function fillStep(page) {
  let filled = false

  // 🔴 Non un ramo esclusivo: il passo del consenso ha SIA checkbox SIA (dopo
  // averle spuntate) campi di testo del genitore che compaiono di colpo. Un
  // primo giro con `return` subito dopo le checkbox lasciava quei campi vuoti
  // e «Continua» spento per sempre — fermava l'intero giro di screenshot lì.
  const boxes = page.locator('input[type=checkbox]')
  if (await boxes.count()) {
    for (const cb of await boxes.all()) await cb.check({ force: true }).catch(() => {})
    filled = true
    await wait(250)
  }

  const dates = page.locator('input[type=date]')
  if (await dates.count()) {
    await dates.first().fill('2026-09-15').catch(() => {})
    if (await page.getByRole('button', { name: 'Continua', exact: true }).isDisabled().catch(() => false)) {
      await dates.first().fill('2009-04-12').catch(() => {})
      await wait(250)
    }
    filled = true
  }
  const times = page.locator('input[type=time]')
  if (await times.count()) {
    const isEnd = /finisci/i.test(await page.locator('h1').first().innerText().catch(() => ''))
    await times.first().fill(isEnd ? '19:30' : '18:00').catch(() => {})
    filled = true
  }
  const numbers = page.locator('input[type=number]')
  if (await numbers.count()) {
    await numbers.first().fill('13').catch(() => {})
    filled = true
  }
  // Testo libero — nome, contatto del genitore, sport "Altro"... Ce ne può
  // essere più di uno sulla stessa schermata (nome + contatto genitore).
  const text = page.locator('input:not([type=time]):not([type=date]):not([type=number]):not([type=checkbox])')
  const textCount = await text.count()
  if (textCount) {
    for (let i = 0; i < textCount; i++) {
      const cur = await text.nth(i).inputValue().catch(() => '')
      if (cur) continue
      await text.nth(i).fill(i === 0 ? 'Giulia' : 'Un contatto qualsiasi').catch(() => {})
    }
    filled = true
  }
  if (filled) return true

  const all = page.locator('button')
  const total = await all.count()
  const boundary = await continueIndex(all, total)
  const idx = []
  for (let i = 0; i < boundary; i++) {
    if (await all.nth(i).getAttribute('aria-label')) continue
    idx.push(i)
  }
  if (!idx.length) return false
  await all.nth(idx[0]).click().catch(() => {})
  if (idx.length >= 7) await all.nth(idx[2]).click().catch(() => {})
  await wait(400)
  return true
}

await main()
