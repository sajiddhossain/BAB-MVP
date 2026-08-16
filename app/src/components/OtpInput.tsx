import { useRef } from 'react'

/**
 * Il codice a 6 cifre, una casella per cifra — non un campo di testo solo.
 *
 * 🔴 Scrivere le sei cifre insieme, piccole, era il punto debole della vecchia
 * schermata: si sbagliava a contarle, e non era chiaro che fosse la strada
 * vera e non un ripiego per chi ha problemi col link. Una casella per cifra è
 * il pattern che chiunque riconosce da un SMS di verifica — non va spiegato.
 *
 * Incollare il codice intero in una casella qualunque lo distribuisce da lì
 * in poi: è così che arriva quando si incolla da un'altra app (Messaggi, il
 * gestore password), non digitando una cifra alla volta.
 */
type Props = {
  length: number
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  label: string
  /** Il nome accessibile di ogni casella, già tradotto — non si genera qui dentro. */
  digitLabel: (position: number, total: number) => string
}

export default function OtpInput({ length, value, onChange, disabled, label, digitLabel }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  function setFrom(index: number, text: string) {
    const clean = text.replace(/\D/g, '')
    if (!clean) return
    const next = value.split('')
    for (let i = 0; i < clean.length && index + i < length; i++) next[index + i] = clean[i]!
    const joined = next.join('').slice(0, length)
    onChange(joined)
    const landOn = Math.min(index + clean.length, length - 1)
    refs.current[landOn]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault(); refs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      e.preventDefault(); refs.current[i + 1]?.focus()
    }
  }

  return (
    <div role="group" aria-label={label} className="flex justify-between gap-1.5">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          value={d}
          disabled={disabled}
          onChange={(e) => setFrom(i, e.target.value.slice(-1))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => { e.preventDefault(); setFrom(i, e.clipboardData.getData('text')) }}
          onFocus={(e) => e.target.select()}
          aria-label={digitLabel(i + 1, length)}
          className="h-14 w-full max-w-11 rounded-[14px] border-[3px] border-[var(--color-ink)] bg-[var(--color-surface)] text-center text-[22px] font-bold disabled:opacity-50"
        />
      ))}
    </div>
  )
}
