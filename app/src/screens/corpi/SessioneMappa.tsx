import { useState } from 'react'
import { Schermo } from '../../ui/Schermo'
import { Bottone } from '../../ui/Bottone'
import { Titolo } from '../../ui/Testo'
import { OcchielloSessione } from '../../ui/sessione/Testo'
import { Interruttore } from '../../ui/sessione/Comandi'
import { Mappa, Riquadro } from '../../ui/sessione/Mappa'
import { Foglio } from '../../ui/sessione/Foglio'
import { testiSessione } from '../../copy/sessione'
import { riempi } from '../../copy/riempi'
import { useLingua } from '../../lib/lingua'
import { scriviSessione, useDatiSessione } from '../../lib/sessione'
import type { Sensazione } from '../../lib/sessione'
import type { Lato } from '../../data/sessione'
import type { PropsSessione } from '../tipi'

/** Una sensazione appena nata, prima che ci scriva dentro qualcosa. */
function nuovaSensazione(zona: string): Sensazione {
  return {
    id: crypto.randomUUID(),
    zona,
    zonaLibera: '',
    parole: [],
    sue: '',
    unLato: null,
    quando: null,
    comparsa: null,
    effetto: null,
    // il centro della scala: come per i cursori, e' l'unico punto che non
    // suggerisce gia' una risposta
    intensita: 5,
  }
}

/**
 * La mappa del corpo. Stesso schermo prima e dopo, cambia solo il bottone.
 *
 * Toccare un punto apre il foglio; salvare aggiunge la sensazione e chiude.
 * Toccare un punto gia' segnato riapre quella sensazione invece di farne una
 * seconda sullo stesso posto — se no la stessa coscia comparirebbe tre volte
 * e nessuno saprebbe piu' quale delle tre e' quella vera.
 */
export function CorpoMappa({ tipo, passo, verso, avanzamento, avanti, indietro }: PropsSessione) {
  const dati = useDatiSessione(tipo)
  const { lingua } = useLingua()
  const t = testiSessione(lingua).mappa
  const [lato, setLato] = useState<Lato>('front')
  const [aperta, setAperta] = useState<Sensazione | null>(null)
  const [eNuova, setENuova] = useState(true)

  function tocca(codice: string) {
    const gia = dati.sensazioni.find((s) => s.zona === codice)
    setENuova(!gia)
    setAperta(gia ?? nuovaSensazione(codice))
  }

  function salva(s: Sensazione) {
    scriviSessione(tipo, (d) => ({
      sensazioni: d.sensazioni.some((x) => x.id === s.id)
        ? d.sensazioni.map((x) => (x.id === s.id ? s : x))
        : [...d.sensazioni, s],
    }))
    setAperta(null)
  }

  function togli(id: string) {
    scriviSessione(tipo, (d) => ({ sensazioni: d.sensazioni.filter((x) => x.id !== id) }))
    setAperta(null)
  }

  const segnate = dati.sensazioni.map((s) => s.zona)

  return (
    <>
      <Schermo
        nodo={passo.nodo}
        verso={verso}
        avanzamento={avanzamento}
        indietro={indietro}
        stacco={30}
        margini={24}
        azione={
          <>
            <Bottone onClick={avanti}>
              {tipo === 'checkin' ? t.azionePrima : t.azioneDopo}
            </Bottone>
            {/*
              Il conteggio sta SOTTO al bottone, come nel disegno. Sembra un
              posto strano finche' non si guarda cosa fa: chi ha appena
              aggiunto una sensazione guarda il pollice, non la testa dello
              schermo, e li' il numero e' proprio dove sta guardando.
            */}
            <p className="m-0 mt-[10px] h-4 text-center text-[14px] font-bold text-lilla">
              {dati.sensazioni.length > 0 ? riempi(
                    dati.sensazioni.length === 1 ? t.conteggio.uno : t.conteggio.molte,
                    { n: dati.sensazioni.length },
                  ) : ''}
            </p>
          </>
        }
      >
        <OcchielloSessione icona="gps">{t.occhiello}</OcchielloSessione>
        <Titolo>{t.titolo}</Titolo>
        <p className="m-0 mt-2 text-[16px] font-bold tracking-[-0.32px] text-ink-soft">
          {t.occhio}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <Interruttore<Lato>
            voci={[
              { id: 'front', testo: t.davanti },
              { id: 'back', testo: t.dietro },
            ]}
            scelta={lato}
            onChange={setLato}
            etichetta={t.titolo}
          />
          <button
            type="button"
            onClick={() => {
              setENuova(true)
              setAperta(nuovaSensazione('altrove'))
            }}
            className="flex h-[41px] shrink-0 items-center gap-2 rounded-pill border-[1.5px] border-paper bg-surface px-4 text-[14px] font-bold text-spento"
            style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.05))' }}
          >
            {t.altrove}
            <span className="flex size-5 items-center justify-center rounded-full bg-paper text-[12px] text-ink-soft">
              ⓘ
            </span>
          </button>
        </div>

        <div className="mt-4">
          <Riquadro>
            <Mappa lato={lato} scelte={segnate} onTocca={tocca} />
          </Riquadro>
        </div>

        <p className="m-0 mt-[18px] text-[13px] leading-[18px] text-ink">{t.nota}</p>
      </Schermo>

      {aperta && (
        <Foglio
          key={aperta.id}
          tipo={tipo}
          sensazione={aperta}
          nuova={eNuova}
          onSalva={salva}
          onTogli={() => togli(aperta.id)}
          onChiudi={() => setAperta(null)}
        />
      )}
    </>
  )
}
