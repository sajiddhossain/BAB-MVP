import { useEffect } from 'react'
import type { Parola } from '../../data/sessione'
import { LIVELLO_DI } from '../../data/sessione'
import type { Livello } from '../../data/sessione'
import type { Tono } from '../../copy/parole'
import { useLingua } from '../../lib/lingua'

/**
 * Il colore del livello.
 *
 * E' l'unica cosa che dice se una parola vuol dire "sto lavorando" o "mi
 * serve una mano", e sta in un posto solo: la stessa terna colora il badge
 * qui, i pallini nell'elenco delle sedici parole, e le fasce che le
 * raggruppano.
 */
export const TINTA_LIVELLO: Record<Livello, { fondo: string; testo: string }> = {
  push: { fondo: 'var(--color-verde-fondo)', testo: 'var(--color-verde-scuro)' },
  calibra: { fondo: 'var(--color-ritmo-fondo)', testo: 'var(--color-ambra-testo)' },
  sostegno: { fondo: 'var(--color-allarme-fondo)', testo: 'var(--color-rosso)' },
}

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
 * `onUsa` la chiude accendendo la parola nel foglio: e' il gesto per cui la
 * scheda esiste — non e' un glossario, e' un modo di scegliere.
 */
export function SchedaParola({
  parola,
  onUsa,
  onChiudi,
}: {
  parola: Parola
  onUsa: () => void
  onChiudi: () => void
}) {
  const { tp } = useLingua()
  const t = tp
  const scheda = t.schede[parola]
  const livello = LIVELLO_DI[parola]
  const tinta = TINTA_LIVELLO[livello]

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChiudi()
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onChiudi])

  return (
    <div className="fixed inset-0 z-60 flex justify-center">
      <div className="relative flex w-full max-w-[402px] flex-col justify-end">
        <button
          type="button"
          aria-label={t.usa}
          onClick={onChiudi}
          className="bab-affiora absolute inset-0 bg-black/60"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={parola}
          className="bab-sale relative flex max-h-[88dvh] flex-col rounded-t-[26px] bg-surface"
          style={{ boxShadow: '0px -4px 10px 0px rgba(0,0,0,0.15)' }}
        >
          <div className="shrink-0 pt-3">
            <div className="mx-auto h-[5px] w-11 rounded-[10px] bg-grigio-tenue" aria-hidden />
          </div>

          <div className="flex-1 overflow-y-auto px-6 pt-[26px]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 text-[24px] leading-none font-bold text-ink">{parola}</h2>
              <button
                type="button"
                onClick={onChiudi}
                aria-label={t.usa}
                className="flex size-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-grigio-tenue text-[14px] leading-none text-ink-mute"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-[10px]">
              <span
                className="inline-flex w-fit items-center gap-[6px] rounded-pill px-[10px] py-1 text-[10.5px] font-bold tracking-[0.5px] uppercase"
                style={{ background: tinta.fondo, color: tinta.testo }}
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
              {scheda.riquadri.map((r) => {
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
        </div>
      </div>
    </div>
  )
}
