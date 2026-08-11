#!/usr/bin/env node
/**
 * Verifica che ogni regione della mappa corporea sia disegnata dove dice di
 * essere, e che la figura non abbia buchi.
 *
 * Perché sono controlli e non commenti: i codici stanno in
 * `content/bodymap.ts` e le forme in `components/body-shapes.ts`. Se qualcuno
 * aggiunge una regione e dimentica la forma, **quella parte del corpo sparisce
 * dalla mappa senza che nessuno se ne accorga** — nessun errore, nessun
 * avviso, solo un punto che l'atleta non può più toccare per dire che le fa
 * male. Vale anche il contrario: una forma con un codice che non esiste più
 * scriverebbe nel database un valore che nessuno sa più leggere.
 *
 * Importa i moduli veri (Node ≥22 toglie i tipi da solo): niente espressioni
 * regolari sul sorgente, quindi il controllo non può divergere dal codice.
 */
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { REGIONS } = await import(join(root, 'src/content/bodymap.ts'))
const { FRONT, BACK, HALF, VIEW } = await import(join(root, 'src/components/body-shapes.ts'))

const errors = []

/** Tutte le coppie di coordinate di un tracciato, per ricavarne il riquadro. */
function pathBox(d) {
  const n = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
  const xs = n.filter((_, i) => i % 2 === 0)
  const ys = n.filter((_, i) => i % 2 === 1)
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
}

function box(s) {
  if (s.k === 'rect') return { x0: s.x, x1: s.x + s.w, y0: s.y, y1: s.y + s.h }
  const b = pathBox(s.d)
  return s.mirror ? { ...b, x0: VIEW.w - b.x1, x1: VIEW.w - b.x0 } : b
}

const yRange = (s) => { const b = box(s); return { y0: b.y0, y1: b.y1 } }

/**
 * In quale colonna sta una forma: quelle che attraversano l'asse sono il
 * tronco, le altre sono un arto destro o sinistro.
 *
 * Serve per il controllo dei buchi: il braccio copre in altezza tutto il
 * tronco, quindi mescolando le colonne un buco fra due fasce della pancia
 * risulterebbe "coperto" dal braccio e passerebbe inosservato.
 */
function column(s) {
  const b = box(s)
  if (b.x0 < VIEW.w / 2 && b.x1 > VIEW.w / 2) return 'centro'
  return b.x1 <= VIEW.w / 2 ? 'sinistra' : 'destra'
}

// ── 1 · ogni regione dichiarata è disegnata, e viceversa ────────────────────
for (const { code, side } of REGIONS) {
  const wantsFront = side === 'front' || side === 'both'
  const wantsBack = side === 'back' || side === 'both'
  if (wantsFront && !FRONT[code]) errors.push(`"${code}" è side:'${side}' ma non ha forma nella vista FRONTE.`)
  if (wantsBack && !BACK[code]) errors.push(`"${code}" è side:'${side}' ma non ha forma nella vista RETRO.`)
  if (side === 'none' && (FRONT[code] || BACK[code]))
    errors.push(`"${code}" è side:'none' ma è disegnato: dovrebbe essere un bottone, non una zona.`)
}
const known = new Set(REGIONS.map((r) => r.code))
for (const [view, map] of [['FRONTE', FRONT], ['RETRO', BACK]]) {
  for (const code of Object.keys(map)) {
    if (!known.has(code)) errors.push(`${view}: la forma "${code}" non corrisponde a nessuna regione.`)
  }
}

// ── 2 · nessuna fascia di corpo senza padrone ───────────────────────────────
// Le zone sono fasce ritagliate sulla sagoma. Se due fasce adiacenti smettono
// di combaciare — basta cambiare un'altezza e scordarsi la vicina — resta una
// striscia di corpo che non appartiene a nessuno: si vede bianca e non si può
// toccare. Da fuori sembra che la mappa "non prenda" proprio lì.
const body = pathBox(HALF)
for (const [view, map] of [['FRONTE', FRONT], ['RETRO', BACK]]) {
  const cols = { centro: [], sinistra: [], destra: [] }
  for (const s of Object.values(map)) cols[column(s)].push(yRange(s))

  let top = Infinity, bottom = -Infinity
  for (const [name, spans] of Object.entries(cols)) {
    if (!spans.length) { errors.push(`${view}: la colonna "${name}" non ha nessuna zona.`); continue }
    spans.sort((a, b) => a.y0 - b.y0)
    let reach = spans[0].y0
    for (const { y0, y1 } of spans) {
      if (y0 > reach + 0.01) errors.push(`${view}, colonna ${name}: nessuna zona copre la fascia y ${reach}–${y0}.`)
      reach = Math.max(reach, y1)
    }
    top = Math.min(top, spans[0].y0)
    bottom = Math.max(bottom, reach)
  }
  if (top > body.y0) errors.push(`${view}: il corpo comincia a y=${body.y0} ma la prima zona a y=${top}.`)
  if (bottom < body.y1) errors.push(`${view}: il corpo arriva a y=${body.y1} ma le zone si fermano a y=${bottom}.`)
}

// ── 3 · destra e sinistra sono speculari ────────────────────────────────────
// Il centro di una zona non è decorativo: ci finiscono il pallino di «già
// segnata» e l'onda del tocco. Un centro sbagliato mette il segno della gamba
// sinistra sulla gamba destra — e la mappa comincia a mentire su un lato.
for (const [view, map] of [['FRONTE', FRONT], ['RETRO', BACK]]) {
  for (const code of Object.keys(map)) {
    if (!code.endsWith('_l')) continue
    const twin = code.replace(/_l$/, '_r')
    if (!map[twin]) { errors.push(`${view}: "${code}" non ha il gemello "${twin}".`); continue }
    if (Math.abs(map[code].cx + map[twin].cx - VIEW.w) > 0.01)
      errors.push(`${view}: "${code}" e "${twin}" non sono speculari (${map[code].cx} e ${map[twin].cx}).`)
    if (map[code].cy !== map[twin].cy)
      errors.push(`${view}: "${code}" e "${twin}" stanno ad altezze diverse.`)
  }
}

// ── 4 · le due viste hanno gli stessi punti di repere ───────────────────────
// Se il ginocchio stesse a due altezze diverse davanti e dietro, la stessa
// altezza toccata sulle due facce darebbe due parti del corpo diverse.
for (const code of Object.keys(FRONT)) {
  if (!BACK[code]) continue
  const a = yRange(FRONT[code]), b = yRange(BACK[code])
  if (a.y0 !== b.y0 || a.y1 !== b.y1)
    errors.push(`"${code}" sta a y ${a.y0}–${a.y1} davanti e ${b.y0}–${b.y1} dietro: le due viste non combaciano.`)
}

if (errors.length) {
  console.error('\n🔴 mappa corporea\n')
  for (const e of errors) console.error('  · ' + e)
  console.error(`\n${errors.length} problema/i.\n`)
  process.exit(1)
}

console.log(
  `✅ mappa corporea — ${REGIONS.length} regioni: ${Object.keys(FRONT).length} sul fronte, ` +
  `${Object.keys(BACK).length} sul retro, nessuna fascia scoperta.`,
)
