import { useState } from 'react'
import { Guscio } from '../../ui/percorso/Guscio'
import { Badge, CartaRisposta, Esito, Occhiello, Scheda, Testa, Titolo } from '../../ui/percorso/pezzi'
import { riempi } from '../../copy/riempi'
import { useLingua } from '../../lib/lingua'
import { TINTE_RISPOSTA, vesteDi } from '../../data/percorso'
import type { Passo } from '../../data/percorso'
import type { StatoCarta } from '../../ui/percorso/pezzi'
import type { PropsEsercizio } from './tipi'

const LETTERE = ['A', 'B', 'C', 'D', 'E']

/**
 * Uno scenario e le parole fra cui scegliere.
 *
 * Sono due schermi del disegno — `bl-false-friends` e `bl-story` — e qui sono
 * uno solo, perche' la differenza fra loro e' quanto e' lungo lo scenario e
 * quante risposte ci sono. I falsi amici danno due parole che si somigliano;
 * la storia ne da' tre o quattro, quasi tutte di altre lezioni.
 *
 * ── LE RIGHE SOTTO ALLE RISPOSTE ───────────────────────────────────────────
 * Nella veste della lezione 1 sono descrizioni ("Leggera, senza attrito") e
 * si vedono da subito. Nella veste classica sono spiegazioni del perche' una
 * risposta e' quella giusta ("C'e' uno sforzo chiaro fatto 48 ore fa") e si
 * vedono solo dopo aver verificato: nei frame sono disegnate insieme alla
 * spunta, cioe' fanno parte dello stato "gia' risposto". Mostrarle prima
 * vorrebbe dire scrivere la risposta accanto alla domanda.
 */
export function Scelta({
  passo,
  testi,
  lezione,
  parole,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'storia' | 'gemelle' }>>) {
  const { tpe, ts } = useLingua()
  const gemelle = passo.tipo === 'gemelle'
  const t = gemelle ? testi.gemelle : testi.storia
  const glosse = gemelle ? testi.gemelle.glosse : []
  const classico = vesteDi(lezione) === 'classico'
  const buchi = { uno: parole[0], due: parole[1] }

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
      azione={esito === true ? tpe.comune.continua : t.azione}
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
          {esito ? (t.esito ? riempi(t.esito, buchi) : null) : tpe.comune.riprova}
        </Esito>
      }
    >
      {classico ? (
        <Testa occhiello={t.occhiello} titolo={t.titolo ?? ''} />
      ) : (
        <Occhiello nome={gemelle ? 'domanda' : 'libro-aperto'}>{t.occhiello}</Occhiello>
      )}

      <div className={classico ? 'mt-[30px]' : 'mt-[10px]'}>
        <Badge>{t.badge}</Badge>
      </div>

      {classico ? (
        <p className="m-0 mt-[14px] text-[15px] leading-[1.5] text-ink-soft">{t.scenario}</p>
      ) : gemelle ? (
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
        className={`m-0 ${
          classico || gemelle
            ? 'mt-[18px] text-[13px] font-bold text-ink-soft'
            : 'mt-[27px] text-center text-[10px] font-bold tracking-[1px] uppercase text-lilla'
        }`}
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
            glossa={classico && esito === null ? undefined : glosse[i]}
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
