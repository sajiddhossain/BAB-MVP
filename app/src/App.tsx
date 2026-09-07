import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './screens/Onboarding'
import { Casa } from './screens/Casa'

export function App() {
  return (
    <Routes>
      <Route path="/onboarding/:id" element={<Onboarding />} />
      <Route path="/casa" element={<Casa />} />
      <Route path="*" element={<Navigate to="/onboarding/accesso" replace />} />
    </Routes>
  )
}
