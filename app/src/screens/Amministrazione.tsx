import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useSessione } from '../lib/conto'
import { SENZA_ACCESSO } from '../lib/sviluppo'

/**
 * Il cancello del pannello di amministrazione.
 *
 * Questo file non mostra niente: dice solo chi puo' entrare, e poi lascia
 * passare. Quello che c'e' dentro sta in `screens/admin/` — l'atrio, le
 * scritte, le sezioni — e ogni stanza e' una rotta sotto a `/admin`.
 *
 * ── CHI PUO' ENTRARE ───────────────────────────────────────────────────────
 * Chi sta in `platform_admins`. Il controllo vero non e' qui: e' nelle regole
 * del database, che rifiutano la scrittura a chiunque altro. Questa pagina
 * chiede al database "sono admin?" solo per non mostrare una scrivania a chi
 * non potra' salvarci niente.
 *
 * La porta e' `/admin/login`, ed e' diversa da quella dell'app: di la' si
 * crea un account, di qua si entra e basta. Chi amministra e' passato prima
 * dall'app vera, come tutti.
 */
export function Amministrazione() {
  const { sessione, caricata } = useSessione()
  const [ammesso, setAmmesso] = useState<boolean | null>(null)

  useEffect(() => {
    if (!caricata) return
    if (!sessione || !supabase) {
      setAmmesso(false)
      return
    }
    void (async () => {
      // le regole lasciano vedere questa tabella solo a chi ci sta dentro:
      // una riga che torna indietro E' la risposta
      const { data } = await supabase.from('platform_admins').select('user_id').limit(1)
      setAmmesso((data?.length ?? 0) > 0)
    })()
  }, [caricata, sessione])

  // col lasciapassare di sviluppo il pannello si apre e basta: serve a
  // lavorarci sopra senza essere admin di un database vero
  if (SENZA_ACCESSO) return <Outlet />
  if (!caricata || ammesso === null) return <Schermata>Un momento…</Schermata>
  if (!sessione) {
    return (
      <Schermata>
        Questa pagina è per chi amministra BAB.{' '}
        <a className="underline" href="/admin/login">
          Entra da qui
        </a>
        .
      </Schermata>
    )
  }
  if (!ammesso) {
    return (
      <Schermata>
        Sei entrata, ma questo indirizzo non è per te. Se dovrebbe esserlo, chiedi a chi
        amministra BAB di aggiungerti.
      </Schermata>
    )
  }
  return <Outlet />
}

function Schermata({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper p-8">
      <p className="m-0 max-w-[420px] text-center text-[14px] leading-[1.6] text-ink">{children}</p>
    </div>
  )
}
