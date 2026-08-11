/**
 * Due controlli che il compilatore non fa da solo:
 *   1. parità di forma fra le lingue (TS garantisce le chiavi, non la lunghezza
 *      degli array: `steps` con 3 voci in una lingua e 4 nell'altra compila)
 *   2. nessuna stringa di testo scritta dentro un componente
 *
 * Uso: node scripts/check-copy.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

let failures = 0
const fail = (m) => { console.error('  ✗ ' + m); failures++ }

// ── 1 · parità di forma ─────────────────────────────────────────────────────
const shape = (o, path = '') =>
  Object.entries(o).flatMap(([k, v]) => {
    const p = path ? `${path}.${k}` : k
    if (Array.isArray(v)) return [`${p}[]=${v.length}`]
    if (v && typeof v === 'object') return shape(v, p)
    return [p]
  })

/**
 * I file di lingua sono oggetti letterali puri: si leggono senza bundler.
 * Si tolgono gli `import type` e l'annotazione, e si valuta il letterale.
 */
const loadLocale = (file, name) => {
  let src = readFileSync(new URL(`../src/copy/${file}`, import.meta.url), 'utf8')
  src = src.replace(/^import[^\n]*\n/gm, '')
  src = src.replace(new RegExp(`export const ${name}(: Copy)? = `), 'return ')
  return new Function(src)()
}

console.log('· parità di forma fra le lingue')
const it = loadLocale('it.ts', 'it')
const en = loadLocale('en.ts', 'en')
const si = shape(it), se = shape(en)
si.filter((k) => !se.includes(k)).forEach((k) => fail(`manca in en, o è diverso: ${k}`))
se.filter((k) => !si.includes(k)).forEach((k) => fail(`manca in it, o è diverso: ${k}`))
console.log(`  ${si.length} chiavi confrontate`)

// ── 2 · nessun letterale nei componenti ─────────────────────────────────────
console.log('· nessuna stringa nei componenti')
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.tsx') ? [p] : []
  })

/**
 * Testo fra tag JSX: >Qualcosa di leggibile<
 *
 * La prima versione pretendeva che il testo COMINCIASSE con una lettera, e così
 * `🩹 Mi sono fatta male` passava indisturbato — cioè proprio la forma che il
 * copy di BAB usa più spesso. Ora basta che una lettera ci sia da qualche parte.
 *
 * 🔴 `(?<!=)` esclude il `>` di una freccia. Senza, `(e) => e.date < today`
 * diventa «testo fra tag»: il `>` della freccia apre, il `<` del confronto
 * chiude, e in mezzo c'è `e.date`. Stessa cosa per `() => Promise<void>`. Sono
 * due false accuse che si prendono solo scrivendo codice normale, e un
 * controllo che accusa il codice normale finisce spento.
 */
const JSX_TEXT = /(?<!=)>\s*([^<>{}\n]*[A-Za-zÀ-ÿ][^<>{}\n]{2,})\s*</g
// Attributi che finiscono davanti agli occhi di chi usa l'app
const UI_ATTR = /\b(aria-label|placeholder|title|alt)=["']([^"']{2,})["']/g

/**
 * `>\s*` attraversa gli a capo, quindi il regex sopra sa saltare dalla fine di
 * un tag al codice della riga dopo e leggerlo come se fosse testo. Il salto
 * serve — il testo vero spesso sta su una riga sua — quindi invece di
 * restringerlo si scarta ciò che è palesemente codice.
 *
 * Nessuna frase che legge un'atleta contiene `=>`, `===` o `.qualcosa(`.
 */
const CODE_ISH = /=>|===|!==|&&|\|\||\)\s*:|\?\s*\(|\breturn\b|\bconst\b|\blet\b|\bif\s*\(|\.\w+\(|\?\s*$|^=\s/

/**
 * 🔴 L'unica esenzione, e vale la pena spiegarla perché un'esenzione tende a
 * fare figli.
 *
 * `screens/admin/` è la console di chi amministra: la aprono la founder e chi
 * lavora con lei, da un portatile. R9 — italiano E inglese — riguarda il
 * prodotto che usa un'atleta, non gli strumenti interni. Tradurre sessanta
 * etichette come «Squadre» e «Aggiungi staff» significherebbe raddoppiarle in
 * un file dove vive la voce di BAB, rendendo più difficile trovare le frasi
 * che una tredicenne legge davvero.
 *
 * La diagnostica NON è esente: quella la apre lei quando qualcosa non va.
 */
const EXEMPT = /^screens\/admin\//

for (const file of walk(new URL('../src', import.meta.url).pathname)) {
  const src = readFileSync(file, 'utf8')
  const rel = file.split('/src/')[1]
  if (EXEMPT.test(rel)) continue
  for (const m of src.matchAll(JSX_TEXT)) {
    const text = m[1].trim()
    if (/^[{}\s|·—–\-•]+$/.test(text)) continue
    if (CODE_ISH.test(text)) continue
    fail(`${rel}: testo in chiaro nel JSX → "${text}"`)
  }
  for (const m of src.matchAll(UI_ATTR)) {
    fail(`${rel}: ${m[1]} in chiaro → "${m[2]}"`)
  }
}

if (failures) {
  console.error(`\n${failures} problema/i. Il copy va in src/copy/, non nei componenti.`)
  process.exit(1)
}
console.log('\n✓ tutto a posto')
