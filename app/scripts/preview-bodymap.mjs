#!/usr/bin/env node
/**
 * Disegna la mappa corporea in un PNG, così si può guardare.
 *
 * Serve perché la geometria è fatta di curve scritte a mano: leggere
 * `C58.5,94 56.5,103 55.5,113` non dice a nessuno se la spalla sembra una
 * spalla. Questa cosa la dice una figura.
 *
 * Importa `src/components/body-shapes.ts` DIRETTAMENTE (Node ≥22 toglie i tipi
 * da solo): l'anteprima non è una copia della geometria che può divergere, è la
 * geometria. Se il componente è rotto, l'anteprima è rotta uguale — che è tutto
 * il punto di guardarla.
 *
 *   node scripts/preview-bodymap.mjs [percorso.png]
 *
 * Richiede Chrome, lo stesso usato per il PDF della roadmap.
 */
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = process.argv[2] ?? join(root, '..', 'docs', 'mappa-corporea.png')
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const { FRONT, BACK, HALF, MIRROR, VIEW, SHADOW } =
  await import(join(root, 'src/components/body-shapes.ts'))

const el = (s, cls) =>
  s.k === 'rect'
    ? `<rect class="${cls}" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}"/>`
    : `<path class="${cls}" d="${s.d}"${s.mirror ? ` transform="${MIRROR}"` : ''}/>`

/** Le decorazioni: si ridisegnano qui perché in `BodyMap.tsx` sono JSX. */
const DECOR = {
  front: `<g class="ink">
    <path opacity="0.3" d="M80.1,36 C80.3,20 89,12 100,12 C111,12 119.7,20 119.9,36
      C114.5,29 108.5,32 100,32 C91.5,32 85.6,29 80.1,36 Z"/>
    <circle cx="93.2" cy="41" r="2.4"/><circle cx="106.8" cy="41" r="2.4"/>
    <path d="M94.5,49 Q100,53.5 105.5,49" fill="none" stroke="#5C6A86" stroke-width="1.8" stroke-linecap="round"/></g>`,
  back: `<g class="ink">
    <ellipse cx="100" cy="35" rx="19.9" ry="23" opacity="0.3"/>
    <path opacity="0.3" d="M100,52 C106.6,60.3 107.4,76.4 104.1,93.2 C102.5,101.6 97.5,101.6 95.9,93.2
      C92.6,76.4 93.4,60.3 100,52 Z"/>
    <path d="M100,122.6 L100,175.1" stroke="#5C6A86" stroke-width="2.2" stroke-dasharray="4 6"
          stroke-linecap="round" fill="none" opacity="0.4"/></g>`,
}

const figure = (side, map, states = {}, caption) => `
<figure>
  <svg viewBox="0 0 ${VIEW.w} ${VIEW.h}">
    <defs><clipPath id="c-${caption.replace(/\W/g, '')}">
      <path d="${HALF}"/><path d="${HALF}" transform="${MIRROR}"/>
    </clipPath></defs>
    <g transform="translate(${SHADOW.dx},${SHADOW.dy})" fill="#0F0F12">
      <path d="${HALF}"/><path d="${HALF}" transform="${MIRROR}"/>
    </g>
    <g clip-path="url(#c-${caption.replace(/\W/g, '')})">
      <rect x="0" y="0" width="${VIEW.w}" height="${VIEW.h}" fill="#E8E4D8"/>
      ${Object.entries(map).map(([code, s]) => el(s, `z ${states[code] ?? ''}`)).join('')}
    </g>
    <path class="edge" d="${HALF}"/><path class="edge" d="${HALF}" transform="${MIRROR}"/>
    ${DECOR[side]}
    ${Object.entries(states).filter(([, k]) => k !== 'sel').map(([code, k]) =>
      `<circle cx="${map[code].cx}" cy="${map[code].cy}" r="3.4" fill="${k === 'flag' ? '#FF6B5C' : '#34BBC0'}" stroke="#fff" stroke-width="1.4"/>`).join('')}
  </svg>
  <figcaption>${caption}</figcaption>
</figure>`

const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#FAF9F6;font:12px "Helvetica Neue",system-ui;display:flex;gap:10px;padding:14px}
svg{width:200px;height:auto}
.z{fill:none;stroke:#0F0F12;stroke-opacity:.3;stroke-width:1.5}
.sel{fill:#34BBC0;stroke:#34BBC0;stroke-opacity:1}
.log{fill:color-mix(in srgb,#34BBC0 34%,white);stroke:#34BBC0;stroke-opacity:.9;stroke-width:1.8}
.flag{fill:color-mix(in srgb,#FF6B5C 34%,white);stroke:#FF6B5C;stroke-opacity:.9;stroke-width:2}
.edge{fill:none;stroke:#0F0F12;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.ink{fill:#5C6A86}
figure{margin:0}figcaption{text-align:center;font-weight:700;margin-top:4px}
</style>
${figure('front', FRONT, {}, 'fronte')}
${figure('back', BACK, {}, 'retro')}
${figure('front', FRONT, { knee_l: 'sel', core: 'log', shoulders: 'log' }, 'scelta + segnate')}
${figure('back', BACK, { calf_r: 'flag', lower_back: 'log' }, 'bandiera rossa')}`

const page = join(tmpdir(), 'bab-bodymap.html')
writeFileSync(page, html)
execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--screenshot=${out}`, '--window-size=900,470', `file://${page}`,
], { stdio: 'ignore' })

console.log(
  `✅ ${out}\n   ${Object.keys(FRONT).length} zone sul fronte, ${Object.keys(BACK).length} sul retro — lette da body-shapes.ts`,
)
