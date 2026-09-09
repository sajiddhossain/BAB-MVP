import { useEffect, useState } from 'react'
import { supabase } from './supabase'

/**
 * A che punto è questa persona: ha un profilo? ha finito il tutorial?
 *
 * Serve a una cosa sola ma importante: chi rientra deve trovare la sua home,
 * non le domande a cui ha già risposto. Il fatto che ci sia una sessione non
 * basta a saperlo — la sessione si apre col codice, il profilo si scrive alla
 * fine dell'onboarding, e fra le due cose c'è tutto il percorso.
 *
 * ── PERCHÉ DUE DOMANDE E UNA RISPOSTA SOLA ─────────────────────────────────
 * Il tutorial viene dopo il profilo, e la riga dell'atleta sa tutt'e due le
 * cose: `athletes.tutorial_done`. Chiederle insieme è una richiesta invece di
 * due, e soprattutto evita lo stato in cui si sa una cosa e non l'altra —
 * quello in cui la guardia manderebbe a casa qualcuna che il tutorial non
 * l'ha ancora visto.
 */
/**
 * Tre risposte e non due. `boh` è quando la domanda non ha avuto risposta —
 * rete caduta, server lento. Serve perché con due sole risposte un problema
 * di rete diventerebbe una decisione: "non lo so" verrebbe letto come "non ce
 * l'ha", e chi rientra si ritroverebbe l'onboarding da rifare per colpa di un
 * secondo di linea storta.
 */
export type Profilo = 'si' | 'no' | 'boh' | null

type Risposta = { profilo: Profilo; tutorial: Profilo }

let risposta: Risposta = { profilo: null, tutorial: null }
let inCorso: Promise<Risposta> | null = null

/** Da chiamare quando il profilo viene creato o cancellato. */
export function dimenticaProfilo() {
  risposta = { profilo: null, tutorial: null }
  inCorso = null
}

/**
 * «Il tutorial è finito», detto senza richiederlo al database.
 *
 * Lo chiama chi l'ha appena finito. Senza, la guardia continuerebbe a
 * rimandarla nel tutorial finché la risposta in cache non scade — cioè fino
 * al prossimo avvio dell'app.
 */
export function segnaTutorialFatto() {
  risposta = { ...risposta, tutorial: 'si' }
}

async function chiedi(): Promise<Risposta> {
  if (!supabase) return { profilo: 'no', tutorial: 'no' }
  const { data } = await supabase.auth.getSession()
  if (!data.session) return { profilo: 'no', tutorial: 'no' }

  const { data: righe, error } = await supabase
    .from('athletes')
    .select('id,tutorial_done')
    .limit(1)

  /*
   * La colonna puo' non esserci ancora.
   *
   * `tutorial_done` arriva con `migrazione-tutorial.sql`, e fra il momento in
   * cui l'app va online e quello in cui qualcuno incolla quella migrazione
   * passa del tempo. Senza questo ripiego la richiesta fallisce INTERA — 400,
   * "column does not exist" — e allora non si sa piu' nemmeno se questa
   * persona ha un profilo: la guardia va in 'boh' e non manda piu' nessuno da
   * nessuna parte.
   *
   * Il ripiego chiede solo cio' che c'era prima, e sul tutorial non decide:
   * 'boh' vuol dire "non lo so", e chi non lo sa non spedisce nessuna dentro
   * a un tutorial ne' fuori. Torna tutto al suo posto appena la migrazione
   * viene lanciata.
   */
  if (error?.code === '42703' || /tutorial_done/.test(error?.message ?? '')) {
    console.warn('[profilo] manca athletes.tutorial_done: lancia migrazione-tutorial.sql')
    const { data: solo, error: errore2 } = await supabase.from('athletes').select('id').limit(1)
    if (errore2 || !solo) return { profilo: 'boh', tutorial: 'boh' }
    return { profilo: solo.length > 0 ? 'si' : 'no', tutorial: 'boh' }
  }

  if (error) {
    console.error('[profilo]', error.message)
    return { profilo: 'boh', tutorial: 'boh' }
  }
  const riga = righe[0] as { id: string; tutorial_done: string | null } | undefined
  if (!riga) return { profilo: 'no', tutorial: 'no' }
  return { profilo: 'si', tutorial: riga.tutorial_done ? 'si' : 'no' }
}

/**
 * La risposta di adesso, chiedendola una volta sola.
 *
 * `null` finché la domanda è in volo: in quel momento non si decide niente.
 */
function useRisposta(attivo: boolean): Risposta {
  const [vista, setVista] = useState<Risposta>(risposta)

  useEffect(() => {
    if (!attivo) return
    if (risposta.profilo !== null) {
      setVista(risposta)
      return
    }
    let vivo = true
    inCorso ??= chiedi()
    void inCorso.then((r) => {
      // un "boh" non si tiene: la prossima volta si richiede
      risposta = r.profilo === 'boh' ? { profilo: null, tutorial: null } : r
      if (r.profilo === 'boh') inCorso = null
      if (vivo) setVista(r)
    })
    return () => {
      vivo = false
    }
  }, [attivo])

  return attivo ? vista : { profilo: null, tutorial: null }
}

/** Se questa persona ha già un profilo, cioè se ha già fatto l'onboarding. */
export function useProfilo(attivo: boolean): Profilo {
  return useRisposta(attivo).profilo
}

/** Se ha già visto il tutorial fino in fondo. */
export function useTutorialFatto(attivo: boolean): Profilo {
  return useRisposta(attivo).tutorial
}
