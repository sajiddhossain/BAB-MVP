import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { useNavigate, useNavigationType, useParams } from 'react-router-dom'
import { PERCORSI, percorsoSessione } from '../data/sessione'
import type { CorpoSessione, Tipo } from '../data/sessione'
import { datiSessione, salvaSessione, scriviSessione, useDatiSessione } from '../lib/sessione'
import { giornataAdesso, segna } from '../lib/giornata'
import { diProva, siPuoFare } from '../lib/finestre'
import { IN_ANTEPRIMA, SENZA_ACCESSO } from '../lib/sviluppo'
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


  /*
   * Fuori orario si torna alla home.
   *
   * Il bottone la home non ce l'ha, ma l'indirizzo si scrive a mano e una
   * notifica vecchia ci porta: senza questo, una finestra chiusa sarebbe una
   * cortesia della home invece che una regola.
   *
   * Il controllo si fa solo entrando, non a ogni schermo: chi comincia alle
   * 11:58 finisce in pace. La finestra decide quando si comincia, non quanto
   * si puo' metterci — mettere fretta a una che sta ascoltando il proprio
   * corpo sarebbe il contrario di quello che le stiamo chiedendo.
   *
   * L'anteprima dell'amministrazione e' fuori: li' gli schermi si guardano a
   * qualunque ora, e non c'e' nessuna giornata vera da rovinare.
   */
  /*
   * E lo stesso per un giro gia' finito oggi. Rientrando dall'indirizzo il
   * giro ripartiva sopra alle risposte salvate e le cambiava in silenzio: il
   * ritmo nuovo finiva nella sessione, quello vecchio restava nella giornata,
   * e da li' in poi le due dicevano cose diverse.
   */
  /*
   * Gli account di prova sono l'eccezione: li' un giro gia' fatto si rifa',
   * e il nuovo sostituisce quello di oggi (vedi `diProva`).
   */
  useEffect(() => {
    if (IN_ANTEPRIMA || SENZA_ACCESSO) return
    const g = giornataAdesso()
    const fatto = buono === 'checkin' ? g.fattoCheckin : g.fattoCheckout
    if ((fatto && !diProva()) || !siPuoFare(buono)) vai('/casa', { replace: true })
  }, [buono, vai])

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
      segna({ fattoCheckout: true, sentito: adesso.ritmo })
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
