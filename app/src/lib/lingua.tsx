import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { TESTI } from '../copy/testi'

export type Lingua = 'it' | 'en'

const CHIAVE = 'bab.lingua'

function iniziale(): Lingua {
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
}

const Contesto = createContext<Valore | null>(null)

export function LinguaProvider({ children }: { children: ReactNode }) {
  const [lingua, setLingua] = useState<Lingua>(iniziale)

  const cambia = useCallback((l: Lingua) => {
    localStorage.setItem(CHIAVE, l)
    setLingua(l)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lingua
  }, [lingua])

  const valore = useMemo(() => ({ lingua, cambia, t: TESTI[lingua] }), [lingua, cambia])

  return <Contesto.Provider value={valore}>{children}</Contesto.Provider>
}

export function useLingua(): Valore {
  const v = useContext(Contesto)
  if (!v) throw new Error('useLingua fuori da LinguaProvider')
  return v
}
