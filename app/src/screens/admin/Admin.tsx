import { Link, Route, Routes } from 'react-router-dom'
import Pulse from './Pulse'
import Teams from './Teams'
import Flags from './Flags'
import Consents from './Consents'
import { Tab, TABS } from './shell'

/**
 * La console. Vive fuori dall'impaginazione dell'atleta, come la dashboard
 * squadra: si guarda da un portatile e non ha né tab né «mi sono fatta male».
 *
 * 🔴 Ci si arriva solo se `platform_admins` contiene il tuo id. Se non ci sei,
 * `App` ti manda a casa tua prima ancora di montare questa schermata — e anche
 * se ci arrivassi, ogni vista `admin_*` tornerebbe vuota: il controllo vero è
 * nel database, non qui.
 */
export default function Admin() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-5 py-8">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-[28px]">BAB · console</h1>
        <div className="flex items-center gap-3 text-[13.5px]">
          <Link to="/team" className="underline text-[var(--color-ink-soft)]">
            Dashboard squadra
          </Link>
          <Link to="/settings/diagnostica" className="underline text-[var(--color-ink-soft)]">
            Diagnostica
          </Link>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2">
        {TABS.map((t) => <Tab key={t.to} {...t} />)}
      </nav>

      <Routes>
        <Route path="/" element={<Pulse />} />
        <Route path="/squadre" element={<Teams />} />
        <Route path="/bandiere" element={<Flags />} />
        <Route path="/consensi" element={<Consents />} />
      </Routes>

      {/* 🔴 Quello che questa console NON mostra, e non per dimenticanza. */}
      <p className="pt-2 text-[12.5px] text-[var(--color-ink-soft)]">
        Da qui non si vede nessun check-in, nessuna data del ciclo e nessuna parola scritta da
        un'atleta: le viste <code>admin_*</code> non hanno quelle colonne. Chi amministra ha più
        potere di un coach, non meno bisogno di limiti.
      </p>
    </div>
  )
}
