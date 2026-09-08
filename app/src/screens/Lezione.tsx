import { useEffect } from 'react'
import type { ComponentType } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LEZIONI, lezionePronta, passiDi } from '../data/percorso'
import type { Passo } from '../data/percorso'
import { caricaProgresso, lezioneAperta, useProgresso } from '../lib/percorso'
import { useLingua } from '../lib/lingua'
import type { TestiLezione } from '../copy/percorso'
import type { PropsEsercizio } from './percorso/tipi'
import { Incontra } from './percorso/Incontra'
import { Abbina } from './percorso/Abbina'
import { Scelta } from './percorso/Scelta'
import { Mossa } from './percorso/Mossa'
import { Frase } from './percorso/Frase'
import { Fatto } from './percorso/Fatto'

/* eslint-disable @typescript-eslint/no-explicit-any */
const CORPI: Record<Passo['tipo'], ComponentType<PropsEsercizio<any>>> = {
  incontra: Incontra,
  abbina: Abbina,
  storia: Scelta,
  gemelle: Scelta,
  mossa: Mossa,
  frase: Frase,
  fatto: Fatto,
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Il riproduttore delle lezioni.
 *
 * Stesso motore del check-in e dell'onboarding: lo schermo che si vede sta
 * nell'indirizzo — `/percorso/1/abbina` — quindi il tasto indietro del
 * telefono funziona da solo, e ricaricando a meta' si resta dov'eravamo.
 *
 * ── QUELLO CHE NON SI TIENE DA PARTE ───────────────────────────────────────
 * Le risposte. Ogni esercizio si tiene le sue finche' e' a schermo e le perde
 * tornando indietro. E' voluto: una lezione dura tre minuti, e l'unica cosa
 * che deve sopravvivere e' "l'ho finita" — che si scrive una volta sola,
 * sullo schermo dell'ultimo passo. Tenere in piedi le risposte di otto
 * esercizi per risparmiare novanta secondi a chi torna indietro sarebbe
 * codice che puo' sbagliare in cambio di niente.
 *
 * ── CHI PUO' ENTRARE ───────────────────────────────────────────────────────
 * Solo le lezioni scritte e aperte. Un indirizzo scritto a mano, o una
 * lezione che nel percorso e' ancora "in arrivo", riporta alla mappa: e' la
 * stessa regola che il check-in applica alle finestre.
 */
export function Lezione() {
  const { lezione, passo } = useParams()
  const vai = useNavigate()
  const { tpe, ts } = useLingua()
  const progresso = useProgresso()

  const numero = Number(lezione)
  const lez = LEZIONI.find((l) => l.numero === numero)
  const passi = passiDi(numero)
  const chiavi = passi ? chiaviDi(passi) : []
  const posizione = chiavi.indexOf(passo ?? '')

  const buona = !!lez && !!passi && lezionePronta(numero) && lezioneAperta(numero, progresso)

  useEffect(() => {
    void caricaProgresso()
  }, [])

  /*
   * I rimandi stanno in un effetto e non nel render, come nell'onboarding e
   * nella sessione: navigare mentre si disegna e' un cambio di stato dentro a
   * un render, e React lo rifiuta.
   */
  useEffect(() => {
    if (!buona) {
      vai('/percorso', { replace: true })
      return
    }
    if (posizione < 0) vai(`/percorso/${numero}/${chiavi[0]}`, { replace: true })
  })

  if (!buona || posizione < 0 || !passi || !lez) return null

  const corrente = passi[posizione]
  const Corpo = CORPI[corrente.tipo]
  const testi = (tpe.lezioni as Record<number, TestiLezione>)[numero]
  if (!testi) return null

  return (
    <Corpo
      key={chiavi[posizione]}
      passo={corrente}
      lezione={numero}
      testi={testi}
      quale={passi.slice(0, posizione).filter((p) => p.tipo === corrente.tipo).length}
      parole={[
        ts.foglio.parole[lez.parole[0]] ?? lez.parole[0],
        ts.foglio.parole[lez.parole[1]] ?? lez.parole[1],
      ]}
      avanzamento={(posizione + 1) / passi.length}
      indietro={() => (posizione > 0 ? vai(-1) : vai('/percorso'))}
      avanti={() =>
        posizione + 1 < passi.length
          ? vai(`/percorso/${numero}/${chiavi[posizione + 1]}`)
          : vai('/percorso')
      }
    />
  )
}

/**
 * Il nome di ogni passo nell'indirizzo.
 *
 * E' il tipo dell'esercizio, e dove lo stesso tipo torna piu' volte — le due
 * schede-parola — si numera: `incontra-1`, `incontra-2`. Numeri e basta
 * sarebbero piu' corti, ma `/percorso/1/3` non dice niente a chi lo legge in
 * un registro o in una segnalazione.
 */
function chiaviDi(passi: Passo[]): string[] {
  const quanti = new Map<string, number>()
  for (const p of passi) quanti.set(p.tipo, (quanti.get(p.tipo) ?? 0) + 1)

  const visti = new Map<string, number>()
  return passi.map((p) => {
    const n = (visti.get(p.tipo) ?? 0) + 1
    visti.set(p.tipo, n)
    return (quanti.get(p.tipo) ?? 1) > 1 ? `${p.tipo}-${n}` : p.tipo
  })
}
