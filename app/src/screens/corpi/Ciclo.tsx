import { Schermo } from '../../ui/Schermo'
import { Occhiello, Titolo, Occhio, Gruppo } from '../../ui/Testo'
import { CampoData } from '../../ui/Campo'
import { Bottone } from '../../ui/Bottone'
import { Carta, Carte } from '../../ui/Carta'
import { Pillole, Selettore } from '../../ui/Scelte'
import { useLingua } from '../../lib/lingua'
import { scrivi, useRisposte } from '../../lib/risposte'
import type { Risposte } from '../../lib/risposte'
import type { PropsSchermo } from '../tipi'

const STACCO = 'mt-[52px]'

/*
 * 11-cycle-question — 3772:241 / 3958:769
 *
 * Non ha bottone: si tocca una carta e si va avanti. E' l'unica domanda
 * dell'onboarding senza "Continua", ed e' cosi' anche nel disegno — il frame
 * non ha il cta-button.
 */
export function CorpoCicloSiNo({ nodo, avanzamento, avanti, indietro }: PropsSchermo) {
  const { t } = useLingua()
  const { ciclo } = useRisposte()
  return (
    <Schermo nodo={nodo} avanzamento={avanzamento} indietro={indietro}>
      <Occhiello>{t.cicloSiNo.occhiello}</Occhiello>
      <Titolo>{t.cicloSiNo.titolo}</Titolo>
      <div className="mt-[68px]">
        <Carte>
          {t.cicloSiNo.scelte.map((s) => (
            <Carta
              key={s.id}
              titolo={s.titolo}
              sotto={s.sotto}
              scelta={ciclo === s.id}
              onClick={() => {
                scrivi({ ciclo: s.id as Risposte['ciclo'] })
                avanti()
              }}
            />
          ))}
        </Carte>
      </div>
    </Schermo>
  )
}

/* 12-cycle-dates — 3772:261 / 3958:797 */
export function CorpoCicloDate({ nodo, avanzamento, avanti, indietro }: PropsSchermo) {
  const { t } = useLingua()
  const { cicliUltimi } = useRisposte()

  function cambia(i: number, v: string) {
    scrivi((r) => {
      const copia = [...r.cicliUltimi] as Risposte['cicliUltimi']
      copia[i] = v
      return { cicliUltimi: copia }
    })
  }

  return (
    <Schermo
      nodo={nodo}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={<Bottone onClick={avanti}>{t.comune.continua}</Bottone>}
    >
      <Occhiello>{t.cicloDate.occhiello}</Occhiello>
      <Titolo>{t.cicloDate.titolo}</Titolo>
      <Occhio>{t.cicloDate.occhio}</Occhio>
      <div className={`${STACCO} flex flex-col gap-5`}>
        {t.cicloDate.etichette.map((et, i) => (
          <Gruppo key={et} etichetta={et}>
            <CampoData
              valore={cicliUltimi[i]}
              onChange={(v) => cambia(i, v)}
              segnaposto={t.cicloDate.segnaposto}
            />
          </Gruppo>
        ))}
      </div>
    </Schermo>
  )
}

/* 13b-first-period-date — 3907:2 / 3958:1308 */
export function CorpoPrimoCiclo({ nodo, avanzamento, avanti, indietro }: PropsSchermo) {
  const { t } = useLingua()
  const { primoCicloMese, primoCicloAnno } = useRisposte()
  const oggi = new Date().getFullYear()
  const anni = Array.from({ length: 20 }, (_, i) => oggi - i)

  return (
    <Schermo
      nodo={nodo}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={
        <Bottone attivo={primoCicloAnno !== null} onClick={avanti}>
          {t.comune.continua}
        </Bottone>
      }
    >
      <Occhiello>{t.primoCiclo.occhiello}</Occhiello>
      <Titolo>{t.primoCiclo.titolo}</Titolo>
      <Occhio>{t.primoCiclo.occhio}</Occhio>
      <div className={`${STACCO} flex flex-col gap-5`}>
        <Gruppo etichetta={t.primoCiclo.mese}>
          <Selettore
            valore={primoCicloMese}
            onChange={(v) => scrivi({ primoCicloMese: v })}
            segnaposto={t.primoCiclo.scegliMese}
            voci={t.mesi.map((testo, i) => ({ valore: i, testo }))}
          />
        </Gruppo>
        <Gruppo etichetta={t.primoCiclo.anno}>
          <Selettore
            valore={primoCicloAnno}
            onChange={(v) => scrivi({ primoCicloAnno: v })}
            segnaposto={t.primoCiclo.scegliAnno}
            voci={anni.map((a) => ({ valore: a, testo: String(a) }))}
          />
        </Gruppo>
      </div>
    </Schermo>
  )
}

/* 14-contraceptive — 3772:287 / 3958:1437 */
export function CorpoContraccettivo({ nodo, avanzamento, avanti, indietro }: PropsSchermo) {
  const { t } = useLingua()
  const { contraccettivo } = useRisposte()
  return (
    <Schermo
      nodo={nodo}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={
        <Bottone attivo={contraccettivo !== ''} onClick={avanti}>
          {t.comune.continua}
        </Bottone>
      }
    >
      <Occhiello>{t.contraccettivo.occhiello}</Occhiello>
      <Titolo>{t.contraccettivo.titolo}</Titolo>
      <div className="mt-9">
        <Pillole
          voci={[
            { id: 'si' as const, testo: t.comune.si },
            { id: 'no' as const, testo: t.comune.no },
          ]}
          scelta={contraccettivo === '' ? null : contraccettivo}
          onChange={(v) => scrivi({ contraccettivo: v })}
        />
      </div>
      <p className="m-0 mt-6 text-[13px] leading-[1.5] text-ink-soft">{t.contraccettivo.nota}</p>
    </Schermo>
  )
}
