/** Solo per la verifica manuale nel browser. Non entra nel bundle di produzione. */
import * as db from './db'
import * as repo from './repo'
import { flush, parked } from './sync'
import * as hydrate from './hydrate'
import * as account from './account'
import { isConnected, supabase } from './supabase'

/**
 * `supabase` è qui perché le tre verifiche che un finto server non può
 * dimostrare (RLS, isolamento del ciclo, cancellazione a cascata) si fanno
 * dalla console, e senza il client non c'è modo di provarle.
 */
export const bab = { db, repo, flush, parked, hydrate, account, supabase, isConnected }
declare global { interface Window { bab: typeof bab } }
if (import.meta.env.DEV) window.bab = bab
