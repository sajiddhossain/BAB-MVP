import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './screens/Onboarding'
import { Sessione } from './screens/Sessione'
import { Casa } from './screens/Casa'
import { Prossimamente } from './screens/Prossimamente'
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
        <Route path="/percorso" element={<Prossimamente titolo="Percorso" />} />
        <Route path="/storico" element={<Prossimamente titolo="Storico" />} />
        <Route path="/profilo" element={<Prossimamente titolo="Profilo" profilo />} />
        <Route path="*" element={<Navigate to="/onboarding/accesso" replace />} />
      </Routes>
    </Guardia>
  )
}
