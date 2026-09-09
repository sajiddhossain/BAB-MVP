import freccia from '../../assets/casa/percorso-tondo.svg'
import { BottoneTocco } from '../tocco'

/**
 * La scheda sotto: cosa c'e' da fare intanto che sei qui.
 *
 * Il chevron e' un carattere e non un'icona perche' nel disegno e' un
 * carattere — stessa famiglia, stesso peso del resto.
 */
export function SchedaPercorso({
  occhiello,
  titolo,
  sotto,
  icona = freccia,
  tinta,
  onClick,
}: {
  occhiello: string
  titolo: string
  sotto: string
  icona?: string
  /** il fondo della scheda: bianco di solito, viola quando la giornata e' chiusa */
  tinta?: string
  onClick?: () => void
}) {
  return (
    <BottoneTocco
      onClick={onClick}
      className="flex w-full items-start gap-3 overflow-hidden rounded-[22px] border border-line pb-[18px] pl-[13px] pr-[13px] pt-[13px] text-left"
      style={{ background: tinta ?? 'var(--color-surface)' }}
    >
      <span className="mt-[5px] flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-viola-chiaro">
        <img src={icona} alt="" className="size-[22px]" aria-hidden />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold tracking-[0.8px] text-ink-mute">
          {occhiello}
        </span>
        <span className="mt-[3px] block text-[14px] font-bold text-ink">{titolo}</span>
        <span className="mt-[3px] block text-[12px] text-ink-medio">{sotto}</span>
      </span>

      <span className="mt-[14px] text-[20px] font-bold leading-none text-ink-tenue" aria-hidden>
        ›
      </span>
    </BottoneTocco>
  )
}
