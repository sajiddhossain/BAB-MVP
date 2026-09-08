import { useLingua } from '../../lib/lingua'
import { riempi } from '../../copy/riempi'
import fuoco from '../../assets/casa/fuoco.svg'

/**
 * La riga in cima: che giorno e', come si chiama, e da quanti giorni di fila
 * apre la app.
 *
 * Il giorno arriva da una Date vera e non da una stringa: il disegno dice
 * "Mercoledì" perche' quel giorno l'ha disegnato di mercoledi'.
 */
export function Testata({ giorno, ora, nome, streak }: { giorno: Date; ora?: string; nome: string; streak: number }) {
  const { t } = useLingua()
  // getDay() mette domenica a 0; nel disegno la settimana comincia da lunedi'
  const nomeGiorno = t.casa.giorni[(giorno.getDay() + 6) % 7]

  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="m-0 text-[12px] font-bold leading-[15px] tracking-[0.5px] text-ink-mute">
          {ora ? `${nomeGiorno} · ${ora}` : nomeGiorno}
        </p>
        <p className="bab-display m-0 mt-[3px] text-[19px] font-bold leading-[23px] text-ink">
          {riempi(t.casa.saluto, { nome })}
        </p>
      </div>

      <div className="mr-[9px] mt-1 flex h-9 shrink-0 items-center gap-[5px] rounded-[99px] border border-line bg-surface pl-2 pr-3">
        <img src={fuoco} alt="" className="size-4" aria-hidden />
        <span className="text-[14px] font-bold text-ink">{streak}</span>
      </div>
    </div>
  )
}
