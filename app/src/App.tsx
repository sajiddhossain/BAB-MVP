import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './screens/Onboarding'
import { Sessione } from './screens/Sessione'
import { Parole } from './screens/Parole'
import { Casa } from './screens/Casa'
import { Prossimamente } from './screens/Prossimamente'
import { Amministrazione } from './screens/Amministrazione'
import { Guardia } from './screens/Guardia'

export function App() {
  return (
    <Guardia>
      <Routes>
        <Route path="/onboarding/:id" element={<Onboarding />} />
        <Route path="/casa" element={<Casa />} />
        {/* :tipo e' `checkin` o `checkout`; :id e' il passo dentro a quel giro */}
        <Route path="/sessione/:tipo/:id" element={<Sessione />} />
        <Route path="/sessione/:tipo" element={<Sessione />} />
        {/* il glossario delle sedici parole: ci si arriva dal foglio, ma ha
            anche un indirizzo suo perche' e' una cosa che si va a rileggere */}
        <Route path="/parole" element={<Parole />} />
        {/* i testi dell'app, per chi li scrive: entra solo chi sta in
            `platform_admins`, e a dirlo e' il database */}
        <Route path="/admin" element={<Amministrazione />} />
        <Route path="/percorso" element={<Prossimamente titolo="Percorso" />} />
        <Route path="/storico" element={<Prossimamente titolo="Storico" />} />
        <Route path="/profilo" element={<Prossimamente titolo="Profilo" profilo />} />
        <Route path="*" element={<Navigate to="/onboarding/accesso" replace />} />
      </Routes>
    </Guardia>
  )
}
