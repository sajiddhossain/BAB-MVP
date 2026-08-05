import { Navigate, Route, Routes } from 'react-router-dom'
import TabBar from './components/TabBar'
import HurtButton from './components/HurtButton'
import Today from './screens/Today'
import Journey from './screens/Journey'
import Me from './screens/Me'

export default function App() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      {/* Acute red-flag capture is always one tap away — master doc §5.
          It lives above the router so it is reachable from every screen. */}
      <HurtButton />

      <main className="flex-1 px-4 pb-28">
        <Routes>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<Today />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/me" element={<Me />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </main>

      <TabBar />
    </div>
  )
}
