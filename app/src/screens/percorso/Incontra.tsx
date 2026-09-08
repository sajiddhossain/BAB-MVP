import { Guscio } from '../../ui/percorso/Guscio'
import { Blocchi, Occhiello, Riga, Scheda, icona } from '../../ui/percorso/pezzi'
import { useLingua } from '../../lib/lingua'
import { LIVELLO_DI } from '../../data/sessione'
import type { Passo } from '../../data/percorso'
import type { PropsEsercizio } from './tipi'

/**
 * Conoscere una parola — la veste della lezione 1: la scheda grande.
 *
 * E' l'unico schermo della lezione in cui non c'e' niente da fare: si legge e
 * si va avanti. Serve che sia cosi' — gli esercizi dopo chiedono di
 * distinguere due cose che si sono viste per trenta secondi, e trenta secondi
 * senza niente da toccare sono quello che le fa restare.
 *
 * I riquadri sotto alla scheda li disegna `Blocchi`, che e' lo stesso di
 * quello della veste classica: la scheda cambia, i riquadri no.
 */
export function Incontra({
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

  return (
    <Guscio avanzamento={avanzamento} indietro={indietro} azione={t.azione} onAzione={avanti}>
      <Occhiello nome={passo.icona === 'manubrio' ? 'manubrio-tenue' : 'piuma-tenue'}>
        {t.occhiello}
      </Occhiello>

      <div className="mt-[26px]">
        <Scheda riga="linear-gradient(to bottom, var(--color-lime), #a3e635)">
          <div className="px-6 py-6">
            <span
              className="mx-auto flex size-[92px] items-center justify-center rounded-full"
              style={{ background: 'var(--color-lime)' }}
            >
              <img src={icona(passo.icona)} alt="" aria-hidden className="size-[45px]" />
            </span>

            {/*
              La parola e' il titolo dello schermo, quindi e' un h1: e' la
              prima cosa che un lettore di schermo deve dire entrando qui.
            */}
            <h1 className="bab-display m-0 mt-7 text-center text-[28px] leading-[34px] font-bold tracking-[-0.56px] text-ink">
              {nome}
            </h1>
            <p className="m-0 mt-2 text-center text-[15px] font-bold text-lilla">{t.metafora}</p>
            <p className="m-0 mt-[11px] text-[15px] leading-[1.5] text-ink-soft">{t.descrizione}</p>
            {t.citazione && (
              <>
                <Riga />
                <p className="m-0 text-[13px] leading-[1.4] font-bold text-lilla">{t.citazione}</p>
              </>
            )}
          </div>
        </Scheda>
      </div>

      <Blocchi tipi={passo.blocchi} testi={t.blocchi} livello={livello} buchi={buchi} />
    </Guscio>
  )
}
