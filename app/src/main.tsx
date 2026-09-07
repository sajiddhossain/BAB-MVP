import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/700.css'
import './index.css'
import { App } from './App'
import { LinguaProvider } from './lib/lingua'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LinguaProvider>
        <App />
      </LinguaProvider>
    </BrowserRouter>
  </StrictMode>,
)
