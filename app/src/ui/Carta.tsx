import type { ReactNode } from 'react'
import { useTocco } from './tocco'

/**
 * La carta-scelta: titolo, sottotitolo e una riga di colore in cima.
 *
 * Nel file Figma la riga verde c'e' su tutte le carte, anche su quelle non
 * scelte — quel frame e' lo stato vuoto. Lo stato scelto qui sotto (bordo
 * nero, fondo lime, riga piena) l'abbiamo deciso noi seguendo il resto della
 * app: e' l'unica cosa di questo file che non viene misurata dal disegno.
 */
export function Carta({
  titolo,
  sotto,
  scelta,
  striscia = 'sopra',
  onClick,
}: {
  titolo: ReactNode
  sotto?: ReactNode
  scelta?: boolean
  /**
   * Da che parte sta la riga di colore. Finche' non ha scelto e' in cima a
   * tutte le carte; quando una scelta c'e', le carte che restano la portano
   * di lato — e' cosi' che nel disegno si distingue "ancora da decidere" da
   * "puoi ancora cambiare idea".
   */
  striscia?: 'sopra' | 'lato'
  onClick?: () => void
}) {
  const tocco = useTocco()
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={scelta}
      {...tocco}
      className={`bab-tocco relative block w-full overflow-hidden rounded-[22px] border-[1.5px] px-4 pt-[14.5px] pb-4 text-left ${
        scelta ? 'border-ink bg-[rgba(212,243,105,0.35)]' : 'border-line bg-surface'
      }`}
      style={{ boxShadow: '0px 4px 8px 0px rgba(0,0,0,0.06)' }}
    >
      <span
        className={
          striscia === 'lato'
            ? 'absolute inset-y-0 left-0 block w-[6px]'
            : 'absolute inset-x-0 top-0 block h-1'
        }
        style={{ background: scelta ? 'var(--color-lime)' : 'rgba(16,185,129,0.6)' }}
      />
      <span className="block text-[15px] font-bold text-ink">{titolo}</span>
      {sotto && <span className="mt-[3px] block text-[13px] leading-[1.5] text-ink-soft">{sotto}</span>}
    </button>
  )
}

/** Le carte una sotto l'altra, con i 9px di stacco che hanno nel disegno. */
export function Carte({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-[9px]">{children}</div>
}
