import { useEffect, useState } from 'react'
import { supabase } from './supabase'

/**
 * Se questa persona ha gia' un profilo, cioe' se ha gia' fatto l'onboarding.
 *
 * Serve a una cosa sola ma importante: chi rientra deve trovare la sua home,
 * non le domande a cui ha gia' risposto. Il fatto che ci sia una sessione non
 * basta a saperlo — la sessione si apre col codice, il profilo si scrive alla
 * fine dell'onboarding, e fra le due cose c'e' tutto il percorso.
 */
/**
 * Tre risposte e non due. `boh` e' quando la domanda non ha avuto risposta —
 * rete caduta, server lento. Serve perche' con due sole risposte un problema
 * di rete diventerebbe una decisione: "non lo so" verrebbe letto come "non ce
 * l'ha", e chi rientra si ritroverebbe l'onboarding da rifare per colpa di un
 * secondo di linea storta.
 */
export type Profilo = 'si' | 'no' | 'boh' | null

let risposta: Profilo = null
let inCorso: Promise<Profilo> | null = null

/** Da chiamare quando il profilo viene creato o cancellato. */
export function dimenticaProfilo() {
  risposta = null
  inCorso = null
}

async function chiedi(): Promise<Profilo> {
  if (!supabase) return 'no'
  const { data } = await supabase.auth.getSession()
  if (!data.session) return 'no'
  const { data: righe, error } = await supabase.from('athletes').select('id').limit(1)
  if (error) {
    console.error('[profilo]', error.message)
    return 'boh'
  }
  return righe.length > 0 ? 'si' : 'no'
}

/** `null` finche' la domanda e' in volo: in quel momento non si decide niente. */
export function useProfilo(attivo: boolean): Profilo {
  const [esiste, setEsiste] = useState<Profilo>(risposta)

  useEffect(() => {
    if (!attivo) return
    if (risposta !== null) {
      setEsiste(risposta)
      return
    }
    let vivo = true
    inCorso ??= chiedi()
    void inCorso.then((r) => {
      // un "boh" non si tiene: la prossima volta si richiede
      risposta = r === 'boh' ? null : r
      if (r === 'boh') inCorso = null
      if (vivo) setEsiste(r)
    })
    return () => {
      vivo = false
    }
  }, [attivo])

  return attivo ? esiste : null
}
