import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/*
 * Il service worker serve a due cose: rendere il prototipo installabile ("aggiungi
 * a home") cosi' si apre a schermo intero senza barre del browser, e farlo partire
 * anche senza rete. In sviluppo NON va registrato: si metterebbe in mezzo all'HMR.
 */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}

/*
 * ...e in sviluppo va tolto di mezzo. Un service worker registrato da una
 * `vite preview` sulla stessa origine resta attivo anche sul dev server e
 * continua a servire la build vecchia: sembra che le modifiche non arrivino.
 * (Il preview ora sta su una porta sua, ma chi l'ha gia' registrato se lo
 * ritroverebbe comunque.)
 */
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()))
}
