#!/usr/bin/env node
/** Cancella un commento (o una risposta) Figma. Stesso token di figma-comments.mjs. */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

function tokenFromEnvFile() {
  try {
    const path = fileURLToPath(new URL('../.env.figma', import.meta.url))
    const line = readFileSync(path, 'utf8').split('\n').find((l) => l.startsWith('FIGMA_TOKEN='))
    return line?.slice('FIGMA_TOKEN='.length).trim()
  } catch { return undefined }
}

const token = process.env.FIGMA_TOKEN || tokenFromEnvFile()
const [, , arg, commentId] = process.argv
if (!token) { console.error('Manca il token (app/.env.figma o FIGMA_TOKEN).'); process.exit(1) }
if (!arg || !commentId) { console.error('Uso: node scripts/figma-delete-comment.mjs <url-o-file-key> <comment-id>'); process.exit(1) }

function fileKeyFrom(input) {
  const m = input.match(/figma\.com\/(?:design|file|proto)\/([a-zA-Z0-9]+)/)
  return m ? m[1] : input
}

const res = await fetch(`https://api.figma.com/v1/files/${fileKeyFrom(arg)}/comments/${commentId}`, {
  method: 'DELETE',
  headers: { 'X-Figma-Token': token },
})
if (!res.ok) { console.error(`Figma ha risposto ${res.status}: ${await res.text()}`); process.exit(1) }
console.log('Cancellato.')
