import type { InputHTMLAttributes } from 'react'
import { useEtichettaDelGruppo } from './etichetta'

/**
 * Un campo di testo. Alto 48, bordo 1.5px, angoli da 14: e' la stessa forma
 * in tutto il disegno, quindi sta qui e non in ogni schermo.
 *
 * Il nome per VoiceOver e' l'etichetta del gruppo in cui sta, se non gliene
 * viene dato uno.
 */
export function Campo(props: InputHTMLAttributes<HTMLInputElement>) {
  const etichetta = useEtichettaDelGruppo()
  return (
    <input
      aria-labelledby={props['aria-label'] ? undefined : etichetta}
      {...props}
      className="h-12 w-full rounded-field border-[1.5px] border-line bg-surface px-[14.5px] text-[15px] text-ink outline-none placeholder:text-ink-mute focus:border-violet"
    />
  )
}

/**
 * Il campo data.
 *
 * Le barre le mette lui mentre si scrive: sul telefono si tiene la tastiera
 * numerica, che e' quello che serve, e non si deve azzeccare il tasto della
 * barra. Cancellando, la barra sparisce da sola perche' non la tratteniamo
 * mai — si ricalcola ogni volta dalle sole cifre.
 */
export function CampoData({
  valore,
  onChange,
  segnaposto,
}: {
  valore: string
  onChange: (v: string) => void
  segnaposto: string
}) {
  return (
    <Campo
      inputMode="numeric"
      autoComplete="off"
      placeholder={segnaposto}
      value={valore}
      maxLength={10}
      onChange={(e) => onChange(formattaData(e.target.value))}
    />
  )
}

/** "1234" -> "12/34", "12345678" -> "12/34/5678". Solo cifre, massimo otto. */
export function formattaData(grezzo: string): string {
  const c = grezzo.replace(/\D/g, '').slice(0, 8)
  if (c.length <= 2) return c
  if (c.length <= 4) return `${c.slice(0, 2)}/${c.slice(2)}`
  return `${c.slice(0, 2)}/${c.slice(2, 4)}/${c.slice(4)}`
}

/** Vero se e' una data gg/mm/aaaa che esiste davvero. */
export function dataValida(v: string): boolean {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v)
  if (!m) return false
  const [, g, me, a] = m.map(Number)
  if (me < 1 || me > 12 || g < 1) return false
  const d = new Date(a, me - 1, g)
  return d.getFullYear() === a && d.getMonth() === me - 1 && d.getDate() === g
}
