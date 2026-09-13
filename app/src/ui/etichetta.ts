import { createContext, useContext } from 'react'

/**
 * L'id dell'etichetta del `Gruppo` in cui sta un campo.
 *
 * L'etichetta sopra ai campi e' un paragrafo e non un `<label>`, e VoiceOver
 * leggeva il campo senza nome: "campo di testo", e basta. Il gruppo mette qui
 * l'id della sua etichetta e il campo lo usa come nome, senza che nessuno
 * schermo debba ricordarsi di collegarli.
 */
export const EtichettaDelGruppo = createContext<string | undefined>(undefined)

export function useEtichettaDelGruppo(): string | undefined {
  return useContext(EtichettaDelGruppo)
}
