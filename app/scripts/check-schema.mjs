#!/usr/bin/env node
/**
 * Controlla lo schema per le due regole che il database NON può far rispettare
 * da solo, e che si dimenticano in fretta.
 *
 * 1. Ogni vista coach_* deve filtrare con is_staff_of / is_staff_of_team.
 *    Le viste girano con i privilegi del proprietario e bypassano la RLS: senza
 *    quella clausola, un coach legge l'intero database. Non è un dettaglio di
 *    stile, è l'unica cosa che regge.
 *
 * 2. Nessuna colonna di testo libero dentro una vista coach_*.
 *    R2: la squadra vede i dati dei due check-in, non le parole che lei scrive.
 *    La distinzione è fatta dall'elenco delle colonne, quindi va sorvegliata lì.
 *
 * Non sostituisce l'esecuzione dello schema: la sintassi la valida Postgres.
 * Serve a impedire che qualcuno aggiunga `note` alla vista senza accorgersene.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'supabase/schema.sql'), 'utf8')

/** I commenti nominano apposta le colonne vietate ("headspace_other NO: ..."). */
const code = src
  .split('\n')
  .map((l) => l.replace(/--.*$/, ''))
  .join('\n')

/** Colonne che contengono parole scritte da lei. Aggiungerne qui, mai alle viste. */
const FREE_TEXT = ['note', 'headspace_other', 'region_free', 'reflection', 'label', 'title']

const errors = []

// ── 1 e 2 · le viste dello staff ────────────────────────────────────────────
const views = code.split(/create or replace view public\./).slice(1)
if (views.length === 0) errors.push('Nessuna vista coach_* trovata: lo staff non vedrebbe niente.')

for (const chunk of views) {
  const name = chunk.split(/\s/)[0]
  const body = chunk.split(';')[0]

  if (!/is_staff_of/.test(body)) {
    errors.push(`${name}: nessun filtro is_staff_of — la vista bypassa la RLS e mostra tutto.`)
  }
  for (const col of FREE_TEXT) {
    if (new RegExp(`[\\s,]${col}[\\s,]`).test(body)) {
      errors.push(`${name}: espone "${col}", che è testo libero. R2 dice di no.`)
    }
  }
}

// ── 3 · le definer devono avere search_path fissato ─────────────────────────
for (const chunk of code.split(/create or replace function public\./).slice(1)) {
  const name = chunk.split(/[\s(]/)[0]
  const head = chunk.split('$$')[0]
  if (/security definer/i.test(head) && !/search_path/i.test(head)) {
    errors.push(`${name}: security definer senza search_path — dirottabile.`)
  }
}

// ── 4 · altezza e peso non devono mai essere leggibili dall'atleta ──────────
if (/create policy[^;]*on public\.athlete_measurements[^;]*auth\.uid\(\)/.test(code)) {
  errors.push('athlete_measurements: una policy nomina auth.uid() — R5 dice che l\'atleta non le vede.')
}

if (errors.length) {
  console.error('\n🔴 schema.sql\n')
  for (const e of errors) console.error('  · ' + e)
  console.error(`\n${errors.length} problema/i.\n`)
  process.exit(1)
}

const n = views.length
console.log(`✅ schema.sql — ${n} viste staff: tutte filtrate, nessun testo libero esposto.`)
