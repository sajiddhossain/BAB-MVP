import { Navigate, Route, Routes } from 'react-router-dom'
import TabBar from './components/TabBar'
import HurtButton from './components/HurtButton'
import Today from './screens/Today'
import Journey from './screens/Journey'
import Me from './screens/Me'
import SignIn from './screens/SignIn'
import { useSession } from './lib/session'
import { useCopy } from './copy'

export default function App() {
  const { userId, loading, connected } = useSession()
  const t = useCopy()

  // Finché Supabase non è collegato l'app gira in locale, senza accesso: è la
  // stessa scelta di `lib/supabase.ts`, e serve a poterla sviluppare e provare
  // prima che il progetto esista.
  if (connected && loading) {
    return <p className="p-8 text-center text-[15px] text-[var(--color-ink-soft)]">{t.common.loading}</p>
  }
  if (connected && !userId) return <SignIn />

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
