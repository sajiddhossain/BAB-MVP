import { useEffect } from 'react'
import { Guscio } from '../../ui/percorso/Guscio'
import { icona } from '../../ui/percorso/pezzi'
import { riempi } from '../../copy/riempi'
import { useLingua } from '../../lib/lingua'
import { finisciLezione, useProgresso } from '../../lib/percorso'
import { LEZIONI, passiDi } from '../../data/percorso'
import type { Passo } from '../../data/percorso'
import type { PropsEsercizio } from './tipi'
import medaglia from '../../assets/percorso/medaglia.svg'

/** Le tinte dei due cerchietti, nell'ordine del disegno. */
const TINTE = ['#ffd1c1', '#e9d5ff']

/**
 * La lezione e' finita.
 *
 * ── QUI SI SCRIVE, E SI SCRIVE ENTRANDO ────────────────────────────────────
 * `finisciLezione` parte appena lo schermo compare, non quando si preme il
 * bottone in fondo. Chi arriva fin qui la lezione l'ha fatta: chiudere l'app
 * su questo schermo invece di premere "torna al percorso" non e' un motivo
 * per rifarla domani.
 *
 * Si scrive prima nel telefono e poi nel database, e la scrittura e' un
 * `upsert`: rientrare in una lezione gia' fatta non rompe niente e non
 * sblocca niente due volte.
 */
export function Fatto({
  lezione,
  testi,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'fatto' }>>) {
  const { ts } = useLingua()
  const t = testi.fatto
  const progresso = useProgresso()

  useEffect(() => {
    void finisciLezione(lezione)
  }, [lezione])

  /* le due parole di questa lezione, con l'icona che avevano nelle schede */
  const incontri = (passiDi(lezione) ?? []).filter((p) => p.tipo === 'incontra')

  const tutte = LEZIONI.length * 2
  const sbloccate = progresso.fatte.length * 2
  /* quanto ha aggiunto questa lezione: due parole su sedici, cioe' il 12% */
  const quota = Math.floor((2 / tutte) * 100)

  return (
    <Guscio
      avanzamento={avanzamento}
      indietro={indietro}
      azione={t.azione}
      onAzione={avanti}
    >
      <div className="relative mx-auto mt-[6px] flex size-[140px] items-center justify-center">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ background: 'linear-gradient(135deg, #ffd1c1, #e9d5ff)' }}
        />
        <img src={medaglia} alt="" aria-hidden className="relative size-[70px]" />
      </div>

      <h1 className="bab-display m-0 mt-5 text-center text-[28px] leading-[34px] font-bold tracking-[-0.56px] text-ink">
        {t.titolo}
      </h1>

      <p className="m-0 mt-[26px] text-center text-[10px] font-bold tracking-[1px] uppercase text-lilla">
        {t.etichetta}
      </p>

      <div className="mt-[19px] grid grid-cols-2 gap-3">
        {incontri.map((p, i) => (
          <div
            key={p.parola}
            className="flex flex-col items-center rounded-[20px] border-[0.5px] border-[rgba(209,201,196,0.5)] bg-surface px-3 py-5 shadow-[0px_6px_20px_0px_rgba(0,0,0,0.04)]"
          >
            <span
              className="flex size-10 items-center justify-center rounded-full"
              style={{ background: TINTE[i % TINTE.length] }}
            >
              <img src={icona(p.icona)} alt="" aria-hidden className="size-5" />
            </span>
            <p className="m-0 mt-4 text-center text-[18px] font-bold text-ink">
              {ts.foglio.parole[p.parola] ?? p.parola}
            </p>
            <p className="m-0 mt-2 text-center text-[12px] leading-[1.4] text-ink-soft">
              {t.righe[i]}
            </p>
          </div>
        ))}
      </div>

      <div
        className="relative mt-5 flex items-center gap-3 overflow-hidden rounded-[20px] border px-5 py-[22px]"
        style={{
          borderColor: '#a3e635',
          background: 'linear-gradient(to right, #ecfccb, #d9f99d)',
        }}
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-[6px]" style={{ background: '#a3e635' }} />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold tracking-[1px] uppercase text-[#2b662b]">
            {t.etichettaProgresso}
          </span>
          <span className="mt-[4px] block text-[18px] font-bold text-ink">
            {riempi(t.conteggio, { fatte: sbloccate, tutte })}
          </span>
        </span>
        <span className="shrink-0 rounded-pill bg-surface px-3 py-[6px] text-[13px] font-bold text-[#2b662b]">
          +{quota}%
        </span>
      </div>
    </Guscio>
  )
}
