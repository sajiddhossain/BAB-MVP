import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const page = await browser.newPage({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 1 })
await page.goto('http://localhost:5199/?flow=checkin', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const cdp = await page.context().newCDPSession(page)
const step = async (ms) => {
  const done = new Promise((r) => cdp.once('Emulation.virtualTimeBudgetExpired', r))
  await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pauseIfNetworkFetchesPending', budget: ms })
  await Promise.race([done, new Promise((r) => setTimeout(() => r('TIMEOUT'), 4000))])
}
await step(1)
const box = await page.evaluate(() => {
  const el = [...document.querySelectorAll('p')].find((p) => p.textContent.trim() === 'Steady').closest('.bab-touch')
  const r = el.getBoundingClientRect()
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
})
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x, y: box.y }] })
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
const letto = []
for (let i = 0; i < 5; i++) {
  await step(80)
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' })
  letto.push({
    ms: (i + 1) * 80,
    coloreCta: await page.evaluate(() => getComputedStyle([...document.querySelectorAll('[data-cta]')].pop().querySelector('p')).color),
    pngBytes: shot.data.length,
  })
}
console.log(JSON.stringify(letto))
await browser.close()
process.exit(0)
