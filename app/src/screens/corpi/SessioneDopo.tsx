import { useState } from 'react'
import { Schermo } from '../../ui/Schermo'
import { Bottone } from '../../ui/Bottone'
import { Titolo } from '../../ui/Testo'
import { OcchielloSessione, TitoloScheda } from '../../ui/sessione/Testo'
import { Scheda } from '../../ui/sessione/Scheda'
import { Cursore } from '../../ui/sessione/Cursore'
import { BOTTINO, FACCE } from '../../data/sessione'
import type { Bottino } from '../../data/sessione'
import { riempi } from '../../copy/riempi'
import { useLingua } from '../../lib/lingua'
import { datiSessione, scriviSessione, useDatiSessione } from '../../lib/sessione'
import type { PropsSessione } from '../tipi'

const ICONE = import.meta.glob<string>('../../assets/sessione/*.svg', {
  eager: true,
  import: 'default',
})
const icona = (n: string) => ICONE[`../../assets/sessione/${n}.svg`]

/** Lo sforzo percepito: la scala CR-10 di Foster, che nel database e' `effort`. */
export function CorpoSforzo({ tipo, passo, verso, avanzamento, avanti, indietro }: PropsSessione) {
  const dati = useDatiSessione(tipo)
  const { ts } = useLingua()
  const t = ts.sforzo

  return (
    <Schermo
      nodo={passo.nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      stacco={30}
      azione={<Bottone onClick={avanti}>{t.azione}</Bottone>}
    >
      <OcchielloSessione icona="nota">{t.occhiello}</OcchielloSessione>
      <Titolo>{t.titolo}</Titolo>

      <div className="mt-[22px] flex flex-col gap-[14px]">
        <Scheda className="px-[18px] pt-[16px] pb-[18px]">
          <TitoloScheda titolo={t.carta} />
          <div className="mt-[14px]">
            <Cursore
              valore={dati.sforzo}
              onChange={(v) => scriviSessione(tipo, { sforzo: v })}
              min={0}
              max={10}
              verso="carico"
              sinistra={t.sinistra}
              destra={t.destra}
              etichetta={t.carta}
            />
          </div>
        </Scheda>

        <Scheda piatta className="px-[17px] py-[15px]">
          <p className="m-0 text-[15px] font-bold text-ink">{t.nota.titolo}</p>
          <p className="m-0 mt-[6px] text-[13px] leading-[1.5] tracking-[-0.26px] text-ink-soft">
            {t.nota.corpo}
          </p>
        </Scheda>
      </div>
    </Schermo>
  )
}

/**
 * Come si sente rispetto a com'e' andata, e cosa si porta a casa.
 *
 * Le cinque facce non sono un voto sulla prestazione: "delusa" e "orgogliosa"
 * possono stare tutte e due sopra allo stesso allenamento. E' per questo che
 * sono parole e non numeri — un numero qui si leggerebbe come una pagella.
 */
export function CorpoSoddisfazione({
  tipo,
  passo,
  verso,
  avanzamento,
  avanti,
  indietro,
}: PropsSessione) {
  const dati = useDatiSessione(tipo)
  const { ts } = useLingua()
  const t = ts.soddisfazione
  const [scriveSua, setScriveSua] = useState(false)

  function commuta(b: Bottino) {
    scriviSessione(tipo, (d) => ({
      bottino: d.bottino.includes(b) ? d.bottino.filter((x) => x !== b) : [...d.bottino, b],
    }))
  }

  return (
    <Schermo
      nodo={passo.nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      stacco={30}
      azione={
        <Bottone attivo={dati.soddisfazione !== null} onClick={avanti}>
          {t.azione}
        </Bottone>
      }
    >
      <OcchielloSessione icona="nota">{t.occhiello}</OcchielloSessione>
      <Titolo>{t.titolo}</Titolo>

      <div className="mt-[22px] flex flex-col gap-[14px]">
        <Scheda piatta className="px-[18px] pt-[16px] pb-[14px]">
          <p className="m-0 text-[15px] font-bold text-ink">{t.domanda}</p>
          <div
            className="mt-[7px] flex items-center justify-between rounded-chip px-[6px] py-3"
            style={{
              background:
                'linear-gradient(90deg, rgba(243,144,127,0.1) 0%, rgba(204,233,101,0.1) 50%, rgba(95,207,168,0.1) 100%)',
            }}
            role="radiogroup"
            aria-label={t.domanda}
          >
            {FACCE.map((f) => {
              const accesa = dati.soddisfazione === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={accesa}
                  onClick={() => scriviSessione(tipo, { soddisfazione: f.id })}
                  className="flex w-[56px] flex-col items-center gap-[6px]"
                >
                  <span
                    /*
                      Le tre cose che cambiano davvero, invece di `all`: la
                      faccia scelta cresce di quattro pixel, prende un bordo e
                      cambia fondo. `all` prometteva di animare anche tutto il
                      resto, compreso quello che un domani si aggiunge qui
                      senza pensarci.
                    */
                    className={`flex items-center justify-center rounded-full transition-[width,height,background-color,border-color] duration-150 motion-reduce:transition-none ${
                      accesa
                        ? 'size-12 border-2 border-verde-vivo bg-verde-fondo'
                        : 'size-11 bg-chip'
                    }`}
                  >
                    <img src={icona(f.icona)} alt="" aria-hidden className="size-9" />
                  </span>
                  <span
                    className={`text-[9px] leading-none ${
                      accesa ? 'font-bold text-verde-scuro' : 'text-ink-soft'
                    }`}
                  >
                    {t.facce[f.id]}
                  </span>
                </button>
              )
            })}
          </div>
        </Scheda>

        <Scheda className="px-[16px] pt-[14px] pb-[16px]">
          <p className="m-0 text-[17px] font-bold text-ink">{t.bottino.titolo}</p>
          <p className="m-0 mt-[3px] text-[11px] leading-[14px] tracking-[0.5px] text-ink-soft">
            {t.bottino.aiuto}
          </p>
          <div className="mt-[14px] flex flex-col items-start gap-[6px]">
            {BOTTINO.map((b) => {
              const accesa = dati.bottino.includes(b)
              return (
                <button
                  key={b}
                  type="button"
                  aria-pressed={accesa}
                  onClick={() => commuta(b)}
                  className={`flex max-w-full items-center gap-[6px] rounded-full border-[1.5px] py-[7px] pl-[9px] pr-[10px] text-left text-[11.5px] leading-[14px] transition-colors duration-150 ${
                    accesa
                      ? 'border-verde-vivo bg-verde-fondo font-bold text-verde-scuro'
                      : 'border-line bg-chip text-ink'
                  }`}
                >
                  <span className="relative block size-4 shrink-0">
                    <img
                      src={icona(accesa ? 'spunta-cerchio' : 'spunta-vuota')}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 size-4"
                    />
                    {accesa && (
                      <img
                        src={icona('spunta-segno')}
                        alt=""
                        aria-hidden
                        className="absolute left-[3.5px] top-[4.5px] w-[9px]"
                      />
                    )}
                  </span>
                  {t.bottino.voci[b]}
                </button>
              )
            })}

            {/*
              "Aggiungi tu..." e' tratteggiata perche' non e' una scelta: e'
              un invito a scrivere. Toccandola diventa un campo, e quello che
              scrive va in `note` — fuori dalla vista del coach, come tutto il
              resto delle sue parole.
            */}
            {scriveSua || dati.bottinoMio ? (
              <input
                autoFocus={scriveSua}
                value={dati.bottinoMio}
                onChange={(e) => scriviSessione(tipo, { bottinoMio: e.target.value.slice(0, 120) })}
                onBlur={() => setScriveSua(false)}
                placeholder={t.bottino.segnaposto}
                className="mt-1 h-10 w-full rounded-full border-[1.5px] border-dashed border-line bg-chip px-[12px] text-[11.5px] text-ink outline-none placeholder:text-ink-soft focus:border-solid focus:border-verde-tenue"
              />
            ) : (
              <button
                type="button"
                onClick={() => setScriveSua(true)}
                className="flex items-center gap-[6px] rounded-full border-[1.5px] border-dashed border-line bg-chip py-[7px] pl-[9px] pr-[10px] text-[11.5px] leading-[14px] text-ink-soft"
              >
                <img src={icona('matita')} alt="" aria-hidden className="size-4" />
                {t.bottino.tua}
              </button>
            )}
          </div>
        </Scheda>
      </div>
    </Schermo>
  )
}

/**
 * L'energia dopo, sulla stessa scala di quella di prima.
 *
 * La scheda sotto dice a quanto stava stamattina. Se il check-in non e' stato
 * fatto quel confronto non esiste, e lo si dice invece di inventare un
 * numero: e' l'unica cosa onesta da scrivere in quel riquadro.
 */
export function CorpoEnergia({ tipo, passo, verso, avanzamento, avanti, indietro }: PropsSessione) {
  const dati = useDatiSessione(tipo)
  const { ts } = useLingua()
  const t = ts.energia
  const prima = datiSessione('checkin')
  // il check-in c'e' stato solo se ha scelto un ritmo: l'energia da sola parte
  // gia' dal centro e non distingue "ha risposto 4" da "non ha aperto niente"
  const ceStata = prima.ritmo !== null

  return (
    <Schermo
      nodo={passo.nodo}
      verso={verso}
      avanzamento={avanzamento}
      indietro={indietro}
      stacco={30}
      azione={<Bottone onClick={avanti}>{t.azione}</Bottone>}
    >
      <OcchielloSessione icona="nota">{t.occhiello}</OcchielloSessione>
      <Titolo>{t.titolo}</Titolo>

      <div className="mt-[22px] flex flex-col gap-[14px]">
        <Scheda className="px-[18px] pt-[16px] pb-[18px]">
          <TitoloScheda titolo={t.carta} />
          <div className="mt-[14px]">
            <Cursore
              valore={dati.energia}
              onChange={(v) => scriviSessione(tipo, { energia: v })}
              sinistra={t.sinistra}
              destra={t.destra}
              etichetta={t.carta}
            />
          </div>
        </Scheda>

        <Scheda piatta className="px-[16px] py-[14px]">
          {ceStata ? (
            <>
              <p className="m-0 text-[15.5px] font-bold text-ink">{riempi(t.nota.titolo, { prima: prima.energia })}</p>
              <p className="m-0 mt-[6px] text-[12.5px] leading-[1.5] tracking-[-0.25px] text-ink-medio">
                {t.nota.corpo}
              </p>
            </>
          ) : (
            <p className="m-0 text-[12.5px] leading-[1.5] tracking-[-0.25px] text-ink-medio">
              {t.nota.senzaPrima}
            </p>
          )}
        </Scheda>
      </div>
    </Schermo>
  )
}
