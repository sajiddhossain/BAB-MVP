import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { useNavigate, useNavigationType, useParams } from 'react-router-dom'
import { PERCORSI, percorsoSessione } from '../data/sessione'
import type { CorpoSessione, Tipo } from '../data/sessione'
import { datiSessione, salvaSessione, scriviSessione, useDatiSessione } from '../lib/sessione'
import { segna } from '../lib/giornata'
import { SESSIONE } from '../copy/sessione'
import type { PropsSessione } from './tipi'
import { CorpoRitmo } from './corpi/SessioneRitmo'
import { CorpoSintonia } from './corpi/SessioneSintonia'
import { CorpoMappa } from './corpi/SessioneMappa'
import { CorpoSegnali, CorpoRendiconto } from './corpi/SessioneFine'
import { CorpoSforzo, CorpoSoddisfazione, CorpoEnergia } from './corpi/SessioneDopo'

const CORPI: Record<CorpoSessione, ComponentType<PropsSessione>> = {
  ritmo: CorpoRitmo,
  sintonia: CorpoSintonia,
  mappa: CorpoMappa,
  segnali: CorpoSegnali,
  sforzo: CorpoSforzo,
  soddisfazione: CorpoSoddisfazione,
  energia: CorpoEnergia,
  rendiconto: CorpoRendiconto,
}

function eTipo(x: string | undefined): x is Tipo {
  return x === 'checkin' || x === 'checkout'
}

/**
 * Il motore del check-in e del check-out.
 *
 * E' lo stesso di quello dell'onboarding, e non per pigrizia: lo schermo che
 * si vede sta nell'indirizzo, quindi il tasto indietro del telefono funziona
 * da solo e ricaricando a meta' si resta dov'eravamo. Su un giro che si fa
 * due volte al giorno, in palestra, col telefono che si spegne, quella e' la
 * proprieta' che conta di piu'.
 */
export function Sessione() {
  const { tipo, id } = useParams()
  const vai = useNavigate()
  const tipoDiNavigazione = useNavigationType()
  const buono: Tipo = eTipo(tipo) ? tipo : 'checkin'
  const dati = useDatiSessione(buono)
  const [salvando, setSalvando] = useState(false)
  const [nonSalvato, setNonSalvato] = useState(false)

  const percorso = percorsoSessione(buono, dati)
  const passo = PERCORSI[buono].find((p) => p.id === id)
  const visibile = passo !== undefined && percorso.includes(passo)

  // l'ora in cui ha cominciato: finisce in `started_at`, che e' come si
  // misura quanto tempo si prende — non per metterle fretta, per capire
  useEffect(() => {
    if (!datiSessione(buono).iniziata) {
      scriviSessione(buono, { iniziata: new Date().toISOString() })
    }
  }, [buono])

  /*
   * Il rimando a uno schermo valido sta qui e non nel render, per la stessa
   * ragione dell'onboarding: togliere l'ultima sensazione dalla mappa fa
   * sparire lo schermo dei segnali, e un rimando dentro al render partirebbe
   * prima della navigazione decisa dalla risposta.
   */
  useEffect(() => {
    if (!eTipo(tipo)) {
      vai('/casa', { replace: true })
      return
    }
    if (!passo) {
      vai(`/sessione/${buono}/${PERCORSI[buono][0].id}`, { replace: true })
      return
    }
    if (visibile) return
    const da = PERCORSI[buono].indexOf(passo)
    const dopo = PERCORSI[buono].slice(da + 1).find((p) => percorso.includes(p))
    if (dopo) vai(`/sessione/${buono}/${dopo.id}`, { replace: true })
  })

  if (!passo || !eTipo(tipo)) return null

  const posizione = percorso.indexOf(passo)

  async function avanti() {
    // `datiSessione` e non `dati`: chi risponde toccando qualcosa scrive e
    // chiama avanti nello stesso gesto, e qui il valore del render e' ancora
    // quello di prima
    const adesso = datiSessione(buono)
    const aggiornato = percorsoSessione(buono, adesso)
    const da = PERCORSI[buono].indexOf(passo!)
    const prossimo = PERCORSI[buono].slice(da + 1).find((p) => aggiornato.includes(p))

    if (prossimo) {
      vai(`/sessione/${buono}/${prossimo.id}`)
      return
    }

    setSalvando(true)
    setNonSalvato(false)
    const esito = await salvaSessione(buono, adesso)
    setSalvando(false)
    if (!esito.ok) {
      console.error('[sessione]', esito.errore)
      // senza sessione "riprova" non puo' funzionare: si rientra, e le
      // risposte restano dove sono
      if (esito.scaduta) {
        vai('/onboarding/accesso', { replace: true, state: { scaduta: true } })
        return
      }
      setNonSalvato(true)
      return
    }

    /*
     * La giornata si aggiorna solo DOPO che il salvataggio e' andato bene.
     * Al contrario, la home direbbe "fatto" per una cosa che nel database non
     * c'e' — e domani, da un altro telefono, quel check-in non esisterebbe.
     */
    if (buono === 'checkin') {
      segna({ fattoCheckin: true, previsto: adesso.ritmo })
    } else {
      const previsto = datiSessione('checkin').ritmo
      segna({
        fattoCheckout: true,
        sentito: adesso.ritmo,
        riassunto: riassuntoDelGiorno(previsto, adesso.ritmo),
      })
    }
    vai('/casa')
  }

  const Corpo = CORPI[passo.corpo]

  return (
    <Corpo
      /*
        La chiave e' il tipo di corpo e non l'id: il ritmo e la mappa
        esistono in tutti e due i giri, e cosi' rimontano quando cambia
        davvero lo schermo e non quando cambia solo cosa c'e' dentro.
      */
      key={passo.corpo}
      tipo={buono}
      passo={passo}
      verso={tipoDiNavigazione === 'POP' ? 'indietro' : 'avanti'}
      avanzamento={(posizione + 1) / percorso.length}
      avanti={() => void avanti()}
      salvando={salvando}
      erroreSalvataggio={nonSalvato}
      indietro={posizione > 0 ? () => vai(-1) : () => vai('/casa')}
    />
  )
}

/**
 * La frase che la home mostra a giornata finita.
 *
 * Il disegno della home non dice cosa ci vada dentro: qui si scrive il
 * confronto, che e' l'unica cosa che la giornata ha davvero prodotto.
 */
function riassuntoDelGiorno(previsto: string | null, sentito: string | null): string {
  const nomi = SESSIONE.comune.ritmi
  if (!sentito) return ''
  const dopo = nomi[sentito as keyof typeof nomi]
  if (!previsto) return `Il tuo corpo oggi ha chiesto un ritmo ${dopo.toLowerCase()}.`
  const prima = nomi[previsto as keyof typeof nomi]
  if (previsto === sentito) return `Avevi previsto ${prima}, ed era ${dopo.toLowerCase()}.`
  return `Avevi previsto ${prima}, il tuo corpo ha chiesto ${dopo.toLowerCase()}.`
}
