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
import Roster from './screens/team/Roster'
import TeamAthlete from './screens/team/Athlete'
import { useSession } from './lib/session'
import { useHydration } from './lib/hydrate'
import { getProfile } from './lib/repo'
import { useCopy } from './copy'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function App() {
  const { userId, loading, connected } = useSession()
  const { pathname } = useLocation()
  /**
   * 🔴 Un coach NON è un'atleta: non ha un profilo, non fa check-in, e non
   * deve passare dall'onboarding. Senza questa deviazione il gate del
   * profilo lo intrappolerebbe in una procedura scritta per una tredicenne.
   */
  const isTeam = pathname.startsWith('/team')
  const t = useCopy()
  /**
   * 🔴 L'idratazione viene PRIMA del profilo, e l'ordine è tutto.
   *
   * Il gate qui sotto guarda se il profilo esiste in locale. Su un telefono
   * nuovo non c'è ancora, quindi senza idratazione un'atleta che rientra
   * verrebbe rimandata a rifare l'onboarding — consenso, data di nascita,
   * stato del ciclo — e il profilo che ne esce finirebbe in coda come
   * inserimento, rifiutato dal server come duplicato e messo da parte in
   * silenzio.
   */
  const hydration = useHydration(userId)
  /** `null` = non ancora controllato. */
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)

  useEffect(() => {
    if (!userId || hydration.state !== 'done') { setHasProfile(null); return }
    let alive = true
    getProfile(userId)
      .then((p) => { if (alive) setHasProfile(Boolean(p)) })
      .catch(() => { if (alive) setHasProfile(false) })
    return () => { alive = false }
  }, [userId, hydration.state])

  // Finché Supabase non è collegato l'app gira in locale, senza accesso: è la
  // stessa scelta di `lib/supabase.ts`, e serve a poterla sviluppare e provare
  // prima che il progetto esista.
  if (connected && loading) {
    return <p className="p-8 text-center text-[15px] text-[var(--color-ink-soft)]">{t.common.loading}</p>
  }
  if (connected && !userId) return <SignIn />

  // Il primo accesso su un dispositivo scarica quello che c'è già. È l'unico
  // momento in cui BAB pretende la rete, quindi lo dice invece di girare a
  // vuoto — e se non ce la fa non prosegue: andare avanti significherebbe
  // rimandare all'onboarding chi l'ha già fatto.
  if (userId && hydration.state === 'error') {
    return (
      <section className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center gap-4 px-6">
        <h1 className="font-display text-[24px]">{t.hydration.errorTitle}</h1>
        <p className="text-[15px] text-[var(--color-ink-soft)]">{t.hydration.errorBody}</p>
        <button type="button" onClick={hydration.retry}
                className="bab-pill self-start px-5 py-2.5 text-[15px]"
                style={{ background: 'var(--color-lime)' }}>
          {t.hydration.retry}
        </button>
      </section>
    )
  }
  if (userId && hydration.state === 'running') {
    return (
      <section className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center gap-3 px-6">
        <h1 className="font-display text-[24px]">{t.hydration.title}</h1>
        <p className="text-[15px] text-[var(--color-ink-soft)]">{t.hydration.body}</p>
      </section>
    )
  }

  // 🔴 Senza profilo non si entra: l'onboarding è dove si raccolgono il
  // consenso e lo stato del ciclo, e senza quelli metà del prodotto non può
  // funzionare — né legalmente né tecnicamente.
  if (userId && hasProfile === false && !isTeam) {
    return <Onboarding onDone={() => setHasProfile(true)} />
  }
  if (userId && hasProfile === null && !isTeam) {
    return <p className="p-8 text-center text-[15px] text-[var(--color-ink-soft)]">{t.common.loading}</p>
  }

  // La dashboard squadra ha una sua impaginazione: niente tab dell'atleta,
  // niente pulsante «mi sono fatta male», e più larghezza — si guarda da un
  // portatile, non da un telefono in palestra.
  if (isTeam) {
    return (
      <Routes>
        <Route path="/team" element={<Roster />} />
        <Route path="/team/:athleteId" element={<TeamAthlete />} />
      </Routes>
    )
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
