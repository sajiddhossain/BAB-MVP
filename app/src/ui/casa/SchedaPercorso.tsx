import freccia from '../../assets/casa/percorso-tondo.svg'
import { BottoneTocco } from '../tocco'

/**
 * La scheda sotto: cosa c'e' da fare intanto che sei qui.
 *
 * Il fondo e' lilla in tutti gli stati della home, come tutto cio' che e'
 * informazione e non domanda: la scheda grande sopra chiede qualcosa, questa
 * offre e basta, e il colore lo dice prima delle parole.
 *
 * Il chevron e' un carattere e non un'icona perche' nel disegno e' un
 * carattere — stessa famiglia, stesso peso del resto.
 */
export function SchedaPercorso({
  occhiello,
  titolo,
  sotto,
  icona = freccia,
  onClick,
}: {
  occhiello: string
  /**
   * Manca a giornata finita, dove la scheda porta al diario: li' e' un
   * invito, e un titolo in mezzo lo farebbe sembrare un compito da fare.
   */
  titolo?: string
  sotto: string
  icona?: string
  onClick?: () => void
}) {
  return (
    <BottoneTocco
      onClick={onClick}
      className="flex w-full items-start gap-3 overflow-hidden rounded-[22px] border border-line bg-viola-chiaro pb-[18px] pl-[13px] pr-[13px] pt-[13px] text-left"
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-white/70 ${
          titolo ? 'mt-[5px]' : 'mt-4'
        }`}
      >
        <img src={icona} alt="" className="size-[22px]" aria-hidden />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold tracking-[0.8px] text-ink-mute">
          {occhiello}
        </span>
        {titolo && <span className="mt-[3px] block text-[14px] font-bold text-ink">{titolo}</span>}
        <span
          className={`block ${titolo ? 'mt-[3px] text-[12px] text-ink-medio' : 'mt-[6px] text-[13px] leading-[1.45] text-[#524e66]'}`}
        >
          {sotto}
        </span>
      </span>

      <span className="mt-[14px] text-[20px] font-bold leading-none text-ink-tenue" aria-hidden>
        ›
      </span>
    </BottoneTocco>
  )
}
