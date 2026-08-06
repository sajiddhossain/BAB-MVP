import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CopyProvider, DEFAULT_LOCALE } from './copy'
import './index.css'
import './lib/devtest'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CopyProvider locale={DEFAULT_LOCALE}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CopyProvider>
  </StrictMode>,
)
