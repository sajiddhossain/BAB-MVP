/**
 * Il piccolo scintillio che compare quando chiude un check-in.
 *
 * 🔴 Festeggia AVERLO FATTO — essersi fermata e ascoltata — non il risultato
 * che ha avuto. È identico qualunque sia l'esito (§1 del tono di voce:
 * nessun esito vale più di un altro), altrimenti sarebbe un punteggio
 * travestito da coriandoli. Non compare mai insieme al Care mode o a una
 * bandiera rossa — chi lo chiama decide quando, questo componente non lo sa.
 *
 * Una volta sola al montaggio, poi sparisce: non un badge che resta acceso.
 * `prefers-reduced-motion` lo spegne da solo — la regola è già globale in
 * `index.css`, qui non serve ripeterla.
 */
const POINTS = [
  { x: 6,  y: 8,  size: 15, delay: 0,     color: 'var(--color-gold)' },
  { x: 90, y: 4,  size: 11, delay: 0.08, color: 'var(--color-lime)' },
  { x: 80, y: 36, size: 9,  delay: 0.2,  color: 'var(--color-teal)' },
  { x: 2,  y: 42, size: 10, delay: 0.13, color: 'var(--color-lavender)' },
]

const STAR = 'M12 0 L14.7 9.3 L24 12 L14.7 14.7 L12 24 L9.3 14.7 L0 12 L9.3 9.3 Z'

export default function Sparkle() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {POINTS.map((p, i) => (
        <svg key={i} viewBox="0 0 24 24" width={p.size} height={p.size}
             className="bab-sparkle absolute"
             style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.delay}s` }}>
          <path d={STAR} fill={p.color} />
        </svg>
      ))}
    </div>
  )
}
