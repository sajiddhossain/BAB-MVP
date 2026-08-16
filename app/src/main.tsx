import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { CopyProvider, type Locale } from './copy'
import { readLocale, writeLocale } from './lib/locale'
import { startSync } from './lib/sync'
import './index.css'
import './lib/devtest'

/**
 * La lingua vive qui, in cima a tutto: cambiarla deve ridisegnare l'app
 * intera, non solo la schermata da cui la si cambia.
 */
function Root() {
  const [locale, setLocale] = useState<Locale>(readLocale)

  /**
   * 🔴 Il battito della coda. `startSync` esisteva da sempre e NON LO CHIAMAVA
   * NESSUNO: la coda si svuotava solo quando lei scriveva qualcosa di nuovo,
   * perché ogni scrittura fa partire un giro per conto suo.
   *
   * Vuol dire che un check-in fatto in palestra senza campo restava fermo fino
   * al check-in successivo. Se quello era il giorno dopo, il suo allenamento
   * arrivava al server con un giorno di ritardo; se smetteva lì per una
   * settimana, restava sul telefono per una settimana — e se nel frattempo
   * cambiava telefono, spariva. Tutta la parte «riprova quando torna la rete»
   * era scritta, testata e mai accesa.
   *
   * Qui e non dentro `App`: deve girare finché l'app è aperta, non finché è
   * aperta una certa schermata.
   */
  useEffect(() => startSync(), [])

  return (
    <CopyProvider locale={locale} onLocale={(l) => { writeLocale(l); setLocale(l) }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CopyProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </StrictMode>,
)
