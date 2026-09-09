import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigationType } from 'react-router-dom'
import { Sfondo } from '../Sfondo'
import { Barra } from '../Barra'
import { Bottone } from '../Bottone'

/**
 * Il guscio di uno schermo di lezione.
 *
 * Diverso da `Schermo` dell'onboarding per una ragione sola, ma grossa: qui
 * il contenuto puo' essere piu' alto dello schermo — quattro righe da
 * abbinare piu' il cesto delle parole non ci stanno in 874 — quindi il centro
 * scorre e il bottone resta dov'e'. Nell'onboarding lo schermo cresce e la
 * pagina scorre tutta insieme, bottone compreso.
 *
 * Il riscontro (giusto / non ancora) sta qui sopra al bottone e non dentro al
 * contenuto come nel disegno: dentro al contenuto, su uno schermo corto,
 * comparirebbe sotto al bordo — cioe' non comparirebbe.
 *
 * ── DA CHE PARTE SI STA ANDANDO ────────────────────────────────────────────
 * Lo dice il router, come nell'onboarding: POP e' il tasto indietro, tutto il
 * resto e' una risposta data. Prima entrava sempre da destra, anche tornando
 * indietro, e otto esercizi di fila che entrano tutti dallo stesso lato fanno
 * sembrare che il tasto indietro abbia aperto un altro schermo nuovo.
 *
 * Si legge una volta sola, quando lo schermo nasce: cambiare nome a
 * un'animazione la fa ripartire, e a meta' esercizio non deve ripartire
 * niente. Chi deve rinascere lo decide `Lezione` con la chiave.
 */
export function Guscio({
  avanzamento,
  indietro,
  azione,
  onAzione,
  attivo = true,
  esito,
  children,
}: {
  avanzamento: number
  indietro?: () => void
  /** la scritta del bottone in fondo */
  azione: ReactNode
  onAzione: () => void
  attivo?: boolean
  /** la scheda del riscontro, quando c'e' */
  esito?: ReactNode
  children: ReactNode
}) {
  const tipoDiNavigazione = useNavigationType()
  const [entrata] = useState(tipoDiNavigazione === 'POP' ? 'indietro' : 'avanti')

  return (
    <div className="flex h-dvh justify-center bg-paper">
      <div className="relative flex w-full max-w-[402px] flex-col overflow-hidden">
        <Sfondo nodo="lezione" />

        <div className="relative pt-[calc(56px+env(safe-area-inset-top))]">
          <Barra avanzamento={avanzamento} indietro={indietro} />
        </div>

        <div className={`bab-entra-${entrata} relative flex-1 overflow-y-auto`}>
          <div className="px-[24px] pt-[39px] pb-6">{children}</div>
        </div>

        <div className="relative px-6 pb-[calc(34px+env(safe-area-inset-bottom))]">
          {esito}
          <Bottone attivo={attivo} onClick={onAzione}>
            {azione}
          </Bottone>
        </div>
      </div>
    </div>
  )
}
