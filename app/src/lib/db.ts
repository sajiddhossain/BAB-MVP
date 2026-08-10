/**
 * Archivio locale (IndexedDB).
 *
 * 🔴 Requisito, non rifinitura: in palestra spesso non c'è campo, ed è il posto
 * dove il check-in va fatto. L'app non chiede MAI alla rete il permesso di
 * registrare qualcosa (docs/06-implementazione/03-offline-e-sync.md).
 *
 * Il modello a EVENTI IMMUTABILI elimina il problema difficile della
 * sincronizzazione: un check-in non si modifica mai, quindi non esistono due
 * versioni della stessa riga e non c'è niente da fondere. Sincronizzare è una
 * coda di inserimenti, non un algoritmo di merge.
 *
 * Niente librerie: sono due object store e quattro operazioni.
 */

const DB_NAME = 'bab'
const DB_VERSION = 1

/** Righe già scritte in locale, per leggere senza rete. */
const RECORDS = 'records'
/** Inserimenti non ancora arrivati al server. */
const PENDING = 'pending'

/**
 * Solo le tabelle che l'app dell'atleta SCRIVE. Le tabelle di squadra
 * (`teams`, `team_staff`, `athlete_measurements`…) non sono qui di proposito:
 * l'app dell'atleta non deve poterci scrivere nemmeno per sbaglio, e altezza e
 * peso non devono neanche transitare da questo dispositivo.
 */
export type TableName =
  | 'athletes' | 'consents' | 'check_ins' | 'body_signals'
  | 'red_flags' | 'cycle_events' | 'journey_progress' | 'shares' | 'ux_events'
  | 'athlete_schedule' | 'athlete_events'

export type PendingOp = {
  /** UUID generato sul client: rende l'inserimento idempotente. */
  id: string
  table: TableName
  row: Record<string, unknown>
  createdAt: number
  attempts: number
  /** Valorizzato solo per errori NON di rete: quelli si mettono da parte. */
  lastError?: string
}

type LocalRecord = {
  key: string
  table: TableName
  id: string
  row: Record<string, unknown>
  /** Ordinamento locale: la data dell'atleta, non quella del server. */
  sortKey: string
}

let dbPromise: Promise<IDBDatabase> | null = null

/**
 * 🔴 Aprire IndexedDB può non finire mai.
 *
 * In navigazione privata, con lo storage bloccato, o quando un'altra scheda
 * tiene aperta una versione vecchia del database, `open()` non chiama né
 * success né error: resta lì. Senza una via d'uscita l'app mostra "un
 * attimo…" per sempre — che è il modo peggiore di fallire, perché sembra un
 * problema di rete e lei aspetta.
 *
 * Meglio fallire in fretta e dichiararlo: chi chiama ha già un `catch`, e le
 * schermate degradano a "non c'è ancora niente" invece di girare a vuoto.
 */
const OPEN_TIMEOUT_MS = 5_000

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    const bail = setTimeout(
      () => reject(new Error('indexeddb-timeout')),
      OPEN_TIMEOUT_MS,
    )
    const settle = <T,>(fn: (v: T) => void) => (v: T) => { clearTimeout(bail); fn(v) }
    // Un'altra scheda con una versione diversa tiene la porta chiusa.
    req.onblocked = () => { clearTimeout(bail); reject(new Error('indexeddb-blocked')) }
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(RECORDS)) {
        const s = db.createObjectStore(RECORDS, { keyPath: 'key' })
        s.createIndex('byTable', 'table')
        s.createIndex('byTableSort', ['table', 'sortKey'])
      }
      if (!db.objectStoreNames.contains(PENDING)) {
        const s = db.createObjectStore(PENDING, { keyPath: 'id' })
        // Si inviano in ordine di creazione: body_signals e red_flags
        // referenziano il check-in.
        s.createIndex('byCreatedAt', 'createdAt')
      }
    }
    req.onsuccess = () => settle(resolve)(req.result)
    req.onerror = () => settle(reject)(req.error)
  })
  // Un fallimento non deve avvelenare i tentativi successivi: la prossima
  // chiamata riprova invece di ereditare la promessa rotta.
  dbPromise.catch(() => { dbPromise = null })
  return dbPromise
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode)
        const req = fn(t.objectStore(store))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      }),
  )
}

/* ── scrittura ──────────────────────────────────────────────────────────── */

/**
 * Scrive in locale e mette in coda, in una sola mossa.
 * La UI prosegue immediatamente: per l'atleta il check-in è finito.
 */
export async function put(
  table: TableName,
  id: string,
  row: Record<string, unknown>,
  sortKey: string,
): Promise<void> {
  const record: LocalRecord = { key: `${table}:${id}`, table, id, row, sortKey }
  await tx(RECORDS, 'readwrite', (s) => s.put(record))
  const op: PendingOp = { id, table, row, createdAt: Date.now(), attempts: 0 }
  await tx(PENDING, 'readwrite', (s) => s.put(op))
}

/* ── lettura ────────────────────────────────────────────────────────────── */

export async function list(
  table: TableName,
  opts: { limit?: number; desc?: boolean } = {},
): Promise<Record<string, unknown>[]> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const t = db.transaction(RECORDS)
    const idx = t.objectStore(RECORDS).index('byTableSort')
    const range = IDBKeyRange.bound([table, ''], [table, '￿'])
    const out: Record<string, unknown>[] = []
    const req = idx.openCursor(range, opts.desc ? 'prev' : 'next')
    req.onsuccess = () => {
      const cur = req.result
      if (!cur || (opts.limit && out.length >= opts.limit)) return resolve(out)
      out.push((cur.value as LocalRecord).row)
      cur.continue()
    }
    req.onerror = () => reject(req.error)
  })
}

export async function get(table: TableName, id: string) {
  const r = await tx<LocalRecord | undefined>(RECORDS, 'readonly', (s) => s.get(`${table}:${id}`))
  return r?.row
}

/* ── coda ───────────────────────────────────────────────────────────────── */

export async function pending(): Promise<PendingOp[]> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const idx = db.transaction(PENDING).objectStore(PENDING).index('byCreatedAt')
    const req = idx.getAll()
    req.onsuccess = () => resolve(req.result as PendingOp[])
    req.onerror = () => reject(req.error)
  })
}

export async function clearPending(id: string): Promise<void> {
  await tx(PENDING, 'readwrite', (s) => s.delete(id))
}

export async function markAttempt(op: PendingOp, error?: string): Promise<void> {
  const next: PendingOp = { ...op, attempts: op.attempts + 1, lastError: error }
  await tx(PENDING, 'readwrite', (s) => s.put(next))
}

/** Righe scaricate dal server: si scrivono in locale SENZA rientrare in coda. */
export async function hydrate(
  table: TableName,
  rows: { id: string; row: Record<string, unknown>; sortKey: string }[],
): Promise<void> {
  const db = await open()
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction(RECORDS, 'readwrite')
    const s = t.objectStore(RECORDS)
    for (const r of rows) {
      s.put({ key: `${table}:${r.id}`, table, id: r.id, row: r.row, sortKey: r.sortKey })
    }
    t.oncomplete = () => resolve()
    t.onerror = () => reject(t.error)
  })
}

/** Cancellazione locale: usata da "cancella il mio account" (§9). */
export async function wipe(): Promise<void> {
  await tx(RECORDS, 'readwrite', (s) => s.clear())
  await tx(PENDING, 'readwrite', (s) => s.clear())
}
