import { Navigate, Route, Routes } from 'react-router-dom'
import TabBar from './components/TabBar'
import HurtButton from './components/HurtButton'
import Today from './screens/Today'
import Journey from './screens/Journey'
import Me from './screens/Me'
import Story from './screens/Story'
import CheckInPre from './screens/CheckInPre'
import CheckInPost from './screens/CheckInPost'
import SignIn from './screens/SignIn'
import Onboarding from './screens/Onboarding'
import { useSession } from './lib/session'
import { getProfile } from './lib/repo'
import { useCopy } from './copy'
import { useEffect, useState } from 'react'

export default function App() {
  const { userId, loading, connected } = useSession()
  const t = useCopy()
  /** `null` = non ancora controllato. */
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)

  useEffect(() => {
    if (!userId) { setHasProfile(null); return }
    let alive = true
    getProfile(userId)
      .then((p) => { if (alive) setHasProfile(Boolean(p)) })
      .catch(() => { if (alive) setHasProfile(false) })
    return () => { alive = false }
  }, [userId])

  // Finché Supabase non è collegato l'app gira in locale, senza accesso: è la
  // stessa scelta di `lib/supabase.ts`, e serve a poterla sviluppare e provare
  // prima che il progetto esista.
  if (connected && loading) {
    return <p className="p-8 text-center text-[15px] text-[var(--color-ink-soft)]">{t.common.loading}</p>
  }
  if (connected && !userId) return <SignIn />

  // 🔴 Senza profilo non si entra: l'onboarding è dove si raccolgono il
  // consenso e lo stato del ciclo, e senza quelli metà del prodotto non può
  // funzionare — né legalmente né tecnicamente.
  if (userId && hasProfile === false) {
    return <Onboarding onDone={() => setHasProfile(true)} />
  }
  if (userId && hasProfile === null) {
    return <p className="p-8 text-center text-[15px] text-[var(--color-ink-soft)]">{t.common.loading}</p>
  }

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
          <Route path="/story" element={<Story />} />
          <Route path="/checkin/pre" element={<CheckInPre />} />
          <Route path="/checkin/post" element={<CheckInPost />} />
          {/* Solo in sviluppo: serve a provare l'onboarding e a mostrarlo
              senza dover creare un account. `import.meta.env.DEV` è statico,
              quindi in produzione questa rotta non finisce nel bundle. */}
          {import.meta.env.DEV && (
            <Route path="/dev/onboarding" element={<Onboarding onDone={() => {}} />} />
          )}
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </main>

      <TabBar />
    </div>
  )
}
