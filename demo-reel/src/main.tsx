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
