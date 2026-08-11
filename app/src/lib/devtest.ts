/** Solo per la verifica manuale nel browser. Non entra nel bundle di produzione. */
import * as db from './db'
import * as repo from './repo'
import { flush, parked } from './sync'
import * as hydrate from './hydrate'
import * as account from './account'

export const bab = { db, repo, flush, parked, hydrate, account }
declare global { interface Window { bab: typeof bab } }
if (import.meta.env.DEV) window.bab = bab
