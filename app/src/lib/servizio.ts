import { IN_ANTEPRIMA } from './sviluppo'

/**
 * Il lavoratore di servizio: quello che rende l'app installabile e apribile
 * senza rete. Cosa fa una volta acceso sta in `public/sw.js`.
 *
 * ── SOLO NELLE VERSIONI PUBBLICATE ─────────────────────────────────────────
 * Sul server di sviluppo una cache si metterebbe fra una modifica e il
 * vederla, e sarebbe la prima cosa a far dubitare di una correzione appena
 * fatta. E non dentro alla cornice dell'anteprima: li' l'app gira per farsi
 * guardare, non per essere usata.
 *
 * Se la registrazione non riesce non succede niente: l'app resta quella di
 * prima, solo che va soltanto online.
 */
export function accendiServizio(): void {
  if (!import.meta.env.PROD || IN_ANTEPRIMA) return
  if (!('serviceWorker' in navigator)) return

  // dopo il carico: registrarlo prima vorrebbe dire contendere la banda con
  // la pagina che si sta ancora aprendo
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
