#!/usr/bin/env node
/**
 * Scarica come PNG le schermate vere di un file Figma — i frame a grandezza
 * telefono, non i singoli pezzi (bottoni, icone, zone della mappa corporea).
 *
 * "Schermata vera" = un FRAME con dimensioni da telefono (330–460px di
 * larghezza, almeno 600px di altezza). È un'euristica, non una regola di
 * Figma: separa le ~12-20 schermate intere dai ~200 frame totali del file,
 * la maggior parte dei quali sono componenti minuscoli.
 *
 * Uso:
 *   node scripts/figma-export-screens.mjs <url-o-file-key> <cartella-destinazione> [--page="Page 1"] [--scale=2]
 *
 * Token da .env.figma o FIGMA_TOKEN, come gli altri script figma-*.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

function tokenFromEnvFile() {
  try {
    const path = fileURLToPath(new URL('../.env.figma', import.meta.url))
    const line = readFileSync(path, 'utf8').split('\n').find((l) => l.startsWith('FIGMA_TOKEN='))
    return line?.slice('FIGMA_TOKEN='.length).trim()
  } catch { return undefined }
}

const token = process.env.FIGMA_TOKEN || tokenFromEnvFile()
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')),
)
const [urlArg, destArg] = args

if (!token) { console.error('Manca il token (app/.env.figma o FIGMA_TOKEN).'); process.exit(1) }
if (!urlArg || !destArg) {
  console.error('Uso: node scripts/figma-export-screens.mjs <url-o-file-key> <cartella-destinazione> [--page="Page 1"] [--scale=2]')
  process.exit(1)
}

function fileKeyFrom(input) {
  const m = input.match(/figma\.com\/(?:design|file|proto)\/([a-zA-Z0-9]+)/)
  return m ? m[1] : input
}
const fileKey = fileKeyFrom(urlArg)
const pageName = flags.page || 'Page 1'
const scale = flags.scale || '2'

const sanitize = (name) => name.replace(/[/\\?%*:|"<>]/g, '-').trim()

async function get(url) {
  const res = await fetch(url, { headers: { 'X-Figma-Token': token } })
  if (!res.ok) throw new Error(`Figma ha risposto ${res.status}: ${await res.text()}`)
  return res.json()
}

console.log('Leggo la struttura del file...')
const doc = await get(`https://api.figma.com/v1/files/${fileKey}?depth=6`)
const page = doc.document.children.find((p) => p.name === pageName)
if (!page) {
  console.error(`Pagina "${pageName}" non trovata. Pagine disponibili: ${doc.document.children.map((p) => p.name).join(', ')}`)
  process.exit(1)
}

const screens = []
function walk(node) {
  if (node.type === 'FRAME') {
    const bb = node.absoluteBoundingBox || {}
    if (bb.width >= 330 && bb.width <= 460 && bb.height >= 600) {
      screens.push({ id: node.id, name: node.name })
    }
  }
  for (const c of node.children || []) walk(c)
}
walk(page)

if (screens.length === 0) {
  console.log('Nessuna schermata trovata con queste dimensioni.')
  process.exit(0)
}
console.log(`Trovate ${screens.length} schermate. Chiedo le immagini a Figma...`)

mkdirSync(destArg, { recursive: true })

// L'API images accetta più id per chiamata, ma teniamo i lotti piccoli per
// restare sotto il limite di lunghezza dell'URL.
const BATCH = 40
const urlById = {}
for (let i = 0; i < screens.length; i += BATCH) {
  const batch = screens.slice(i, i + BATCH)
  const ids = batch.map((s) => s.id).join(',')
  const imgRes = await get(`https://api.figma.com/v1/images/${fileKey}?ids=${ids}&format=png&scale=${scale}`)
  if (imgRes.err) throw new Error(imgRes.err)
  Object.assign(urlById, imgRes.images)
}

console.log('Scarico i PNG...')
const used = new Set()
let ok = 0
for (const s of screens) {
  const url = urlById[s.id]
  if (!url) { console.error(`  ✗ ${s.name} — Figma non ha restituito un'immagine (frame vuoto?)`); continue }
  let base = sanitize(s.name) || s.id
  let filename = `${base}.png`
  let n = 2
  while (used.has(filename)) { filename = `${base} (${n}).png`; n++ }
  used.add(filename)

  const imgRes = await fetch(url)
  const buf = Buffer.from(await imgRes.arrayBuffer())
  writeFileSync(join(destArg, filename), buf)
  console.log(`  ✓ ${filename}`)
  ok++
}

console.log(`\nFatto: ${ok}/${screens.length} schermate salvate in ${destArg}`)
