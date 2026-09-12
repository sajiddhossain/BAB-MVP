import type { ReactNode } from 'react'
import { useLingua } from '../../lib/lingua'

/** Lo spazio fra le due meta'. Vedi `attesa`, qui sotto. */
const ARIA = 10

/**
 * L'interruttore a due posizioni: Davanti/Dietro, Sì/No.
 *
 * Nel disegno la parte accesa e' una pastiglia bianca che sta dentro a una
 * scanalatura color carta, con un'ombra morbida sotto. Non e' un bottone
 * premuto: e' una cosa che scorre, e infatti scorre — la pastiglia si sposta
 * invece di accendersi e spegnersi, che e' quello che fa capire che le due
 * scelte sono due posizioni della stessa cosa.
 *
 * ── E PRIMA DI RISPONDERE NON E' UN INTERRUTTORE ───────────────────────────
 * La pastiglia nasce con la risposta, quindi finche' non si rispondeva
 * restava una barra piatta color carta con due parole sopra: non si capiva
 * che ci fosse qualcosa da toccare, ne' quale meta' fosse quale. Sembrava una
 * riga scritta, non una domanda.
 *
 * Il primo tentativo — le due meta' appena piu' chiare della scanalatura — non
 * bastava: bianco al sessanta per cento sopra alla carta fa tre toni quasi
 * uguali, e restava una macchia pallida.
 *
 * Cosi' in attesa l'interruttore non si finge un interruttore: la scanalatura
 * sparisce e restano due pastiglie bianche col bordo, staccate. Sono due
 * bottoni e si vede. Ed e' la stessa forma di tutto il resto che si tocca in
 * quel foglio — le parole, le risposte di "Quando la senti?" — quindi non c'e'
 * niente da imparare. Alla risposta la scanalatura torna e la pastiglia
 * scorre: il comando si compone, e il gesto ha un prima e un dopo.
 *
 * Due misure servono a non far saltare niente in quel momento. Lo spazio fra
 * le meta' e' lo stesso nei due stati (dopo non si vede, perche' la meta'
 * spenta non ha piu' fondo), se no le due meta' cambierebbero larghezza. E in
 * attesa il padding verticale cala di quanto cresce il bordo — 7.5 piu' 1.5
 * fanno i 9 di sempre — se no il comando si alzerebbe di tre pixel.
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
  const attesa = scelta === null
  return (
    <div
      role="radiogroup"
      aria-label={etichetta}
      className={`relative flex rounded-pill p-[3px] ${attesa ? '' : 'bg-paper'} ${className}`}
      style={{ gap: ARIA }}
    >
      {/*
        La pastiglia bianca sta sotto ai due bottoni ed e' una sola: cosi'
        scorre da una parte all'altra. Quando non ha ancora scelto non c'e',
        e al suo posto ci sono i due bottoni col bordo — vedi sopra.

        Le misure tengono conto dello spazio in mezzo: larga quanto una meta',
        e il salto e' una meta' piu' lo spazio. Il `100%` del `translateX` e'
        la larghezza della pastiglia stessa, non della scanalatura.
      */}
      {indice >= 0 && (
        <span
          aria-hidden
          className="absolute inset-y-[3px] left-[3px] rounded-pill bg-surface transition-transform duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{
            width: `calc((100% - ${6 + ARIA}px) / 2)`,
            transform: `translateX(calc(${indice} * (100% + ${ARIA}px)))`,
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
            className={`relative z-1 min-w-0 flex-1 rounded-pill px-4 text-[13px] font-bold transition-colors duration-150 ${
              acceso ? 'text-lilla' : attesa ? 'text-ink' : 'text-spento'
            } ${attesa ? 'border-[1.5px] border-line bg-surface py-[7.5px]' : 'py-[9px]'}`}
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
  const { ts } = useLingua()
  const t = ts.comune
  return (
    <Interruttore<boolean>
      voci={[
        { id: true, testo: t.si },
        { id: false, testo: t.no },
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
  onInfo,
  etichettaInfo,
  icona,
  children,
  tratteggiata = false,
}: {
  accesa: boolean
  onClick: () => void
  /**
   * Se c'e', la pastiglia guadagna una ⓘ che apre la scheda della parola.
   * Sono due bottoni dentro a un bordo solo e non un bottone dentro l'altro:
   * annidare due <button> non e' HTML valido, e sul telefono la ⓘ diventa
   * irraggiungibile perche' il tocco lo prende quello di fuori.
   */
  onInfo?: () => void
  /** cosa legge VoiceOver sulla ⓘ: il testo lo passa chi la usa */
  etichettaInfo?: string
  icona?: string
  children: ReactNode
  /** il bordo a trattini di "Aggiungi tu...": e' un invito, non una scelta */
  tratteggiata?: boolean
}) {
  const bordo = `inline-flex items-center rounded-[24px] border-[1.5px] text-[13px] leading-[16px] transition-colors duration-150 ${
    tratteggiata ? 'border-dashed' : ''
  } ${
    accesa
      ? 'border-verde-tenue bg-verde-fondo font-bold text-verde-testo'
      : 'border-line bg-surface text-ink'
  }`

  const dentro = (
    <>
      {icona && <img src={icona} alt="" aria-hidden className="size-[14px] shrink-0" />}
      <span className="text-left">{children}</span>
    </>
  )

  if (!onInfo) {
    return (
      <button
        type="button"
        aria-pressed={accesa}
        onClick={onClick}
        className={`${bordo} gap-[6px] py-[6px] pl-[9px] pr-[11px]`}
      >
        {dentro}
      </button>
    )
  }

  return (
    <span className={`${bordo} pr-[3px]`}>
      <button
        type="button"
        aria-pressed={accesa}
        onClick={onClick}
        className="flex items-center gap-[6px] py-[6px] pr-[6px] pl-[9px]"
      >
        {dentro}
      </button>
      <button
        type="button"
        onClick={onInfo}
        aria-label={etichettaInfo}
        className="flex size-[22px] shrink-0 items-center justify-center rounded-full text-[13px] leading-none text-ink-mute"
      >
        ⓘ
      </button>
    </span>
  )
}

/**
 * Una scelta fra tre: quando la senti, quando e' comparsa, cosa le ha fatto
 * la sessione.
 *
 * Non e' una `Pastiglia` con un altro colore: la pastiglia e' una parola che
 * si accende insieme ad altre, questa e' una risposta sola. La forma lo dice
 * — angolo piccolo invece che pillola — e il bordo e' di due pixel, l'unico
 * di tutto il foglio.
 *
 * Si puo' anche spegnere ritoccandola: non rispondere e' una risposta, e
 * lasciarla accesa per sbaglio sarebbe peggio che lasciarla vuota.
 */
export function Scelta({
  accesa,
  onClick,
  children,
}: {
  accesa: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={accesa}
      onClick={onClick}
      className={`inline-flex h-[37px] items-center rounded-[10px] px-[13px] text-[13px] font-medium text-ink transition-colors duration-150 ${
        accesa
          ? 'border-2 border-verde-acceso bg-verde-chiaro'
          : 'border border-scelta-bordo bg-chip'
      }`}
    >
      {children}
    </button>
  )
}
