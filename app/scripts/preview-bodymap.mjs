#!/usr/bin/env node
/**
 * Disegna la mappa corporea in un PNG, così si può guardare.
 *
 * Serve perché la geometria è fatta di path SVG scritti a mano: leggere
 * `M56,92 C56,78 74,70 100,70` non dice a nessuno se il collo si vede o se le
 * spalle sembrano un guscio di tartaruga. Questa cosa la dice una figura.
 *
 * Legge le forme DAL COMPONENTE VERO, non da una copia: se l'anteprima è
 * bella e il componente è rotto, l'anteprima non è servita a niente.
 *
 *   node scripts/preview-bodymap.mjs [percorso.png]
 *
 * Richiede Chrome, lo stesso usato per il PDF della roadmap.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = process.argv[2] ?? join(root, '..', 'docs', 'mappa-corporea.png')
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const src = readFileSync(join(root, 'src/components/BodyMap.tsx'), 'utf8')

function shapes(name) {
  const head = `const ${name}: Partial<Record<RegionCode, Shape>> = {`
  const i = src.indexOf(head)
  if (i === -1) throw new Error(`${name} non trovato in BodyMap.tsx`)
  const body = src.slice(src.indexOf('{', i), src.indexOf('\n}', i) + 2)
  const json = body
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(\b[a-z_]\w*):/gi, '"$1":')
    .replace(/'/g, '"')
    .replace(/,(\s*[}\]])/g, '$1')
  return JSON.parse(json)
}

const el = (s, cls) =>
  s.k === 'ellipse'
    ? `<ellipse class="${cls}" cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}"/>`
    : `<path class="${cls}" d="${s.d}"/>`

const draw = (m, states = {}) =>
  Object.entries(m).map(([code, s]) => el(s, `z ${states[code] ?? ''}`)).join('')

const front = shapes('FRONT')
const back = shapes('BACK')

const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#FAF9F6;font:12px "Helvetica Neue",system-ui;display:flex;gap:18px;padding:16px}
svg{width:190px;height:auto}
.z{fill:#fff;stroke:#0F0F12;stroke-width:1.75;stroke-linejoin:round}
.sel{fill:#34BBC0;stroke:#34BBC0;stroke-width:3}
.log{fill:color-mix(in srgb,#34BBC0 20%,transparent);stroke:#34BBC0;stroke-width:2.5}
.flag{fill:color-mix(in srgb,#FF6B5C 22%,transparent);stroke:#FF6B5C;stroke-width:3}
figure{margin:0}figcaption{text-align:center;font-weight:700;margin-top:6px}
</style>
<figure><svg viewBox="0 0 200 400">${draw(front)}</svg><figcaption>fronte</figcaption></figure>
<figure><svg viewBox="0 0 200 400">${draw(back)}</svg><figcaption>retro</figcaption></figure>
<figure><svg viewBox="0 0 200 400">${draw(front, { knee_l: 'sel', core: 'log', shoulders: 'log' })}</svg>
<figcaption>scelta + segnate</figcaption></figure>
<figure><svg viewBox="0 0 200 400">${draw(back, { calf_r: 'flag', lower_back: 'log' })}</svg>
<figcaption>🚩 bandiera rossa</figcaption></figure>`

const page = join(tmpdir(), 'bab-bodymap.html')
writeFileSync(page, html)
execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--screenshot=${out}`, '--window-size=880,470', `file://${page}`,
], { stdio: 'ignore' })

console.log(
  `✅ ${out}\n   ${Object.keys(front).length} forme sul fronte, ${Object.keys(back).length} sul retro — lette da BodyMap.tsx`,
)
