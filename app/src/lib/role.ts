import { useEffect, useState } from 'react'
import * as db from './db'
import { supabase } from './supabase'

/**
 * Chi è entrato: un'atleta, qualcuno dello staff, o chi amministra.
 *
 * 🔴 Finora questa domanda non se la faceva nessuno, e il risultato era che un
 * coach che entrava finiva dentro l'onboarding di una tredicenne — «come ti
 * chiamiamo?», la data di nascita, lo stato del ciclo. L'unica strada per la
 * dashboard era scrivere `/team` nella barra dell'indirizzo, e nessuno gliel'ha
 * mai detto.
 *
 * 🔴 Non c'è nessun ruolo dentro al token. Si guardano due tabelle, e la RLS fa
 * la domanda al posto nostro: `platform_admins` la legge solo un admin, e su
 * `team_staff` ognuno vede solo le proprie righe. Quindi «quante righe ci sono»
 * È la risposta — non serve confrontare niente, e non c'è niente da falsificare
 * dal client.
 */

export type Role = 'athlete' | 'staff' | 'admin'

const KEY = (userId: string) => `role:${userId}`

/** Dove va a finire chi entra, se non ha chiesto una pagina precisa. */
export const homeFor = (role: Role): string =>
  role === 'admin' ? '/admin' : role === 'staff' ? '/team' : '/today'

export async function readRole(userId: string): Promise<Role> {
  if (!supabase) return 'athlete'

  const [admin, staff] = await Promise.all([
    supabase.from('platform_admins').select('user_id', { count: 'exact', head: true }),
    supabase.from('team_staff').select('user_id', { count: 'exact', head: true }),
  ])
  if (admin.error && staff.error) throw new Error(staff.error.message)

  const role: Role = (admin.count ?? 0) > 0 ? 'admin'
    : (staff.count ?? 0) > 0 ? 'staff'
    : 'athlete'
  await db.setMeta(KEY(userId), role).catch(() => {})
  return role
}

/**
 * 🔴 Il ruolo si ricorda sul dispositivo, e serve per l'unico caso in cui
 * sbagliare costa: senza rete non si può chiedere niente al server, e il
 * ripiego naturale — «sarà un'atleta» — manderebbe un coach dritto
 * nell'onboarding. Un coach che ha già aperto BAB una volta da questo portatile
 * resta un coach anche quando il wi-fi della palestra non va.
 *
 * Non è un permesso: è solo dove atterra. Cosa può leggere lo decide la RLS a
 * ogni singola query, e quella non passa da qui.
 */
export function useRole(userId: string | null) {
  const [role, setRole] = useState<Role>('athlete')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !supabase) { setRole('athlete'); setLoading(false); return }
    let alive = true
    setLoading(true)

    db.getMeta(KEY(userId))
      .then((cached) => {
        if (alive && (cached === 'staff' || cached === 'admin')) setRole(cached)
      })
      .catch(() => {})
      .finally(() => readRole(userId)
        .then((r) => { if (alive) setRole(r) })
        .catch(() => { /* niente rete: resta quello che sapevamo */ })
        .finally(() => { if (alive) setLoading(false) }))

    return () => { alive = false }
  }, [userId])

  return { role, loading }
}
