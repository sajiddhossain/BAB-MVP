#!/usr/bin/env node
/**
 * Misura testo per testo, invece di guardare il diff a occhio.
 *
 * Il diff pixel dice QUANTO sbagli, questo dice DOVE e DI QUANTO:
 * per ogni blocco di testo confronta estensione orizzontale e verticale
 * fra il render React e l'export Figma. Un Δ di 1px e' arrotondamento del
 * line box; un Δ di 5px e' il font o l'asse variabile sbagliato.
 *
 *   node scripts/measure.mjs <id>            # bande automatiche
 *   node scripts/measure.mjs <id> --bands    # elenca le bande trovate
 *
 * Richiede che `node scripts/diff.mjs <id>` sia gia' girato (legge out/diff).
 */
import { readFileSync, existsSync } from 'node:fs'
import { PNG } from 'pngjs'

const id = process.argv[2]
if (!id) {
  console.error('uso: node scripts/measure.mjs <id>')
  process.exit(2)
}

const p = (s) => `out/diff/${id}.${s}.png`
for (const f of ['mine', 'ref']) {
  if (!existsSync(p(f))) {
    console.error(`manca ${p(f)} — lancia prima: node scripts/diff.mjs ${id}`)
    process.exit(2)
  }
}

const load = (f) => PNG.sync.read(readFileSync(f))
const A = load(p('mine'))
const B = load(p('ref'))
const W = Math.min(A.width, B.width)
const H = Math.min(A.height, B.height)

const DARK = 140
const lum = (img, x, y) => {
  const i = (y * img.width + x) * 4
  return 0.299 * img.data[i] + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2]
}

/** Righe che contengono inchiostro: servono a trovare i blocchi da sole. */
function inkRows(img) {
  const rows = new Uint8Array(H)
  for (let y = 0; y < H; y++) {
    let n = 0
    for (let x = 0; x < W; x++) if (lum(img, x, y) < DARK) n++
    rows[y] = n > 2 ? 1 : 0
  }
  return rows
}

/** Raggruppa le righe con inchiostro in blocchi separati da almeno 4px di vuoto. */
function blocks(rows) {
  const out = []
  let start = -1
  let gap = 0
  for (let y = 0; y < H; y++) {
    if (rows[y]) {
      if (start < 0) start = y
      gap = 0
    } else if (start >= 0) {
      if (++gap >= 4) {
        out.push([start, y - gap])
        start = -1
      }
    }
  }
  if (start >= 0) out.push([start, H - 1])
  return out
}

function extent(img, y0, y1) {
  let xmin = 1e9
  let xmax = -1
  let ymin = 1e9
  let ymax = -1
  for (let y = y0; y <= y1; y++)
    for (let x = 0; x < W; x++)
      if (lum(img, x, y) < DARK) {
        if (x < xmin) xmin = x
        if (x > xmax) xmax = x
        if (y < ymin) ymin = y
        if (y > ymax) ymax = y
      }
  return xmax < 0 ? null : { xmin, xmax, w: xmax - xmin + 1, ymin, ymax, h: ymax - ymin + 1 }
}

// I blocchi li deriviamo dal riferimento: e' lui la verita'.
const bs = blocks(inkRows(B))

console.log(`\n${id} — ${bs.length} blocchi (riferimento: export Figma)\n`)
console.log('  y-range      mine w×h        ref w×h        Δleft  Δtop   Δw   Δh')
let worst = 0
for (const [y0, y1] of bs) {
  const a = extent(A, y0, y1)
  const b = extent(B, y0, y1)
  if (!a || !b) continue
  const d = [a.xmin - b.xmin, a.ymin - b.ymin, a.w - b.w, a.h - b.h]
  worst = Math.max(worst, ...d.map(Math.abs))
  const flag = d.some((v) => Math.abs(v) > 1) ? ' ←' : ''
  console.log(
    `  ${String(y0).padStart(3)}-${String(y1).padEnd(4)}` +
      `  ${String(a.w).padStart(3)}×${String(a.h).padEnd(3)}` +
      `     ${String(b.w).padStart(3)}×${String(b.h).padEnd(3)}` +
      `    ${String(d[0]).padStart(5)} ${String(d[1]).padStart(5)} ${String(d[2]).padStart(4)} ${String(d[3]).padStart(4)}${flag}`,
  )
}
console.log(`\n  scostamento massimo: ${worst}px  ${worst <= 1 ? '(arrotondamento, ok)' : '(da correggere)'}\n`)
