import type { ReactNode } from 'react'

/**
 * La riga con la pastiglia dell'emoji e la frase colorata. Nel disegno la
 * pastiglia e' sempre 32x32 col bordo del colore dell'emoji, e il testo e'
 * viola: cambia l'icona e il tono, non la forma.
 */
export function Nota({
  icona,
  tono = 'amber',
  children,
}: {
  icona: string
  tono?: 'amber'
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-chip border-[1.5px]"
        style={
          tono === 'amber'
            ? { background: 'var(--color-amber-soft)', borderColor: 'var(--color-amber)' }
            : undefined
        }
      >
        <img src={icona} alt="" className="size-[18px]" />
      </div>
      <p className="m-0 text-[13px] font-bold text-violet">{children}</p>
    </div>
  )
}
