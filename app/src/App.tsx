import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './screens/Onboarding'
import { Casa } from './screens/Casa'
import { Prossimamente } from './screens/Prossimamente'
import { Guardia } from './screens/Guardia'

export function App() {
  return (
    <Guardia>
      <Routes>
        <Route path="/onboarding/:id" element={<Onboarding />} />
        <Route path="/casa" element={<Casa />} />
        <Route path="/percorso" element={<Prossimamente titolo="Percorso" />} />
        <Route path="/storico" element={<Prossimamente titolo="Storico" />} />
        <Route path="/profilo" element={<Prossimamente titolo="Profilo" profilo />} />
        <Route path="*" element={<Navigate to="/onboarding/accesso" replace />} />
      </Routes>
    </Guardia>
  )
}
