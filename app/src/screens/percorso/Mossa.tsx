import { useState } from 'react'
import { Guscio } from '../../ui/percorso/Guscio'
import { CartaRisposta, Esito, Occhiello, Titolo } from '../../ui/percorso/pezzi'
import { riempi } from '../../copy/riempi'
import { useLingua } from '../../lib/lingua'
import { TINTE_RISPOSTA } from '../../data/percorso'
import { LIVELLI } from '../../data/sessione'
import type { Passo } from '../../data/percorso'
import type { StatoCarta } from '../../ui/percorso/pezzi'
import type { PropsEsercizio } from './tipi'

const LETTERE = ['A', 'B', 'C']

/**
 * Cosa fai adesso.
 *
 * E' l'unico esercizio che non chiede una parola: chiede la mossa. Le tre
 * scelte sono i tre livelli che l'app ha gia' — spingi, calibra, sostegno —
 * e i nomi vengono da li', non dai testi della lezione: sono le stesse tre
 * parole che l'atleta vede sulle sedici schede e in fondo al check-in, e
 * scriverle una seconda volta vorrebbe dire vederle diventare diverse.
 */
export function Mossa({
  passo,
  testi,
  parole,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'mossa' }>>) {
  const { tpe, tp } = useLingua()
  const t = testi.mossa
  const buchi = { uno: parole[0], due: parole[1] }

  const [scelta, setScelta] = useState<number | null>(null)
  const [esito, setEsito] = useState<boolean | null>(null)
  const giusta = LIVELLI.indexOf(passo.giusta)

  function stato(i: number): StatoCarta {
    if (esito === null) return scelta === i ? 'scelta' : 'ferma'
    if (i !== scelta) return 'ferma'
    return esito ? 'giusta' : 'sbagliata'
  }

  return (
    <Guscio
      avanzamento={avanzamento}
      indietro={indietro}
      attivo={scelta !== null}
      azione={esito === true ? tpe.comune.continua : tpe.comune.verifica}
      onAzione={() => {
        if (esito === true) {
          avanti()
          return
        }
        setEsito(scelta === giusta)
      }}
      esito={
        <Esito
          aperto={esito !== null}
          giusto={esito === true}
          titolo={esito ? tpe.comune.giusto : tpe.comune.sbagliato}
        >
          {esito ? t.esito : tpe.comune.riprova}
        </Esito>
      }
    >
      <Occhiello nome="scudo-mossa">{t.occhiello}</Occhiello>

      <div className="mt-[3px]">
        <Titolo>{riempi(t.titolo, buchi)}</Titolo>
      </div>

      <div className="mt-[62px] flex flex-col gap-3">
        {LIVELLI.map((livello, i) => (
          <CartaRisposta
            key={livello}
            lettera={LETTERE[i]}
            tinta={TINTE_RISPOSTA[i % TINTE_RISPOSTA.length]}
            stato={stato(i)}
            titolo={tp.livelli[livello].nome}
            glossa={t.scelte[i] || undefined}
            onClick={() => {
              setScelta(i)
              setEsito(null)
            }}
          />
        ))}
      </div>

      <p className="m-0 mt-[52px] text-center text-[13px] leading-[1.4] text-ink-soft">
        {riempi(t.nota, buchi)}
      </p>
    </Guscio>
  )
}
