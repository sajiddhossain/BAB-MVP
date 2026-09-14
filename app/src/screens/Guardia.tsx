import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { acceso, caricaProfilo, useSessione } from '../lib/conto'
import { caricaImpostazioni } from '../lib/impostazioni'
import { useProfilo, useTutorialFatto } from '../lib/profilo'
import { CHIAVI } from '../data/tutorial'
import { IN_ANTEPRIMA, SENZA_ACCESSO } from '../lib/sviluppo'

/**
 * Chi puo' stare dove.
 *
 * Quattro regole, in quest'ordine:
 *   1. senza sessione si vedono solo i due schermi dell'accesso;
 *   2. con la sessione ma senza profilo si sta nell'onboarding, e si riparte
 *      dal nome: il codice l'ha gia' inserito, rifarglielo scrivere sarebbe
 *      chiedergli due volte la stessa cosa;
 *   3. col profilo fatto ma il tutorial no, si sta nel tutorial. E' la tappa
 *      che il profilo da solo non sa raccontare: il profilo si scrive al
 *      consenso, il tutorial viene dopo, e senza questa regola chi chiude
 *      l'app a meta' del minigioco non lo rivedrebbe mai piu';
 *   4. con tutt'e due fatti, l'onboarding e il tutorial non si rivedono —
 *      chi rientra trova la sua home, non le domande a cui ha gia' risposto.
 *
 * Se le chiavi di Supabase non ci sono la guardia non fa niente: senza un
 * progetto acceso non esiste nessuna sessione da chiedere, e bloccare tutto
 * vorrebbe dire non poter piu' provare il percorso in locale.
 */
const ACCESSO = ['/onboarding/accesso', '/onboarding/link']

export function Guardia({ children }: { children: ReactNode }) {
  const { sessione, caricata } = useSessione()
  const dove = useLocation()
  const dentro = acceso && sessione !== null
  const profilo = useProfilo(dentro)
  const tutorial = useTutorialFatto(dentro)

  // il profilo c'e' nel database ma non in questo telefono: si rilegge,
  // e con lui gli orari e l'account di prova decisi dal pannello
  useEffect(() => {
    if (profilo !== 'si') return
    void caricaProfilo()
    void caricaImpostazioni()
  }, [profilo])

  /*
   * L'anteprima passa sempre.
   *
   * Dentro alla cornice dell'amministrazione i dati sono finti e chi guarda
   * e' quasi sempre qualcuno che scrive i testi, non un'atleta: non ha un
   * profilo, e la guardia lo rimanderebbe all'onboarding a ogni schermo. Non
   * e' una porta sui dati — quelli li difende il database, non questa riga.
   */
  if (!acceso || SENZA_ACCESSO || IN_ANTEPRIMA) return <>{children}</>

  /*
   * L'amministrazione dei testi si difende da sola.
   *
   * Chi ci entra non e' un'atleta e quasi sempre non ha un profilo: le regole
   * qui sotto lo rimanderebbero all'onboarding. Chi puo' vedere davvero
   * quella pagina lo decide `platform_admins` nel database, e lo decide la'
   * anche se qualcuno arrivasse qui a mano.
   */
  if (dove.pathname.startsWith('/admin')) return <>{children}</>

  // finche' non si sa, non si decide: mandare all'accesso qui vorrebbe dire
  // buttare fuori a ogni ricarica chi la sessione ce l'ha
  if (!caricata) return <Attesa />

  const dentroOnboarding = dove.pathname.startsWith('/onboarding')
  const dentroTutorial = dove.pathname.startsWith('/tutorial')

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

  if (profilo === 'no') {
    // entrata ma senza profilo: gli schermi del codice non servono piu'
    if (!dentroOnboarding || ACCESSO.includes(dove.pathname)) {
      return <Navigate to="/onboarding/nome" replace />
    }
    return <>{children}</>
  }

  /*
   * Profilo fatto. Manca il tutorial?
   *
   * Un 'boh' qui non manda nessuno da nessuna parte: preferiamo che una
   * ragazza si trovi in home senza aver visto il tutorial, piuttosto che
   * rispedirla dentro a un tutorial gia' visto per colpa di un secondo di
   * rete storta. Il primo errore si corregge da solo al prossimo avvio.
   */
  if (tutorial === 'no' && !dentroTutorial) {
    return <Navigate to={`/tutorial/${CHIAVI[0]}`} replace />
  }
  if (tutorial === 'si' && dentroTutorial) return <Navigate to="/casa" replace />
  if (dentroOnboarding) return <Navigate to={tutorial === 'no' ? `/tutorial/${CHIAVI[0]}` : '/casa'} replace />

  return <>{children}</>
}

/** Uno schermo vuoto del colore giusto: meglio di un lampo bianco. */
function Attesa() {
  return <div className="min-h-dvh bg-paper" />
}
