import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './screens/Onboarding'
import { Sessione } from './screens/Sessione'
import { Parole } from './screens/Parole'
import { Percorso } from './screens/Percorso'
import { Lezione } from './screens/Lezione'
import { Casa } from './screens/Casa'
import { Prossimamente } from './screens/Prossimamente'
import { Amministrazione } from './screens/Amministrazione'
import { Guardia } from './screens/Guardia'
import { Sezione } from './screens/Sezione'
import { AccessoAdmin } from './screens/AccessoAdmin'

export function App() {
  return (
    <Guardia>
      <Routes>
        <Route path="/onboarding/:id" element={<Onboarding />} />
        <Route path="/casa" element={<Casa />} />
        {/* :tipo e' `checkin` o `checkout`; :id e' il passo dentro a quel giro */}
        <Route path="/sessione/:tipo/:id" element={<Sessione />} />
        <Route path="/sessione/:tipo" element={<Sessione />} />
        {/* il glossario delle sedici parole: ci si arriva dal foglio, ma ha
            anche un indirizzo suo perche' e' una cosa che si va a rileggere */}
        <Route
          path="/parole"
          element={
            <Sezione id="parole">
              <Parole />
            </Sezione>
          }
        />
        {/* i testi dell'app, per chi li scrive: entra solo chi sta in
            `platform_admins`, e a dirlo e' il database. L'accesso e' suo e
            non passa dall'onboarding: chi scrive i testi non e' un'atleta */}
        <Route path="/admin/login" element={<AccessoAdmin />} />
        <Route path="/admin" element={<Amministrazione />} />
        {/*
          Il percorso, la sua mappa e le sue lezioni stanno tutti dentro alla
          stessa sezione: spegnendola si spegne anche quello che c'e' dentro.
        */}
        <Route
          path="/percorso"
          element={
            <Sezione id="percorso">
              <Percorso />
            </Sezione>
          }
        />
        {/* :lezione e' il numero da 1 a 8; :passo e' l'esercizio dentro a
            quella lezione, tipo `incontra-1` o `abbina` */}
        <Route
          path="/percorso/:lezione/:passo"
          element={
            <Sezione id="percorso">
              <Lezione />
            </Sezione>
          }
        />
        <Route
          path="/percorso/:lezione"
          element={
            <Sezione id="percorso">
              <Lezione />
            </Sezione>
          }
        />
        <Route
          path="/storico"
          element={
            <Sezione id="storico">
              <Prossimamente titolo="Storico" />
            </Sezione>
          }
        />
        <Route
          path="/profilo"
          element={
            <Sezione id="profilo">
              <Prossimamente titolo="Profilo" profilo />
            </Sezione>
          }
        />
        <Route path="*" element={<Navigate to="/onboarding/accesso" replace />} />
      </Routes>
    </Guardia>
  )
}
