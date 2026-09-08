import type { ReactNode } from 'react'

const ICONE = import.meta.glob<string>('../../assets/sessione/*.svg', {
  eager: true,
  import: 'default',
})

/**
 * L'occhiello di questi schermi: icona piu' scritta, senza pastiglia.
 *
 * Nell'onboarding l'occhiello sta dentro a una pastiglia verde; qui no, e
 * l'icona cambia a ogni passo — la stella per indovinare, la nota musicale
 * per sintonizzarsi, il mirino per individuare. Sono due componenti e non uno
 * con un interruttore perche' sono due forme diverse, non due stati.
 */
export function OcchielloSessione({ icona, children }: { icona: string; children: ReactNode }) {
  return (
    <p className="m-0 flex items-center gap-[6px]">
      <img
        src={ICONE[`../../assets/sessione/${icona}.svg`]}
        alt=""
        aria-hidden
        className="size-[19.5px] shrink-0"
      />
      <span className="text-[16px] font-bold uppercase tracking-[0.5px] text-ink">{children}</span>
    </p>
  )
}

/**
 * Il titolo di una scheda: 15px grassetto, con la sua domanda sotto.
 * E' la forma che si ripete su tutte le schede coi cursori.
 */
export function TitoloScheda({ titolo, domanda }: { titolo: string; domanda?: string }) {
  return (
    <>
      <p className="m-0 text-[16px] font-bold text-ink">{titolo}</p>
      {domanda && (
        <p className="m-0 mt-[3px] text-[13px] leading-[18px] tracking-[-0.26px] text-ink-soft">
          {domanda}
        </p>
      )}
    </>
  )
}
