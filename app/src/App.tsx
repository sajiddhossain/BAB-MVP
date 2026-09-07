import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLogin } from './screens/AuthLogin'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthLogin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
