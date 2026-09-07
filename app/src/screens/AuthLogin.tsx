import { useState } from 'react'
import { Screen, Accento } from '../ui/Screen'
import { Occhiello, Titolo, Occhio, Etichetta } from '../ui/Testo'
import { Nota } from '../ui/Nota'
import { Campo } from '../ui/Campo'
import { Bottone } from '../ui/Bottone'
import logo from '../assets/logo-bab.svg'
import sparkles from '../assets/icon-sparkles.svg'
import teal from '../assets/accent-teal.svg'
import coral from '../assets/accent-coral.svg'

/**
 * 01-auth-login — node 3771:2
 *
 * Nota: in Figma questo schermo esiste due volte (3771:2 e 3958:461). Vale
 * quello linkato, 3771:2. Prima di fare gli altri va deciso quale copia e'
 * buona per i ~140 nomi che compaiono piu' di una volta.
 */
export function AuthLogin() {
  const [email, setEmail] = useState('')
  const valida = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())

  return (
    <Screen
      accenti={
        <>
          <Accento src={coral} left={310} top={24} size={110} />
          <Accento src={teal} left={-50} top={724} size={160} />
        </>
      }
      azione={
        <Bottone attivo={valida} onClick={() => {}}>
          Mandami il link
        </Bottone>
      }
    >
      {/* il riquadro del marchio */}
      <div className="flex h-[220px] items-center justify-center rounded-card border-[1.5px] border-line bg-veil">
        <img src={logo} alt="BAB" className="h-[82px] w-[178px]" />
      </div>

      <div className="mt-4">
        <Occhiello>Accesso</Occhiello>
        <Titolo>Entra in BAB</Titolo>
        <Occhio>Inserisci la tua mail e riceverai subito un link per attivare BAB.</Occhio>
      </div>

      <div className="mt-5">
        <Nota icona={sparkles}>Siamo felici che tu sia qui 🎉</Nota>
      </div>

      <div className="mt-8">
        <Etichetta>La tua email</Etichetta>
        <div className="mt-[6px]">
          <Campo
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="nome@esempio.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
    </Screen>
  )
}
