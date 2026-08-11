import { useEffect, useState } from 'react'
import { fill, useCopy } from '@/copy'
import { googleEnabled, signInWithEmail, signInWithGoogle } from '@/lib/session'

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

  useEffect(() => {
    let alive = true
    void googleEnabled().then((on) => { if (alive) setGoogle(on) })
    return () => { alive = false }
  }, [])

  async function sendLink(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    const r = await signInWithEmail(email.trim())
    if (r.ok) { setState('sent'); return }
    // 🔴 Il messaggio tecnico va in console, non davanti a una tredicenne:
    // "Failed to fetch" non le dice cosa fare e la fa sentire in difetto.
    console.error('[auth]', r.error)
    setState('error')
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center gap-5 px-5 py-10">
      <div>
        <h1 className="font-display text-[30px] leading-tight">{t.auth.title}</h1>
        <p className="mt-2 text-[15px] text-[var(--color-ink-soft)]">{t.auth.lede}</p>
      </div>

      {state === 'sent' ? (
        <div className="bab-card flex flex-col gap-2 px-4 py-4" style={{ background: 'var(--tempo-steady-tint)' }}>
          <h2 className="font-display text-[18px]">{t.auth.sentTitle}</h2>
          <p className="text-[15px]">
            {fill(t.auth.sentBody, { email }).split('**').map((p, i) =>
              i % 2 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>,
            )}
          </p>
          <button type="button" onClick={() => setState('idle')} className="bab-pill self-start px-4 py-2 text-[13px]">
            {t.auth.sentAgain}
          </button>
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
            disabled={state === 'sending'}
            className="bab-pill px-4 py-3 text-[15px] disabled:opacity-60"
            style={{ background: 'var(--color-lime)' }}
          >
            {state === 'sending' ? t.auth.sending : t.auth.sendLink}
          </button>
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
