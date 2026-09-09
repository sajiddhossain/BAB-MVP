import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { caricaSezioni, useStatoSezione } from '../lib/sezioni'
import { Prossimamente } from './Prossimamente'

/**
 * Il cancello di una sezione.
 *
 * Sta intorno alle rotte di una sezione e guarda com'e' messa adesso:
 * `aperta` la lascia passare, `in-arrivo` mette lo schermo che dice che
 * arriva presto, `nascosta` rimanda alla home — perche' una sezione nascosta
 * non deve essere raggiungibile nemmeno scrivendo l'indirizzo a mano.
 *
 * Non e' una porta sui dati e non pretende di esserlo: quello che un'atleta
 * puo' leggere lo decidono le regole del database. Questa e' una decisione di
 * prodotto — "questo pezzo non e' ancora pronto" — e si prende dal pannello.
 */
export function Sezione({ id, children }: { id: string; children: ReactNode }) {
  const stato = useStatoSezione(id)

  /*
   * Si rilegge entrando: chi ha l'app aperta da ieri deve accorgersi che una
   * sezione e' stata aperta o chiusa senza dover chiudere e riaprire tutto.
   */
  useEffect(() => {
    void caricaSezioni()
  }, [])

  if (stato === 'nascosta') return <Navigate to="/casa" replace />
  if (stato === 'in-arrivo') return <Prossimamente id={id} />
  return <>{children}</>
}
