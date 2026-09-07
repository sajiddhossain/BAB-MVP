import { useState } from 'react'
import type { ComponentType } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { percorsoVisibile } from '../data/onboarding'
import type { Corpo } from '../data/onboarding'
import { useLingua } from '../lib/lingua'
import { salvaOnboarding } from '../lib/conto'
import { tutte, useRisposte } from '../lib/risposte'
import type { PropsSchermo } from './tipi'
import {
  CorpoNome,
  CorpoCompleanno,
  CorpoSport,
  CorpoAllenamenti,
  CorpoEdFisica,
  CorpoGare,
} from './corpi/Profilo'
import {
  CorpoCicloSiNo,
  CorpoCicloDate,
  CorpoPrimoCiclo,
  CorpoContraccettivo,
} from './corpi/Ciclo'
import {
  CorpoAccesso,
  CorpoLink,
  CorpoIntro,
  CorpoRiepilogo,
  CorpoConsenso,
} from './corpi/Vari'

const CORPI: Record<Corpo, ComponentType<PropsSchermo>> = {
  accesso: CorpoAccesso,
  link: CorpoLink,
  intro: CorpoIntro,
  nome: CorpoNome,
  compleanno: CorpoCompleanno,
  sport: CorpoSport,
  allenamenti: CorpoAllenamenti,
  edFisica: CorpoEdFisica,
  gare: CorpoGare,
  cicloSiNo: CorpoCicloSiNo,
  cicloDate: CorpoCicloDate,
  primoCiclo: CorpoPrimoCiclo,
  contraccettivo: CorpoContraccettivo,
  riepilogo: CorpoRiepilogo,
  consenso: CorpoConsenso,
}

/**
 * Il motore dell'onboarding.
 *
 * Lo schermo che si vede e' quello nell'indirizzo, non uno stato interno: il
 * tasto indietro del telefono funziona da solo, e ricaricando la pagina si
 * resta dov'eravamo.
 *
 * Il percorso si ricalcola a ogni risposta, perche' le risposte cambiano quali
 * schermi esistono — chi dice di non avere il ciclo non vede le tre domande
 * che vengono dopo, e l'avanzamento in cima lo sa.
 */
export function Onboarding() {
  const { id } = useParams()
  const vai = useNavigate()
  const { lingua } = useLingua()
  const risposte = useRisposte()
  const [salvando, setSalvando] = useState(false)
  const [nonSalvato, setNonSalvato] = useState(false)

  const percorso = percorsoVisibile(risposte)
  const i = percorso.findIndex((p) => p.id === id)
  if (i === -1) return <Navigate to={`/onboarding/${percorso[0].id}`} replace />

  const passo = percorso[i]

  // l'avanzamento conta solo gli schermi del percorso vero: accesso, codice e
  // presentazione vengono prima, e li' la barra non c'e' proprio
  const nelPercorso = percorso.filter((p) => !p.fuoriPercorso)
  const posizione = nelPercorso.indexOf(passo)

  async function avanti() {
    // `tutte()` e non `risposte`: chi risponde toccando una carta scrive e
    // chiama avanti nello stesso gesto, quindi qui il valore del render e'
    // ancora quello di prima — e sono proprio quelle risposte a decidere
    // quale schermo viene dopo
    const aggiornato = percorsoVisibile(tutte())
    const qui = aggiornato.findIndex((p) => p.id === passo.id)
    const prossimo = aggiornato[qui + 1]

    if (prossimo) {
      vai(`/onboarding/${prossimo.id}`)
      return
    }

    // fine del percorso: e' qui che tutto quello che ha risposto va nel
    // database, in un colpo solo. Non a ogni schermo: a meta' onboarding non
    // c'e' ancora una riga `athletes` valida da aggiornare.
    setSalvando(true)
    setNonSalvato(false)
    const esito = await salvaOnboarding(tutte(), lingua)
    setSalvando(false)
    if (!esito.ok) {
      console.error('[onboarding]', esito.errore)
      setNonSalvato(true)
      return
    }
    vai('/casa')
  }

  const Corpo = CORPI[passo.corpo]

  return (
    <Corpo
      passo={passo}
      nodo={passo.nodo[lingua]}
      avanzamento={
        posizione === -1 ? undefined : (posizione + 1) / nelPercorso.length
      }
      avanti={() => void avanti()}
      salvando={salvando}
      erroreSalvataggio={nonSalvato}
      indietro={i > 0 ? () => vai(-1) : undefined}
    />
  )
}
