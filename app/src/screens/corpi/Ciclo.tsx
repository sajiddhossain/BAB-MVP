import { Schermo } from '../../ui/Schermo'
import { Occhiello, Titolo, Occhio, Gruppo } from '../../ui/Testo'
import { Apri } from '../../ui/Apri'
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
 * 11-cycle-question + 13b-first-period-date — 3772:241 / 3958:769 e 3907:2
 *
 * Sono un frame solo, non due schermi: in 3907:2 le altre due carte sono
 * ancora li' sotto, scese di 70px, e la prima si e' aperta nel modulo del
 * mese e dell'anno. Per questo qui c'e' un componente solo che si apre,
 * invece di due schermi che si sostituiscono — sostituendoli, le due carte
 * che restano ripartirebbero da capo invece di scorrere in giu'.
 *
 * L'indirizzo pero' resta diverso (`ciclo` e `primo-ciclo`): cosi' il tasto
 * indietro del telefono richiude il modulo invece di uscire dalla domanda, e
 * la barra dell'avanzamento sale, come sale in Figma fra i due frame.
 *
 * Chiusa non ha bottone: si tocca una carta e si va. E' l'unica domanda
 * dell'onboarding senza "Continua", ed e' cosi' anche nel disegno.
 */
export function CorpoCicloSiNo({ passo, nodo, avanzamento, avanti, indietro }: PropsSchermo) {
  const { t } = useLingua()
  const { ciclo, primoCicloMese, primoCicloAnno } = useRisposte()
  const aperto = passo.id === 'primo-ciclo'

  const oggi = new Date().getFullYear()
  const anni = Array.from({ length: 20 }, (_, i) => oggi - i)

  function rispondi(id: string) {
    scrivi({ ciclo: id as Risposte['ciclo'] })
    avanti()
  }

  const altre = t.cicloSiNo.scelte.filter((s) => s.id !== 'si')

  return (
    <Schermo
      nodo={nodo}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={
        aperto ? (
          <Bottone attivo={primoCicloAnno !== null} onClick={avanti}>
            {t.comune.continua}
          </Bottone>
        ) : undefined
      }
    >
      <Occhiello>{t.cicloSiNo.occhiello}</Occhiello>
      {/*
        Le due domande stanno tutte e due nel titolo, una aperta e una chiusa.
        Scambiando solo il testo il titolo passerebbe da una riga a due di
        scatto, e tutto quello che sta sotto salterebbe di 40px nel momento
        esatto in cui comincia a scorrere.
      */}
      <Titolo>
        <Apri aperto={!aperto} dentroTesto>
          {t.cicloSiNo.titolo}
        </Apri>
        <Apri aperto={aperto} dentroTesto>
          {t.primoCiclo.titolo}
        </Apri>
      </Titolo>

      {/* quello che compare aprendo: la spiegazione e i due menu */}
      <Apri aperto={aperto}>
        <div className="pt-[10px]">
          <Occhio>{t.primoCiclo.occhio}</Occhio>
        </div>
        <div className="mt-9 flex flex-col gap-3">
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
        <div className="h-5" />
      </Apri>

      {/* la carta del "si'": e' quella che si trasforma, quindi sparisce */}
      <Apri aperto={!aperto}>
        <div className="h-[134px]" />
        <Carta
          titolo={t.cicloSiNo.scelte[0].titolo}
          sotto={t.cicloSiNo.scelte[0].sotto}
          scelta={ciclo === 'si'}
          onClick={() => rispondi('si')}
        />
        <div className="h-[9px]" />
      </Apri>

      {/* le altre due restano, e scendono da sole perche' stanno nel flusso */}
      <Carte>
        {altre.map((s) => (
          <Carta
            key={s.id}
            titolo={s.titolo}
            sotto={s.sotto}
            scelta={ciclo === s.id}
            striscia={aperto ? 'lato' : 'sopra'}
            onClick={() => rispondi(s.id)}
          />
        ))}
      </Carte>
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
