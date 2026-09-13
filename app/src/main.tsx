// per primo, prima di ogni modulo che legge le sue copie: vedi il file
import './lib/azzeramento'
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
import { Rete } from './ui/Rete'
import { IN_ANTEPRIMA } from './lib/sviluppo'
import { ascoltaAnteprima } from './lib/scritte'
import { accendiTocco } from './lib/tocco'
import { accendiCoda, accendiVetrina } from './lib/sessione'
import { accendiServizio } from './lib/servizio'

/*
 * L'anteprima dell'amministrazione dei testi.
 *
 * Questa stessa app gira dentro a una cornice nella pagina di
 * amministrazione. La' dentro le serve una giornata finta da mostrare — se no
 * meta' delle scritte non compare, perche' parlano di sensazioni che nessuno
 * ha segnato — e un orecchio per le bozze che arrivano mentre qualcuno
 * scrive.
 */
if (IN_ANTEPRIMA) {
  accendiVetrina()
  ascoltaAnteprima()
  accendiTocco()
}

accendiServizio()
/* i salvataggi rimasti senza campo ripartono da soli */
accendiCoda()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Rete>
      <BrowserRouter>
        <LinguaProvider>
          <App />
        </LinguaProvider>
      </BrowserRouter>
    </Rete>
  </StrictMode>,
)
