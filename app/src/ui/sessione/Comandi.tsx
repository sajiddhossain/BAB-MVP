import type { ReactNode } from 'react'
import { SESSIONE } from '../../copy/sessione'

/**
 * L'interruttore a due posizioni: Davanti/Dietro, Sì/No.
 *
 * Nel disegno la parte accesa e' una pastiglia bianca che sta dentro a una
 * scanalatura color carta, con un'ombra morbida sotto. Non e' un bottone
 * premuto: e' una cosa che scorre, e infatti scorre — la pastiglia si sposta
 * invece di accendersi e spegnersi, che e' quello che fa capire che le due
 * scelte sono due posizioni della stessa cosa.
 */
export function Interruttore<T extends string | boolean>({
  voci,
  scelta,
  onChange,
  etichetta,
  className = '',
}: {
  voci: [{ id: T; testo: string }, { id: T; testo: string }]
  scelta: T | null
  onChange: (id: T) => void
  etichetta: string
  className?: string
}) {
  const indice = voci.findIndex((v) => v.id === scelta)
  return (
    <div
      role="radiogroup"
      aria-label={etichetta}
      className={`relative flex rounded-pill bg-paper p-[3px] ${className}`}
    >
      {/*
        La pastiglia bianca sta sotto ai due bottoni ed e' una sola: cosi'
        scorre da una parte all'altra. Quando non ha ancora scelto non c'e'.
      */}
      {indice >= 0 && (
        <span
          aria-hidden
          className="absolute inset-y-[3px] left-[3px] rounded-pill bg-surface transition-transform duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{
            width: 'calc(50% - 3px)',
            transform: `translateX(${indice * 100}%)`,
            filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.08))',
          }}
        />
      )}
      {voci.map((v) => {
        const acceso = v.id === scelta
        return (
          <button
            key={String(v.id)}
            type="button"
            role="radio"
            aria-checked={acceso}
            onClick={() => onChange(v.id)}
            /*
              Finche' non ha scelto, tutte e due le scritte restano in
              inchiostro pieno: con quella spenta di default l'interruttore
              sembrava disattivato invece che in attesa di una risposta.
            */
            className={`relative z-1 min-w-0 flex-1 rounded-pill px-4 py-[9px] text-[13px] font-bold transition-colors duration-150 ${
              acceso ? 'text-lilla' : scelta === null ? 'text-ink' : 'text-spento'
            }`}
          >
            {v.testo}
          </button>
        )
      })}
    </div>
  )
}

/** L'interruttore già fatto per le domande da sì o no. */
export function SiNo({
  scelta,
  onChange,
  etichetta,
  className,
}: {
  scelta: boolean | null
  onChange: (v: boolean) => void
  etichetta: string
  className?: string
}) {
  return (
    <Interruttore<boolean>
      voci={[
        { id: true, testo: SESSIONE.comune.si },
        { id: false, testo: SESSIONE.comune.no },
      ]}
      scelta={scelta}
      onChange={onChange}
      etichetta={etichetta}
      className={className}
    />
  )
}

/**
 * Una pastiglia che si accende: le parole del foglio, le fasce di ore, le
 * cose portate a casa.
 *
 * Il verde acceso e' lo stesso su tutte e tre, ed e' l'unico verde di questi
 * schermi che vuol dire "questa l'hai scelta tu". Il verde della home vuol
 * dire un'altra cosa (la sessione e' andata) ed e' un altro colore apposta.
 */
export function Pastiglia({
  accesa,
  onClick,
  icona,
  children,
  tratteggiata = false,
}: {
  accesa: boolean
  onClick: () => void
  icona?: string
  children: ReactNode
  /** il bordo a trattini di "Aggiungi tu...": e' un invito, non una scelta */
  tratteggiata?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={accesa}
      onClick={onClick}
      className={`inline-flex items-center gap-[6px] rounded-[24px] border-[1.5px] py-[6px] pl-[9px] pr-[11px] text-[13px] leading-[16px] transition-colors duration-150 ${
        tratteggiata ? 'border-dashed' : ''
      } ${
        accesa
          ? 'border-verde-tenue bg-verde-fondo font-bold text-verde-testo'
          : 'border-line bg-surface text-ink'
      }`}
    >
      {icona && <img src={icona} alt="" aria-hidden className="size-[14px] shrink-0" />}
      <span className="text-left">{children}</span>
    </button>
  )
}
