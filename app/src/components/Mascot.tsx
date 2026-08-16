const MASCOT_SPARK = 'M10 0 L12.2 7.8 L20 10 L12.2 12.2 L10 20 L7.8 12.2 L0 10 L7.8 7.8 Z'

/**
 * Piccoli scintillii che le girano intorno di continuo — non lo scintillio
 * di festa di `Sparkle.tsx` (quello è un botto unico a fine check-in), ma un
 * respiro ambientale, sempre acceso e mai invadente: per questo restano
 * piccoli, radi e mai sopra il volto.
 */
const AMBIENT_SPARKS = [
  { x: 82, y: -4,  size: 0.16, delay: 0,    color: 'var(--color-gold)' },
  { x: -10, y: 62, size: 0.13, delay: 0.9,  color: 'var(--color-lavender)' },
  { x: 88, y: 68,  size: 0.11, delay: 1.7,  color: 'var(--color-teal)' },
]

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
 *
 * È viva, non un'icona ferma: sbatte le palpebre, guarda in giro, sorride e
 * apre la bocca a intervalli — tutti loop CSS, nessuno stato React, così
 * resta leggera anche dove compaiono più mascotte insieme (Onboarding).
 * `prefers-reduced-motion` spegne tutto da sé, regola già globale in
 * `index.css`.
 */
export default function Mascot({ size = 40 }: { size?: number }) {
  return (
    <span className="bab-mascot-wrap" style={{ width: size, height: size }} aria-hidden>
      {AMBIENT_SPARKS.map((s, i) => (
        <svg key={i} viewBox="0 0 20 20" width={size * s.size} height={size * s.size}
             className="bab-mascot-spark absolute"
             style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.delay}s` }}>
          <path d={MASCOT_SPARK} fill={s.color} />
        </svg>
      ))}
      <svg viewBox="0 0 48 48" width={size} height={size} className="bab-mascot-bob">
        <path d="M24 2 L29.5 17.5 L46 17.5 L32.7 27.3 L38 43 L24 33.4 L10 43 L15.3 27.3 L2 17.5 L18.5 17.5 Z"
              fill="var(--color-lime)" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" />
        <g className="bab-mascot-gaze">
          <g className="bab-mascot-eye"><circle cx="19" cy="24" r="2.1" fill="var(--color-ink)" /></g>
          <g className="bab-mascot-eye bab-mascot-eye-r"><circle cx="29" cy="24" r="2.1" fill="var(--color-ink)" /></g>
        </g>
        <path className="bab-mascot-mouth-closed"
              d="M19 29.5 Q24 33.5 29 29.5" fill="none" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" />
        <path className="bab-mascot-mouth-open"
              d="M18.5 29 Q24 39.5 29.5 29 Q24 33.5 18.5 29 Z" fill="var(--color-ink)" />
      </svg>
    </span>
  )
}
