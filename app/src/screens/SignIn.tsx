import { useEffect, useRef, useState } from 'react'
import { fill, useCopy } from '@/copy'
import { googleEnabled, signInWithCode, signInWithEmail, signInWithGoogle } from '@/lib/session'
import { lockedFor, recordAttempt, resetAttempts } from '@/lib/rateLimit'
import OtpInput from '@/components/OtpInput'
import Mascot from '@/components/Mascot'

const CODE_LENGTH = 6

/**
 * Le soglie del freno — vedi `lib/rateLimit.ts` per il perché.
 * Il codice tollera più tentativi liberi del link: un refuso capita, e
 * indovinare un codice a 6 cifre a tentativi resta comunque impraticabile
 * molto prima di arrivare al tetto dell'attesa.
 */
const CODE_LIMIT = { scope: 'otp-code', free: 5, base: 30_000, cap: 5 * 60_000 }
const SEND_LIMIT = { scope: 'otp-send', free: 2, base: 30_000, cap: 5 * 60_000 }

/** "0:45", "2:00" — non i millisecondi grezzi che nessuno legge a colpo d'occhio. */
function formatWait(ms: number): string {
  const s = Math.ceil(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Il conto alla rovescia vivo per un indirizzo: si aggiorna da solo, si ferma da solo a 0. */
function useLock(scope: string, id: string): number {
  const [ms, setMs] = useState(() => (id ? lockedFor(scope, id) : 0))
  useEffect(() => {
    if (!id) { setMs(0); return }
    setMs(lockedFor(scope, id))
    const i = setInterval(() => {
      const left = lockedFor(scope, id)
      setMs(left)
      if (left <= 0) clearInterval(i)
    }, 500)
    return () => clearInterval(i)
  }, [scope, id])
  return ms
}

/**
 * Come si entra.
 *
 * 🔴 R12 · L'ordine sullo schermo non è casuale: **prima il link via email**,
 * poi Google. Google ha un'età minima che varia fra i 13 e i 16 anni a seconda
 * del paese, e gli account scolastici sono spesso bloccati dall'amministratore
 * per le app di terze parti — quindi per una dodicenne è la strada che *non*
 * funziona. Metterlo per primo insegnerebbe la cosa sbagliata.
 *
 * Per lo stesso motivo `ageNote` sta lì: se Google non funziona, deve sembrare
 * normale e non un errore suo.
 *
 * E se Google non è *configurato* sul progetto, tutto il blocco sparisce: le
 * due note sotto parlano solo di Google, e senza il bottone non vogliono dire
 * niente.
 */
export default function SignIn() {
  const t = useCopy()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [google, setGoogle] = useState(false)
  const [code, setCode] = useState('')
  const [codeState, setCodeState] = useState<'idle' | 'checking' | 'wrong'>('idle')

  const sendWait = useLock(SEND_LIMIT.scope, email)
  const codeWait = useLock(CODE_LIMIT.scope, email)

  useEffect(() => {
    let alive = true
    void googleEnabled().then((on) => { if (alive) setGoogle(on) })
    return () => { alive = false }
  }, [])

  async function sendLink(e: React.FormEvent) {
    e.preventDefault()
    if (lockedFor(SEND_LIMIT.scope, email) > 0) return
    recordAttempt(SEND_LIMIT.scope, email, SEND_LIMIT.free, SEND_LIMIT.base, SEND_LIMIT.cap)
    setState('sending')
    const r = await signInWithEmail(email.trim())
    if (r.ok) { setState('sent'); return }
    // 🔴 Il messaggio tecnico va in console, non davanti a una tredicenne:
    // "Failed to fetch" non le dice cosa fare e la fa sentire in difetto.
    console.error('[auth]', r.error)
    setState('error')
  }

  async function submitCode(value: string) {
    if (value.length < CODE_LENGTH || lockedFor(CODE_LIMIT.scope, email) > 0) return
    setCodeState('checking')
    const r = await signInWithCode(email, value)
    // Se è andata, `onAuthStateChange` cambia schermata da solo: qui non c'è
    // niente da fare se non restare fermi finché non succede. Si riparte da
    // zero per il prossimo accesso, invece di portarsi dietro i tentativi.
    if (r.ok) { resetAttempts(CODE_LIMIT.scope, email); return }
    console.error('[auth]', r.error)
    recordAttempt(CODE_LIMIT.scope, email, CODE_LIMIT.free, CODE_LIMIT.base, CODE_LIMIT.cap)
    setCodeState('wrong')
    setCode('') // riparte da caselle vuote: ritentare lo stesso codice sbagliato non serve
  }

  /**
   * L'ultima cifra manda da sola — è quello che ci si aspetta da sei
   * caselle. Il bottone resta comunque, per chi arriva lì da tastiera e
   * preferisce confermare invece che farlo scattare da solo.
   *
   * `submittedFor` evita di rimandare lo stesso codice due volte: senza,
   * digitare la sesta cifra E toccare "Entra" nello stesso istante manderebbe
   * due richieste, e la seconda consumerebbe un tentativo per niente.
   */
  const submittedFor = useRef('')
  useEffect(() => {
    if (code.length === CODE_LENGTH && code !== submittedFor.current) {
      submittedFor.current = code
      void submitCode(code)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center gap-5 px-5 py-10">
      {/* 🔴 Stessa mascotte del resto dell'app: il primo saluto, prima ancora
          dell'onboarding. Compare sempre uguale, con o senza email inviata. */}
      <div className="flex justify-center">
        <Mascot size={56} />
      </div>
      <div>
        <h1 className="font-display text-[30px] leading-tight">{t.auth.title}</h1>
        <p className="mt-2 text-[15px] text-[var(--color-ink-soft)]">{t.auth.lede}</p>
      </div>

      {state === 'sent' ? (
        // 🔴 Schermata dedicata al codice, non il link con un ripiego in coda:
        // le sei caselle sono la cosa grande al centro, il link è la nota in
        // fondo. Per una spiegazione più lunga di quale problema risolve, vedi
        // `enterWithCode` più sopra.
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-[22px]">{t.auth.sentTitle}</h2>
            <p className="mt-1 text-[15px] text-[var(--color-ink-soft)]">
              {fill(t.auth.sentBody, { email }).split('**').map((p, i) =>
                i % 2 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>,
              )}
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); void submitCode(code) }} className="flex flex-col gap-3">
            <OtpInput
              length={CODE_LENGTH}
              value={code}
              onChange={(v) => { setCode(v); setCodeState('idle') }}
              disabled={codeState === 'checking' || codeWait > 0}
              label={t.auth.codeLabel}
              digitLabel={(i, n) => fill(t.auth.codeDigitLabel, { i, n })}
            />
            {codeWait > 0 ? (
              <p className="text-[13.5px]" style={{ color: 'var(--care)' }} role="alert">
                {fill(t.auth.codeLocked, { time: formatWait(codeWait) })}
              </p>
            ) : codeState === 'wrong' && (
              <p className="text-[13.5px]" style={{ color: 'var(--care)' }} role="alert">
                {t.auth.codeWrong}
              </p>
            )}
            <button
              type="submit"
              disabled={codeState === 'checking' || code.length < CODE_LENGTH || codeWait > 0}
              className="bab-pill px-4 py-3 text-[15px] disabled:opacity-40"
              style={{ background: 'var(--color-lime)' }}
            >
              {codeState === 'checking' ? t.auth.codeChecking : t.auth.codeSubmit}
            </button>
          </form>

          <div className="flex items-center justify-between gap-3 text-[13.5px] text-[var(--color-ink-soft)]">
            <span>{t.auth.codeHint}</span>
            <button type="button" onClick={() => setState('idle')} className="underline shrink-0">
              {t.auth.sentAgain}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={sendLink} className="flex flex-col gap-3">
          <label className="bab-label" htmlFor="email">{t.auth.emailLabel}</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.auth.emailPlaceholder}
            className="bab-card px-4 py-3 text-[16px]"
          />
          <button
            type="submit"
            disabled={state === 'sending' || sendWait > 0}
            className="bab-pill px-4 py-3 text-[15px] disabled:opacity-60"
            style={{ background: 'var(--color-lime)' }}
          >
            {state === 'sending' ? t.auth.sending : t.auth.sendLink}
          </button>
          {sendWait > 0 && (
            <p className="text-[13.5px]" style={{ color: 'var(--care)' }} role="alert">
              {fill(t.auth.sendLocked, { time: formatWait(sendWait) })}
            </p>
          )}
        </form>
      )}

      {state === 'error' && (
        <div className="bab-card px-4 py-3" style={{ background: 'var(--care-tint)', borderColor: 'var(--care)' }} role="alert">
          <p className="text-[15px] font-bold">{t.auth.trouble}</p>
          <p className="text-[14px]">{t.auth.troubleBody}</p>
        </div>
      )}

      {google && (
      <>
      <div className="flex items-center gap-3 text-[13px] text-[var(--color-ink-soft)]">
        <span className="h-px flex-1" style={{ background: 'var(--color-sand)' }} />
        {t.auth.or}
        <span className="h-px flex-1" style={{ background: 'var(--color-sand)' }} />
      </div>

      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        className="bab-pill flex items-center justify-center gap-2 px-4 py-3 text-[15px]"
      >
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.8 2.6 13.6l7.8 6c1.9-5.6 7.2-10.1 13.6-10.1z" />
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.6 3-2.3 5.6-4.9 7.3l7.6 5.9c4.4-4.1 7.1-10.2 7.1-17.5z" />
          <path fill="#FBBC05" d="M10.4 28.4c-.5-1.4-.8-2.9-.8-4.4s.3-3 .8-4.4l-7.8-6C.9 16.7 0 20.2 0 24s.9 7.3 2.6 10.4l7.8-6z" />
          <path fill="#34A853" d="M24 47.5c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.4 0-11.7-4.5-13.6-10.1l-7.8 6C6.5 42.2 14.6 47.5 24 47.5z" />
        </svg>
        {t.auth.google}
      </button>

      <p className="text-[13px] text-[var(--color-ink-soft)]">{t.auth.ageNote}</p>
      <p className="text-[13px] text-[var(--color-ink-soft)]">{t.auth.socialNote}</p>
      </>
      )}
    </div>
  )
}
