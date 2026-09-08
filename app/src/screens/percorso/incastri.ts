import { useState } from 'react'
import { useTrascina } from '../../lib/trascina'

/**
 * Le pastiglie che vanno posate in un certo numero di caselle.
 *
 * E' lo stesso meccanismo in tre esercizi — l'abbinamento nelle due vesti e
 * la frase da comporre — e cambia solo cosa sono le caselle: una riga, un
 * buco in mezzo a una frase. Qui c'e' chi sta dove, il tocca-e-posa, il
 * trascinamento, e il ritorno nel cesto.
 *
 * Le caselle si numerano da 0. Il bersaglio `cesto` riporta la pastiglia
 * indietro: e' l'unico modo per disfare una mossa trascinando invece che
 * toccando.
 */
export function useIncastri(quante: number) {
  /** per ogni casella, quale pastiglia c'e' dentro */
  const [posato, setPosato] = useState<(number | null)[]>(() =>
    Array.from({ length: quante }, () => null),
  )
  /** la pastiglia presa in mano, in attesa di sapere dove va */
  const [scelta, setScelta] = useState<number | null>(null)
  const [esito, setEsito] = useState<boolean | null>(null)

  const dove = (n: number) => posato.findIndex((p) => p === n)

  function metti(n: number, casella: number | null) {
    setPosato((prima) => {
      const dopo = prima.map((p) => (p === n ? null : p))
      if (casella !== null) dopo[casella] = n
      return dopo
    })
    setScelta(null)
    setEsito(null)
  }

  /** Toccare una pastiglia: la prende, o la riprende da dove l'aveva posata. */
  function toccaPastiglia(n: number) {
    if (dove(n) >= 0) {
      metti(n, null)
      setScelta(n)
      return
    }
    setScelta((s) => (s === n ? null : n))
    setEsito(null)
  }

  /** Toccare una casella: ci posa quella in mano, o svuota la casella. */
  function toccaCasella(i: number) {
    if (scelta !== null) {
      metti(scelta, i)
      return
    }
    const n = posato[i]
    if (n !== null) metti(n, null)
  }

  const { presa, pastiglia } = useTrascina({
    onPosa(id, bersaglio) {
      if (bersaglio === null) return
      metti(Number(id), bersaglio === 'cesto' ? null : Number(bersaglio))
    },
    onTocco(id) {
      toccaPastiglia(Number(id))
    },
  })

  return {
    posato,
    scelta,
    esito,
    setEsito,
    dove,
    metti,
    toccaPastiglia,
    toccaCasella,
    presa,
    pastiglia,
    /** vero quando almeno una casella e' piena: prima non c'e' niente da verificare */
    qualcosa: posato.some((p) => p !== null),
    pieno: posato.every((p) => p !== null),
  }
}
