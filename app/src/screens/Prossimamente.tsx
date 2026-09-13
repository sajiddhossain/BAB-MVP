import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sfondo } from '../ui/Sfondo'
import { Bottone } from '../ui/Bottone'
import { Errore } from '../ui/Testo'
import { useModale } from '../ui/modale'
import { BottoneTocco } from '../ui/tocco'
import { BarraSotto } from '../ui/casa/BarraSotto'
import { Riga, Scheda } from '../ui/percorso/pezzi'
import { useLingua } from '../lib/lingua'
import { cancellaAccount } from '../lib/conto'
import { SEZIONI } from '../data/sezioni'
import scintille from '../assets/icon-sparkles.svg'

/**
 * Una sezione che c'e' ma non e' ancora aperta.
 *
 * Non e' uno schermo del disegno: nel pilota il percorso parte spento, e
 * questo e' quello che l'atleta trova toccando "Percorso". Era un segnaposto
 * — titolo, «Arriva presto.», pagina vuota — e un segnaposto va bene finche'
 * lo vede solo chi lavora qui.
 *
 * Adesso dice due cose e basta: che cos'e' quella parte, e che non deve fare
 * niente per averla. Le parole stanno in `copy/testi.ts` come tutte le altre,
 * quindi si correggono dal pannello senza ricompilare — che era mezzo motivo
 * per rifarlo.
 *
 * Il nome in cima e' quello della barra in fondo: e' la parola che ha appena
 * toccato, ed e' quella che si aspetta di rileggere.
 */
export function Prossimamente({ id, profilo = false }: { id: string; profilo?: boolean }) {
  const { t, lingua, cambia } = useLingua()
  const vai = useNavigate()
  const [conferma, setConferma] = useState(false)

  const tp = t.prossimamente
  const detto = (tp.sezioni as Record<string, { cosa: string; quando: string }>)[id]
  const nome =
    (t.casa.nav as Record<string, string>)[id] ?? SEZIONI.find((s) => s.id === id)?.nome ?? ''

  return (
    /*
      `h-dvh` e non `min-h-dvh`: con il minimo il contenitore cresce insieme
      al contenuto, l'area interna non arriva mai a dover scorrere, e la barra
      in fondo — che sta attaccata al fondo del contenitore — se ne va sotto
      allo schermo. Con l'altezza fissa scorre il dentro e la barra resta.
    */
    <div className="flex h-dvh justify-center bg-paper">
      <div className="relative flex w-full max-w-[402px] flex-col overflow-hidden">
        <Sfondo nodo="prossimamente" />

        <div className="bab-entra-avanti relative flex-1 overflow-y-auto px-[24px] pt-[calc(58px+env(safe-area-inset-top))] pb-[104px]">
          <p className="m-0 flex items-center gap-2">
            <img src={scintille} alt="" aria-hidden className="size-[18px] shrink-0" />
            <span className="text-[10px] font-bold tracking-[1px] text-lilla uppercase">
              {tp.occhiello}
            </span>
          </p>

          <h1 className="bab-display m-0 mt-[6px] text-[28px] leading-[34px] font-bold tracking-[-0.56px] text-ink">
            {nome}
          </h1>

          {/*
            Senza il testo di quella sezione non si inventa niente: resta il
            nome, e sotto il bottone per tornare indietro. Capita solo per una
            sezione aggiunta al codice e non ancora scritta, e in quel caso una
            scheda vuota sarebbe peggio di una scheda che non c'e'.
          */}
          {detto && (
            <>
              <div className="mt-[22px]">
                <Scheda riga="linear-gradient(to bottom, #ffd1c1, #e9d5ff, var(--color-lime))">
                  <div className="px-4 py-[14px] pl-[22px]">
                    <p className="m-0 text-[10px] font-bold tracking-[1px] text-lilla uppercase">
                      {tp.etichettaCosa}
                    </p>
                    <Riga />
                    <p className="m-0 text-[14px] leading-[1.55] text-ink-soft">{detto.cosa}</p>
                  </div>
                </Scheda>
              </div>

              <div className="mt-[14px]">
                <Scheda riga="var(--color-lime)">
                  <div className="px-4 py-[14px] pl-[22px]">
                    <p className="m-0 text-[10px] font-bold tracking-[1px] text-lilla uppercase">
                      {tp.etichettaQuando}
                    </p>
                    <Riga />
                    <p className="m-0 text-[14px] leading-[1.55] text-ink-soft">{detto.quando}</p>
                  </div>
                </Scheda>
              </div>
            </>
          )}

          <div className="mt-[26px]">
            <Bottone onClick={() => vai('/casa')}>{tp.azione}</Bottone>
          </div>

          {/*
            Le due cose che servono a provare l'app: la lingua e il ricomincia
            da capo. Non sono uno schermo del profilo, sono gli attrezzi che ci
            stanno finche' il profilo vero non c'e'.
          */}
          {profilo && (
            <>
              <div className="mt-8 flex gap-2">
                {(['it', 'en'] as const).map((l) => (
                  <BottoneTocco
                    key={l}
                    onClick={() => cambia(l)}
                    className={`h-11 flex-1 rounded-[12px] border-[1.5px] text-[13px] font-bold ${
                      lingua === l ? 'border-ink bg-lime' : 'border-line bg-surface'
                    }`}
                  >
                    {l.toUpperCase()}
                  </BottoneTocco>
                ))}
              </div>

              {/* cancella davvero, quindi prima chiede: vedi `ConfermaRicomincia` */}
              <BottoneTocco
                onClick={() => setConferma(true)}
                className="mt-4 h-11 w-full rounded-[12px] border-[1.5px] border-line bg-surface text-[13px] font-bold text-ink"
              >
                {lingua === 'it' ? 'Ricomincia da capo' : 'Start over'}
              </BottoneTocco>
            </>
          )}
        </div>

        <BarraSotto />
      </div>

      {conferma && <ConfermaRicomincia onChiudi={() => setConferma(false)} />}
    </div>
  )
}

/**
 * «Ricominciare da capo?» — il foglio che chiede prima di cancellare.
 *
 * E' fatto come il foglio delle sensazioni: sale dal basso, dietro lo schermo
 * si scurisce, e il resto non si tocca finche' e' aperto. Cancellare non si
 * annulla, e un tocco per sbaglio sul bottone del profilo non deve bastare.
 *
 * Mentre cancella non si chiude: ne' col fondo, ne' con Annulla, ne' con Esc.
 * Chiuderlo a meta' non fermerebbe il database, e lascerebbe credere che non
 * sia successo niente.
 *
 * Finito, la pagina si ricarica da capo invece di cambiare indirizzo: le copie
 * in memoria — risposte, tutorial, percorso — ripartono vuote tutte insieme,
 * senza doverle dimenticare una per una.
 */
function ConfermaRicomincia({ onChiudi }: { onChiudi: () => void }) {
  const { t } = useLingua()
  const c = t.prossimamente.ricomincia
  const modale = useModale<HTMLDivElement>()
  const [inCorso, setInCorso] = useState(false)
  const [errore, setErrore] = useState(false)

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !inCorso) onChiudi()
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onChiudi, inCorso])

  async function cancella() {
    if (inCorso) return
    setInCorso(true)
    setErrore(false)
    const esito = await cancellaAccount()
    if (!esito.ok) {
      console.error('[ricomincia]', esito.errore)
      setInCorso(false)
      setErrore(true)
      return
    }
    window.location.replace('/onboarding/accesso')
  }

  return (
    <div ref={modale} className="fixed inset-0 z-50 flex justify-center">
      <div className="relative flex w-full max-w-[402px] flex-col justify-end">
        <button
          type="button"
          aria-label={c.annulla}
          onClick={() => {
            if (!inCorso) onChiudi()
          }}
          className="bab-affiora absolute inset-0 bg-black/40"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ricomincia-titolo"
          tabIndex={-1}
          className="bab-sale relative rounded-t-[20px] bg-surface px-6 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] outline-none"
          style={{ boxShadow: '0px -4px 20px 0px rgba(0,0,0,0.15)' }}
        >
          <div className="mx-auto h-1 w-9 rounded-sm bg-line/60" aria-hidden />

          <h2
            id="ricomincia-titolo"
            className="bab-display m-0 mt-[18px] text-[26px] leading-[1.12] font-bold text-ink"
          >
            {c.titolo}
          </h2>
          <p className="m-0 mt-3 text-[14px] leading-[1.5] text-ink-soft">{c.testo}</p>

          <div className="mt-6">
            <Bottone attivo={!inCorso} onClick={() => void cancella()}>
              {inCorso ? c.inCorso : c.conferma}
            </Bottone>
            {errore && <Errore>{c.errore}</Errore>}
          </div>

          {/* secondario come il "togli" del foglio: la cosa da fare di solito e' tornare indietro */}
          <button
            type="button"
            disabled={inCorso}
            onClick={onChiudi}
            className="mt-3 h-12 w-full rounded-pill border-[1.5px] border-line bg-surface text-[15px] font-bold text-ink disabled:opacity-45"
          >
            {c.annulla}
          </button>
        </div>
      </div>
    </div>
  )
}
