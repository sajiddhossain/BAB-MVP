import type { Tempo } from '../../data/casa'
import { RITMI } from '../../data/sessione'
import { useLingua } from '../../lib/lingua'

const ICONE = import.meta.glob<string>('../../assets/sessione/tempo-*.svg', {
  eager: true,
  import: 'default',
})

/**
 * La fila dei tre ritmi.
 *
 * E' la stessa fila nel check-in e nel check-out: prima e' una previsione,
 * dopo e' un esito, ma il gesto e' identico apposta — e' quello che rende il
 * confronto fra le due un confronto e non due domande diverse.
 */
export function Ritmi({
  scelto,
  onChange,
}: {
  scelto: Tempo | null
  onChange: (t: Tempo) => void
}) {
  const { ts } = useLingua()
  const nomi = ts.comune.ritmi
  return (
    <div className="flex gap-3" role="radiogroup" aria-label="Ritmo">
      {RITMI.map((r) => {
        const acceso = scelto === r.id
        return (
          <button
            key={r.id}
            type="button"
            role="radio"
            aria-checked={acceso}
            onClick={() => onChange(r.id)}
            className="relative h-[62px] min-w-0 flex-1"
          >
            {/* l'ombra dura, 4px in giu' e a destra come sulle schede */}
            <span
              className="absolute inset-0 translate-x-1 translate-y-1 rounded-chip"
              style={{ background: acceso ? 'rgba(212,178,111,0.12)' : 'rgba(0,0,0,0.04)' }}
            />
            <span
              className={`absolute inset-0 flex flex-col items-center justify-center gap-[3px] rounded-chip border-[1.5px] transition-colors duration-150 ${
                acceso ? 'border-ritmo-bordo bg-ritmo-fondo' : 'border-line bg-surface'
              }`}
            >
              <img
                src={ICONE[`../../assets/sessione/${r.icona}.svg`]}
                alt=""
                aria-hidden
                className="size-[17px]"
              />
              <span className="text-[13px] font-bold text-ink">
                {nomi[r.id]}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
