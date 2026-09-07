import type { InputHTMLAttributes } from 'react'

/**
 * Un campo di testo. Alto 48, bordo 1.5px, angoli da 14: e' la stessa forma
 * in tutto il disegno, quindi sta qui e non in ogni schermo.
 */
export function Campo(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-12 w-full rounded-field border-[1.5px] border-line bg-surface px-[14.5px] text-[15px] text-ink outline-none placeholder:text-ink-mute focus:border-violet"
    />
  )
}
