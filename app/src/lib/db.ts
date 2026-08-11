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
const DB_VERSION = 2

/** Righe già scritte in locale, per leggere senza rete. */
const RECORDS = 'records'
/** Inserimenti non ancora arrivati al server. */
const PENDING = 'pending'
/**
 * Qualche riga di stato dell'archivio — oggi solo: se l'idratazione iniziale è
 * già stata fatta su questo dispositivo.
 *
 * 🔴 Sta QUI e non in `localStorage` di proposito. I due archivi si possono
 * cancellare separatamente: se il segnaposto vivesse fuori e IndexedDB venisse
 * svuotato, l'app crederebbe di aver già scaricato tutto e lascerebbe
 * un'atleta davanti a una app vuota con tre mesi di dati sul server. Tenendolo
 * dentro, il segnaposto muore insieme ai dati che descrive.
 */
const META = 'meta'

/**
 * Solo le tabelle che l'app dell'atleta SCRIVE. Le tabelle di squadra
 * (`teams`, `team_staff`, `athlete_measurements`…) non sono qui di proposito:
 * l'app dell'atleta non deve poterci scrivere nemmeno per sbaglio, e altezza e
 * peso non devono neanche transitare da questo dispositivo.
 */
export const TABLES = [
  'athletes', 'consents', 'check_ins', 'body_signals',
  'red_flags', 'cycle_events', 'journey_progress', 'shares', 'ux_events',
  'athlete_schedule', 'athlete_events',
] as const

export type TableName = typeof TABLES[number]

export type PendingOp = {
  /**
   * Chiave della coda. Per un inserimento è l'uuid della riga — che è ciò che
   * lo rende idempotente. Per una modifica è l'uuid dell'OPERAZIONE: due
   * modifiche alla stessa riga sono due cose distinte e devono restare
   * tutt'e due in coda, nell'ordine in cui le ha fatte.
   */
  id: string
  /**
   * Assente vuol dire `insert`. Le code scritte prima che le modifiche
   * esistessero non hanno questo campo, e devono continuare a partire.
   */
  op?: 'insert' | 'update'
  /** Solo per `update`: la riga da modificare. */
  target?: string
  table: TableName
  /** Per `update` contiene SOLO i campi cambiati, non la riga intera. */
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
      // v2. Gli `if` qui sopra rendono l'aggiornamento additivo: chi aveva già
      // la v1 si ritrova il nuovo store e NON perde una riga — R10 vale anche
      // per l'archivio locale, non solo per il server.
      if (!db.objectStoreNames.contains(META)) {
        db.createObjectStore(META, { keyPath: 'key' })
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

/**
 * Modifica una riga già scritta.
 *
 * 🔴 In coda finiscono SOLO i campi cambiati, non la riga intera.
 *
 * Non è un'ottimizzazione: è l'unica cosa che rende sopportabile una modifica
 * fatta offline. Se si spedisse tutta la riga, cambiare il nome dal telefono
 * riscriverebbe anche lo sport e la data di nascita con i valori che il
 * telefono aveva in quel momento — e se nel frattempo li avesse corretti dal
 * tablet, li perderebbe senza accorgersene. Mandando solo il campo toccato, due
 * modifiche a campi diversi si fondono da sole.
 *
 * Resta vero che due modifiche allo STESSO campo da due dispositivi si
 * sovrascrivono: vince l'ultima che arriva. Per un profilo è accettabile, e
 * l'alternativa — una cronologia di versioni per il nome — costa più di quanto
 * valga.
 */
export async function patch(
  table: TableName,
  id: string,
  changes: Record<string, unknown>,
): Promise<void> {
  if (Object.keys(changes).length === 0) return
  const key = `${table}:${id}`
  const cur = await tx<LocalRecord | undefined>(RECORDS, 'readonly', (s) => s.get(key))
  const next: LocalRecord = {
    key, table, id,
    row: { ...(cur?.row ?? { id }), ...changes },
    sortKey: cur?.sortKey ?? id,
  }
  await tx(RECORDS, 'readwrite', (s) => s.put(next))

  const op: PendingOp = {
    id: crypto.randomUUID(), op: 'update', target: id,
    table, row: changes, createdAt: Date.now(), attempts: 0,
  }
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

/**
 * Righe scaricate dal server: si scrivono in locale SENZA rientrare in coda.
 *
 * 🔴 Una transazione sola per tabella, non una `put` per riga: se la scheda si
 * chiude a metà, o l'archivio si riempie, o va tutto o non va niente. Mezza
 * settimana scritta è peggio di zero, perché sembra completa.
 */
export async function hydrate(
  table: TableName,
  rows: { id: string; row: Record<string, unknown>; sortKey: string }[],
): Promise<void> {
  if (rows.length === 0) return
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

/* ── segnaposto ─────────────────────────────────────────────────────────── */

export async function getMeta(key: string): Promise<string | undefined> {
  const r = await tx<{ key: string; value: string } | undefined>(
    META, 'readonly', (s) => s.get(key),
  )
  return r?.value
}

export async function setMeta(key: string, value: string): Promise<void> {
  await tx(META, 'readwrite', (s) => s.put({ key, value }))
}

/** Cancellazione locale: usata da "cancella il mio account" (§9). */
export async function wipe(): Promise<void> {
  await tx(RECORDS, 'readwrite', (s) => s.clear())
  await tx(PENDING, 'readwrite', (s) => s.clear())
  // Anche il segnaposto: altrimenti al prossimo accesso l'app crederebbe di
  // aver già scaricato tutto e mostrerebbe un archivio vuoto per sempre.
  await tx(META, 'readwrite', (s) => s.clear())
}
