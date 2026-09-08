import { useEffect } from 'react'
import { Guscio } from '../../ui/percorso/Guscio'
import { TINTE_PASTIGLIA } from '../../ui/percorso/pezzi'
import { riempi } from '../../copy/riempi'
import { useLingua } from '../../lib/lingua'
import { finisciLezione, useProgresso } from '../../lib/percorso'
import { LEZIONI, passiDi } from '../../data/percorso'
import type { Passo } from '../../data/percorso'
import type { PropsEsercizio } from './tipi'
import scintilla from '../../assets/percorso/scintilla.svg'

/**
 * La lezione e' finita — la veste delle lezioni 2-8.
 *
 * Cambia il disegno, non quello che succede: `finisciLezione` parte appena lo
 * schermo compare, non quando si preme il bottone in fondo. Chi arriva fin
 * qui la lezione l'ha fatta, e chiudere l'app su questo schermo non e' un
 * motivo per rifarla domani.
 */
export function FattoClassico({
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

  const incontri = (passiDi(lezione) ?? []).filter((p) => p.tipo === 'incontra')
  const tutte = LEZIONI.length * 2
  const sbloccate = progresso.fatte.length * 2
  const numeri = { fatte: sbloccate, tutte, restano: tutte - sbloccate }

  return (
    <Guscio avanzamento={avanzamento} indietro={indietro} azione={t.azione} onAzione={avanti}>
      <div className="mx-auto mt-[26px] flex size-[150px] items-center justify-center">
        <img src={scintilla} alt="" aria-hidden className="size-[60px]" />
      </div>

      <h1 className="bab-display m-0 mt-[30px] text-center text-[28px] leading-[34px] font-bold tracking-[-0.56px] text-ink">
        {t.titolo}
      </h1>

      {t.sotto && (
        <p className="m-0 mt-4 text-center text-[15px] leading-[1.4] text-ink-soft">
          {riempi(t.sotto, numeri)}
        </p>
      )}

      {/* le due parole appena sbloccate, come pastiglie */}
      <div className="mt-[22px] flex items-center justify-center gap-3">
        {incontri.map((p, i) => (
          <span
            key={p.parola}
            className="rounded-pill px-5 py-[10px] text-[15px] font-bold text-ink"
            style={{ background: TINTE_PASTIGLIA[i % TINTE_PASTIGLIA.length] }}
          >
            {ts.foglio.parole[p.parola] ?? p.parola}
          </span>
        ))}
      </div>

      <div className="relative mt-[46px] overflow-hidden rounded-[20px] border-[0.5px] border-[rgba(209,201,196,0.5)] bg-surface px-6 py-5 pl-[30px] shadow-[0px_6px_20px_0px_rgba(0,0,0,0.04)]">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[6px]"
          style={{ background: 'linear-gradient(to bottom, #ffd1c1, var(--color-lime))' }}
        />
        <p className="m-0 text-[10px] font-bold tracking-[1px] uppercase text-lilla">
          {t.etichettaProgresso}
        </p>
        <p className="bab-display m-0 mt-[6px] text-[22px] leading-[28px] font-bold text-ink">
          {riempi(t.conteggio, numeri)}
        </p>
        {/* la barra: e' il progresso su tutte e sedici, non su questa lezione */}
        <div className="mt-4 h-[10px] overflow-hidden rounded-pill bg-chip">
          <div
            className="bab-avanzamento h-full rounded-pill"
            style={{
              width: `${(sbloccate / tutte) * 100}%`,
              background: 'linear-gradient(to right, var(--color-lime), #a3e635)',
            }}
          />
        </div>
      </div>
    </Guscio>
  )
}
