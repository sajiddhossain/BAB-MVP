#!/usr/bin/env node
/**
 * Verifica che il prototipo si usi davvero col dito.
 *
 * Non basta che compili: le cose che si rompono in silenzio sono il bottone che
 * avanza, il tocco a vuoto che NON deve avanzare, lo scroll che non cambia
 * schermo e lo swipe che torna indietro. Usa eventi touch veri via CDP: il drag
 * col mouse non simula lo scroll touch.
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
const state = () => page.evaluate(() => window.__babState())
const scrollTop = () =>
  page.evaluate(() => Math.round(document.querySelector('.overflow-y-auto')?.scrollTop ?? -1))

async function tap(x, y) {
  await touch('touchStart', x, y)
  await touch('touchEnd', x, y)
  // 700ms coprono anche il bottone che conferma prima di chiudere (460ms),
  // poi si aspetta che la transizione sia finita davvero invece di indovinare
  await page.waitForTimeout(700)
  await page.waitForFunction(() => !window.__moving, null, { timeout: 4000 })
}
/**
 * Tocca il bottone principale dello schermo corrente.
 *
 * Lo cerca nel DOM invece che a coordinate: su tune-in sta a y=1193 di 1262,
 * cioe' fuori schermo, e con la navigazione "solo se confermi" non c'e' piu' un
 * punto qualunque da toccare per andare avanti.
 *
 * Prende l'ULTIMO, non il primo: quando c'e' un pannello aperto in pagina ci
 * sono due bottoni principali, quello del pannello e quello dello schermo che
 * sta dietro, e vale quello sopra.
 */
async function tapCta() {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-cta]')].pop()
    if (!el) return null
    el.scrollIntoView({ block: 'center' })
    const r = el.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + Math.min(28, r.height / 2) }
  })
  if (!box) throw new Error('nessun bottone principale su questo schermo')
  await tap(box.x, box.y)
}

/**
 * Tocca il comando che porta questa scritta.
 *
 * A coordinate non si puo': il pannello si sposta quando la tendina si chiude,
 * e un test che insegue le coordinate misura se stesso, non l'app.
 */
async function tapLabel(text) {
  const box = await page.evaluate((t) => {
    const p = [...document.querySelectorAll('p')].find((e) => e.textContent.trim() === t)
    if (!p) return null
    /*
     * La scritta non sta sempre DENTRO al comando: le faccine di checkout-3
     * hanno il nome come sorella del bottone, e mirare alla scritta voleva
     * dire toccare nove pixel di testo invece del bersaglio. Se non e'
     * dentro, si sale finche' non si trova un antenato con un comando solo.
     */
    let el = p.closest('.bab-touch')
    for (let n = p.parentElement; n && !el; n = n.parentElement) {
      const vicini = n.querySelectorAll('.bab-touch')
      if (vicini.length === 1) el = vicini[0]
      else if (vicini.length > 1) break
    }
    const r = (el ?? p).getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
  }, text)
  if (!box) throw new Error('nessun comando con la scritta: ' + text)
  await tap(box.x, box.y)
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

// Foglio bianco: il prototipo NON deve aprirsi con le risposte del frame Figma
// gia' dentro. I default dei componenti restano quelli del frame (li confronta
// il diff); il vuoto lo mette proto/blank.ts.
expect('parte senza risposte', (await state())['checkin.tempo'], null)

// la regola: si va avanti solo confermando. Un dito appoggiato a vuoto per
// leggere non deve portarti due schermi piu' in la'.
await tap(196, 700)
expect('un tocco a vuoto non avanza', await step(), 0)
await tapCta()
expect('...e nemmeno il bottone, se la domanda non ha risposta', await step(), 0)
await tapLabel('Upbeat')
await tapCta()
expect('il bottone principale avanza', await step(), 1)

// tune-in e' alto 1262: qui lo swipe verticale deve SCORRERE, non avanzare
await swipe(196, 650, 196, 330)
expect('lo swipe verticale non avanza', await step(), 1)
expect('...ma scorre', (await scrollTop()) > 100, true)

/*
 * tune-in e' alto 1262: scorrendo si perdevano di vista sia il tasto indietro
 * sia a che punto sei. La barra resta appiccicata, e sotto compare un velo o il
 * contenuto le passa sopra.
 */
const barTop = await page.evaluate(() => {
  const img = document.querySelector('img[alt=""][src*="arrow-left"]')
  return Math.round(img.getBoundingClientRect().top)
})
expect('la barra in alto resta in vista', barTop > 0 && barTop < 160, true)
expect(
  '...col velo sotto',
  await page.evaluate(() => {
    const v = [...document.querySelectorAll('div')].find((d) =>
      getComputedStyle(d).backdropFilter.includes('blur(6px)'),
    )
    return Number(getComputedStyle(v).opacity) > 0.5
  }),
  true,
)

await swipe(120, 450, 340, 450)
expect('lo swipe destro torna indietro', await step(), 0)

await tapLabel('Upbeat')
await tapCta()
await tapLabel('7–8h') // anche tune-in aspetta una risposta
await tapCta() // il suo CTA sta a y=1193: tapCta lo porta in vista da solo
expect('e lo fa anche da uno schermo che scorre', await step(), 2)
await tap(30, 60)
expect('il tasto indietro torna indietro', await step(), 1)

// --- interazioni vere ---------------------------------------------------
// Il rischio grosso: toccare un comando seleziona MA cambia anche pagina,
// perche' il tocco arriva anche allo stage. Qui si vede subito.
const K = 852 / 874 // lo stage e' scalato per riempire il telefono
const at = (x, y) => [x * K + 1, y * K]

await page.goto(`${BASE}/?flow=checkin`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)

await tap(...at(328, 415)) // chip "Gentle"
expect('il chip si seleziona', (await state())['checkin.tempo'], 'gentle')
expect('...senza cambiare schermo', await step(), 0)

await tapCta()
expect('il CTA porta avanti', await step(), 1)
await tapLabel('7–8h')

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
await tapLabel('Upbeat')
await tapCta()
await tapLabel('7–8h')
await tapCta()
expect('siamo sulla body map', await step(), 2)
expect(
  'il contatore parte da zero',
  await page.evaluate(() =>
    [...document.querySelectorAll('p')].find((e) => /spots? added/.test(e.textContent))?.textContent,
  ),
  '0 spots added',
)

/** baricentro di una zona -> punto sullo schermo del telefono */
const onBody = async (zoneId) =>
  at(...(await page.evaluate((id) => {
    // data-zone ce l'ha solo la figura che si vede: le due sono sovrapposte
    const path = document.querySelector(`path[data-zone="${id}"]`)
    const svg = path.ownerSVGElement
    const b = path.getBBox()
    const stage = document.querySelector('.bab-proto > div > div').getBoundingClientRect()
    const k = svg.getScreenCTM()
    const p = new DOMPoint(b.x + b.width / 2, b.y + b.height / 2).matrixTransform(k)
    const scale = stage.width / 402
    return [(p.x - stage.left) / scale, (p.y - stage.top) / scale]
  }, zoneId)))

const spots = () =>
  page.evaluate(() =>
    [...document.querySelectorAll('p')].find((e) => /spots? added/.test(e.textContent))?.textContent,
  )

await tap(...(await onBody('quad-r')))
// la chiave porta il lato: diciannove zone si chiamano uguale davanti e dietro
expect('la zona si accende', (await state())['checkin.lastZone'], 'Front:quad-r')
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

/*
 * Dal pannello si esce con la sua ✕, non col tasto indietro: quello appartiene
 * allo schermo che sta dietro, ed e' coperto dai veli. Prima funzionava lo
 * stesso perche' lo stage prendeva qualunque tocco in alto a sinistra.
 */
await tapLabel('✕')
expect('la ✕ chiude il pannello', await step(), 2)
/*
 * Un punto vale solo se lo confermi: toccare la zona lo mette "in sospeso" e
 * apre il pannello, ma uscendo con la ✕ non deve restare niente. Altrimenti
 * basterebbe sfiorare il corpo per ritrovarsi punti che non hai mai nominato.
 */
expect('...e un punto non confermato non conta', await spots(), '0 spots added')

await tap(...at(151, 271)) // linguetta "Back"
expect('il toggle gira il corpo', (await state())['checkin.bodySide'], 'Back')
// il gomito e' una zona da 191px: senza tolleranza sul tocco sarebbe intoccabile
await tap(...(await onBody('elbow-l')))
expect('anche una zona minuscola si prende', (await state())['checkin.lastZone'], 'Back:elbow-l')
await tapLabel('✕')

// --- sensation sheet ----------------------------------------------------
await page.goto(`${BASE}/?flow=checkin`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)
await tap(...at(202, 806))
await tapLabel('Upbeat')
await tapCta()
await tapLabel('7–8h')
await tapCta()
await tap(...(await onBody('quad-r')))
expect('siamo sul sensation sheet', await step(), 3)
await tapCta()
expect('il pannello non aggiunge una sensazione senza nome', await step(), 3)
// il sheet parte a y=175, i chip a 205.5 al suo interno -> 380.5 assoluti
await tap(...at(58, 394)) // chip "strong"
const chips = (await state())['checkin.spot.Front:quad-r.chips']
expect('il chip del sheet si aggiunge', Array.isArray(chips) && chips.includes('strong'), true)
expect('...senza cambiare schermo', await step(), 3)

// --- i campi fanno quello che dicono -------------------------------------
await page.fill('textarea', 'tira quando salgo le scale')
await page.waitForTimeout(200)
expect(
  'il campo di testo scrive davvero',
  (await state())['checkin.spot.Front:quad-r.note'],
  'tira quando salgo le scale',
)

// "A little help ✨" e' una tendina: la freccia deve chiuderla, e il pannello
// accorciarsi invece di restare con un buco in mezzo
const sheetTop = () =>
  page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find(
      (d) => getComputedStyle(d).borderTopLeftRadius === '20px' && d.offsetWidth > 300,
    )
    return Math.round(el.getBoundingClientRect().top)
  })
const topOpen = await sheetTop()
await tapLabel('A little help ✨')
expect('la tendina si chiude', (await state())['checkin.spot.Front:quad-r.help'], false)
expect('...e il pannello si accorcia', (await sheetTop()) > topOpen + 100, true)
await tapLabel('A little help ✨')
await page.waitForTimeout(400)
expect('e si riapre', (await state())['checkin.spot.Front:quad-r.help'], true)

// --- salvare, riaprire, togliere -----------------------------------------
/*
 * Il bottone diventa un segno di spunta PRIMA di chiudere: qui stai salvando un
 * dato tuo, e vedere che e' stato preso vale la mezza pausa. Si guarda subito
 * dopo il tocco, prima che il pannello se ne vada.
 */
{
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-cta]')].pop()
    const r = el.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + 28 }
  })
  await touch('touchStart', box.x, box.y)
  await touch('touchEnd', box.x, box.y)
  await page.waitForTimeout(260)
  expect(
    'il bottone conferma prima di chiudere',
    await page.evaluate(() => {
      const cta = [...document.querySelectorAll('[data-cta]')].pop()
      const svg = cta.querySelector('svg')
      return Number(getComputedStyle(svg).opacity) > 0.8 &&
        Number(getComputedStyle(cta.querySelector('p')).opacity) < 0.2
    }),
    true,
  )
  await page.waitForTimeout(700)
  await page.waitForFunction(() => !window.__moving, null, { timeout: 4000 })
}
expect('...poi salva il punto e riporta alla mappa', await step(), 2)
expect('...e ora il contatore conta', await spots(), '1 spot added')

await tap(...(await onBody('quad-r')))
expect('ritoccando un punto salvato si riapre', await step(), 3)
expect(
  '...con le parole che avevi scritto',
  await page.evaluate(() => document.querySelector('textarea').value),
  'tira quando salgo le scale',
)
expect(
  '...e il bottone dice che stai correggendo',
  await page.evaluate(() =>
    [...document.querySelectorAll('[data-cta] p')].pop()?.textContent,
  ),
  'Update this sensation',
)

// un altro punto: le risposte sono sue, non quelle del primo
await tapLabel('✕')
await tap(...(await onBody('chest-l')))
expect(
  'un punto nuovo si apre vuoto',
  await page.evaluate(() => document.querySelector('textarea').value),
  '',
)
await tapLabel('✕')

// e si toglie
await tap(...(await onBody('quad-r')))
await tapLabel('Remove this spot')
expect('"Remove this spot" toglie il punto', await step(), 2)
expect('...e il contatore torna indietro', await spots(), '0 spots added')

// "Somewhere else": per quello che non sta in nessuna zona del disegno
await tapLabel('Somewhere else')
expect('"Somewhere else" apre il pannello', await step(), 3)
expect(
  '...intestato come dice',
  await page.evaluate(() =>
    [...document.querySelectorAll('p')].find((e) => getComputedStyle(e).fontSize === '26px')
      ?.textContent,
  ),
  'Somewhere else',
)

/*
 * Arrivato in fondo non deve sfondare.
 * Si riparte dalla mappa: dal pannello il bottone salva e torna indietro, non
 * porta avanti, quindi da li' non si arriverebbe mai alla fine.
 */
await tapLabel('✕')
expect('si torna alla mappa', await step(), 2)
for (let i = 0; i < 6; i++) await tapCta()
expect("in fondo si ferma sull'ultimo", await step(), 4)

/*
 * "Try this today" era una tendina che non si apriva. Ora si apre, e il
 * riquadro con l'avvertenza scende sotto invece di restarci sotto sepolto.
 */
const boxTop = () =>
  page.evaluate(() => {
    const p = [...document.querySelectorAll('p')].find((e) =>
      e.textContent.startsWith('BAB never tells'),
    )
    return Math.round(p.parentElement.getBoundingClientRect().top)
  })
const chiuso = await boxTop()
await tapLabel('Try this today')
expect('la tendina "Try this today" si apre', (await state())['checkin.tryToday'], true)
expect("...e l'avvertenza scende sotto", (await boxTop()) > chiuso + 150, true)
expect(
  '...senza finire sotto il bottone',
  await page.evaluate(() => {
    const p = [...document.querySelectorAll('p')].find((e) =>
      e.textContent.startsWith('BAB never tells'),
    )
    const cta = document.querySelector('[data-cta]')
    return p.parentElement.getBoundingClientRect().bottom < cta.getBoundingClientRect().top
  }),
  true,
)

/* ------------------------------------------------ la tastiera e i campi veri */
/*
 * ?kb=1 accende la tastiera disegnata da noi anche qui: senza, il controllo
 * dipenderebbe dal fatto che il browser di prova finga di essere un telefono.
 */
await page.goto(`${BASE}/?flow=checkin&kb=1`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)
await tapLabel('Steady')
await tapCta()
await tapLabel('6–7h')
await tapCta()
expect('si arriva alla mappa', await step(), 2)

const somewhere = () =>
  page.evaluate(
    () =>
      !![...document.querySelectorAll('p')].find(
        (e) => e.textContent.trim() === 'Somewhere else' && e.style.fontSize === '11.5px',
      ),
  )
const counter = () =>
  page.evaluate(
    () => [...document.querySelectorAll('p')].find((e) => /spots? added/.test(e.textContent))?.textContent,
  )

expect('un punto fuori dal disegno non si vede ancora', await somewhere(), false)
await tapLabel('Somewhere else')
expect('...ma il pannello si apre lo stesso', await step(), 3)

const kbTop = () =>
  page.evaluate(() => {
    const k = document.querySelector('[data-key="q"]')
    return k ? Math.round(k.getBoundingClientRect().top) : null
  })
/* la tastiera sta sempre nel DOM: da chiusa e' spinta sotto il bordo */
const kbChiusa = async () => (await kbTop()) > 852
expect('a riposo la tastiera sta fuori schermo', await kbChiusa(), true)
await page.evaluate(() => {
  const t = document.querySelector('textarea')
  const r = t.getBoundingClientRect()
  const f = (ty) =>
    t.dispatchEvent(
      new PointerEvent(ty, {
        bubbles: true,
        cancelable: true,
        clientX: r.x + 20,
        clientY: r.y + 10,
        pointerId: 1,
        pointerType: 'touch',
        isPrimary: true,
      }),
    )
  f('pointerdown')
  f('pointerup')
})
await page.waitForTimeout(500)
expect('toccando il campo la tastiera sale', (await kbTop()) < 852, true)

const pressKey = async (id) => {
  await page.evaluate((k) => {
    const el = [...document.querySelectorAll('[data-key]')].find((e) => e.dataset.key === k)
    const f = (ty) =>
      el.dispatchEvent(
        new PointerEvent(ty, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'touch', isPrimary: true }),
      )
    f('pointerdown')
    f('pointerup')
  }, id)
  await page.waitForTimeout(60)
}
for (const c of ['s', 'o', 'r', 'e']) await pressKey(c)
const written = () => page.evaluate(() => document.querySelector('textarea').value)
expect('i tasti scrivono, col maiuscolo a inizio frase', await written(), 'Sore')
await pressKey('backspace')
expect('...e si cancella', await written(), 'Sor')
await pressKey('Done')
await page.waitForTimeout(500)
expect('"Done" fa scendere la tastiera', await kbChiusa(), true)

await tapLabel('tight')
await tapCta()
expect('confermando si torna alla mappa', await step(), 2)
expect('...e ora il punto fuori dal disegno si vede', await somewhere(), true)
expect('...e il contatore sta al singolare', await counter(), '1 spot added')
await tapLabel('Somewhere else')
expect('...e toccandolo si riapre il pannello', await step(), 3)

/* ---------------------------------------- "Add your own" e' un campo, non un finto */
await page.goto(`${BASE}/?flow=checkout&kb=1`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)
await tapLabel('Gentle')
for (let i = 0; i < 6; i++) {
  const trovato = await page.evaluate(
    () => !![...document.querySelectorAll('p')].find((p) => p.textContent.trim() === 'Add your own...'),
  )
  if (trovato) break
  await tapCta()
}
expect(
  'si arriva a "What did you bring home?"',
  await page.evaluate(
    () => !![...document.querySelectorAll('p')].find((p) => p.textContent.trim() === 'Add your own...'),
  ),
  true,
)
expect('a riposo non e un campo', await page.evaluate(() => !!document.querySelector('input.bab-field')), false)
await tapLabel('Add your own...')
expect('toccandolo diventa un campo vero', await page.evaluate(() => !!document.querySelector('input.bab-field')), true)
for (const c of ['k', 'e', 'p', 't']) await pressKey(c)
await pressKey('Done')
await page.waitForTimeout(400)
expect(
  'le tue parole diventano una pillola tua',
  await page.evaluate(() => (window.__babState() || {})['checkout.ownTakeHome']),
  'Kept',
)

/* ------------------------- l'ultima domanda del check-out si vede quando scegli */
/*
 * Era l'unico comando dell'app in cui "scelto" cambiava solo il colore di un
 * testo da 12px: si toccava e sembrava non fosse successo niente.
 */
await page.goto(`${BASE}/?flow=checkout`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)
await tapLabel('Gentle')
await tapCta() // -> il confronto
await tapCta() // -> effort
await tapCta() // -> satisfaction
await tapLabel('Proud') // il bottone li' e' chiuso finche' non scegli una faccia
await tapCta() // -> energy
await tapCta() // -> la mappa
await tapCta() // -> la lettura finale
expect('si arriva alla lettura finale', await step(), 7)
const sfondoNo = () =>
  page.evaluate(() => {
    const el = [...document.querySelectorAll('.bab-touch')].find((e) => e.textContent.trim() === 'No')
    return el ? getComputedStyle(el).backgroundColor : null
  })
const primaDelTocco = await sfondoNo()
await tapLabel('No')
const dopoIlTocco = await sfondoNo()
expect('scegliendo, il bottone cambia davvero aspetto', primaDelTocco !== dopoIlTocco, true)
expect('...e prende il verde delle altre scelte', dopoIlTocco, 'rgb(229, 245, 242)')

/* ------------------ la lettura finale parla del punto che hai segnato davvero */
await page.goto(`${BASE}/?flow=checkin`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)
await tapLabel('Steady')
await tapCta()
await tapLabel('6–7h')
await tapCta()
await tap(...(await onBody('chest-l')))
await tapLabel('strong')
await tapCta() // salva il punto
await tapCta() // -> la lettura
const testo = (px) =>
  page.evaluate(
    (s) =>
      [...document.querySelectorAll('p')]
        .find((e) => Math.round(parseFloat(getComputedStyle(e).fontSize)) === s)
        ?.textContent.trim(),
    px,
  )
expect('il titolo nomina la zona che hai segnato', await testo(30), 'About that left chest.')
expect(
  '...e il riepilogo porta quello che hai scelto',
  await page.evaluate(
    () => [...document.querySelectorAll('p')].map((e) => e.textContent.trim()).find((t) => t.includes('|')),
  ),
  'strong  |  6/10',
)

/* ------------------------------- anche le due domande in fondo partono in bianco */
await page.goto(`${BASE}/?flow=checkin`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)
await tapLabel('Steady')
await tapCta()
const sceltePresenti = () =>
  page.evaluate(
    () =>
      [...document.querySelectorAll('.bab-touch')].filter((el) => {
        const t = el.textContent.trim()
        if (t !== 'Yes' && t !== 'No') return false
        const p = el.querySelector('p')
        return p && getComputedStyle(p).color === 'rgb(134, 107, 242)'
      }).length,
  )
expect('nessuna delle due domande parte gia risposta', await sceltePresenti(), 0)
// stanno in fondo a uno schermo lungo 1262: senza scorrere il tocco cade altrove
await page.evaluate(() => {
  const l = document.querySelector('.overflow-y-auto')
  l.scrollTop = l.scrollHeight
})
await page.waitForTimeout(300)
await tapLabel('No')
expect('...e rispondendo se ne accende una', await sceltePresenti(), 1)

/* --------------------------------------- un punto sta sul suo lato, non su entrambi */
/*
 * Diciannove zone su trentatre portano lo stesso nome davanti e dietro
 * (head, knee-l, ankle-r...). Segnando solo il nome, un ginocchio segnato
 * davanti si accendeva anche dietro.
 */
await page.goto(`${BASE}/?flow=checkin`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)
await tapLabel('Steady')
await tapCta()
await tapLabel('6–7h')
await tapCta()
await tap(...(await onBody('knee-l')))
await tapLabel('sore')
await tapCta()
const accese = () =>
  page.evaluate(() =>
    [...document.querySelectorAll('path[data-zone]')]
      .filter((p) => +getComputedStyle(p).fillOpacity > 0.1)
      .map((p) => p.dataset.zone),
  )
expect('il ginocchio segnato davanti si accende', (await accese()).join(), 'knee-l')
await tapLabel('Back')
await page.waitForTimeout(500)
expect('...e girandosi non si accende anche dietro', (await accese()).join(), '')

/* ------------------------------------------------------- il rimbalzo ai bordi */
/*
 * Questo controllo esiste perche' il rimbalzo era gia' passato una volta per
 * funzionante senza esserlo: ascoltava gli eventi del puntatore, che il
 * browser annulla appena decide che il gesto e' uno scorrimento. Serve il
 * tocco vero via CDP, non eventi finti costruiti a mano.
 */
await page.goto(`${BASE}/?flow=checkin`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)
await tapLabel('Steady')
await tapCta()
expect('si arriva a tune-in', await step(), 1)

const pull = () =>
  page.evaluate(() => {
    const l = document.querySelector('.overflow-y-auto')
    const c = l && l.firstElementChild
    return c ? Math.round(new DOMMatrixReadOnly(getComputedStyle(c).transform).m42) : 0
  })
// portati in fondo e da li' tira ancora: e' li' che deve tendersi
await page.evaluate(() => {
  const l = document.querySelector('.overflow-y-auto')
  l.scrollTop = l.scrollHeight
})
await page.waitForTimeout(200)
const cx = 196
let peak = 0
await touch('touchStart', cx, 600)
for (let i = 1; i <= 10; i++) {
  await touch('touchMove', cx, 600 - i * 14)
  await page.waitForTimeout(16)
  const y = await pull()
  if (Math.abs(y) > Math.abs(peak)) peak = y
}
await touch('touchEnd', cx, 460)
expect('arrivati in fondo il contenuto si tende', peak < -30, true)
await page.waitForTimeout(600)
expect('...e al rilascio torna al suo posto', await pull(), 0)

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
