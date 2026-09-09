import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { useNavigate, useNavigationType, useParams } from 'react-router-dom'
import { CHIAVI, PASSI } from '../data/tutorial'
import { dimenticaTutorial, finisciTutorial, useTutorial } from '../lib/tutorial'
import { segnaTutorialFatto } from '../lib/profilo'
import { ComeFunziona, PrimaRep, Ritmi } from './tutorial/Spiegazioni'
import { Conta, Indovina } from './tutorial/Battito'
import { Andiamo, Confronto } from './tutorial/Fine'
import type { PropsTutorial } from './tutorial/tipi'

const CORPI: Record<string, ComponentType<PropsTutorial>> = {
  'come-funziona': ComeFunziona,
  'prima-rep': PrimaRep,
  indovina: Indovina,
  conta: Conta,
  confronto: Confronto,
  ritmi: Ritmi,
  andiamo: Andiamo,
}

/**
 * Il motore del tutorial.
 *
 * Stesso motore dell'onboarding e del check-in: lo schermo che si vede sta
 * nell'indirizzo — `/tutorial/conta` — quindi il tasto indietro del telefono
 * funziona da solo, e ricaricando a metà si resta dov'eravamo.
 *
 * ── COSA SUCCEDE ALLA FINE ─────────────────────────────────────────────────
 * L'ultimo schermo scrive due cose sulla riga dell'atleta: che il tutorial è
 * finito, e i battiti che ha contato. Poi si va a casa.
 *
 * Se la scrittura non riesce si va a casa lo stesso. Il prezzo è rivedere il
 * tutorial al prossimo avvio; il prezzo di fermarla qui sarebbe lasciarla
 * davanti a un bottone che non la porta da nessuna parte, dopo che ha appena
 * finito. Fra i due, il primo è il male minore.
 */
export function Tutorial() {
  const { id } = useParams()
  const vai = useNavigate()
  const tipoDiNavigazione = useNavigationType()
  const { bpm } = useTutorial()
  const [salvando, setSalvando] = useState(false)

  const posizione = CHIAVI.indexOf(id ?? '')

  useEffect(() => {
    if (posizione < 0) vai(`/tutorial/${CHIAVI[0]}`, { replace: true })
  })

  if (posizione < 0) return null

  const passo = PASSI[posizione]
  const Corpo = CORPI[passo.id]
  const verso = tipoDiNavigazione === 'POP' ? 'indietro' : 'avanti'

  async function finisci() {
    setSalvando(true)
    /*
     * `segnaTutorialFatto` prima di navigare: senza, la guardia legge ancora
     * la risposta vecchia — "il tutorial non è finito" — e rimanda dentro
     * mentre si sta uscendo.
     */
    await finisciTutorial(bpm)
    segnaTutorialFatto()
    dimenticaTutorial()
    vai('/casa', { replace: true })
  }

  return (
    <Corpo
      key={passo.id}
      passo={passo}
      nodo={`tut-${passo.id}`}
      verso={verso}
      avanzamento={(posizione + 1) / PASSI.length}
      salvando={salvando}
      indietro={() => (posizione > 0 ? vai(-1) : undefined)}
      avanti={() =>
        posizione + 1 < PASSI.length
          ? vai(`/tutorial/${CHIAVI[posizione + 1]}`)
          : void finisci()
      }
    />
  )
}
