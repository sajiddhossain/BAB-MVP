import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './screens/Onboarding'
import { Casa } from './screens/Casa'
import { Guardia } from './screens/Guardia'

export function App() {
  return (
    <Guardia>
      <Routes>
        <Route path="/onboarding/:id" element={<Onboarding />} />
        <Route path="/casa" element={<Casa />} />
        <Route path="*" element={<Navigate to="/onboarding/accesso" replace />} />
      </Routes>
    </Guardia>
  )
}
