/**
 * Uno screenshot per ogni schermata e ogni azione, in viewport da telefono.
 *
 * 🔴 Perché uno script e non una sessione a mano: la cartella si chiama come
 * la versione, quindi alla prossima versione va rifatta tutta. Rifarla a mano
 * vuol dire che alcune schermate mancheranno e nessuno saprà quali.
 *
 * Serve un finto Supabase in ascolto (scratchpad/stub.mjs) e il dev server
 * puntato lì: metà dell'app — l'onboarding, la console, la dashboard squadra —
 * esiste solo da autenticata.
 *
 *   node scripts/shots.mjs [--base http://localhost:5180] [--out ../screens/v0.1.0]
 */
import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  return i > -1 ? process.argv[i + 1] : d
}

const BASE = arg('base', 'http://localhost:5180')
const STUB = arg('stub', 'http://localhost:5599')
const OUT = resolve(HERE, '..', arg('out', `../screens/v${(await import('../package.json', { with: { type: 'json' } })).default.version}`))

/** iPhone 13/14: la misura su cui è disegnata l'app. */
const PHONE = { width: 390, height: 844 }

let n = 0
const done = []
const failed = []

async function main() {
  await mkdir(OUT, { recursive: true })
  // Lo stub sopravvive allo script: se l'ultimo giro è finito su «admin»,
  // questo partirebbe dentro la console invece che nell'app dell'atleta.
  await fetch(`${STUB}/__role?r=athlete`)
  const browser = await chromium.launch({ channel: 'chrome' })
  const ctx = await browser.newContext({
    viewport: PHONE,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'it-IT',
    colorScheme: 'light',
  })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.error('  ⚠ errore di pagina:', e.message))

  const S = makeShooter(page)

  await S.group('00-accesso')
  await run('la schermata d\'accesso', async () => {
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await wait(600)
    await S.shot('schermata-accesso')
  })
  await run('email scritta', async () => {
    await page.fill('#email', 'demo@babsport.com')
    await S.shot('email-scritta')
  })
  await run('link mandato + campo codice', async () => {
    await page.locator('form button[type=submit]').click()
    await wait(900)
    await S.shot('link-mandato-e-codice')
  })
  await run('codice sbagliato', async () => {
    await page.fill('#code', '000000')
    await page.locator('#code').press('Enter')
    await wait(900)
    await S.shot('codice-sbagliato')
  })

  // ── Da qui in poi si entra ────────────────────────────────────────────────
  await signIn(page)

  await S.group('01-onboarding')
  await onboarding(page, S)

  // Profilo salvato: da adesso l'app è quella vera.
  await seed(page)
  await page.goto(`${BASE}/today`, { waitUntil: 'networkidle' })
  await wait(800)

  await S.group('02-oggi')
  await run('oggi · niente ancora', async () => {
    await clearCheckIns(page)
    await reload(page, '/today')
    await S.shot('oggi-nessun-checkin')
  })
  await run('oggi · pre fatto', async () => {
    await addCheckIn(page, { kind: 'pre', tempo_chosen: 'steady' })
    await reload(page, '/today')
    await S.shot('oggi-pre-fatto')
  })
  await run('oggi · cerchio chiuso', async () => {
    await addCheckIn(page, { kind: 'post', tempo_predicted: 'steady', tempo_chosen: 'gentle' })
    await reload(page, '/today')
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
  })

  await S.group('03-checkin-prima')
  const PRE = ['tempo_predicted', 'prediction_confidence', 'sleep_hours', 'sleep',
    'energy', 'hydration', 'muscles', 'headspace', 'surprise', 'school_load', 'body', 'pain']
  for (const [i, p] of PRE.entries()) {
    await run(`pre · ${p}`, async () => {
      await page.goto(`${BASE}/checkin/pre?p=${p}`, { waitUntil: 'networkidle' })
      await wait(650)
      await S.shot(`${String(i + 1).padStart(2, '0')}-${p}`)
    })
  }
  await run('pre · mappa · retro', async () => {
    await page.goto(`${BASE}/checkin/pre?p=body`, { waitUntil: 'networkidle' })
    await wait(650)
    await page.getByRole('button', { name: /retro/i }).first().click()
    await wait(500)
    await S.shot('13-mappa-retro')
  })
  await run('pre · foglio zona · la parola', async () => {
    await page.getByRole('button', { name: /fronte/i }).first().click()
    await wait(400)
    await tapRegion(page)
    await wait(700)
    await S.shot('14-foglio-zona-parola')
  })
  await run('pre · foglio zona · quanto e come', async () => {
    await pickFirstPill(page)
    await wait(700)
    await S.shot('15-foglio-zona-quanto')
  })

  await S.group('04-checkin-dopo')
  const POST = ['tempo_chosen', 'effort', 'duration_bucket', 'session_type',
    'legs', 'breath', 'energy', 'headspace', 'body', 'brought_home', 'note']
  for (const [i, p] of POST.entries()) {
    await run(`post · ${p}`, async () => {
      await page.goto(`${BASE}/checkin/post?p=${p}`, { waitUntil: 'networkidle' })
      await wait(650)
      await S.shot(`${String(i + 1).padStart(2, '0')}-${p}`)
    })
  }

  await S.group('05-me')
  await run('me · sta ancora imparando', async () => {
    await clearCheckIns(page)
    await reload(page, '/me')
    await S.shot('me-sta-imparando')
  })
  await run('me · con la lettura', async () => {
    await seedHistory(page)
    await reload(page, '/me')
    await S.shot('me-con-lettura')
  })

  await S.group('06-il-mio-corpo')
  await run('corpo · ancora niente', async () => {
    await clearSignals(page)
    await reload(page, '/body')
    await S.shot('corpo-vuoto')
  })
  await run('corpo · con la storia', async () => {
    await seedSignals(page)
    await reload(page, '/body')
    await S.shot('corpo-con-storia')
  })
  for (const d of [30, 90]) {
    await run(`corpo · ultimi ${d} giorni`, async () => {
      await page.getByRole('button', { name: new RegExp(`${d} giorni`) }).first().click()
      await wait(700)
      await S.shot(`corpo-ultimi-${d}-giorni`)
    })
  }
  await run('corpo · zona scelta', async () => {
    await tapRegion(page)
    await wait(700)
    await S.shot('corpo-zona-scelta')
  })

  await S.group('07-percorso-e-storia')
  await run('percorso', async () => { await reload(page, '/journey'); await S.shot('percorso') })
  await run('storia della settimana', async () => { await reload(page, '/story'); await S.shot('storia') })

  await S.group('08-impostazioni')
  const SET = [
    ['indice', '/settings'],
    ['profilo', '/settings/profilo'],
    ['ritmo', '/settings/ritmo'],
    ['agenda', '/settings/agenda'],
    ['agenda-giorni-allenamento', '/settings/agenda/giorni?k=training'],
    ['agenda-giorni-educazione-fisica', '/settings/agenda/giorni?k=pe'],
    ['agenda-gare', '/settings/agenda/gare'],
    ['lingua', '/settings/lingua'],
    ['dati', '/settings/dati'],
    ['diagnostica', '/settings/diagnostica'],
    ['account', '/settings/account'],
  ]
  for (const [name, path] of SET) {
    await run(`impostazioni · ${name}`, async () => {
      await reload(page, path)
      await S.shot(name)
    })
  }

  await S.group('09-azioni')
  await run('lingua · passata a English', async () => {
    await reload(page, '/settings/lingua')
    await page.getByRole('button', { name: /english/i }).first().click()
    await wait(800)
    await S.shot('lingua-english')
    await page.getByRole('button', { name: /italiano/i }).first().click()
    await wait(700)
  })
  await run('dati · esportazione fatta', async () => {
    await reload(page, '/settings/dati')
    await page.locator('button').first().click()
    await wait(1500)
    await S.shot('dati-esportazione-fatta')
  })
  await run('account · conferma cancellazione', async () => {
    await reload(page, '/settings/account')
    const b = page.getByRole('button').filter({ hasText: /cancella|elimina/i })
    if (await b.count()) await b.last().click()
    await wait(800)
    await S.shot('account-conferma-cancellazione')
  })
  await run('agenda · aggiungi una gara', async () => {
    await reload(page, '/settings/agenda/gare')
    const b = page.getByRole('button').filter({ hasText: /aggiungi/i })
    if (await b.count()) await b.first().click({ timeout: 4000 }).catch(() => {})
    await wait(700)
    await S.shot('agenda-nuova-gara')
  })
  await run('check-in · uscire a metà', async () => {
    await page.goto(`${BASE}/checkin/pre?p=sleep`, { waitUntil: 'networkidle' })
    await wait(700)
    await page.locator('button').nth(1).click().catch(() => {})
    await wait(400)
    await page.getByRole('button', { name: /chiudi/i }).first().click().catch(() => {})
    await wait(700)
    await S.shot('checkin-esci-conferma')
  })

  await S.group('10-squadra')
  await setRole(page, 'staff')
  await run('squadra · elenco', async () => { await reload(page, '/team'); await S.shot('squadra-elenco') })

  await S.group('11-console-admin')
  await setRole(page, 'admin')
  for (const [name, path] of [
    ['battito', '/admin'],
    ['squadre', '/admin/squadre'],
    ['bandiere-rosse', '/admin/bandiere'],
    ['consensi', '/admin/consensi'],
  ]) {
    await run(`admin · ${name}`, async () => { await reload(page, path); await S.shot(name) })
  }

  await browser.close()

  const report = [
    `# Screenshot — ${done.length} immagini`, '',
    ...done.map((d) => `- ${d}`),
    ...(failed.length ? ['', '## Non riusciti', ...failed.map((f) => `- ${f}`)] : []),
  ].join('\n')
  await writeFile(resolve(OUT, 'INDICE.md'), report + '\n')
  console.log(`\n✅ ${done.length} screenshot in ${OUT}`)
  if (failed.length) console.log(`⚠  ${failed.length} non riusciti — vedi INDICE.md`)
}

// ── attrezzi ────────────────────────────────────────────────────────────────

function makeShooter(page) {
  let group = '00'
  return {
    async group(g) { group = g; await mkdir(resolve(OUT, g), { recursive: true }) },
    async shot(name) {
      n++
      const file = resolve(OUT, group, `${String(n).padStart(3, '0')}-${name}.png`)
      await page.screenshot({ path: file })
      done.push(`${group}/${String(n).padStart(3, '0')}-${name}.png`)
      // Se la pagina scorre, serve anche l'intero: metà del contenuto sta
      // sotto la piega e uno screenshot del solo viewport non lo direbbe.
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

/** Ritorna `true` se è andata storta: un flusso a passi non prosegue al buio. */
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

async function signIn(page) {
  await page.evaluate(async () => {
    await window.bab.supabase.auth.setSession({
      access_token: 'finto-token-per-screenshot',
      refresh_token: 'finto-refresh',
    })
  })
  await wait(500)
}

/**
 * 🔴 Il ruolo vive in due posti e vanno cambiati tutt'e due: lo stub (che
 * risponde al conteggio di `platform_admins` / `team_staff`) e la cache in
 * `db.setMeta('role:<uid>')`, che altrimenti serve quello del giro prima.
 *
 * E va rimesso a `athlete` all'AVVIO, non solo alla fine: lo stub è un
 * processo che sopravvive allo script, e un giro finito su «admin» faceva
 * partire quello dopo dentro la console — con mezze schermate sbagliate e
 * nessun errore a dirlo.
 */
async function setRole(page, r) {
  await fetch(`${STUB}/__role?r=${r}`)
  await page.evaluate(async (uid) => {
    await window.bab.db.setMeta(`role:${uid}`, undefined).catch(() => {})
  }, await page.evaluate(() => window.bab.__uid ?? ''))
  await wait(300)
}

/** Il profilo: senza, l'app resta ferma sull'onboarding. */
async function seed(page) {
  await page.evaluate(async () => {
    const uid = (await window.bab.supabase.auth.getSession()).data.session.user.id
    window.bab.__uid = uid
    await window.bab.repo.saveProfile({
      id: uid, display_name: 'Giulia', sport: 'Pallavolo',
      birth_date: '2011-04-12', cycle_status: 'tracking', locale: 'it',
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

/** Abbastanza giornate chiuse perché «la mia lettura» smetta di dire «troppo presto». */
async function seedHistory(page) {
  await page.evaluate(async () => {
    const uid = window.bab.__uid
    const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)
    const T = ['upbeat', 'steady', 'gentle']
    for (let i = 0; i < 14; i++) {
      await window.bab.repo.saveCheckIn({
        athlete_id: uid, kind: 'pre', local_date: day(i),
        tempo_chosen: T[i % 3], sleep: 3, energy: 4, hydration: 3, muscles: 3,
      })
      if (i % 4 !== 0) {
        await window.bab.repo.saveCheckIn({
          athlete_id: uid, kind: 'post', local_date: day(i),
          tempo_predicted: T[i % 3], tempo_chosen: T[(i + 1) % 3], effort: 3,
        })
      }
    }
  })
  await wait(600)
}

/**
 * 🔴 Scritti con `db.put` e non con `repo.saveAcuteSignal`: quello timbra
 * `created_at` ad adesso, e senza date sparse nel tempo «Il mio corpo» non ha
 * niente da rileggere — che è l'unica cosa che quella schermata fa.
 */
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

/** Tocca una zona della mappa: il primo bersaglio disegnato. */
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
 * attraversa a clic, senza sapere in anticipo dove si finisce.
 *
 * 🔴 Il nome del file lo dà il TITOLO della schermata, non una lista scritta
 * qui. Con la lista i primi due giri hanno prodotto file che mentivano: i tre
 * bottoni del ritmo avanzano da soli al clic, quindi lo scatto «compilato» era
 * già la schermata dopo, e da lì tutte le etichette erano sfasate di uno.
 * Un nome preso dalla pagina non può sfasarsi.
 */
async function onboarding(page, S) {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await wait(900)

  const title = () => page.locator('h1').first().innerText().catch(() => '')

  for (let i = 1; i <= 20; i++) {
    // 🔴 La fine dell'onboarding non la dice un contatore: la dice la barra
    // delle tab, che esiste solo dentro l'app. Senza questo controllo il ciclo
    // tirava dritto e infilava «Oggi» e il pannello «mi sono fatta male» nella
    // cartella dell'onboarding.
    if (await page.locator('nav[aria-label]').count()) break
    const before = await title()
    if (!before) break
    const name = `${String(i).padStart(2, '0')}-${slug(before)}`

    const stop = await run(`onboarding · ${before}`, async () => {
      await S.shot(name)

      const filled = await fillStep(page)
      const after = await title()

      // Alcuni passi avanzano da soli al tocco: se il titolo è già cambiato
      // non c'è niente da fotografare come «compilato» e niente da confermare.
      if (after !== before) return
      if (filled) await S.shot(`${name}-compilato`)

      const go = page.locator('button').last()
      if (await go.isDisabled()) throw new Error(`«Continua» disabilitato su «${before}»`)
      await go.click()
      await wait(850)
    })
    if (stop) break

    if ((await title()) === before) {
      failed.push(`onboarding · fermo su «${before}»`)
      break
    }
  }
}

/**
 * Compila quello che c'è, qualunque cosa sia. Generico di proposito: un elenco
 * di selettori per passo è esattamente la cosa che si sfasa quando l'onboarding
 * cambia, e nessuno se ne accorge finché non guarda 90 immagini a una a una.
 */
async function fillStep(page) {
  const boxes = page.locator('input[type=checkbox]')
  if (await boxes.count()) {
    for (const cb of await boxes.all()) await cb.check().catch(() => {})
    return true
  }
  const dates = page.locator('input[type=date]')
  if (await dates.count()) {
    await dates.first().fill('2026-09-15').catch(() => {})
    // 🔴 Una data sola non va bene per tutti i campi data: sul compleanno una
    // data futura dà un'età fuori scala e «Continua» resta spento. Invece di
    // indovinare a quale passo siamo, si guarda se il bottone si è acceso.
    if (await page.locator('button').last().isDisabled().catch(() => false)) {
      await dates.first().fill('2011-04-12').catch(() => {})
      await wait(250)
    }
    return true
  }
  const text = page.locator('input:not([type=time])')
  if (await text.count()) {
    await text.first().fill('Giulia').catch(() => {})
    return true
  }
  // Bottoni del contenuto: fuori la freccia indietro (ha aria-label) e «Continua».
  const all = page.locator('button')
  const total = await all.count()
  const idx = []
  for (let i = 0; i < total - 1; i++) {
    if (await all.nth(i).getAttribute('aria-label')) continue
    idx.push(i)
  }
  if (!idx.length) return false
  await all.nth(idx[0]).click().catch(() => {})
  // Se sono giorni della settimana ne sceglie due: una settimana con un solo
  // allenamento non somiglia a niente di vero.
  if (idx.length >= 7) await all.nth(idx[2]).click().catch(() => {})
  await wait(400)
  return true
}

await main()
