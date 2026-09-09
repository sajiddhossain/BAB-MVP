import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottoneTocco } from '../ui/tocco'
import { mandaCodice, useSessione, verificaCodice } from '../lib/conto'
import { SENZA_ACCESSO } from '../lib/sviluppo'

/**
 * L'accesso al pannello.
 *
 * ── PERCHE' NON E' QUELLO DELL'APP ─────────────────────────────────────────
 * L'accesso dell'app CREA: una ragazza che scrive la sua mail per la prima
 * volta diventa un'utente di BAB, ed e' giusto cosi'. Questa porta no. Qui si
 * entra e basta: se quella mail non ha gia' un account, non se ne fa uno —
 * si dice di passare dall'app vera, e di tornare.
 *
 * La differenza sta in una riga (`shouldCreateUser: false`), ma e' la riga
 * che separa "un pannello ha una porta sua" da "chiunque puo' registrarsi
 * dalla porta di servizio".
 *
 * ── QUESTA PAGINA NON DECIDE NIENTE ────────────────────────────────────────
 * Entrare non vuol dire poter scrivere. Chi puo' cambiare i testi lo dice
 * `platform_admins` nel database, e lo dicono le regole riga per riga: chi
 * entra qui senza esserci dentro vede una scrivania che non salva niente, e
 * il pannello glielo dice subito. Il controllo vero non e' mai nel browser.
 */
export function AccessoAdmin() {
  const vai = useNavigate()
  const { sessione, caricata } = useSessione()
  const [email, setEmail] = useState('')
  const [codice, setCodice] = useState('')
  const [passo, setPasso] = useState<'mail' | 'codice'>('mail')
  const [stato, setStato] = useState('')
  const [manca, setManca] = useState(false)
  const [manda, setManda] = useState(false)

  /* chi e' gia' dentro non deve rivedere la porta: si va alla scrivania */
  useEffect(() => {
    if (SENZA_ACCESSO || (caricata && sessione)) vai('/admin', { replace: true })
  }, [caricata, sessione, vai])

  async function chiediCodice() {
    const pulita = email.trim()
    if (!pulita.includes('@')) {
      setStato('Serve un indirizzo mail.')
      return
    }
    setManda(true)
    setManca(false)
    setStato('Mando il codice…')
    const esito = await mandaCodice(pulita, true)
    setManda(false)
    if (esito.ok) {
      setPasso('codice')
      setStato('Ti abbiamo mandato un codice a sei cifre.')
      return
    }
    if (esito.sconosciuta) {
      setManca(true)
      setStato('')
      return
    }
    if (esito.fraSecondi) {
      setStato(`Aspetta ${esito.fraSecondi} secondi e riprova.`)
      return
    }
    setStato(esito.lento ? 'La posta non risponde. Riprova fra un minuto.' : esito.errore)
  }

  async function entra() {
    if (codice.trim().length < 6) {
      setStato('Il codice è di sei cifre.')
      return
    }
    setManda(true)
    setStato('Controllo…')
    const esito = await verificaCodice(email, codice)
    setManda(false)
    if (esito.ok) {
      vai('/admin', { replace: true })
      return
    }
    setStato('Codice non valido o scaduto.')
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper p-6">
      <div className="w-full max-w-[380px] rounded-[20px] border-[1.5px] border-line bg-surface p-6 shadow-[6px_6px_0_rgba(0,0,0,0.06)]">
        <p className="m-0 text-[10px] font-bold tracking-[1px] text-ink-mute uppercase">
          Solo per chi scrive
        </p>
        <h1 className="bab-display m-0 mt-1 text-[24px] leading-[30px] font-bold tracking-[-0.5px] text-ink">
          Le parole di BAB
        </h1>

        {manca ? (
          <>
            <p className="m-0 mt-4 text-[13.5px] leading-[1.6] text-ink">
              Questo indirizzo non ha un account BAB, e da qui non se ne creano.
            </p>
            <p className="m-0 mt-2 text-[13px] leading-[1.6] text-ink-medio">
              Entra una volta dall’app vera, poi torna qui: da lì in poi questa porta ti
              riconosce.
            </p>
            <a
              href="/onboarding/accesso"
              className="bab-tocco mt-4 flex h-11 items-center justify-center rounded-[12px] border-[1.5px] border-line bg-lime text-[13.5px] font-bold text-ink"
            >
              Vai all’app
            </a>
            <BottoneTocco
              onClick={() => {
                setManca(false)
                setStato('')
              }}
              className="mt-2 h-11 w-full rounded-[12px] text-[13px] font-bold text-ink-medio hover:text-ink"
            >
              Provo un altro indirizzo
            </BottoneTocco>
          </>
        ) : (
          <>
            <p className="m-0 mt-3 text-[13px] leading-[1.6] text-ink-medio">
              {passo === 'mail'
                ? 'Scrivi la mail con cui entri in BAB. Ti mandiamo un codice.'
                : `Abbiamo mandato un codice a ${email.trim()}.`}
            </p>

            {passo === 'mail' ? (
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void chiediCodice()}
                placeholder="tu@esempio.it"
                className="mt-4 h-12 w-full rounded-[12px] border-[1.5px] border-line bg-paper px-3 text-[14px] transition-colors duration-150 focus:border-verde-acceso focus:outline-none motion-reduce:transition-none"
              />
            ) : (
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                value={codice}
                onChange={(e) => setCodice(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && void entra()}
                placeholder="000000"
                className="mt-4 h-12 w-full rounded-[12px] border-[1.5px] border-line bg-paper px-3 text-center text-[20px] tracking-[6px] transition-colors duration-150 focus:border-verde-acceso focus:outline-none motion-reduce:transition-none"
              />
            )}

            <BottoneTocco
              disabled={manda}
              onClick={() => void (passo === 'mail' ? chiediCodice() : entra())}
              className="mt-3 h-11 w-full rounded-[12px] border-[1.5px] border-line bg-lime text-[13.5px] font-bold text-ink disabled:bg-chip disabled:text-ink-mute"
            >
              {passo === 'mail' ? 'Mandami il codice' : 'Entra'}
            </BottoneTocco>

            {passo === 'codice' && (
              <BottoneTocco
                onClick={() => {
                  setPasso('mail')
                  setCodice('')
                  setStato('')
                }}
                className="mt-2 h-11 w-full rounded-[12px] text-[13px] font-bold text-ink-medio hover:text-ink"
              >
                Cambia indirizzo
              </BottoneTocco>
            )}
          </>
        )}

        <p aria-live="polite" className="m-0 mt-3 min-h-[18px] text-[12px] text-ink-medio">
          {stato}
        </p>
      </div>
    </div>
  )
}
