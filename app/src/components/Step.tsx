import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCopy } from '@/copy'

/**
 * Una schermata, una decisione.
 *
 * 🔴 «Una cosa per schermata» non vuol dire un elemento per schermata: vuol
 * dire una DECISIONE per schermata. Il contesto che serve a prenderla —
 * la spiegazione, il pezzo educativo, il riepilogo di cosa ha già detto — sta
 * sulla stessa schermata, perché separarlo dalla domanda vorrebbe dire
 * insegnare in un posto e chiedere in un altro (§10 dice il contrario).
 *
 * 🔴 Sostituisce lo scorrimento unico che avevano i due check-in. Il motivo per
 * cui era stato scritto così era buono — tornare a cambiare un canale non deve
 * costare il giro intero — e va conservato: il passo indietro è sempre libero,
 * le risposte non si perdono mai, e ogni passo ha il suo indirizzo, quindi il
 * tasto «indietro» del telefono fa la cosa giusta invece di buttare via tutto.
 *
 * Il bottone d'azione è l'unico oggetto con l'ombra da 8px: il design system
 * la riserva al protagonista della schermata, e qui il protagonista è ovvio
 * perché ce n'è uno solo.
 */

type Props = {
  /** Il gruppo del flusso: «Passo 2 · Sintonizzati». Orienta, non numera. */
  section?: string
  /** Posizione nel flusso, 1-based, e lunghezza. Solo per la barra. */
  at: number
  of: number
  /** La domanda. È il titolo della schermata, non un'etichetta sopra un campo. */
  question: string
  help?: string
  children?: React.ReactNode
  onBack?: () => void
  /** Uscire dal flusso. Se `dirty`, chiede conferma: qui dentro c'è del lavoro. */
  onClose?: () => void
  dirty?: boolean
  /** `null` = la risposta manca ancora, e il bottone resta spento. */
  onNext?: (() => void) | null
  nextLabel?: string
  /**
   * Le domande facoltative si possono saltare, e saltare è una RISPOSTA: chi
   * chiama registra l'id del passo in `skipped_fields`. Senza un salto
   * esplicito, «non ha risposto» e «non è mai arrivata lì» sono la stessa cosa
   * nei dati — ed è la differenza fra una domanda da tagliare e una che
   * funziona.
   */
  onSkip?: () => void
}

/**
 * Quanto manca. Niente numeri: «3 di 14» a una tredicenne che ha aperto BAB in
 * spogliatoio dice soprattutto che ne mancano undici. La forma dice la stessa
 * cosa senza contarla, e per chi usa uno screen reader il conto c'è comunque
 * negli attributi.
 */
export function Progress({ at, of }: { at: number; of: number }) {
  const t = useCopy()
  return (
    <div
      role="progressbar"
      aria-label={t.flow.progress}
      aria-valuemin={1}
      aria-valuemax={of}
      aria-valuenow={at}
      className="h-[10px] flex-1 overflow-hidden rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-surface)]"
    >
      <div
        className="h-full rounded-full transition-[width] duration-200"
        style={{ width: `${Math.round((at / of) * 100)}%`, background: 'var(--color-lime)' }}
      />
    </div>
  )
}

export default function Step({
  section, at, of, question, help, children,
  onBack, onClose, dirty, onNext, nextLabel, onSkip,
}: Props) {
  const t = useCopy()
  const head = useRef<HTMLHeadingElement>(null)
  const [leaving, setLeaving] = useState(false)

  /**
   * A ogni passo il fuoco va sul titolo. Non è un vezzo: senza, chi usa uno
   * screen reader resta col fuoco sul bottone appena premuto e non sente mai la
   * domanda nuova — il flusso diventa muto proprio per chi ha più bisogno che
   * parli.
   */
  useEffect(() => {
    head.current?.focus()
    window.scrollTo({ top: 0 })
  }, [question])

  return (
    <section className="flex min-h-[calc(100dvh-96px)] flex-col gap-5 pt-1">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          aria-label={t.flow.back}
          className="bab-pill h-11 w-11 shrink-0 text-[17px] disabled:opacity-25"
        >
          <span aria-hidden>←</span>
        </button>

        <Progress at={at} of={of} />

        {onClose && (
          <button
            type="button"
            onClick={() => (dirty ? setLeaving(true) : onClose())}
            aria-label={t.flow.close}
            className="bab-pill h-11 w-11 shrink-0 text-[17px]"
          >
            <span aria-hidden>✕</span>
          </button>
        )}
      </header>

      {/* 🔴 Uscire a metà butta via tutto quello che ha scritto: gli eventi si
          salvano al termine, non a ogni passo. Quindi si chiede — ma solo se
          c'è davvero qualcosa da perdere, altrimenti è un ostacolo inutile. */}
      {leaving && onClose && (
        <div className="bab-card flex flex-col gap-3 px-4 py-4"
             style={{ background: 'var(--care-tint)', borderColor: 'var(--care)' }}
             role="alertdialog" aria-label={t.flow.leaveTitle}>
          <p className="text-[15px] font-bold">{t.flow.leaveTitle}</p>
          <p className="text-[14px]">{t.flow.leaveBody}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onClose} className="bab-pill px-4 py-2 text-[14px]"
                    style={{ borderColor: 'var(--care)', color: 'var(--care)' }}>
              {t.flow.leaveYes}
            </button>
            <button type="button" onClick={() => setLeaving(false)} className="bab-pill px-4 py-2 text-[14px]">
              {t.flow.leaveNo}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4">
        {section && <p className="bab-label">{section}</p>}
        <h1 ref={head} tabIndex={-1} className="bab-heading-focus font-display text-[27px] leading-[1.12]">
          {question}
        </h1>
        {help && <p className="text-[15px] leading-snug text-[var(--color-ink-soft)]">{help}</p>}
        {children}
      </div>

      <footer className="flex flex-col gap-2 pb-2">
        {onSkip && (
          <button type="button" onClick={onSkip}
                  className="self-center px-3 py-2 text-[14px] underline text-[var(--color-ink-soft)]">
            {t.flow.skip}
          </button>
        )}
        {onNext !== undefined && (
          <button
            type="button"
            disabled={onNext === null}
            onClick={onNext ?? undefined}
            className="bab-pill px-4 py-3.5 text-[17px] disabled:opacity-40"
            style={onNext
              ? { background: 'var(--color-lime)', boxShadow: 'var(--shadow-lg)' }
              : undefined}
          >
            {nextLabel ?? t.flow.next}
          </button>
        )}
      </footer>
    </section>
  )
}

/**
 * Il motore del flusso: quale passo, e come si va avanti.
 *
 * 🔴 Il passo sta nell'indirizzo (`?p=…`), non solo in memoria. Il componente
 * non si smonta, quindi le risposte restano dove sono — ma il tasto «indietro»
 * del telefono torna alla domanda precedente invece di far uscire dal check-in
 * e perdere tutto. Con dodici passi, una scivolata del pollice non può costare
 * la giornata.
 *
 * `ids` è la lista dei passi principali, quelli che la barra conta. I passi
 * annidati — la sensazione, l'intensità, il comportamento dentro alla mappa
 * corporea — non ci stanno: sono deviazioni dentro un passo, e contarle
 * farebbe saltare la barra avanti e indietro.
 */
export function useFlow(ids: readonly string[], nested: Record<string, string> = {}) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()

  const wanted = params.get('p') ?? ''
  const known = ids.includes(wanted) || wanted in nested
  const id = known ? wanted : ids[0]!

  /** Un passo annidato mostra la barra ferma sul passo che lo contiene. */
  const anchor = nested[id] ?? id
  const at = Math.max(0, ids.indexOf(anchor)) + 1

  const go = (to: string) => setParams({ p: to })

  return {
    id,
    at,
    of: ids.length,
    go,
    /** Il passo principale successivo, saltando le deviazioni. */
    onward: () => {
      const i = ids.indexOf(anchor)
      go(ids[Math.min(i + 1, ids.length - 1)]!)
    },
    /** Indietro passa dalla cronologia: così coincide col tasto del telefono. */
    back: at === 1 && anchor === id ? undefined : () => navigate(-1),
  }
}

/**
 * Scelta singola che avanza da sola.
 *
 * 🔴 È quello che rende «una domanda per schermata» più veloce del muro di
 * domande, non più lento: rispondere è un tocco, non un tocco più «Avanti».
 * La pausa serve a farle vedere che la scelta è stata registrata — senza, la
 * schermata cambia prima che l'occhio arrivi sulla pillola premuta.
 */
export function useAdvance() {
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (pick: () => void, go: () => void) => {
    pick()
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(go, 240)
  }
}
