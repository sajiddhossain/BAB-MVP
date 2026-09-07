import { createClient } from '@supabase/supabase-js'

/**
 * Le chiavi stanno nell'ambiente, non nel codice: quella anonima e' pubblica
 * per progetto ma cambia fra sviluppo e produzione, e non ha senso ricompilare
 * per cambiarla.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null
