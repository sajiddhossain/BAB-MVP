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

export function EyeIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" stroke={color} {...base} />
      <circle cx="12" cy="12" r="2.6" stroke={color} {...base} />
    </svg>
  )
}

export function PuzzleIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M9 4h4v2.2a1.6 1.6 0 0 0 2.8 1.1 1.6 1.6 0 0 1 2.8 1.1V12h-2.2a1.6 1.6 0 0 0 0 3.2H20v4h-4v-2.2a1.6 1.6 0 0 0-3.2 0V19H9v-4H6.8a1.6 1.6 0 0 1 0-3.2H9V9H6.8a1.6 1.6 0 0 1-1.1-2.8A1.6 1.6 0 0 1 9 6.2V4Z"
            stroke={color} {...base} />
    </svg>
  )
}

export function CheckIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M4 12.5l5 5L20 6" stroke={color} {...base} />
    </svg>
  )
}

export function LockIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" stroke={color} {...base} />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" stroke={color} {...base} />
    </svg>
  )
}

/** «Mi sono fatta male» — un cerotto, non una faccina di dolore: descrive l'azione, non giudica lo stato. */
export function BandageIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <rect x="2.5" y="8.5" width="19" height="7" rx="3.5" stroke={color} {...base} transform="rotate(-35 12 12)" />
      <path d="M9.5 8.7a2 2 0 1 1 4 4M14.5 15.3a2 2 0 1 1-4-4" stroke={color} {...base} transform="rotate(-35 12 12)" />
    </svg>
  )
}

/** Bandiera rossa — marca i segnali che instradano al Care da soli (§4.3). */
export function FlagIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M6 3v18" stroke={color} {...base} />
      <path d="M6 4h12l-3 4 3 4H6Z" stroke={color} {...base} strokeLinejoin="round" />
    </svg>
  )
}

/** «Ora»: la tappa attiva nel Percorso — un triangolo di riproduzione, non una freccia generica. */
export function PlayIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M7 4.5v15l13-7.5Z" stroke={color} {...base} strokeLinejoin="round" />
    </svg>
  )
}

export function PinIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 21.5S5 14.8 5 9.5a7 7 0 0 1 14 0c0 5.3-7 12-7 12Z" stroke={color} {...base} strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.4" stroke={color} {...base} />
    </svg>
  )
}

/* ── Icone per Body-Sense e il lessico delle sensazioni ──────────────────
   Sostituiscono le emoji nei contenuti tradotti di `content/bodysense.ts`
   e `content/lexicon.ts`. Ogni content-file ora porta una chiave (`icon`)
   invece del carattere emoji; `ContentIcon` sotto la traduce in disegno. */

export function LungsIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 3v9" stroke={color} {...base} />
      <path d="M12 12c-1-3-3-3-4-2-2 2-3 7-1 9 1.5 1.5 3.5-.5 4-2M12 12c1-3 3-3 4-2 2 2 3 7 1 9-1.5 1.5-3.5-.5-4-2"
            stroke={color} {...base} />
    </svg>
  )
}

export function BalanceIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 3v16M8 21h8" stroke={color} {...base} />
      <path d="M4 8h6M14 8h6" stroke={color} {...base} />
      <path d="M4 8l-2 5a3 3 0 0 0 6 0L4 8ZM20 8l-2 5a3 3 0 0 0 6 0l-4-5Z" stroke={color} {...base} />
    </svg>
  )
}

export function JarIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M8 3h8v2.5c1.5.6 2.5 2 2.5 4V19a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2V9.5c0-2 1-3.4 2.5-4V3Z" stroke={color} {...base} />
      <path d="M6.2 12h11.6" stroke={color} {...base} />
    </svg>
  )
}

export function CloudSunIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <circle cx="8" cy="8" r="3" stroke={color} {...base} />
      <path d="M8 2.5v1.4M8 12v1.4M2.5 8h1.4M12.6 8H14M3.9 3.9l1 1M11.1 3.9l-1 1" stroke={color} {...base} />
      <path d="M9 12.5c.6-.7 1.5-1.1 2.5-1.1 2 0 3.6 1.5 3.6 3.4H19a2.9 2.9 0 0 1 0 5.7H8.4a3.4 3.4 0 0 1-1-6.6c.3-.6.9-1 1.6-1.4Z"
            stroke={color} {...base} />
    </svg>
  )
}

export function FlameIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 2c1 3-2.5 4-2.5 7.5a2.5 2.5 0 0 0 5 0c0-1-.5-1.7-.5-1.7 1.8.8 3 3 3 5.2A5 5 0 0 1 7 13c0-4.5 4-5.5 5-11Z"
            stroke={color} {...base} />
    </svg>
  )
}

/** «Nervosa»: un disegno astratto — una linea a scatti — non un volto, per non impersonare
    un'emozione che è lei a nominare (coerente con `Mascot.tsx`: qui non è nemmeno un compagno). */
export function ZigzagIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M3 12l4-7 3 5 3-6 3 6 3-5 2 7" stroke={color} {...base} />
    </svg>
  )
}

export function StarOutlineIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 2.5l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.6l-5.6 3-1.4-6.3-4.8-4.3 6.4-.6L12 2.5Z"
            stroke={color} {...base} />
    </svg>
  )
}

export function QuestionIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <circle cx="12" cy="12" r="9.5" stroke={color} {...base} />
      <path d="M9.3 9.5a2.7 2.7 0 1 1 4 2.3c-.9.5-1.3 1-1.3 2" stroke={color} {...base} />
      <circle cx="12" cy="17" r="0.9" fill={color} stroke="none" />
    </svg>
  )
}

export function StrongIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M5 15V9a2 2 0 0 1 4 0v3.5M9 12.5V6a2 2 0 0 1 4 0v6.5" stroke={color} {...base} />
      <path d="M13 8.2a2 2 0 0 1 4 .3v2M17 9.5a2 2 0 0 1 4 .5c0 4-2.5 8-7 8-3 0-5-1.3-6.5-3.3L5 12.5"
            stroke={color} {...base} />
    </svg>
  )
}

export function MinusIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M5 12h14" stroke={color} {...base} />
    </svg>
  )
}

export function RepeatIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M4 11a8 8 0 0 1 14-5.2M20 5v4h-4" stroke={color} {...base} />
      <path d="M20 13a8 8 0 0 1-14 5.2M4 19v-4h4" stroke={color} {...base} />
    </svg>
  )
}

export function ArrowLeftIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M19 12H5M11 6l-6 6 6 6" stroke={color} {...base} />
    </svg>
  )
}

export function ArrowRightIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" stroke={color} {...base} />
    </svg>
  )
}

export function BowlIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M3 11h18a9 7 0 0 1-18 0Z" stroke={color} {...base} />
      <path d="M7 11c0-3 2-5 5-5s5 2 5 5" stroke={color} {...base} opacity={0.5} />
      <path d="M9 19.5h6" stroke={color} {...base} />
    </svg>
  )
}

export function DropletIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 3s6 7 6 11.5a6 6 0 0 1-12 0C6 10 12 3 12 3Z" stroke={color} {...base} />
    </svg>
  )
}

export function HandshakeIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M2 11l4-3 4 2.5 3-1.5 4 2 5-3" stroke={color} {...base} />
      <path d="M6 8l4 5-2 2M14 9.5l3.5 4.5-2 2" stroke={color} {...base} />
    </svg>
  )
}

export function SproutIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 21v-9" stroke={color} {...base} />
      <path d="M12 12c0-3.5-3-5-7-5 0 4 2.5 6 7 5.5Z" stroke={color} {...base} />
      <path d="M12 10c0-3 2.5-4.5 6-4.5.3 3.3-2 5.2-6 5Z" stroke={color} {...base} />
    </svg>
  )
}

export function SparkleLineIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M11 3l1 4.5L16.5 8 12 9l-1 4.5L10 9 5.5 8 10 7.5 11 3Z" stroke={color} {...base} strokeLinejoin="round" />
      <path d="M18 13l.6 2.4L21 16l-2.4.6L18 19l-.6-2.4L15 16l2.4-.6L18 13Z" stroke={color} {...base} strokeLinejoin="round" opacity={0.6} />
    </svg>
  )
}

export function SpiralIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 12a2 2 0 1 1 2 2 4 4 0 1 1 4-4 6 6 0 1 1-6-6" stroke={color} {...base} />
    </svg>
  )
}

export function BreathWaveIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M2 12c1.5-4 2.5-4 4 0s2.5 4 4 0 2.5-4 4 0 2.5 4 4 0 2.5-4 4 0" stroke={color} {...base} />
    </svg>
  )
}

export function PersonIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <circle cx="12" cy="5" r="2.6" stroke={color} {...base} />
      <path d="M12 9v6M8 21l2-6h4l2 6M7.5 13h9" stroke={color} {...base} />
    </svg>
  )
}

export function DotsIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <circle cx="5" cy="12" r="1.4" fill={color} stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill={color} stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill={color} stroke="none" />
    </svg>
  )
}

export function FeatherIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M20 4c-8 0-14 6-14 14v2h2c8 0 14-6 14-14V4Z" stroke={color} {...base} />
      <path d="M20 4L7 17M11 13l-3 3M15 9l-3 3" stroke={color} {...base} />
    </svg>
  )
}

export function CloudRainIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M6.5 16A4 4 0 0 1 7 8.1a5 5 0 0 1 9.6-1.3A4.5 4.5 0 0 1 17.5 16h-11Z" stroke={color} {...base} />
      <path d="M9 18.5l-1 2.5M13 18.5l-1 2.5M17 18.5l-1 2.5" stroke={color} {...base} />
    </svg>
  )
}

export function ShieldIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M12 2.5l7.5 3V11c0 5-3.2 8.6-7.5 10.5C7.7 19.6 4.5 16 4.5 11V5.5l7.5-3Z" stroke={color} {...base} />
      <path d="M8.7 12l2.3 2.3 4.3-4.6" stroke={color} {...base} />
    </svg>
  )
}

export function BulbIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M9 17.5h6M10 20h4" stroke={color} {...base} />
      <path d="M12 3a6.5 6.5 0 0 0-3.8 11.8c.6.4 1 1.1 1 1.9v.3h5.6v-.3c0-.8.4-1.5 1-1.9A6.5 6.5 0 0 0 12 3Z"
            stroke={color} {...base} />
    </svg>
  )
}

export function EarIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M13 3a6 6 0 0 1 6 6c0 2.5-1.5 3.3-1.5 5.5a2.5 2.5 0 0 1-5 0" stroke={color} {...base} />
      <path d="M13 3a6.5 6.5 0 0 0-6.5 6.5c0 2 1 3 1 5v3a3 3 0 0 0 3 3" stroke={color} {...base} />
    </svg>
  )
}

/** Chiavi usate da `content/bodysense.ts` e `content/lexicon.ts` al posto delle emoji. */
export type IconKey =
  | 'lungs' | 'bolt' | 'target' | 'balance' | 'jar' | 'heart'
  | 'moon' | 'cloud-sun' | 'flame' | 'zigzag' | 'star' | 'question'
  | 'strong' | 'minus' | 'repeat' | 'arrow-left' | 'arrow-right'
  | 'bowl' | 'droplet' | 'handshake' | 'sprout' | 'sparkle'
  | 'spiral' | 'breath-wave' | 'person' | 'dots' | 'feather'
  | 'cloud-rain' | 'shield' | 'bulb' | 'ear' | 'eye' | 'leaf' | 'check'

export function ContentIcon({ name, size = 24, color = 'currentColor' }: IconProps & { name: IconKey }) {
  switch (name) {
    case 'lungs': return <LungsIcon size={size} color={color} />
    case 'bolt': return <BoltIcon size={size} color={color} />
    case 'target': return <TargetIcon size={size} color={color} />
    case 'balance': return <BalanceIcon size={size} color={color} />
    case 'jar': return <JarIcon size={size} color={color} />
    case 'heart': return <HeartIcon size={size} color={color} />
    case 'moon': return <MoonIcon size={size} color={color} />
    case 'cloud-sun': return <CloudSunIcon size={size} color={color} />
    case 'flame': return <FlameIcon size={size} color={color} />
    case 'zigzag': return <ZigzagIcon size={size} color={color} />
    case 'star': return <StarOutlineIcon size={size} color={color} />
    case 'question': return <QuestionIcon size={size} color={color} />
    case 'strong': return <StrongIcon size={size} color={color} />
    case 'minus': return <MinusIcon size={size} color={color} />
    case 'repeat': return <RepeatIcon size={size} color={color} />
    case 'arrow-left': return <ArrowLeftIcon size={size} color={color} />
    case 'arrow-right': return <ArrowRightIcon size={size} color={color} />
    case 'bowl': return <BowlIcon size={size} color={color} />
    case 'droplet': return <DropletIcon size={size} color={color} />
    case 'handshake': return <HandshakeIcon size={size} color={color} />
    case 'sprout': return <SproutIcon size={size} color={color} />
    case 'sparkle': return <SparkleLineIcon size={size} color={color} />
    case 'spiral': return <SpiralIcon size={size} color={color} />
    case 'breath-wave': return <BreathWaveIcon size={size} color={color} />
    case 'person': return <PersonIcon size={size} color={color} />
    case 'dots': return <DotsIcon size={size} color={color} />
    case 'feather': return <FeatherIcon size={size} color={color} />
    case 'cloud-rain': return <CloudRainIcon size={size} color={color} />
    case 'shield': return <ShieldIcon size={size} color={color} />
    case 'bulb': return <BulbIcon size={size} color={color} />
    case 'ear': return <EarIcon size={size} color={color} />
    case 'eye': return <EyeIcon size={size} color={color} />
    case 'leaf': return <LeafIcon size={size} color={color} />
    case 'check': return <CheckIcon size={size} color={color} />
  }
}
