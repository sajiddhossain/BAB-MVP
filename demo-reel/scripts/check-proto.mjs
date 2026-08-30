#!/usr/bin/env node
/**
 * Verifica che il prototipo si usi davvero col dito.
 *
 * Non basta che compili: le tre cose che possono rompersi in silenzio sono
 * il tap che avanza, lo scroll che NON avanza, e lo swipe che torna indietro.
 * Usa eventi touch veri via CDP: il drag col mouse non simula lo scroll touch.
 *
 *   node scripts/check-proto.mjs        (richiede il dev server attivo)
 */
import { chromium } from 'playwright-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:5199'

const browser = await chromium.launch({ executablePath: CHROME })
// iPhone 14 Pro
const page = await browser.newPage({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(`${BASE}/?flow=checkin`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)

const cdp = await page.context().newCDPSession(page)
const touch = (type, x, y) =>
  cdp.send('Input.dispatchTouchEvent', {
    type,
    touchPoints: type === 'touchEnd' ? [] : [{ x, y, radiusX: 8, radiusY: 8, force: 1 }],
  })
const step = () => page.evaluate(() => window.__step)
const scrollTop = () =>
  page.evaluate(() => Math.round(document.querySelector('.overflow-y-auto')?.scrollTop ?? -1))

async function tap(x, y) {
  await touch('touchStart', x, y)
  await touch('touchEnd', x, y)
  await page.waitForTimeout(650)
}
async function swipe(x1, y1, x2, y2) {
  await touch('touchStart', x1, y1)
  for (let i = 1; i <= 5; i++)
    await touch('touchMove', x1 + ((x2 - x1) * i) / 5, y1 + ((y2 - y1) * i) / 5),
      await page.waitForTimeout(25)
  await touch('touchEnd', x2, y2)
  await page.waitForTimeout(650)
}

const checks = []
const expect = (name, got, want) => checks.push({ name, got, want, ok: got === want })

expect('parte dal primo schermo', await step(), 0)
await tap(196, 700)
expect('il tap avanza', await step(), 1)

// tune-in e' alto 1262: qui lo swipe verticale deve SCORRERE, non avanzare
await swipe(196, 650, 196, 330)
expect('lo swipe verticale non avanza', await step(), 1)
expect('...ma scorre', (await scrollTop()) > 100, true)

await swipe(120, 450, 340, 450)
expect('lo swipe destro torna indietro', await step(), 0)

await tap(196, 700)
await tap(196, 760)
expect('due tap avanzano di due', await step(), 2)
await tap(30, 60)
expect('il tasto indietro torna indietro', await step(), 1)

// --- interazioni vere ---------------------------------------------------
// Il rischio grosso: toccare un comando seleziona MA cambia anche pagina,
// perche' il tocco arriva anche allo stage. Qui si vede subito.
const state = () => page.evaluate(() => window.__babState())
const K = 852 / 874 // lo stage e' scalato per riempire il telefono
const at = (x, y) => [x * K + 1, y * K]

await page.goto(`${BASE}/?flow=checkin`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)

await tap(...at(328, 415)) // chip "Gentle"
expect('il chip si seleziona', (await state())['checkin.tempo'], 'gentle')
expect('...senza cambiare schermo', await step(), 0)

await tap(...at(202, 806)) // CTA
expect('il CTA porta avanti', await step(), 1)

// slider Sleep su tune-in: trascinare deve spostare il pallino
const before = (await state())['checkin.sleep'] ?? 139
await touch('touchStart', ...at(150, 306))
for (const x of [200, 250, 280]) {
  await touch('touchMove', ...at(x, 306))
  await page.waitForTimeout(30)
}
await touch('touchEnd', ...at(280, 306))
await page.waitForTimeout(300)
const after = (await state())['checkin.sleep']
expect('lo slider si trascina', typeof after === 'number' && after > before, true)
expect('...senza cambiare schermo', await step(), 1)

// --- body map -----------------------------------------------------------
/*
 * Le zone del corpo sono ritagliate dal disegno da tools/extract-zones.py:
 * se quel passaggio si rompe restano dei path vuoti e il tocco non prende piu'
 * niente, senza che nulla sembri rotto. Qui si vede.
 * I bersagli sono i baricentri delle zone, convertiti dallo spazio del disegno
 * a quello dello schermo con la stessa scala che usa il componente.
 */
await page.goto(`${BASE}/?flow=checkin`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)
await tap(...at(202, 806))
await tap(...at(202, 806))
expect('siamo sulla body map', await step(), 2)

/** baricentro di una zona -> punto sullo schermo del telefono */
const onBody = async (zoneId) =>
  at(...(await page.evaluate((id) => {
    const svg = document.querySelector('svg[viewBox]')
    const path = svg.querySelector(`path[data-zone="${id}"]`)
    const b = path.getBBox()
    const stage = document.querySelector('.bab-proto > div > div').getBoundingClientRect()
    const k = svg.getScreenCTM()
    const p = new DOMPoint(b.x + b.width / 2, b.y + b.height / 2).matrixTransform(k)
    const scale = stage.width / 402
    return [(p.x - stage.left) / scale, (p.y - stage.top) / scale]
  }, zoneId)))

await tap(...(await onBody('quad-r')))
expect('la zona si accende', ((await state())['checkin.zones'] ?? []).includes('quad-r'), true)
expect('...e fa salire il sheet', await step(), 3)
expect(
  '...col nome della zona',
  // il titolo del sheet e' l'unico testo da 26px: cercarlo per classe prendeva
  // l'occhiello dello schermo che sta dietro
  await page.evaluate(() =>
    [...document.querySelectorAll('p')].find((e) => getComputedStyle(e).fontSize === '26px')
      ?.textContent,
  ),
  'Right quad',
)

await tap(30, 60)
expect('si torna alla body map', await step(), 2)
await tap(...at(151, 271)) // linguetta "Back"
expect('il toggle gira il corpo', (await state())['checkin.bodySide'], 'Back')
// il gomito e' una zona da 191px: senza tolleranza sul tocco sarebbe intoccabile
await tap(...(await onBody('elbow-l')))
expect('anche una zona minuscola si prende', ((await state())['checkin.zones'] ?? []).includes('elbow-l'), true)

// --- sensation sheet ----------------------------------------------------
await page.goto(`${BASE}/?flow=checkin`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)
await tap(...at(202, 806))
await tap(...at(202, 806))
await tap(...at(202, 806))
expect('siamo sul sensation sheet', await step(), 3)
// il sheet parte a y=175, i chip a 205.5 al suo interno -> 380.5 assoluti
await tap(...at(58, 394)) // chip "strong"
const chips = (await state())['checkin.sheet.chips']
expect('il chip del sheet si aggiunge', Array.isArray(chips) && chips.includes('strong'), true)
expect('...senza cambiare schermo', await step(), 3)

/*
 * Arrivato in fondo non deve sfondare.
 * Nota: qui si tocca il CTA (y=809), non un punto qualunque. A meta' sheet ci
 * sono i comandi, che giustamente fermano il tocco e non fanno cambiare pagina.
 */
for (let i = 0; i < 6; i++) await tap(...at(201, 809))
expect("in fondo si ferma sull'ultimo", await step(), 4)

await browser.close()

let bad = 0
for (const c of checks) {
  if (!c.ok) bad++
  console.log(`${c.ok ? '✓' : '✗'} ${c.name}${c.ok ? '' : `  (atteso ${c.want}, ottenuto ${c.got})`}`)
}
if (errors.length) {
  bad++
  console.log('✗ errori in pagina:', errors)
}
console.log(bad ? `\n${bad} controlli falliti` : '\ntutto ok')
process.exit(bad ? 1 : 0)
