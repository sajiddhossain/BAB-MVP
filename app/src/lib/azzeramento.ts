/**
 * L'azzeramento: il browser dimentica quello che aveva salvato, una volta sola.
 *
 * ── PERCHE' SERVE ──────────────────────────────────────────────────────────
 * Il 13 settembre 2026 il database e' stato svuotato: atlete, account e tutto
 * quello che avevano scritto. I telefoni pero' si tenevano la loro copia — le
 * risposte dell'onboarding, la giornata con "check-in fatto", i salvataggi in
 * coda, e soprattutto l'accesso di un account che non esiste piu'. Con quella
 * copia l'app avrebbe mostrato cose che nel database non ci sono, e la coda
 * avrebbe provato per sempre a rimandare check-in di persone cancellate.
 *
 * Qui, alla prima apertura dopo l'azzeramento, si cancella tutto questo e si
 * lascia un segno: le aperture dopo non toccano piu' niente. Resta solo la
 * lingua, che non e' un dato di nessuno.
 *
 * ── PERCHE' STA IN UN FILE A PARTE, IMPORTATO PER PRIMO ────────────────────
 * Le copie si leggono appena i loro moduli vengono caricati (`giornata.ts`
 * legge la sua in cima al file). Se questa pulizia stesse dentro all'app,
 * partirebbe dopo, a copie gia' lette. `main.tsx` la importa per prima, e
 * questo file non importa niente: cosi' gira prima di tutti.
 *
 * Un altro azzeramento, un giorno, e' cambiare la data qui sotto.
 */
const AZZERAMENTO = '2026-09-13'
const SEGNO = 'bab.azzeramento'
const RESTANO = new Set(['bab.lingua', SEGNO])

try {
  if (localStorage.getItem(SEGNO) !== AZZERAMENTO) {
    for (const chiave of Object.keys(localStorage)) {
      const nostra = chiave.startsWith('bab.') && !RESTANO.has(chiave)
      // l'accesso lo tiene Supabase, sotto `sb-<progetto>-auth-token`
      const accesso = /^sb-.+-auth-token/.test(chiave)
      if (nostra || accesso) localStorage.removeItem(chiave)
    }
    localStorage.setItem(SEGNO, AZZERAMENTO)
  }
} catch {
  // navigazione privata o spazio bloccato: non c'e' niente di vecchio da togliere
}
