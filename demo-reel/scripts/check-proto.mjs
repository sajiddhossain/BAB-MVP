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

// arrivato in fondo non deve sfondare
for (let i = 0; i < 8; i++) await tap(196, 600)
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
