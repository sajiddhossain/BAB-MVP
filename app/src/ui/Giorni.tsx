import { useLingua } from '../lib/lingua'

/**
 * I sette giorni della settimana da accendere e spegnere.
 *
 * Nel disegno sono sette quadrati da 44 con 5 di stacco: 7x44 + 6x5 = 338,
 * cioe' quasi esattamente i 342 della colonna. Qui invece che fissare i 44 si
 * lascia che si dividano lo spazio, cosi' su uno schermo stretto si stringono
 * insieme invece di uscire dal bordo.
 *
 * L'indice 0 e' lunedi': e' l'ordine in cui stanno nel disegno.
 */
export function Giorni({
  scelti,
  onChange,
}: {
  scelti: number[]
  onChange: (g: number[]) => void
}) {
  const { t } = useLingua()
  return (
    <div className="flex gap-[5px]">
      {t.giorni.map((nome, i) => {
        const acceso = scelti.includes(i)
        return (
          <button
            key={i}
            type="button"
            aria-pressed={acceso}
            onClick={() =>
              onChange(acceso ? scelti.filter((x) => x !== i) : [...scelti, i].sort((a, b) => a - b))
            }
            className={`h-11 min-w-0 flex-1 rounded-[12px] border-[1.5px] text-[13px] font-bold transition-colors duration-150 ${
              acceso ? 'border-ink bg-lime text-ink' : 'border-line bg-surface text-ink'
            }`}
          >
            {nome}
          </button>
        )
      })}
    </div>
  )
}
