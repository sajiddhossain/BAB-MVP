import type { ReactNode } from 'react'
import { useState } from 'react'

/**
 * Il bottone principale.
 *
 * L'ombra non e' sfocata: e' una seconda pastiglia identica spostata di 6px in
 * giu'. E' la firma del disegno — la stessa che c'e' sulle card — e con una
 * box-shadow morbida non viene uguale.
 *
 * Premendo, la faccia scende sull'ombra invece di rimpicciolirsi: e' quello
 * che fa sembrare che il bottone si schiacci davvero.
 */
export function Bottone({
  children,
  onClick,
  attivo = true,
}: {
  children: ReactNode
  onClick?: () => void
  attivo?: boolean
}) {
  const [giu, setGiu] = useState(false)
  return (
    <div className="relative h-[62px] w-full select-none">
      <div className="absolute inset-x-0 top-[6px] h-14 rounded-pill bg-black/8" />
      <button
        type="button"
        disabled={!attivo}
        onPointerDown={() => setGiu(true)}
        onPointerUp={() => setGiu(false)}
        onPointerLeave={() => setGiu(false)}
        onPointerCancel={() => setGiu(false)}
        onClick={onClick}
        style={{
          background: attivo
            ? 'linear-gradient(to right, var(--color-lime), var(--color-lime-deep))'
            : 'var(--color-surface)',
          transform: giu && attivo ? 'translateY(6px)' : undefined,
          transition: giu ? 'transform 90ms cubic-bezier(0.4,0,1,1)' : 'transform 260ms cubic-bezier(0.34,1.56,0.64,1)',
        }}
        className="absolute inset-x-0 top-0 h-14 rounded-pill border-[1.5px] border-line text-[16px] font-bold text-ink disabled:text-ink-mute"
      >
        {children}
      </button>
    </div>
  )
}
