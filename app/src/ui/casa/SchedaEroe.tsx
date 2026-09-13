import type { ReactNode } from 'react'
import type { StatoGiornata } from '../../data/casa'
import { TINTE } from '../../data/casa'
import ambra from '../../assets/casa/tag-ambra.svg'
import verde from '../../assets/casa/tag-verde.svg'
import viola from '../../assets/casa/tag-viola.svg'
import luna from '../../assets/casa/tag-luna.svg'

/*
 * Due stati hanno la stessa tinta viola ma non la stessa icona: a giornata
 * finita c'e' la stella, nel giorno di riposo la luna. Per questo l'icona sta
 * nella tinta di ogni stato e non nel nome del colore.
 */
const ICONE: Record<string, string> = { ambra, verde, viola, luna }

/**
 * La scheda grande in cima alla home.
 *
 * E' sempre la stessa forma — etichetta, titolo, riga di testo, poi quello
 * che serve a quello stato — e cambia solo la tinta. Tenere la forma qui e
 * non in ognuno dei quattro stati e' quello che fa si' che passando da uno
 * stato all'altro non si muova niente che non deve muoversi.
 */
export function SchedaEroe({
  stato,
  etichetta,
  titolo,
  corpo,
  senzaIcona = false,
  children,
}: {
  stato: StatoGiornata
  etichetta: string
  titolo: string
  corpo?: string
  /**
   * L'etichetta senza la sua icona. Serve quando l'icona direbbe il falso: al
   * check-out la spunta vuol dire "check-in fatto", e se non l'ha fatto non ci
   * puo' stare.
   */
  senzaIcona?: boolean
  children?: ReactNode
}) {
  const tinta = TINTE[stato]
  return (
    /*
     * Sotto ci sono un po' di `leading` scritti a mano. Non sono capricci: in
     * Figma l'altezza della casella di testo e' fissata, mentre `normal` nel
     * browser e' piu' alto — e siccome qui e' tutto in colonna, quei due o
     * tre pixel a riga si sommano e in fondo alla scheda diventano quindici.
     */
    <div className="overflow-hidden rounded-[26px] p-5 pb-4" style={{ background: tinta.fondo }}>
      {/* il div attorno serve: un inline-flex da solo si porta dietro una
          riga di testo piu' alta di lui, e la scheda parte 4px piu' in basso */}
      <div className="flex">
        <span
          className={`inline-flex h-[26px] items-center gap-[5px] rounded-[99px] bg-white/60 pr-[11px] ${
            senzaIcona ? 'pl-[11px]' : 'pl-[9px]'
          }`}
        >
          {!senzaIcona && <img src={ICONE[tinta.icona]} alt="" className="size-3" aria-hidden />}
          <span
            className="text-[11px] font-bold leading-none tracking-[0.8px]"
            style={{ color: tinta.etichetta }}
          >
            {etichetta}
          </span>
        </span>
      </div>

      <p className="bab-display m-0 mt-3 text-[22px] font-bold leading-[26px] text-ink">{titolo}</p>

      {corpo && (
        <p className="m-0 mt-1 text-[13px] leading-[1.45]" style={{ color: tinta.testo }}>
          {corpo}
        </p>
      )}

      {children}
    </div>
  )
}
