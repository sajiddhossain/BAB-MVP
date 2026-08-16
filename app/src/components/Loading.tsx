import Mascot from './Mascot'

/**
 * Lo stato "sta caricando" — la stessa mascotte viva degli stati vuoti
 * (`Body.tsx`, `Story.tsx`...), non una riga di testo grigio sola: aspettare
 * non deve sembrare che l'app si sia fermata.
 */
export default function Loading({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 pt-10 text-center">
      <Mascot size={36} />
      <p className="text-[15px] text-[var(--color-ink-soft)]">{label}</p>
    </div>
  )
}
