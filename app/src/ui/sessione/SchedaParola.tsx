import { useEffect } from 'react'
import type { Parola } from '../../data/sessione'
import type { Livello } from '../../data/sessione'
import type { Tono } from '../../copy/parole'
import { TONI_NASCOSTI } from '../../copy/parole'
import { useLingua } from '../../lib/lingua'
import { useModale } from '../modale'

/**
 * Il colore del livello.
 *
 * E' l'unica cosa che dice se una parola vuol dire "sto lavorando" o "mi
 * serve una mano", e sta in un posto solo: la stessa terna colora i pallini
 * nell'elenco delle sedici parole e le fasce che le raggruppano.
 */
export const TINTA_LIVELLO: Record<Livello, { fondo: string; testo: string }> = {
  push: { fondo: 'var(--color-verde-fondo)', testo: 'var(--color-verde-scuro)' },
  calibra: { fondo: 'var(--color-ritmo-fondo)', testo: 'var(--color-ambra-testo)' },
  sostegno: { fondo: 'var(--color-allarme-fondo)', testo: 'var(--color-rosso)' },
}

/*
 * La pastiglia in cima alla scheda e' verde per tutte e sedici le parole.
 *
 * Prima prendeva il colore del livello — verde, giallo, rosso — ma per ora la
 * distinzione sulla scheda non la vogliamo: la pastiglia dice cosa notare,
 * non quanto preoccuparsi. I livelli restano colorati nell'elenco. Per
 * tornare indietro basta rimettere `TINTA_LIVELLO[LIVELLO_DI[parola]]`.
 */
const BADGE = TINTA_LIVELLO.push

const RIQUADRO: Record<Tono, { fondo: string; bordo: string; etichetta: string; testo: string }> = {
  prova: {
    fondo: 'var(--color-nebbia)',
    bordo: 'var(--color-nebbia-bordo)',
    etichetta: 'var(--color-nebbia-testo)',
    testo: 'var(--color-ink)',
  },
  rosso: {
    fondo: 'var(--color-allarme-fondo)',
    bordo: 'var(--color-rosso-bordo)',
    etichetta: 'var(--color-rosso)',
    testo: 'var(--color-ink)',
  },
  viola: {
    fondo: 'var(--color-lilla-fondo)',
    bordo: 'var(--color-lilla-bordo)',
    etichetta: 'var(--color-lilla-cupo)',
    testo: 'var(--color-lilla-cupo)',
  },
}

/**
 * La scheda che spiega una delle sedici parole.
 *
 * Nel disegno queste schede sono in Plus Jakarta Sans, un carattere che nel
 * resto della app non c'e'. Qui restano in Space Grotesk: un terzo carattere
 * per una scheda sola si paga in byte a ogni apertura, e la differenza fra i
 * due a queste misure non si vede.
 *
 * ── "USA QUESTA PAROLA" SOLO DENTRO A UNA SESSIONE ─────────────────────────
 * Il bottone in fondo c'e' quando la scheda si apre durante un check-in o un
 * check-out, cioe' quando chi la apre ha `onUsa` da passarle: accende la
 * parola nel foglio e torna li' in un gesto solo.
 *
 * Quando le sedici parole si leggono e basta — dalla home, dal loro
 * indirizzo — non c'e' niente da accendere, e il bottone non c'e': un "usala"
 * che chiude e non fa altro sarebbe una bugia. Li' la scheda spiega, e si
 * chiude dalla ✕ o toccando fuori.
 */
export function SchedaParola({
  parola,
  onChiudi,
  onUsa,
}: {
  parola: Parola
  onChiudi: () => void
  /** accende la parola nel foglio; senza, la scheda e' solo da leggere */
  onUsa?: () => void
}) {
  const { ts, tp } = useLingua()
  const t = tp
  // il nome della parola sta con le altre quindici, non sulla scheda:
  // `parola` e' l'identificativo, e in inglese si leggeva "intorpidito"
  const nome = ts.foglio.parole[parola]
  const scheda = t.schede[parola]

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChiudi()
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onChiudi])

  const modale = useModale<HTMLDivElement>()

  return (
    <div ref={modale} className="fixed inset-0 z-60 flex justify-center">
      <div className="relative flex w-full max-w-[402px] flex-col justify-end">
        <button
          type="button"
          aria-label={t.chiudi}
          onClick={onChiudi}
          className="bab-affiora absolute inset-0 bg-black/60"
        />

        <div
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          aria-label={nome}
          className="bab-sale relative flex max-h-[88dvh] flex-col rounded-t-[26px] bg-surface outline-none"
          style={{ boxShadow: '0px -4px 10px 0px rgba(0,0,0,0.15)' }}
        >
          <div className="shrink-0 pt-3">
            <div className="mx-auto h-[5px] w-11 rounded-[10px] bg-grigio-tenue" aria-hidden />
          </div>

          {/*
            Senza bottone sotto, l'aria in fondo la mette lo scorrevole: se no
            l'ultimo riquadro finirebbe appiccicato al bordo dello schermo.
            Col bottone ci pensa lui.
          */}
          <div
            className={`flex-1 overflow-y-auto px-6 pt-[26px] ${
              onUsa ? '' : 'pb-[calc(26px+env(safe-area-inset-bottom))]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 text-[24px] leading-none font-bold text-ink">{nome}</h2>
              {/*
                Il cerchietto resta di trenta, ma quello che si tocca e' piu'
                grande: senza il bottone in fondo questa e' la via d'uscita
                principale, e trenta pixel sono meno di un polpastrello.
              */}
              <button
                type="button"
                onClick={onChiudi}
                aria-label={t.chiudi}
                className="relative flex size-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-grigio-tenue text-[14px] leading-none text-ink-mute after:absolute after:-inset-[7px] after:content-['']"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-[10px]">
              <span
                className="inline-flex w-fit items-center gap-[6px] rounded-pill px-[10px] py-1 text-[10.5px] font-bold tracking-[0.5px] uppercase"
                style={{ background: BADGE.fondo, color: BADGE.testo }}
              >
                <span
                  aria-hidden
                  className="size-[6px] rounded-full"
                  style={{ background: 'currentColor' }}
                />
                {scheda.badge}
              </span>
              <p className="m-0 text-[15px] font-bold text-lilla-vivo">{scheda.metafora}</p>
              <p className="m-0 text-[13.5px] leading-[20px] text-ink-medio">
                {scheda.descrizione}
              </p>
            </div>

            <div className="mt-[21px] flex flex-col gap-3">
              {scheda.riquadri.filter((r) => !TONI_NASCOSTI.has(r.tono)).map((r) => {
                const c = RIQUADRO[r.tono]
                return (
                  <div
                    key={r.etichetta + r.testo}
                    className="rounded-[14px] border-[1.5px] p-4"
                    style={{ background: c.fondo, borderColor: c.bordo }}
                  >
                    <p
                      className="m-0 text-[10.5px] font-bold tracking-[0.5px] uppercase"
                      style={{ color: c.etichetta }}
                    >
                      {r.etichetta}
                    </p>
                    <p
                      className="m-0 mt-[6px] text-[13px] leading-[18px]"
                      style={{ color: c.testo }}
                    >
                      {r.testo}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {onUsa && (
            <div className="shrink-0 px-6 pt-[21px] pb-[calc(24px+env(safe-area-inset-bottom))]">
              <div className="relative h-[62px] w-full">
                <div className="absolute inset-x-0 top-[6px] h-14 rounded-pill bg-black/8" />
                <button
                  type="button"
                  onClick={onUsa}
                  className="absolute inset-x-0 top-0 h-14 rounded-pill border-[1.5px] border-line bg-lime text-[16px] font-bold text-ink"
                >
                  {t.usa}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
