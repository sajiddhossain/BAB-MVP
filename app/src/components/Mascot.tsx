/**
 * La mascotte del Percorso — una stellina amica, la stessa famiglia visiva
 * dello scintillio di fine check-in (`Sparkle.tsx`): non è un personaggio
 * nuovo inventato da zero, è quello scintillio diventato compagno.
 *
 * 🔴 Il §6 del tono di voce vieta "volti che giudicano" — ma parla delle
 * scale che leggono il corpo (le emoji-scale sono metafore naturali apposta,
 * mai un volto). Questa non legge niente: è una compagna di percorso, non un
 * giudizio su di lei. Il volto qui è lecito perché non guarda lei, cammina
 * CON lei.
 *
 * Segna dove sei ADESSO sul sentiero, non un punteggio — compare solo
 * accanto alla tappa "ora", mai su quelle fatte o bloccate: vedere la
 * mascotte ferma su una tappa vecchia o su un lucchetto non vorrebbe dire
 * niente.
 */
export default function Mascot({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden className="bab-mascot-bob">
      <path d="M24 2 L29.5 17.5 L46 17.5 L32.7 27.3 L38 43 L24 33.4 L10 43 L15.3 27.3 L2 17.5 L18.5 17.5 Z"
            fill="var(--color-lime)" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="19" cy="24" r="2.1" fill="var(--color-ink)" />
      <circle cx="29" cy="24" r="2.1" fill="var(--color-ink)" />
      <path d="M19 29.5 Q24 33.5 29 29.5" fill="none" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
