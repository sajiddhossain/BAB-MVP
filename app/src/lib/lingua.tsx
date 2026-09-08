import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { TESTI } from '../copy/testi'
import { TESTI_SESSIONE } from '../copy/sessione'
import { TESTI_PAROLE } from '../copy/parole'
import { caricaScritte, conScritte, useScritte } from './scritte'
import { IN_ANTEPRIMA } from './sviluppo'

export type Lingua = 'it' | 'en'

const CHIAVE = 'bab.lingua'

function iniziale(): Lingua {
  /*
   * Dentro alla cornice dell'anteprima la lingua la decide chi sta scrivendo,
   * e sta nell'indirizzo: cambiarla da la' non deve cambiare la lingua
   * dell'app di chi guarda, che e' la stessa memoria.
   */
  if (IN_ANTEPRIMA) {
    const chiesta = new URLSearchParams(window.location.search).get('lingua')
    if (chiesta === 'it' || chiesta === 'en') return chiesta
  }
  const salvata = localStorage.getItem(CHIAVE)
  if (salvata === 'it' || salvata === 'en') return salvata
  // il file Figma nasce in italiano: se il telefono non dice altro, si parte da li'
  return navigator.language.toLowerCase().startsWith('it') ? 'it' : 'en'
}

type Valore = {
  lingua: Lingua
  cambia: (l: Lingua) => void
  /** i testi della lingua corrente, gia' scelti: `t.nome.titolo` */
  t: (typeof TESTI)['it']
  /** i testi del check-in e del check-out */
  ts: (typeof TESTI_SESSIONE)['it']
  /** le sedici schede-parola */
  tp: (typeof TESTI_PAROLE)['it']
}

const Contesto = createContext<Valore | null>(null)

/**
 * La lingua e i testi.
 *
 * I testi passano tutti di qui e non si leggono piu' direttamente dai file di
 * `copy/`: e' qui che sopra a quelli compilati si posano le sovrascritture
 * scritte dall'amministrazione. Un componente che importasse `TESTI` da solo
 * si perderebbe le correzioni, e sarebbe l'unico schermo dell'app a dire una
 * cosa diversa da tutti gli altri.
 */
export function LinguaProvider({ children }: { children: ReactNode }) {
  const [lingua, setLingua] = useState<Lingua>(iniziale)
  const scritte = useScritte()

  const cambia = useCallback((l: Lingua) => {
    localStorage.setItem(CHIAVE, l)
    setLingua(l)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lingua
  }, [lingua])

  // una volta sola all'avvio: le sovrascritture cambiano di rado, e chi le
  // cambia ha la sua anteprima
  useEffect(() => {
    void caricaScritte()
  }, [])

  const valore = useMemo(() => {
    const mappa = scritte[lingua]
    return {
      lingua,
      cambia,
      t: conScritte(TESTI[lingua], 'testi', mappa),
      ts: conScritte(TESTI_SESSIONE[lingua], 'sessione', mappa),
      tp: conScritte(TESTI_PAROLE[lingua], 'parole', mappa),
    }
  }, [lingua, cambia, scritte])

  return <Contesto.Provider value={valore}>{children}</Contesto.Provider>
}

export function useLingua(): Valore {
  const v = useContext(Contesto)
  if (!v) throw new Error('useLingua fuori da LinguaProvider')
  return v
}
