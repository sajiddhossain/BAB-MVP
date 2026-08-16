/**
 * Un freno lato app ai tentativi di accesso — codice a 6 cifre e richieste
 * del link. Sopravvive a un refresh (localStorage), non a un telefono diverso
 * né a chi chiama l'API di Supabase direttamente saltando l'app: quella
 * protezione vera sta nella dashboard di Supabase (rate limit + captcha), non
 * qui. Questo ferma solo chi prova a mano dall'interfaccia — che è comunque
 * il caso più comune di un fratello che prova a indovinare.
 *
 * 🔴 Le prime `freeTries` non bloccano niente: un codice digitato male per un
 * refuso non deve costare un'attesa. Da lì in poi l'attesa raddoppia a ogni
 * volta, fino a un tetto — così un tentativo isolato in più costa poco, ma
 * una lista di codici provati in fila costa sempre di più.
 */

type Entry = { attempts: number; lockedUntil: number }

const STORE_KEY = 'bab.rateLimit'

function read(): Record<string, Entry> {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') } catch { return {} }
}

function write(store: Record<string, Entry>) {
  // In navigazione privata `localStorage` può rifiutare la scrittura: niente
  // freno in quel caso, ma l'accesso non si deve rompere per questo.
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)) } catch { /* niente freno, niente crash */ }
}

const key = (scope: string, id: string) => `${scope}:${id.trim().toLowerCase()}`

/** Quanto manca al prossimo tentativo permesso, in millisecondi. 0 = via libera. */
export function lockedFor(scope: string, id: string): number {
  const e = read()[key(scope, id)]
  if (!e) return 0
  return Math.max(0, e.lockedUntil - Date.now())
}

/** Un uso della risorsa — un codice sbagliato, un link richiesto. */
export function recordAttempt(
  scope: string, id: string, freeTries: number, baseMs: number, capMs: number,
): void {
  const store = read()
  const k = key(scope, id)
  const prev = store[k] ?? { attempts: 0, lockedUntil: 0 }
  const attempts = prev.attempts + 1
  const over = attempts - freeTries
  const wait = over > 0 ? Math.min(capMs, baseMs * 2 ** (over - 1)) : 0
  store[k] = { attempts, lockedUntil: wait > 0 ? Date.now() + wait : 0 }
  write(store)
}

/** Un accesso riuscito: si riparte da zero per quell'indirizzo. */
export function resetAttempts(scope: string, id: string): void {
  const store = read()
  delete store[key(scope, id)]
  write(store)
}
