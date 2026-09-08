import { useState } from 'react'
import { Guscio } from '../../ui/percorso/Guscio'
import { Badge, CartaRisposta, Esito, Occhiello, Scheda, Titolo } from '../../ui/percorso/pezzi'
import { useLingua } from '../../lib/lingua'
import { TINTE_RISPOSTA } from '../../data/percorso'
import type { Passo } from '../../data/percorso'
import type { StatoCarta } from '../../ui/percorso/pezzi'
import type { PropsEsercizio } from './tipi'

const LETTERE = ['A', 'B', 'C', 'D', 'E']

/**
 * Uno scenario e le parole fra cui scegliere.
 *
 * Sono due schermi del disegno — `bl-false-friends` e `bl-story` — e qui sono
 * uno solo, perche' la differenza fra loro e' quanto e' lungo lo scenario e
 * quante risposte ci sono. I falsi amici mettono lo scenario grande, come un
 * titolo, e danno due parole che si somigliano; la storia lo mette in una
 * scheda e ne da' quattro, tre delle quali di altre lezioni.
 *
 * Le glosse sotto alle risposte dei falsi amici ("Potenza muscolare al
 * massimo") stanno nei testi e non sono le metafore delle schede-parola: qui
 * servono a separare due parole vicine, non a spiegarle da zero.
 */
export function Scelta({
  passo,
  testi,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'storia' | 'gemelle' }>>) {
  const { tpe, ts } = useLingua()
  const gemelle = passo.tipo === 'gemelle'
  const t = gemelle ? testi.gemelle : testi.storia
  const glosse = gemelle ? testi.gemelle.glosse : []

  const [scelta, setScelta] = useState<number | null>(null)
  const [esito, setEsito] = useState<boolean | null>(null)

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
        setEsito(scelta === passo.giusta)
      }}
      esito={
        <Esito
          aperto={esito !== null}
          giusto={esito === true}
          titolo={esito ? tpe.comune.giusto : tpe.comune.sbagliato}
        >
          {esito ? null : tpe.comune.riprova}
        </Esito>
      }
    >
      <Occhiello nome={gemelle ? 'domanda' : 'libro-aperto'}>{t.occhiello}</Occhiello>

      <div className="mt-[10px]">
        <Badge>{t.badge}</Badge>
      </div>

      {gemelle ? (
        <div className="mt-[14px]">
          <Titolo>{t.scenario}</Titolo>
        </div>
      ) : (
        <div className="mt-[19px]">
          <Scheda riga="linear-gradient(to right, #ffd1c1, #ffb8a2)">
            <p className="m-0 px-4 py-5 pl-[22px] text-[13px] leading-[1.4] text-ink-soft">
              {t.scenario}
            </p>
          </Scheda>
        </div>
      )}

      <p
        className={`m-0 ${gemelle ? 'mt-[10px] text-[13px] text-ink-soft' : 'mt-[27px] text-center text-[10px] font-bold tracking-[1px] uppercase text-lilla'}`}
      >
        {t.domanda}
      </p>

      <div className="mt-[10px] flex flex-col gap-[10px]">
        {passo.risposte.map((parola, i) => (
          <CartaRisposta
            key={parola}
            lettera={LETTERE[i]}
            tinta={TINTE_RISPOSTA[i % TINTE_RISPOSTA.length]}
            stato={stato(i)}
            titolo={ts.foglio.parole[parola] ?? parola}
            glossa={glosse[i]}
            onClick={() => {
              setScelta(i)
              setEsito(null)
            }}
          />
        ))}
      </div>
    </Guscio>
  )
}
