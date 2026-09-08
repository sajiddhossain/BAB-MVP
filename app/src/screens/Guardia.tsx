import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { acceso, caricaProfilo, useSessione } from '../lib/conto'
import { useProfilo } from '../lib/profilo'

/**
 * Chi puo' stare dove.
 *
 * Tre regole, in quest'ordine:
 *   1. senza sessione si vedono solo i due schermi dell'accesso;
 *   2. con la sessione e il profilo gia' fatto, l'onboarding non si rivede —
 *      chi rientra trova la sua home, non le domande a cui ha gia' risposto;
 *   3. con la sessione ma senza profilo si sta nell'onboarding, e si riparte
 *      dal nome: il codice l'ha gia' inserito, rifarglielo scrivere sarebbe
 *      chiedergli due volte la stessa cosa.
 *
 * Se le chiavi di Supabase non ci sono la guardia non fa niente: senza un
 * progetto acceso non esiste nessuna sessione da chiedere, e bloccare tutto
 * vorrebbe dire non poter piu' provare il percorso in locale.
 */
const ACCESSO = ['/onboarding/accesso', '/onboarding/link']

export function Guardia({ children }: { children: ReactNode }) {
  const { sessione, caricata } = useSessione()
  const dove = useLocation()
  const profilo = useProfilo(acceso && sessione !== null)

  // il profilo c'e' nel database ma non in questo telefono: si rilegge
  useEffect(() => {
    if (profilo === 'si') void caricaProfilo()
  }, [profilo])

  if (!acceso) return <>{children}</>

  // finche' non si sa, non si decide: mandare all'accesso qui vorrebbe dire
  // buttare fuori a ogni ricarica chi la sessione ce l'ha
  if (!caricata) return <Attesa />

  const dentroOnboarding = dove.pathname.startsWith('/onboarding')

  if (!sessione) {
    return ACCESSO.includes(dove.pathname) ? (
      <>{children}</>
    ) : (
      <Navigate to="/onboarding/accesso" replace />
    )
  }

  if (profilo === null) return <Attesa />

  // "boh" vuol dire che la domanda non ha avuto risposta: si mostra quello
  // che e' stato chiesto e non si sposta nessuno. Sbagliare qui costa piu'
  // che aspettare — mandare all'onboarding chi l'ha gia' fatto e' peggio che
  // lasciarlo dov'e' per un giro.
  if (profilo === 'boh') return <>{children}</>

  if (profilo === 'si' && dentroOnboarding) return <Navigate to="/casa" replace />
  if (profilo === 'no' && !dentroOnboarding) return <Navigate to="/onboarding/nome" replace />
  // entrata ma senza profilo: gli schermi del codice non servono piu'
  if (profilo === 'no' && ACCESSO.includes(dove.pathname)) {
    return <Navigate to="/onboarding/nome" replace />
  }

  return <>{children}</>
}

/** Uno schermo vuoto del colore giusto: meglio di un lampo bianco. */
function Attesa() {
  return <div className="min-h-dvh bg-paper" />
}
