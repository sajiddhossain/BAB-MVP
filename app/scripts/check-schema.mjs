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
import { readFileSync, existsSync } from 'node:fs'
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

// ── 5 · la dashboard squadra legge solo dalle viste ─────────────────────────
// La regola R2 vive nelle colonne delle viste. Se una query dello staff
// interroga una tabella di base, quella garanzia sparisce e nessuno se ne
// accorge finché non finisce una nota di un'atleta davanti al suo coach.
const coachFile = join(root, 'src/lib/coach.ts')
if (existsSync(coachFile)) {
  const coach = readFileSync(coachFile, 'utf8').replace(/\/\/.*$/gm, '')
  // `team_staff` e `teams` sono ammesse: dicono di quali squadre fa parte CHI
  // sta guardando, e non contengono nessun dato delle atlete.
  const ALLOWED = new Set(['team_staff', 'teams', 'team_sessions', 'team_events'])
  for (const m of coach.matchAll(/\.from\(['"](\w+)['"]\)/g)) {
    const table = m[1]
    if (table.startsWith('coach_') || ALLOWED.has(table)) continue
    errors.push(`coach.ts interroga "${table}": lo staff legge solo dalle viste coach_*.`)
  }
  for (const col of FREE_TEXT) {
    if (new RegExp(`['"\\s,]${col}['"\\s,]`).test(coach)) {
      errors.push(`coach.ts nomina "${col}", che è testo libero e non deve arrivare allo staff.`)
    }
  }
}

// ── 6 · le colonne chieste dalla dashboard esistono davvero ────────────────
// Non sostituisce l'esecuzione contro il database, ma prende la classe di
// errore più probabile: una colonna scritta male o che nella vista non c'è.
// Senza database non si scoprirebbe fino al primo coach che apre la pagina.
if (existsSync(coachFile)) {
  const coach = readFileSync(coachFile, 'utf8')
  /** Le colonne di ogni vista, lette dalla sua definizione. */
  const cols = {}
  for (const chunk of code.split(/create or replace view public\./).slice(1)) {
    const name = chunk.split(/\s/)[0]
    const body = chunk.slice(chunk.indexOf('as'), chunk.indexOf(';'))
    const selectPart = body.slice(0, body.search(/\bfrom\b/))
    cols[name] = new Set(
      selectPart
        .replace(/^\s*as\s+select/i, '')
        .split(',')
        .map((c) => {
          const asAlias = c.match(/\bas\s+(\w+)\s*$/i)
          if (asAlias) return asAlias[1]
          const last = c.trim().split(/[.\s]/).pop()
          return (last || '').trim()
        })
        .filter((c) => /^\w+$/.test(c)),
    )
  }
  for (const m of coach.matchAll(/\.from\(['"](coach_\w+)['"]\)\s*\n?\s*\.select\(\s*['"]([^'"]+)['"]/g)) {
    const [, view, list] = m
    const known = cols[view]
    if (!known) { errors.push(`coach.ts interroga la vista "${view}", che non esiste nello schema.`); continue }
    for (const col of list.split(',').map((c) => c.trim()).filter(Boolean)) {
      if (!known.has(col)) errors.push(`coach.ts chiede "${col}" a ${view}, che non ce l'ha.`)
    }
  }
}

// ── 7 · le tabelle scritte dall'atleta hanno la chiave generata sul client ──
// La coda di sincronizzazione è idempotente SOLO se l'id nasce sul telefono.
// Con una chiave assegnata dal server, un inserimento che arriva ma la cui
// risposta si perde — il campo che cade a metà richiesta, in palestra —
// viene ritentato e crea una SECONDA riga: l'atleta si ritrova due volte lo
// stesso polpaccio e nessuno se ne accorge. È anche ciò che permette
// all'idratazione di riconoscere una riga scaricata come la stessa riga
// creata qui, invece che come una copia.
const dbFile = join(root, 'src/lib/db.ts')
if (existsSync(dbFile)) {
  const dbSrc = readFileSync(dbFile, 'utf8')
  const block = dbSrc.slice(dbSrc.indexOf('export const TABLES'))
  const written = [...block.slice(0, block.indexOf(']')).matchAll(/'(\w+)'/g)].map((m) => m[1])
  if (written.length === 0) errors.push('db.ts: nessuna tabella in TABLES — il controllo delle chiavi non ha guardato niente.')

  // ── 8 · l'export porta via TUTTO ──────────────────────────────────────────
  // §9: i dati sono suoi. Se qualcuno aggiunge una tabella e si dimentica di
  // `export_my_data`, l'export continua a funzionare e a sembrare completo —
  // semplicemente le restituisce meno di quello che abbiamo. È il tipo di
  // buco che si scopre solo quando qualcuno chiede i propri dati sul serio.
  const exp = code.slice(code.indexOf('create or replace function public.export_my_data'))
  const body = exp.slice(0, exp.indexOf('$$;', exp.indexOf('$$') + 2))
  for (const table of written) {
    if (!body.includes(`public.${table} `)) {
      errors.push(`export_my_data non esporta "${table}": l'atleta non riavrebbe tutti i suoi dati.`)
    }
  }

  for (const table of written) {
    const i = code.indexOf(`create table if not exists public.${table} (`)
    if (i === -1) { errors.push(`db.ts scrive "${table}", che nello schema non esiste.`); continue }
    const firstCol = code.slice(i, code.indexOf(';', i)).split('\n')[1] ?? ''
    if (!/\buuid\b/.test(firstCol)) {
      errors.push(`${table}: la chiave non è uuid generato sul client — un reinvio creerebbe una riga doppia.`)
    }
  }

  // E l'id deve finire DENTRO la riga, non solo nella chiave locale: è la riga
  // che viene spedita.
  const repoFile = join(root, 'src/lib/repo.ts')
  if (existsSync(repoFile)) {
    const repo = readFileSync(repoFile, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    for (const m of repo.matchAll(/db\.put\('(\w+)',\s*(\w+),\s*([\s\S]*?)\},/g)) {
      const [, table, key, row] = m
      if (table === 'athletes') continue        // la riga È il profilo, l'id ce l'ha già
      if (!new RegExp(`(^|[{,\\s])id(\\s*[,:}]|\\s*$)`, 'm').test(row) && !row.includes(`id: ${key}`)) {
        errors.push(`repo.ts: la riga scritta in "${table}" non contiene l'id — il server ne genererebbe uno suo.`)
      }
    }
  }
}

if (errors.length) {
  console.error('\n🔴 schema.sql\n')
  for (const e of errors) console.error('  · ' + e)
  console.error(`\n${errors.length} problema/i.\n`)
  process.exit(1)
}

const n = views.length
console.log(`✅ schema.sql — ${n} viste staff: tutte filtrate, nessun testo libero esposto.`)
