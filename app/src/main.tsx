import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CopyProvider, type Locale } from './copy'
import { readLocale, writeLocale } from './lib/locale'
import './index.css'
import './lib/devtest'

/**
 * La lingua vive qui, in cima a tutto: cambiarla deve ridisegnare l'app
 * intera, non solo la schermata da cui la si cambia.
 */
function Root() {
  const [locale, setLocale] = useState<Locale>(readLocale)
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
    <Root />
  </StrictMode>,
)
