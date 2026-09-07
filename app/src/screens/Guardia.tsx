import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { acceso, useSessione } from '../lib/conto'

/**
 * Chi non ha fatto l'accesso non va oltre i due schermi dell'accesso.
 *
 * Se le chiavi di Supabase non ci sono la guardia non fa niente: senza un
 * progetto acceso non esiste nessuna sessione da chiedere, e bloccare tutto
 * vorrebbe dire non poter piu' provare il percorso in locale.
 */
const LIBERI = ['/onboarding/accesso', '/onboarding/link']

export function Guardia({ children }: { children: ReactNode }) {
  const { sessione, caricata } = useSessione()
  const dove = useLocation()

  if (!acceso) return <>{children}</>

  // finche' non si sa, non si decide: mandare all'accesso qui vorrebbe dire
  // buttare fuori a ogni ricarica chi la sessione ce l'ha
  if (!caricata) return <div className="min-h-dvh bg-paper" />

  if (!sessione && !LIBERI.includes(dove.pathname)) {
    return <Navigate to="/onboarding/accesso" replace />
  }

  return <>{children}</>
}
