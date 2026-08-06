import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase.
 *
 * La chiave `anon` è pubblica per design: finisce nel bundle del frontend. È
 * sicura SOLO grazie alla RLS (`athlete_id = auth.uid()` su ogni tabella).
 * Stessa impostazione della landing.
 *
 * Se le variabili non ci sono, il client è `null` e l'app funziona comunque in
 * locale — non deve rompersi solo perché non è ancora collegata.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          // Link via email: nessuna password da ricordare né da farsi rubare.
          // Per delle minorenni è la scelta più semplice e più sicura.
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

export const isConnected = () => supabase !== null
