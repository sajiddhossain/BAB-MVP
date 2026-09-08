import type { ReactNode } from 'react'
import { Apri } from '../Apri'
import spuntaTonda from '../../assets/percorso/spunta-tonda.svg'
import spunta from '../../assets/percorso/spunta.svg'

const ICONE = import.meta.glob<string>('../../assets/percorso/*.svg', {
  eager: true,
  import: 'default',
})

/** Una icona del percorso presa per nome, senza un `import` per ognuna. */
export function icona(nome: string): string {
  return ICONE[`../../assets/percorso/${nome}.svg`]
}

/**
 * L'occhiello di una lezione: icona piccola e scritta lilla in maiuscolo.
 *
 * Diverso da quello del check-in, che e' nero e piu' grande: sono due gruppi
 * di frame disegnati in momenti diversi, e la differenza si vede.
 */
export function Occhiello({ nome, children }: { nome: string; children: ReactNode }) {
  return (
    <p className="m-0 flex items-center gap-2">
      <img src={icona(nome)} alt="" aria-hidden className="size-[18px] shrink-0" />
      <span className="text-[10px] font-bold tracking-[1px] uppercase text-lilla">{children}</span>
    </p>
  )
}

/** Il titolo di uno schermo di lezione: 28 su 34, come nel disegno. */
export function Titolo({ children }: { children: ReactNode }) {
  return (
    <h1 className="bab-display m-0 text-[28px] leading-[34px] font-bold tracking-[-0.56px] text-ink">
      {children}
    </h1>
  )
}

/** La pastiglia "SCENARIO" sopra allo scenario. */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-pill bg-[#ffd1c1] px-3 py-[6px] text-[10px] font-bold tracking-[1px] uppercase text-lilla">
      {children}
    </span>
  )
}

/**
 * Una scheda bianca con la riga di colore a sinistra.
 *
 * E' la forma che si ripete in tutta la lezione: la scheda della parola, lo
 * scenario, la frase, le note. Cambia il colore della riga e cosa c'e'
 * dentro.
 */
export function Scheda({
  riga,
  className = '',
  children,
}: {
  /** il colore della riga a sinistra: una tinta o un gradiente */
  riga: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[20px] border-[0.5px] border-[rgba(209,201,196,0.5)] bg-surface shadow-[0px_10px_24px_-10px_rgba(93,95,239,0.07),0px_6px_20px_0px_rgba(0,0,0,0.04)] ${className}`}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[6px]" style={{ background: riga }} />
      {children}
    </div>
  )
}

/** La linea tratteggiata che divide una scheda in due. */
export function Riga() {
  return <div aria-hidden className="my-4 border-t border-dashed border-[#e0dbd6]" />
}

export type StatoCarta = 'ferma' | 'scelta' | 'giusta' | 'sbagliata'

/**
 * Una carta-risposta: cerchio con la lettera, titolo, e a volte una glossa.
 *
 * I quattro stati non sono quattro disegni: nel file Figma esiste solo la
 * carta ferma e quella scelta. Giusta e sbagliata le abbiamo aggiunte noi
 * seguendo i colori che l'app usa gia' — il lime del disegno per il giusto,
 * il rosso tenue delle schede d'allarme per lo sbagliato.
 */
export function CartaRisposta({
  lettera,
  tinta,
  stato,
  titolo,
  glossa,
  onClick,
}: {
  lettera: string
  tinta: string
  stato: StatoCarta
  titolo: string
  glossa?: string
  onClick?: () => void
}) {
  const veste = {
    ferma: { fondo: 'var(--color-surface)', bordo: tinta, cerchio: tinta },
    scelta: { fondo: 'var(--color-surface)', bordo: 'var(--color-ink)', cerchio: tinta },
    giusta: { fondo: '#ecfccb', bordo: '#a3e635', cerchio: '#a3e635' },
    sbagliata: {
      fondo: 'var(--color-allarme-fondo)',
      bordo: 'var(--color-rosso-bordo)',
      cerchio: 'var(--color-rosso-bordo)',
    },
  }[stato]

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={stato !== 'ferma'}
      className="relative flex min-h-[80px] w-full items-center gap-3 overflow-hidden rounded-[20px] border-2 px-4 text-left shadow-[0px_10px_24px_-10px_rgba(93,95,239,0.07),0px_6px_20px_0px_rgba(0,0,0,0.04)] transition-colors duration-150 motion-reduce:transition-none"
      style={{ background: veste.fondo, borderColor: veste.bordo }}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[6px]" style={{ background: tinta }} />
      <span
        className="ml-[2px] flex size-10 shrink-0 items-center justify-center rounded-[20px] text-[14px] font-bold text-ink"
        style={{ background: veste.cerchio }}
      >
        {stato === 'giusta' ? (
          <img src={spunta} alt="" aria-hidden className="size-4" />
        ) : (
          lettera
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] leading-[1.4] font-bold tracking-[-0.3px] text-ink">
          {titolo}
        </span>
        {glossa && <span className="block text-[13px] leading-[1.4] text-ink-soft">{glossa}</span>}
      </span>
    </button>
  )
}

/**
 * Il riscontro sopra al bottone.
 *
 * Si apre invece di comparire: e' lo stesso gesto delle schede che si aprono
 * nel check-in, e senza, il bottone farebbe un salto ogni volta che qualcuno
 * verifica.
 */
export function Esito({
  aperto,
  giusto,
  titolo,
  children,
}: {
  aperto: boolean
  giusto: boolean
  titolo: string
  children?: ReactNode
}) {
  return (
    <Apri aperto={aperto}>
      <div className="pb-3">
        <div
          className="relative overflow-hidden rounded-[20px] border px-4 py-[14px]"
          style={
            giusto
              ? { borderColor: '#a3e635', background: 'linear-gradient(to right, #ecfccb, #d9f99d)' }
              : {
                  borderColor: 'var(--color-rosso-bordo)',
                  background: 'var(--color-allarme-fondo)',
                }
          }
          role="status"
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[6px]"
            style={{ background: giusto ? '#a3e635' : 'var(--color-rosso-bordo)' }}
          />
          <p className="m-0 flex items-center gap-2">
            {giusto && <img src={spuntaTonda} alt="" aria-hidden className="size-4" />}
            <span
              className="text-[12px] font-bold tracking-[1px] uppercase"
              style={{ color: giusto ? '#2b662b' : 'var(--color-allarme-testo)' }}
            >
              {titolo}
            </span>
          </p>
          {children && (
            <p
              className="m-0 mt-[10px] text-[13px] leading-[1.4]"
              style={{ color: giusto ? '#8c5954' : 'var(--color-allarme-testo)' }}
            >
              {children}
            </p>
          )}
        </div>
      </div>
    </Apri>
  )
}

/**
 * Una pastiglia del cesto delle parole.
 *
 * Non e' un `<button>`: i gesti glieli attacca `useTrascina`, che si prende
 * pointerdown, pointermove e pointerup e decide da solo se e' stato un tocco
 * o un trascinamento. Resta raggiungibile con la tastiera perche' ha `role`
 * e `tabIndex`, e `Invio` fa quello che fa un tocco.
 */
export function Pastiglia({
  testo,
  tinta,
  presa,
  spenta,
  fantasma,
  inerte,
  gesti,
  onTocco,
}: {
  testo: string
  tinta: string
  /** scelta, in attesa di sapere dove va */
  presa?: boolean
  /** gia' posata da un'altra parte: resta al suo posto ma spenta */
  spenta?: boolean
  /** e' l'ombra che segue il dito */
  fantasma?: boolean
  /**
   * Non si tocca: e' dentro a qualcos'altro che si tocca gia'.
   *
   * Una pastiglia posata sta dentro al bottone della sua riga. Senza questo
   * sarebbe un bottone dentro a un bottone, che non e' HTML valido e con la
   * tastiera si comporta come viene.
   */
  inerte?: boolean
  gesti?: Record<string, unknown>
  onTocco?: () => void
}) {
  return (
    <span
      {...gesti}
      role={fantasma || inerte ? undefined : 'button'}
      tabIndex={fantasma || inerte || spenta ? undefined : 0}
      aria-pressed={fantasma || inerte ? undefined : !!presa}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onTocco?.()
        }
      }}
      className={`inline-flex items-center rounded-pill border-[1.5px] px-[14px] py-2 text-[12px] font-bold select-none ${
        spenta ? 'opacity-35' : ''
      } ${presa ? 'ring-2 ring-ink ring-offset-1' : ''} ${fantasma ? 'shadow-lg' : ''}`}
      style={{
        background: tinta,
        borderColor: presa ? 'var(--color-ink)' : tinta,
        color: 'var(--color-ink)',
        filter: fantasma ? undefined : 'drop-shadow(0px 8px 9px rgba(124,58,237,0.1))',
        ...(gesti?.style as object),
      }}
    >
      {testo}
    </span>
  )
}

/** Il cesto delle parole: la scheda bianca con dentro le pastiglie. */
export function Cesto({ etichetta, children }: { etichetta: string; children: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[rgba(209,201,196,0.5)] bg-surface px-[14px] py-3 shadow-[0px_10px_24px_0px_rgba(93,95,239,0.07),0px_6px_20px_0px_rgba(0,0,0,0.04)]">
      <p className="m-0 text-[10px] font-bold tracking-[1px] uppercase text-lilla">{etichetta}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

/** Le tinte delle pastiglie, nell'ordine del disegno. */
export const TINTE_PASTIGLIA = ['#ffd1c1', '#e9d5ff', '#d1fae5', '#fef3c7']
