/*
 * I due interruttori che esistono solo mentre si lavora.
 */

/**
 * Siamo dentro alla cornice dell'amministrazione dei testi?
 *
 * Si decide una volta sola, quando la pagina si carica: `?anteprima=1`
 * nell'indirizzo, e una finestra che ha qualcuno sopra di se'. Non si
 * ricalcola a ogni cambio di schermata, perche' navigando dentro all'app il
 * pezzetto dopo il punto interrogativo si perde — ma restiamo la stessa
 * pagina, e la cornice e' sempre quella.
 *
 * Le due condizioni servono tutt'e due. Solo il parametro vorrebbe dire che
 * chiunque puo' aggiungerlo al proprio indirizzo e vedersi una giornata
 * finta; solo la cornice vorrebbe dire che qualunque sito che ci mettesse
 * dentro a un iframe farebbe partire l'anteprima.
 *
 * Non apre nessuna porta sui dati: quello che si vede qui e' inventato, e
 * quello che sta nel database e' protetto dalle regole del database, non da
 * questa riga.
 */
export const IN_ANTEPRIMA =
  typeof window !== 'undefined' &&
  window.parent !== window &&
  new URLSearchParams(window.location.search).get('anteprima') === '1'

/**
 * Il lasciapassare per lavorare sugli schermi.
 *
 * Vive solo con il server di sviluppo: `import.meta.env.DEV` e' falso in ogni
 * versione costruita per essere pubblicata, quindi questo valore sparisce
 * proprio dal codice compilato — non e' una porta chiusa a chiave, e' una
 * porta che in produzione non e' mai stata murata perche' non e' mai
 * esistita.
 *
 * Si accende mettendo `VITE_SENZA_ACCESSO=1` in `.env.local`, che git ignora.
 * Serve alla guardia (per girare l'onboarding senza rifare l'accesso) e
 * all'amministrazione dei testi (per aprirla senza essere admin di un
 * database vero).
 */
export const SENZA_ACCESSO = import.meta.env.DEV && import.meta.env.VITE_SENZA_ACCESSO === '1'
