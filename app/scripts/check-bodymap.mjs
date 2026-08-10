#!/usr/bin/env node
/**
 * Verifica che ogni regione della mappa corporea sia disegnata dove dice di
 * essere.
 *
 * Perché è un controllo e non un commento: i codici stanno in
 * `content/bodymap.ts` e le forme in `components/BodyMap.tsx`. Se qualcuno
 * aggiunge una regione e dimentica la forma, **quella parte del corpo sparisce
 * dalla mappa senza che nessuno se ne accorga** — nessun errore, nessun avviso,
 * solo un punto che l'atleta non può più toccare per dire che le fa male.
 *
 * Vale anche il contrario: una forma con un codice che non esiste più
 * scriverebbe nel database un valore che nessuno sa più leggere.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const content = readFileSync(join(root, 'src/content/bodymap.ts'), 'utf8')
const component = readFileSync(join(root, 'src/components/BodyMap.tsx'), 'utf8')

/** { code, side } da REGIONS. */
const regions = [...content.matchAll(/\{\s*code:\s*'(\w+)',\s*side:\s*'(front|back|both|none)'/g)]
  .map(([, code, side]) => ({ code, side }))

/** Le chiavi dentro `const FRONT = {…}` e `const BACK = {…}`. */
function keysOf(name) {
  const start = component.indexOf(`const ${name}: Partial<Record<RegionCode, Shape>> = {`)
  if (start === -1) return null
  const end = component.indexOf('\n}', start)
  const block = component.slice(start, end)
  return new Set([...block.matchAll(/^\s{2}(\w+):\s*\{/gm)].map((m) => m[1]))
}

const front = keysOf('FRONT')
const back = keysOf('BACK')

const errors = []
if (!regions.length) errors.push('Nessuna regione trovata in content/bodymap.ts.')
if (!front || !back) errors.push('FRONT o BACK non trovati in components/BodyMap.tsx.')

if (regions.length && front && back) {
  for (const { code, side } of regions) {
    const wantsFront = side === 'front' || side === 'both'
    const wantsBack = side === 'back' || side === 'both'
    if (wantsFront && !front.has(code)) errors.push(`"${code}" è side:'${side}' ma non ha forma nella vista FRONTE.`)
    if (wantsBack && !back.has(code)) errors.push(`"${code}" è side:'${side}' ma non ha forma nella vista RETRO.`)
    if (side === 'none' && (front.has(code) || back.has(code)))
      errors.push(`"${code}" è side:'none' ma è disegnato: dovrebbe essere un bottone, non una zona.`)
  }
  const known = new Set(regions.map((r) => r.code))
  for (const [view, set] of [['FRONTE', front], ['RETRO', back]]) {
    for (const code of set) {
      if (!known.has(code)) errors.push(`${view}: la forma "${code}" non corrisponde a nessuna regione.`)
    }
  }
}

if (errors.length) {
  console.error('\n🔴 mappa corporea\n')
  for (const e of errors) console.error('  · ' + e)
  console.error(`\n${errors.length} problema/i.\n`)
  process.exit(1)
}

console.log(
  `✅ mappa corporea — ${regions.length} regioni: ${front.size} sul fronte, ${back.size} sul retro, tutte disegnate.`,
)
