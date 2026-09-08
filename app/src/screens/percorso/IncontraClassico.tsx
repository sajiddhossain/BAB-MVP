import { Guscio } from '../../ui/percorso/Guscio'
import { Blocchi, Scheda, Testa, icona } from '../../ui/percorso/pezzi'
import { riempi } from '../../copy/riempi'
import { useLingua } from '../../lib/lingua'
import { LIVELLO_DI } from '../../data/sessione'
import { TINTE_PASTIGLIA } from '../../ui/percorso/pezzi'
import type { Passo } from '../../data/percorso'
import type { PropsEsercizio } from './tipi'

/**
 * Conoscere una parola — la veste delle lezioni 2-8.
 *
 * Stessa cosa dell'altra, disegnata in un altro modo: qui c'e' un titolo
 * sopra ("Incontra «indolenzito»"), la scheda e' orizzontale — icona a
 * sinistra, parola e metafora accanto, descrizione sotto — e non c'e' la
 * frase citata. Sotto ci sono da uno a due riquadri, che cambiano da schermo
 * a schermo e li disegna lo stesso `Blocchi` dell'altra veste.
 */
export function IncontraClassico({
  passo,
  testi,
  quale,
  parole,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'incontra' }>>) {
  const { ts, tp } = useLingua()
  const t = testi.incontra[quale] ?? testi.incontra[0]
  const nome = ts.foglio.parole[passo.parola] ?? passo.parola
  const livello = tp.livelli[LIVELLO_DI[passo.parola]].nome
  const buchi = { uno: parole[0], due: parole[1] }
  const tinta = TINTE_PASTIGLIA[quale % TINTE_PASTIGLIA.length]

  return (
    <Guscio avanzamento={avanzamento} indietro={indietro} azione={t.azione} onAzione={avanti}>
      <Testa occhiello={t.occhiello} titolo={riempi(t.titolo ?? nome, buchi)} />

      <div className="mt-[30px]">
        <Scheda riga={`linear-gradient(to bottom, ${tinta}, var(--color-lime))`}>
          <div className="px-6 py-6 pl-[30px]">
            <div className="flex items-center gap-3">
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-[16px]"
                style={{ background: tinta }}
              >
                <img src={icona(passo.icona)} alt="" aria-hidden className="size-5" />
              </span>
              <span className="min-w-0">
                <h1 className="bab-display m-0 text-[24px] leading-[30px] font-bold tracking-[-0.48px] text-ink">
                  {nome}
                </h1>
                <p className="m-0 mt-[2px] text-[13px] leading-[1.3] font-bold text-lilla">
                  {t.metafora}
                </p>
              </span>
            </div>
            <p className="m-0 mt-[22px] text-[14px] leading-[1.5] text-ink-soft">{t.descrizione}</p>
          </div>
        </Scheda>
      </div>

      <Blocchi tipi={passo.blocchi} testi={t.blocchi} livello={livello} buchi={buchi} />
    </Guscio>
  )
}
