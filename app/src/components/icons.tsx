/**
 * Icone disegnate su misura — stesso stile lineare della mascotte
 * (`Mascot.tsx`): tratto pieno, angoli arrotondati, nessun riempimento
 * fotorealistico. Sostituiscono le emoji di sistema nei punti più visibili
 * dell'app (tab bar, home), che altrimenti cambiano faccia da un telefono
 * all'altro — un'emoji la disegna il sistema operativo, questa la disegna
 * BAB sempre uguale.
 *
 * Non è (ancora) un set completo: le emoji dentro i contenuti tradotti
 * (esercizi di Body-Sense, il lessico delle sensazioni...) restano emoji per
 * ora — sono scelte di contenuto, non chrome dell'interfaccia.
 */

type IconProps = { size?: number; color?: string }

const base = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2.4 }

export function SunIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <circle cx="12" cy="12" r="5" stroke={color} {...base} />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
            stroke={color} {...base} />
    </svg>
  )
}

export function MoonIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" stroke={color} {...base} />
    </svg>
  )
}

export function PathIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <circle cx="5" cy="19" r="2" stroke={color} {...base} />
      <circle cx="19" cy="5" r="2" stroke={color} {...base} />
      <path d="M6.6 17.6C11 13 9 8 12 6.6c2-.9 3.2.3 4.8-.2" stroke={color} {...base} strokeDasharray="0.5 3.4" />
    </svg>
  )
}

export function TrendIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M3 16l5.5-6 4 4L21 5" stroke={color} {...base} />
      <path d="M15 5h6v6" stroke={color} {...base} />
    </svg>
  )
}

export function CompassIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={color} {...base} />
      <path d="M15 9l-2 6-4-1.5L11 7.5 15 9Z" stroke={color} {...base} />
    </svg>
  )
}

export function BoltIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M13 3 5 13.5h5.5L11 21l8-11h-5.5L13 3Z" stroke={color} {...base} />
    </svg>
  )
}

export function WaveIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M2 15c1.7 0 1.7-2 3.4-2s1.7 2 3.4 2 1.7-2 3.4-2 1.7 2 3.4 2 1.7-2 3.4-2 1.7 2 3.4 2"
            stroke={color} {...base} />
      <path d="M2 10c1.7 0 1.7-2 3.4-2s1.7 2 3.4 2 1.7-2 3.4-2 1.7 2 3.4 2 1.7-2 3.4-2 1.7 2 3.4 2"
            stroke={color} {...base} opacity={0.5} />
    </svg>
  )
}

export function LeafIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M5 19c-1-6 2-13 14-14 1 12-6 15-14 14Z" stroke={color} {...base} />
      <path d="M6 18c3-4 6-6 11-12" stroke={color} {...base} />
    </svg>
  )
}

export function HeartIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 20.2S3 14.6 3 8.7C3 5.6 5.4 3.5 8 3.5c1.7 0 3.2.9 4 2.4.8-1.5 2.3-2.4 4-2.4 2.6 0 5 2.1 5 5.2 0 5.9-9 11.5-9 11.5Z"
            stroke={color} {...base} />
    </svg>
  )
}

export function TargetIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke={color} {...base} />
      <circle cx="12" cy="12" r="4.5" stroke={color} {...base} />
      <circle cx="12" cy="12" r="0.9" fill={color} stroke="none" />
    </svg>
  )
}

/** Icona per andatura — stesso codice di `content/tempo.ts`, un disegno al posto dell'emoji. */
export function TempoIcon({ code, size = 24, color = 'currentColor' }: IconProps & { code: 'upbeat' | 'steady' | 'gentle' }) {
  if (code === 'upbeat') return <BoltIcon size={size} color={color} />
  if (code === 'steady') return <WaveIcon size={size} color={color} />
  return <LeafIcon size={size} color={color} />
}
