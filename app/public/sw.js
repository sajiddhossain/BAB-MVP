/*
 * Il lavoratore di servizio: quello che fa esistere l'app quando la rete no.
 *
 * ── DUE REGOLE, E BASTA ────────────────────────────────────────────────────
 *
 * 1. I file sotto `/assets/` hanno il codice del contenuto nel nome: se il
 *    file cambia, cambia il nome. Quindi quello in cache e' per definizione
 *    ancora giusto, e si serve da li' senza nemmeno chiedere alla rete.
 *
 * 2. Tutto il resto — la pagina, il manifest, le icone — si chiede prima alla
 *    rete, e la cache e' la rete di sicurezza. Cosi' chi apre l'app col campo
 *    ha sempre l'ultima versione, e chi la apre senza ha comunque un'app.
 *
 * Non c'e' un elenco di file da precaricare. Vorrebbe dire generarlo a ogni
 * build e tenerlo allineato ai nomi con il codice dentro: con queste due
 * regole la cache si riempie da sola visitando l'app, che e' quello che fa
 * chiunque prima di trovarsi senza campo.
 *
 * ── COSA NON PASSA DA QUI ──────────────────────────────────────────────────
 * Tutto quello che non e' di questa origine, cioe' Supabase. Una risposta del
 * database messa in cache e riservata piu' tardi sarebbe un dato vecchio
 * spacciato per nuovo, e su un check-in vorrebbe dire mostrare "gia' fatto"
 * per una cosa che nel database non c'e'. I salvataggi che non partono li
 * tiene la app, in una coda sua, dove sa cosa sono.
 */

const CACHE = 'bab-v1'

/*
 * Una cosa sola si precarica: la pagina.
 *
 * Tutti gli indirizzi dell'app — `/casa`, `/parole`, `/sessione/checkin/ritmo`
 * — sono quella stessa pagina, e la strada la legge poi il router. Senza
 * precaricarla, senza rete si aprirebbero solo gli indirizzi gia' visitati da
 * quel telefono: chi ha aperto solo la home non potrebbe tornare al check-in.
 */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.add('/'))
      // se la pagina non si scarica adesso, si prendera' visitandola: non e'
      // un motivo per non installare il lavoratore
      .catch(() => {}),
  )
  // la versione nuova prende il posto della vecchia senza aspettare che si
  // chiudano tutte le schede: su un telefono la scheda vecchia puo' restare
  // aperta per settimane
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const vecchie = (await caches.keys()).filter((k) => k !== CACHE)
      await Promise.all(vecchie.map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (e) => {
  const richiesta = e.request
  if (richiesta.method !== 'GET') return

  const url = new URL(richiesta.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(dallaCacheSennoDallaRete(richiesta))
    return
  }

  e.respondWith(dallaReteSennoDallaCache(richiesta))
})

async function dallaCacheSennoDallaRete(richiesta) {
  const trovata = await caches.match(richiesta)
  if (trovata) return trovata
  const risposta = await fetch(richiesta)
  if (risposta.ok) void (await caches.open(CACHE)).put(richiesta, risposta.clone())
  return risposta
}

async function dallaReteSennoDallaCache(richiesta) {
  try {
    const risposta = await fetch(richiesta)
    if (risposta.ok) void (await caches.open(CACHE)).put(richiesta, risposta.clone())
    return risposta
  } catch (guaio) {
    const trovata = await caches.match(richiesta)
    if (trovata) return trovata
    /*
     * Un indirizzo dentro all'app — `/casa`, `/sessione/checkin/ritmo` — non
     * e' un file: e' la stessa pagina, e la strada la legge poi il router. Chi
     * arriva qui senza rete e senza quella pagina in cache non ha mai aperto
     * l'app da questo telefono, e allora non c'e' niente da servire.
     */
    if (richiesta.mode === 'navigate') {
      const pagina = await caches.match('/')
      if (pagina) return pagina
    }
    throw guaio
  }
}
