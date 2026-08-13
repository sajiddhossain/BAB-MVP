import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import TabBar from './components/TabBar'
import HurtButton from './components/HurtButton'
import Today from './screens/Today'
import Journey from './screens/Journey'
import Me from './screens/Me'
import Story from './screens/Story'
import Body from './screens/Body'
import BodySense from './screens/BodySense'
import SettingsIndex from './screens/settings/Index'
import SettingsProfile from './screens/settings/Profile'
import SettingsRhythm from './screens/settings/Rhythm'
import SettingsAgenda from './screens/settings/Agenda'
import AgendaDays from './screens/settings/AgendaDays'
import AgendaEvents from './screens/settings/AgendaEvents'
import SettingsLanguage from './screens/settings/Language'
import SettingsData from './screens/settings/Data'
import Diagnostics from './screens/settings/Diagnostics'
import SettingsAccount from './screens/settings/Account'
import CheckInPre from './screens/CheckInPre'
import CheckInPost from './screens/CheckInPost'
import SignIn from './screens/SignIn'
import Onboarding from './screens/Onboarding'
import Roster from './screens/team/Roster'
import Admin from './screens/admin/Admin'
import TeamAthlete from './screens/team/Athlete'
import { useSession } from './lib/session'
import { useHydration } from './lib/hydrate'
import { homeFor, useRole } from './lib/role'
import { getProfile } from './lib/repo'
import { adopt } from './lib/locale'
import { useCopy, useSetLocale } from './copy'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/** L'agenda allenamenti, montata su un indirizzo per sport (R3-bis). */
function AgendaDaysBySport() {
  const { sport } = useParams()
  return <AgendaDays kind="training" sport={sport ? decodeURIComponent(sport) : null} />
}

export default function App() {
  const { userId, loading, connected } = useSession()
  const { pathname } = useLocation()
  /**
   * 🔴 Un coach NON è un'atleta: non ha un profilo, non fa check-in, e non
   * deve passare dall'onboarding. Senza questa deviazione il gate del
   * profilo lo intrappolerebbe in una procedura scritta per una tredicenne.
   */
  const isTeam = pathname.startsWith('/team')
  /**
   * 🔴 Durante un check-in la barra delle tab sparisce. Non è pulizia: un
   * flusso a passi ha una sola strada avanti e una indietro, e tre destinazioni
   * sempre in fondo allo schermo sono tre modi di perdere quello che ha scritto
   * — che non è ancora salvato. La via d'uscita resta, ma è una sola e chiede
   * conferma (vedi `Step`).
   *
   * Il bottone «mi sono fatta male» invece resta: §5 dice sempre a un tocco, e
   * «sempre» comprende il mezzo del check-in.
   */
  const isFlow = pathname.startsWith('/checkin')
  const isAdmin = pathname.startsWith('/admin')
  /**
   * 🔴 «Come sta l'app» parla del DISPOSITIVO, non di chi lo tiene in mano:
   * la coda, l'archivio locale, la connessione. Serve a un'atleta quando non le
   * si salva niente, e serve a chi amministra mentre è al telefono con lei.
   * Rimandare un admin alla console proprio quando apre la diagnostica sarebbe
   * il momento peggiore per ricordargli chi è.
   */
  const isDiag = pathname === '/settings/diagnostica'
  const t = useCopy()

  /**
   * 🔴 Chi è entrato. Prima non se lo chiedeva nessuno: un coach finiva
   * nell'onboarding di una tredicenne, e l'unica strada per la sua dashboard
   * era scrivere `/team` a mano nella barra dell'indirizzo.
   */
  const { role, loading: roleLoading } = useRole(userId)
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
  /**
   * 🔴 Solo per le atlete. Lo staff non ha righe da scaricare — la dashboard
   * legge dal server a ogni apertura, di proposito — e farlo aspettare davanti
   * a nove richieste vuote sarebbe una schermata di attesa per niente. Si
   * aspetta di sapere chi è prima di partire: idratare e poi scoprire che era
   * un coach vorrebbe dire averlo già bloccato.
   */
  const hydration = useHydration(!roleLoading && role === 'athlete' ? userId : null)
  const setLocale = useSetLocale()
  /** `null` = non ancora controllato. */
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)

  useEffect(() => {
    if (!userId || role !== 'athlete' || hydration.state !== 'done') { setHasProfile(null); return }
    let alive = true
    getProfile(userId)
      .then((p) => {
        if (!alive) return
        setHasProfile(Boolean(p))
        // Telefono nuovo: se qui non ha mai scelto una lingua, si prende
        // quella del suo profilo invece di ripartire dall'italiano.
        const adopted = adopt(p?.locale)
        if (adopted) setLocale(adopted)
      })
      .catch(() => { if (alive) setHasProfile(false) })
    return () => { alive = false }
  }, [userId, role, hydration.state, setLocale])

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
  if (userId && role === 'athlete' && hasProfile === false && !isTeam && !isAdmin && !isDiag) {
    return <Onboarding onDone={() => setHasProfile(true)} />
  }
  if (userId && role === 'athlete' && hasProfile === null && !isTeam && !isAdmin && !isDiag) {
    return <p className="p-8 text-center text-[15px] text-[var(--color-ink-soft)]">{t.common.loading}</p>
  }

  /**
   * La console di chi amministra. Sta fuori dall'impaginazione dell'atleta come
   * la dashboard squadra: si guarda da un portatile, non da un telefono in
   * palestra, e non ha né tab né «mi sono fatta male».
   */
  if (isAdmin) return <Routes><Route path="/admin/*" element={<Admin />} /></Routes>

  // La dashboard squadra ha una sua impaginazione: niente tab dell'atleta,
  // niente pulsante «mi sono fatta male», e più larghezza — si guarda da un
  // portatile, non da un telefono in palestra.
  if (userId && role !== 'athlete' && !isTeam && !isAdmin && !isDiag) {
    return <Navigate to={homeFor(role)} replace />
  }

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

      <main className={`flex-1 px-4 ${isFlow ? 'pb-6' : 'pb-28'}`}>
        <Routes>
          {/* Ognuno a casa sua: l'atleta a Oggi, il coach alla squadra, chi
              amministra alla console. */}
          <Route path="/" element={<Navigate to={homeFor(role)} replace />} />
          <Route path="/today" element={<Today />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/me" element={<Me />} />
          <Route path="/story" element={<Story />} />
          <Route path="/body" element={<Body />} />
          <Route path="/senti" element={<BodySense />} />
          {/* Le impostazioni: un indice e cinque schermate. Ognuna ha il suo
              indirizzo, quindi il tasto indietro del telefono torna all'indice
              invece di uscire dalle impostazioni. */}
          <Route path="/settings" element={<SettingsIndex />} />
          <Route path="/settings/profilo" element={<SettingsProfile />} />
          <Route path="/settings/ritmo" element={<SettingsRhythm />} />
          <Route path="/settings/agenda" element={<SettingsAgenda />} />
          {/* Una schermata sola su due indirizzi: la domanda è «quali giorni»,
              cambia solo di cosa. */}
          <Route path="/settings/agenda/allenamenti" element={<AgendaDays kind="training" />} />
          <Route path="/settings/agenda/allenamenti/:sport" element={<AgendaDaysBySport />} />
          <Route path="/settings/agenda/educazione-fisica" element={<AgendaDays kind="pe" />} />
          <Route path="/settings/agenda/gare" element={<AgendaEvents />} />
          <Route path="/settings/lingua" element={<SettingsLanguage />} />
          <Route path="/settings/dati" element={<SettingsData />} />
          {/* Non è nell'indice: ci si arriva da «I tuoi dati» quando qualcosa
              non torna, o incollando l'indirizzo mentre si è al telefono con
              lei. Metterla fra le voci principali insegnerebbe a dubitare. */}
          <Route path="/settings/diagnostica" element={<Diagnostics />} />
          <Route path="/settings/account" element={<SettingsAccount />} />
          <Route path="/checkin/pre" element={<CheckInPre />} />
          <Route path="/checkin/post" element={<CheckInPost />} />
          {/* Solo in sviluppo: serve a provare l'onboarding e a mostrarlo
              senza dover creare un account. `import.meta.env.DEV` è statico,
              quindi in produzione questa rotta non finisce nel bundle. */}
          {import.meta.env.DEV && (
            <Route path="/dev/onboarding" element={<Onboarding onDone={() => {}} />} />
          )}
          <Route path="*" element={<Navigate to={homeFor(role)} replace />} />
        </Routes>
      </main>

      {!isFlow && <TabBar />}
    </div>
  )
}
