#!/usr/bin/env node
/**
 * Legge i commenti di un file Figma via API REST — nessun MCP di Figma offre
 * questa funzione (né quello ufficiale né TalkToFigma), quindi si passa
 * dall'endpoint diretto.
 *
 * Uso:
 *   node scripts/figma-comments.mjs <url-o-file-key>
 *
 * Il token si legge da `.env.figma` (accanto a questa cartella, ignorato da
 * git — vedi .gitignore) o, se preferisci non salvarlo su disco, dalla
 * variabile d'ambiente FIGMA_TOKEN. Non si scrive mai nel codice.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

function tokenFromEnvFile() {
  try {
    const path = fileURLToPath(new URL('../.env.figma', import.meta.url))
    const line = readFileSync(path, 'utf8').split('\n').find((l) => l.startsWith('FIGMA_TOKEN='))
    return line?.slice('FIGMA_TOKEN='.length).trim()
  } catch {
    return undefined
  }
}

const token = process.env.FIGMA_TOKEN || tokenFromEnvFile()
const arg = process.argv[2]

if (!token) {
  console.error(
    'Manca il token. Scrivilo in app/.env.figma (FIGMA_TOKEN=...) oppure esportalo: export FIGMA_TOKEN="il-tuo-token"',
  )
  process.exit(1)
}
if (!arg) {
  console.error('Uso: node scripts/figma-comments.mjs <url-o-file-key>')
  process.exit(1)
}

/** Da un URL tipo figma.com/design/ABC123/nome-file estrae "ABC123". Se è già una key, la lascia com'è. */
function fileKeyFrom(input) {
  const m = input.match(/figma\.com\/(?:design|file|proto)\/([a-zA-Z0-9]+)/)
  return m ? m[1] : input
}

const fileKey = fileKeyFrom(arg)

const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, {
  headers: { 'X-Figma-Token': token },
})

if (!res.ok) {
  console.error(`Figma ha risposto ${res.status}: ${await res.text()}`)
  process.exit(1)
}

const { comments } = await res.json()

if (!comments?.length) {
  console.log('Nessun commento su questo file.')
  process.exit(0)
}

// I commenti arrivano piatti, con `parent_id` per le risposte a thread: li
// raggruppo per thread principale così si legge come una conversazione.
const roots = comments.filter((c) => !c.parent_id)
const repliesOf = (id) => comments.filter((c) => c.parent_id === id)

for (const root of roots) {
  const node = root.client_meta?.node_id ? ` [nodo ${root.client_meta.node_id}]` : ''
  const resolved = root.resolved_at ? ' (risolto)' : ''
  console.log(`\n— ${root.user.handle}${node}${resolved}  id:${root.id}`)
  console.log(`  ${root.message}`)
  for (const reply of repliesOf(root.id)) {
    console.log(`    ↳ ${reply.user.handle}: ${reply.message}`)
  }
}
