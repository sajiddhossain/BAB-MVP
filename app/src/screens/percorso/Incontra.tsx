import { Guscio } from '../../ui/percorso/Guscio'
import { Occhiello, Scheda, Riga, icona } from '../../ui/percorso/pezzi'
import { riempi } from '../../copy/riempi'
import { useLingua } from '../../lib/lingua'
import { LIVELLO_DI } from '../../data/sessione'
import type { Passo } from '../../data/percorso'
import type { PropsEsercizio } from './tipi'

/**
 * Conoscere una parola: la scheda grande, una parola per volta.
 *
 * E' l'unico schermo della lezione in cui non c'e' niente da fare: si legge e
 * si va avanti. Serve che sia cosi' — gli esercizi dopo chiedono di
 * distinguere due cose che si sono viste per trenta secondi, e trenta secondi
 * senza niente da toccare sono quello che le fa restare.
 *
 * La pastiglia in alto a destra della scheda in fondo NON e' scritta nei
 * testi: e' il livello della parola, che l'app sa gia' da `LIVELLO_DI`. Nel
 * disegno e' scritta a mano ("Push"), e scritta a mano vuol dire che un
 * giorno dira' una cosa e il check-in ne dira' un'altra.
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
    <Guscio
      avanzamento={avanzamento}
      indietro={indietro}
      azione={t.azione}
      onAzione={avanti}
    >
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
            <p className="m-0 mt-[11px] text-[15px] leading-[1.5] text-ink-soft">
              {t.descrizione}
            </p>
            <Riga />
            <p className="m-0 text-[13px] leading-[1.4] font-bold text-lilla">{t.citazione}</p>
          </div>
        </Scheda>
      </div>

      <div className="mt-[17px]">
        <Scheda riga="linear-gradient(to bottom, #ffd1c1, var(--color-lime))">
          <div className="px-4 py-[14px]">
            <div className="flex items-center justify-between gap-3">
              <p className="m-0 text-[10px] font-bold tracking-[1px] uppercase text-lilla">
                {t.etichetta}
              </p>
              <span
                className="shrink-0 rounded-pill px-[10px] py-1 text-[11px] font-bold text-ink"
                style={{ background: 'var(--color-lime)' }}
              >
                {livello}
              </span>
            </div>
            <Riga />
            <p className="m-0 text-[13px] leading-[1.4] text-ink-soft">
              {riempi(t.nota, buchi)}
            </p>
          </div>
        </Scheda>
      </div>
    </Guscio>
  )
}
