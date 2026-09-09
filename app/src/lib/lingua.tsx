import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { TESTI } from '../copy/testi'
import { TESTI_SESSIONE } from '../copy/sessione'
import { TESTI_PAROLE } from '../copy/parole'
import { TESTI_PERCORSO } from '../copy/percorso'
import {
  caricaScritte,
  conMarcatori,
  conScritte,
  elencoChiavi,
  rileggiScritte,
  useScritte,
} from './scritte'
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
  /** il percorso: la mappa e le otto lezioni */
  tpe: (typeof TESTI_PERCORSO)['it']
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

  /*
   * All'avvio, e ogni volta che l'app torna davanti agli occhi.
   *
   * Le sovrascritture cambiano di rado, ma un'app installata sul telefono non
   * si chiude quasi mai: leggendole solo all'avvio, una correzione pubblicata
   * stamattina arriverebbe a chi ha spento e riacceso — cioe' quasi a nessuna.
   * `rileggiScritte` si ferma da solo se le ha gia' lette da poco.
   *
   * Due ascoltatori e non uno: `visibilitychange` copre l'app messa via e
   * ripresa, `focus` la finestra del computer tornata davanti. Su un telefono
   * scatta il primo, sul portatile spesso solo il secondo.
   */
  useEffect(() => {
    void caricaScritte()
    const tornata = () => {
      if (document.visibilityState === 'visible') rileggiScritte()
    }
    document.addEventListener('visibilitychange', tornata)
    window.addEventListener('focus', tornata)
    return () => {
      document.removeEventListener('visibilitychange', tornata)
      window.removeEventListener('focus', tornata)
    }
  }, [])

  const valore = useMemo(() => {
    const mappa = scritte[lingua]
    let t = conScritte(TESTI[lingua], 'testi', mappa)
    let ts = conScritte(TESTI_SESSIONE[lingua], 'sessione', mappa)
    let tp = conScritte(TESTI_PAROLE[lingua], 'parole', mappa)
    let tpe = conScritte(TESTI_PERCORSO[lingua], 'percorso', mappa)

    /*
     * Dentro alla cornice ogni scritta si porta dietro il proprio numero,
     * invisibile: e' cosi' che toccare un punto dello schermo dice al
     * pannello quale scritta si sta toccando. Fuori dall'anteprima questo
     * ramo non viene mai eseguito.
     */
    if (IN_ANTEPRIMA) {
      const numeri = new Map(elencoChiavi(lingua).map((c, i) => [c, i]))
      t = conMarcatori(t, 'testi', numeri)
      ts = conMarcatori(ts, 'sessione', numeri)
      tp = conMarcatori(tp, 'parole', numeri)
      tpe = conMarcatori(tpe, 'percorso', numeri)
    }

    return { lingua, cambia, t, ts, tp, tpe }
  }, [lingua, cambia, scritte])

  return <Contesto.Provider value={valore}>{children}</Contesto.Provider>
}

export function useLingua(): Valore {
  const v = useContext(Contesto)
  if (!v) throw new Error('useLingua fuori da LinguaProvider')
  return v
}
