import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { useNavigate, useNavigationType, useParams } from 'react-router-dom'
import { PERCORSO, percorsoVisibile } from '../data/onboarding'
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
  const tipoDiNavigazione = useNavigationType()
  const [nonSalvato, setNonSalvato] = useState(false)

  const percorso = percorsoVisibile(risposte)
  const passo = PERCORSO.find((p) => p.id === id)
  const visibile = passo !== undefined && percorso.includes(passo)

  /*
   * Il rimando a uno schermo valido sta qui e non nel render.
   *
   * Rispondendo si cambia il percorso, e puo' capitare di far sparire lo
   * schermo su cui si e' — cambiare idea sul ciclo mentre il modulo del primo
   * ciclo e' aperto. Se il rimando fosse nel render partirebbe in quel
   * momento, prima che la navigazione decisa dalla risposta arrivi, e
   * riporterebbe all'inizio dell'onboarding invece che avanti.
   *
   * Da qui invece calcola la stessa cosa che calcola `avanti` — il primo
   * schermo che si vede ancora, da qui in poi — quindi anche se partono tutti
   * e due finiscono nello stesso posto.
   */
  useEffect(() => {
    if (!passo) {
      vai('/onboarding/accesso', { replace: true })
      return
    }
    if (visibile) return
    const da = PERCORSO.indexOf(passo)
    const dopo = PERCORSO.slice(da + 1).find((p) => percorso.includes(p))
    // finito l'onboarding viene il tutorial, come in fondo ad `avanti`
    vai(dopo ? `/onboarding/${dopo.id}` : '/tutorial', { replace: true })
  })

  if (!passo) return null

  /*
   * Da che parte si sta andando lo dice il router: POP e' il tasto indietro,
   * PUSH e' una risposta data. Prima lo ricavavo confrontando con il render
   * precedente, ma in StrictMode React renderizza due volte e al secondo giro
   * il confronto e' con se' stesso — usciva sempre "nessun movimento".
   */
  const verso = tipoDiNavigazione === 'POP' ? 'indietro' : 'avanti'

  /*
   * L'avanzamento si conta sul percorso INTERO, non su quello che si vede.
   *
   * Contandolo sul visibile, rispondere faceva tornare indietro la barra:
   * dire "si'" al ciclo fa comparire due domande, il totale cresce, e la
   * stessa posizione diventa una frazione piu' piccola. Una barra che torna
   * indietro e' peggio di una imprecisa.
   *
   * Sul percorso intero il totale non cambia mai e la barra sale e basta: chi
   * salta delle domande fa un passo piu' lungo, che e' esattamente quello che
   * e' successo — ne ha una in meno da fare.
   *
   * Accesso, codice e presentazione restano fuori dal conto: vengono prima
   * del percorso, e li' la barra non c'e' proprio.
   */
  const domande = PERCORSO.filter((p) => !p.fuoriPercorso)
  const posizione = domande.indexOf(passo)

  async function avanti() {
    // `tutte()` e non `risposte`: chi risponde toccando una carta scrive e
    // chiama avanti nello stesso gesto, quindi qui il valore del render e'
    // ancora quello di prima — e sono proprio quelle risposte a decidere
    // quale schermo viene dopo
    const aggiornato = percorsoVisibile(tutte())
    /*
     * Il prossimo si cerca scorrendo il percorso INTERO da dove siamo, e
     * prendendo il primo che con le risposte nuove si vede ancora. Cercarlo
     * dentro `aggiornato` non basta: se la risposta appena data ha fatto
     * sparire lo schermo su cui siamo — rispondere "non ancora" mentre si e'
     * sul modulo del primo ciclo — li' dentro non ci saremmo piu'.
     */
    const da = PERCORSO.indexOf(passo!)
    const prossimo = PERCORSO.slice(da + 1).find((p) => aggiornato.includes(p))

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
      /*
       * Se manca la sessione non c'e' niente da riprovare: si rientra. Le
       * risposte restano dove sono, quindi rientrando si ritrova qui e
       * finisce — l'ultimo schermo si ricalcola da solo.
       */
      if (esito.scaduta) {
        vai('/onboarding/accesso', { replace: true, state: { scaduta: true } })
        return
      }
      setNonSalvato(true)
      return
    }
    /*
     * Dopo l'onboarding viene il tutorial, e ci si va direttamente. Prima si
     * andava a `/casa` e ci pensava la guardia a rimandare nel tutorial: ma la
     * guardia non decide quando la risposta e' "boh" (rete storta) ne' quando
     * l'accesso e' spento, e in quei casi il tutorial saltava. Se l'avesse gia'
     * visto, e' la guardia a mandarla a casa da li'.
     */
    vai('/tutorial', { replace: true })
  }

  const Corpo = CORPI[passo.corpo]

  return (
    /*
      La chiave e' il tipo di corpo, non l'id del passo: cosi' React rimonta
      quando si cambia davvero schermata (e l'entrata parte da sola), ma NON
      quando si passa da `ciclo` a `primo-ciclo`, che e' la stessa schermata
      che si apre. Li' rimontare vorrebbe dire far ricominciare le carte da
      capo invece di farle scorrere in giu'.
    */
    <Corpo
      key={passo.corpo}
      passo={passo}
      nodo={passo.nodo[lingua]}
      verso={verso}
      avanzamento={posizione === -1 ? undefined : (posizione + 1) / domande.length}
      avanti={() => void avanti()}
      salvando={salvando}
      erroreSalvataggio={nonSalvato}
      indietro={percorso.indexOf(passo) > 0 ? () => vai(-1) : undefined}
    />
  )
}
