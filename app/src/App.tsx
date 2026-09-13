import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './screens/Onboarding'
import { Tutorial } from './screens/Tutorial'
import { Sessione } from './screens/Sessione'
import { Parole } from './screens/Parole'
import { Percorso } from './screens/Percorso'
import { Lezione } from './screens/Lezione'
import { Casa } from './screens/Casa'
import { Prossimamente } from './screens/Prossimamente'
import { Amministrazione } from './screens/Amministrazione'
import { Atrio } from './screens/admin/Atrio'
import { Scritte } from './screens/admin/Scritte'
import { Atlete } from './screens/admin/Atlete'
import { Atleta } from './screens/admin/Atleta'
import { Sezioni } from './screens/admin/Sezioni'
import { Stanze } from './screens/admin/Telaio'
import { Guardia } from './screens/Guardia'
import { Sezione } from './screens/Sezione'
import { AccessoAdmin } from './screens/AccessoAdmin'

export function App() {
  return (
    <Guardia>
      <Routes>
        <Route path="/onboarding/:id" element={<Onboarding />} />
        {/* il tutorial che viene subito dopo l'onboarding: sette schermi, e
            in mezzo il minigioco del battito. Chi l'ha gia' visto non ci
            torna — a dirlo e' `athletes.tutorial_done`, non questo file */}
        <Route path="/tutorial/:id" element={<Tutorial />} />
        <Route path="/tutorial" element={<Navigate to="/tutorial/come-funziona" replace />} />
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
        {/* il pannello di amministrazione: entra solo chi sta in
            `platform_admins`, e a dirlo e' il database. L'accesso e' suo e
            non passa dall'onboarding: chi amministra non e' un'atleta */}
        <Route path="/admin/login" element={<AccessoAdmin />} />
        {/*
          Il pannello e' un atrio con delle stanze: `/admin` chiede solo chi
          sei e poi lascia passare, e ogni stanza sta sotto. Prima era una
          rotta sola e tutto quello che serviva doveva entrare li' dentro.
        */}
        <Route path="/admin" element={<Amministrazione />}>
          {/* tutte le stanze dentro alla stessa barra laterale */}
          <Route element={<Stanze />}>
            <Route index element={<Atrio />} />
            <Route path="scritte" element={<Scritte />} />
            <Route path="atlete" element={<Atlete />} />
            <Route path="atlete/:id" element={<Atleta />} />
            <Route path="sezioni" element={<Sezioni />} />
          </Route>
        </Route>
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
              <Prossimamente id="storico" />
            </Sezione>
          }
        />
        <Route
          path="/profilo"
          element={
            <Sezione id="profilo">
              <Prossimamente id="profilo" profilo />
            </Sezione>
          }
        />
        <Route path="*" element={<Navigate to="/onboarding/accesso" replace />} />
      </Routes>
    </Guardia>
  )
}
