import { useState } from 'react'
import { Badge, CartaRisposta, Esito, Occhiello, Testa, Titolo } from '../../ui/percorso/pezzi'
import { Guscio } from '../../ui/percorso/Guscio'
import { riempi } from '../../copy/riempi'
import { useLingua } from '../../lib/lingua'
import { TINTE_RISPOSTA, segnoDi, vesteDi } from '../../data/percorso'
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
 *
 * La pastiglia e lo scenario sopra alle carte ci sono solo nella veste
 * classica: nella lezione 1 la domanda sta tutta nel titolo.
 */
export function Mossa({
  passo,
  testi,
  lezione,
  parole,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'mossa' }>>) {
  const { tpe, tp } = useLingua()
  const t = testi.mossa
  const classico = vesteDi(lezione) === 'classico'
  const buchi = { uno: parole[0], due: parole[1] }

  const [scelta, setScelta] = useState<number | null>(null)
  const [esito, setEsito] = useState<boolean | null>(null)
  /* la mossa giusta la possono dire i testi, dove le due lingue non scelgono
     la stessa: vedi il commento su `gemelle.giusta` nei testi */
  const giusta = LIVELLI.indexOf(t.giusta ?? passo.giusta)

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
        setEsito(scelta === giusta)
      }}
      esito={
        <Esito
          aperto={esito !== null}
          giusto={esito === true}
          titolo={esito ? tpe.comune.giusto : tpe.comune.sbagliato}
        >
          {esito ? riempi(t.esito, buchi) : tpe.comune.riprova}
        </Esito>
      }
    >
      {classico ? (
        <Testa
          sopra={t.sopra}
          occhiello={t.occhiello}
          titolo={riempi(t.titolo, buchi)}
          segno={segnoDi(lezione)}
        />
      ) : (
        <>
          <Occhiello nome="scudo-mossa">{t.occhiello}</Occhiello>
          <div className="mt-[3px]">
            <Titolo>{riempi(t.titolo, buchi)}</Titolo>
          </div>
        </>
      )}

      {t.badge && (
        <div className="mt-[24px]">
          <Badge>{t.badge}</Badge>
        </div>
      )}
      {t.scenario && (
        <p className="m-0 mt-[14px] text-[13px] leading-[1.4] text-ink-soft">
          {riempi(t.scenario, buchi)}
        </p>
      )}

      <div className={classico ? 'mt-[30px] flex flex-col gap-3' : 'mt-[62px] flex flex-col gap-3'}>
        {LIVELLI.map((livello, i) => (
          <CartaRisposta
            key={livello}
            lettera={LETTERE[i]}
            tinta={TINTE_RISPOSTA[i % TINTE_RISPOSTA.length]}
            stato={stato(i)}
            /*
              Dalla terza lezione le carte non dicono piu' il nome del
              livello ma una frase intera ("CALIBRA: mobilita' dolce"): dove
              i testi ne danno una, vince quella.

              L'ordine resta sempre spingi / calibra / sostegno, anche dove
              il frame le mette al contrario. E' lo stesso ordine delle
              sedici schede e del check-in, e girarlo per uno schermo solo
              vorrebbe dire insegnare due scale diverse.
            */
            titolo={t.etichette?.[i] ? riempi(t.etichette[i], buchi) : tp.livelli[livello].nome}
            glossa={t.scelte[i] ? riempi(t.scelte[i], buchi) : undefined}
            onClick={() => {
              setScelta(i)
              setEsito(null)
            }}
          />
        ))}
      </div>

      {t.nota && (
        <p className="m-0 mt-[52px] text-center text-[13px] leading-[1.4] text-ink-soft">
          {riempi(t.nota, buchi)}
        </p>
      )}
    </Guscio>
  )
}
