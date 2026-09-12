import type { ReactNode } from 'react'
import { useLingua } from '../../lib/lingua'

/** Lo spazio fra i due bottoni, nella forma `bottoni`. */
const ARIA = 10

/**
 * L'interruttore a due posizioni: Davanti/Dietro, Sì/No.
 *
 * Ha due forme, e non e' un gusto: e' se una risposta c'e' gia' oppure no.
 *
 * ── `barra` ────────────────────────────────────────────────────────────────
 * L'interruttore del disegno: una scanalatura color carta con dentro una
 * pastiglia bianca e un'ombra morbida. Non e' un bottone premuto, e' una cosa
 * che scorre — e infatti scorre, invece di accendersi e spegnersi, ed e'
 * quello che fa capire che le due scelte sono due posizioni della stessa
 * cosa. Va bene dove una risposta c'e' sempre: Davanti/Dietro sono le due
 * facce della stessa figura, e la pastiglia c'e' dal primo istante.
 *
 * ── `bottoni` ──────────────────────────────────────────────────────────────
 * Dove invece si parte senza risposta, la barra non funziona. La pastiglia
 * nasce con la risposta, quindi prima restava una barra piatta color carta
 * con due parole sopra: non si capiva che ci fosse qualcosa da toccare, ne'
 * quale meta' fosse quale. Sembrava una riga scritta, non una domanda.
 *
 * Schiarire appena le due meta' non bastava — bianco sopra carta fa tre toni
 * quasi uguali. E farle diventare barra al momento della risposta era peggio:
 * due bottoni che si fondono in un oggetto diverso e' un movimento che nessuno
 * si aspetta, e per capire cos'e' successo bisogna rileggere il comando.
 *
 * Quindi qui non c'e' nessun interruttore: sono due pastiglie staccate, prima
 * e dopo. Si toccano come tutto il resto del foglio — le parole, le risposte
 * di "Quando la senti?" — e rispondere accende quella scelta senza spostare
 * niente. Il lilla e non il verde perche' il verde delle parole vuol dire
 * "questa l'hai scelta ed e' una cosa tua", mentre qui "Hai il ciclo? Si" non
 * deve leggersi ne' bene ne' male: e' un fatto.
 */
export function Interruttore<T extends string | boolean>({
  voci,
  scelta,
  onChange,
  etichetta,
  className = '',
  forma = 'barra',
}: {
  voci: [{ id: T; testo: string }, { id: T; testo: string }]
  scelta: T | null
  onChange: (id: T) => void
  etichetta: string
  className?: string
  /** vedi sopra: `barra` dove la risposta c'e' sempre, `bottoni` dove manca */
  forma?: 'barra' | 'bottoni'
}) {
  const indice = voci.findIndex((v) => v.id === scelta)
  const attesa = scelta === null

  if (forma === 'bottoni') {
    return (
      <div
        role="radiogroup"
        aria-label={etichetta}
        className={`flex ${className}`}
        style={{ gap: ARIA }}
      >
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
                Alti quanto era alta la barra, ombra compresa: cosi' cambiando
                forma non si e' mosso niente di quello che ci sta intorno.
              */
              className={`min-w-0 flex-1 rounded-pill border-[1.5px] px-4 py-[10.5px] text-[13px] font-bold transition-colors duration-150 ${
                acceso
                  ? 'border-lilla bg-lilla-fondo text-lilla-testo'
                  : `border-line bg-surface ${attesa ? 'text-ink' : 'text-spento'}`
              }`}
            >
              {v.testo}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label={etichetta}
      className={`relative flex rounded-pill bg-paper p-[3px] ${className}`}
    >
      {/*
        La pastiglia bianca sta sotto ai due bottoni ed e' una sola: cosi'
        scorre da una parte all'altra.
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
            className={`relative z-1 min-w-0 flex-1 rounded-pill px-4 py-[9px] text-[13px] font-bold transition-colors duration-150 ${
              acceso ? 'text-lilla' : attesa ? 'text-ink' : 'text-spento'
            }`}
          >
            {v.testo}
          </button>
        )
      })}
    </div>
  )
}

/**
 * L'interruttore già fatto per le domande da sì o no.
 *
 * Sempre a bottoni: una domanda da sì o no parte senza risposta — e' questo
 * che la rende una domanda — quindi la barra qui non ci va mai.
 */
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
      forma="bottoni"
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
