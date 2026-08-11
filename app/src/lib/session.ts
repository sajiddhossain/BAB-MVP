import { useEffect, useState } from 'react'
import { supabase } from './supabase'

/**
 * Chi è connessa, e come si entra.
 *
 * R12: il **link via email** è la strada principale, non un ripiego. Google ha
 * un'età minima che varia fra 13 e 16 anni a seconda del paese, e gli account
 * scolastici sono spesso bloccati dall'amministratore per le app di terze
 * parti: una dodicenne spesso non può usarlo. Il link via email funziona a
 * qualsiasi età.
 *
 * 🔴 Se Supabase non è collegato, `userId` è `null` e l'app **continua a
 * funzionare**. È deliberato: il contenuto di sicurezza — il Care mode, cosa
 * fare quando fa male — non deve mai dipendere dall'essere connesse.
 */

export type AuthResult = { ok: true } | { ok: false; error: string }

export function useSession() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let alive = true

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setUserId(data.session?.user.id ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (alive) setUserId(session?.user.id ?? null)
    })

    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])

  return { userId, loading, connected: supabase !== null }
}

/** Il link via email. Nessuna password: niente da ricordare, niente da rubare. */
export async function signInWithEmail(email: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'not-connected' }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
  return error ? { ok: false, error: error.message } : { ok: true }
}

/**
 * Google. Comodità per chi ce l'ha già — utile soprattutto per lo staff, che
 * sono adulti senza vincoli d'età e accedono da un portatile.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'not-connected' }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  return error ? { ok: false, error: error.message } : { ok: true }
}

/**
 * Google è **acceso nella dashboard, non nel codice** (SUPABASE.md §4b), quindi
 * il codice non può saperlo: deve chiederlo. `/auth/v1/settings` è pubblico e
 * dice quali provider sono configurati.
 *
 * 🔴 Serve perché il tasto c'è comunque: senza questa risposta, un progetto in
 * cui Google non è ancora stato configurato mostra un bottone che porta a una
 * pagina d'errore di Supabase. A una dodicenne quell'errore sembra colpa sua —
 * ed è esattamente quello che `ageNote` esiste per evitare.
 *
 * In caso di dubbio si nasconde: il link via email funziona sempre (R12), un
 * bottone rotto no.
 */
export async function googleEnabled(): Promise<boolean> {
  if (!supabase) return false
  try {
    const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string },
    })
    if (!r.ok) return false
    const s = (await r.json()) as { external?: Record<string, boolean> }
    return s.external?.google === true
  } catch {
    return false
  }
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut()
}
