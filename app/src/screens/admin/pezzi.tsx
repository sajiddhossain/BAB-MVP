import { useEffect, useId, useState } from 'react'
import type { ReactNode } from 'react'
import { useModale } from '../../ui/modale'

/**
 * I pezzi che le stanze delle atlete hanno in comune.
 *
 * L'elenco e la scheda prima avevano ognuna i suoi riquadri, i suoi numeri,
 * le sue date scritte a modo suo. Adesso stanno qui, cosi' un riquadro e' lo
 * stesso riquadro dappertutto e una data si legge sempre nello stesso modo.
 */

/* ── date ─────────────────────────────────────────────────────────────────── */

export function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** il giorno di `n` giorni fa, come `2026-09-08` */
export function giornoFa(n: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return iso(d)
}

/** tutti i giorni da `dal` ad `al`, compresi */
export function giorniTra(dal: string, al: string): string[] {
  const fuori: string[] = []
  const d = new Date(`${dal}T12:00:00`)
  const fine = new Date(`${al}T12:00:00`)
  while (d <= fine) {
    fuori.push(iso(d))
    d.setDate(d.getDate() + 1)
  }
  return fuori
}

export function data(valore: string | null): string {
  if (!valore) return '—'
  return new Date(valore.length === 10 ? `${valore}T12:00:00` : valore).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function dataLunga(giorno: string): string {
  const s = new Date(`${giorno}T12:00:00`).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** «12 set» */
export function dataBreve(giorno: string): string {
  return new Date(`${giorno}T12:00:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}

export function giorniDa(giorno: string): number {
  const q = new Date(`${giorno}T12:00:00`)
  return Math.round((Date.now() - q.getTime()) / 86_400_000)
}

export function quando(giorni: number | null): string {
  if (giorni === null) return 'mai'
  if (giorni <= 0) return 'oggi'
  if (giorni === 1) return 'ieri'
  if (giorni < 14) return `${giorni} giorni fa`
  if (giorni < 60) return `${Math.round(giorni / 7)} settimane fa`
  return `${Math.round(giorni / 30)} mesi fa`
}

/* ── file ─────────────────────────────────────────────────────────────────── */

type Cella = string | number | boolean | null | undefined

/**
 * Un CSV che Excel in italiano apre in colonne.
 *
 * Il separatore e' il punto e virgola e in testa c'e' il BOM: con la virgola
 * Excel italiano mette tutta la riga in una cella sola, e senza BOM le
 * lettere accentate diventano simboli.
 */
export function csv(colonne: string[], righe: Cella[][]): string {
  const cella = (v: Cella) => {
    if (v === null || v === undefined) return ''
    const s = typeof v === 'boolean' ? (v ? 'sì' : 'no') : String(v)
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return '﻿' + [colonne, ...righe].map((r) => r.map(cella).join(';')).join('\r\n')
}

export function scaricaFile(nome: string, testo: string, tipo = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([testo], { type: tipo }))
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ── riquadri e numeri ────────────────────────────────────────────────────── */

export function Riquadro({
  titolo,
  destra,
  children,
  className = '',
}: {
  titolo: string
  destra?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-[14px] border-[1.5px] border-line bg-surface p-4 ${className}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="m-0 text-[10.5px] font-bold tracking-[0.5px] text-ink-mute uppercase">{titolo}</h2>
        {destra}
      </div>
      {children}
    </section>
  )
}

export function Voce({ nome, v, allarme }: { nome: string; v: ReactNode; allarme?: boolean }) {
  return (
    <p className="m-0 flex items-baseline justify-between gap-3 py-[3px] text-[12px]">
      <span className="shrink-0 text-ink-mute">{nome}</span>
      <span className={`text-right font-bold ${allarme ? 'text-rosso' : ''}`}>{v}</span>
    </p>
  )
}

/** lo stesso numero dell'atrio: cifra grande, cosa conta sotto */
export function Numero({
  quanto,
  cosa,
  nota,
  allarme,
}: {
  quanto: ReactNode
  cosa: string
  nota?: string
  allarme?: boolean
}) {
  return (
    <div
      className={`min-w-[120px] flex-1 rounded-[14px] border-[1.5px] px-4 py-3 ${
        allarme ? 'border-rosso-bordo bg-allarme-fondo' : 'border-line bg-surface'
      }`}
    >
      <p className="m-0 text-[22px] leading-none font-bold">{quanto}</p>
      <p className="m-0 mt-[6px] text-[11.5px] leading-[1.3] text-ink-medio">{cosa}</p>
      {nota && <p className="m-0 mt-[2px] text-[11px] text-ink-mute">{nota}</p>}
    </div>
  )
}

/* ── comandi ──────────────────────────────────────────────────────────────── */

export const CAMPO =
  'h-8 rounded-pill border border-line bg-chip px-3 text-[12px] text-ink outline-none placeholder:text-ink-mute focus:border-verde-acceso focus:bg-surface'

export function Chip({
  acceso,
  onClick,
  children,
  conta,
}: {
  acceso: boolean
  onClick: () => void
  children: ReactNode
  conta?: number
}) {
  return (
    <button
      type="button"
      aria-pressed={acceso}
      onClick={onClick}
      className={`bab-tocco h-8 shrink-0 cursor-pointer rounded-pill border px-3 text-[12px] font-bold ${
        acceso ? 'border-ink bg-ink text-surface' : 'border-line bg-chip text-ink-medio'
      }`}
    >
      {children}
      {conta !== undefined && <span className={acceso ? 'ml-1 opacity-70' : 'ml-1 text-ink-mute'}>{conta}</span>}
    </button>
  )
}

export function Tasto({
  tipo = 'secondo',
  onClick,
  disabled,
  children,
  piccolo,
}: {
  tipo?: 'primo' | 'secondo' | 'pericolo'
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  piccolo?: boolean
}) {
  const colori = {
    primo: 'border-ink bg-lime text-ink shadow-[2px_2px_0_rgba(44,44,58,0.9)]',
    secondo: 'border-line bg-surface text-ink',
    pericolo: 'border-rosso bg-rosso text-white shadow-[2px_2px_0_rgba(44,44,58,0.9)]',
  }[tipo]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`bab-tocco shrink-0 cursor-pointer rounded-pill border-[1.5px] font-bold disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none ${
        piccolo ? 'h-8 px-3 text-[12px]' : 'h-10 px-4 text-[13px]'
      } ${colori}`}
    >
      {children}
    </button>
  )
}

/* ── finestre ─────────────────────────────────────────────────────────────── */

/**
 * Una finestra sopra al pannello.
 *
 * Esc e il velo la chiudono, tranne mentre sta facendo qualcosa: chiudere a
 * meta' una cancellazione lascerebbe chi guarda senza sapere com'e' finita.
 */
export function Finestra({
  titolo,
  sotto,
  onChiudi,
  bloccata,
  children,
  piede,
}: {
  titolo: string
  sotto?: ReactNode
  onChiudi: () => void
  bloccata?: boolean
  children: ReactNode
  piede: ReactNode
}) {
  const modale = useModale<HTMLDivElement>()
  const id = useId()

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !bloccata) onChiudi()
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onChiudi, bloccata])

  return (
    <div ref={modale} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Chiudi"
        tabIndex={-1}
        onClick={() => {
          if (!bloccata) onChiudi()
        }}
        className="absolute inset-0 cursor-default bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        className="relative flex max-h-full w-full max-w-[520px] flex-col rounded-[16px] border-[1.5px] border-ink bg-surface text-ink shadow-[4px_4px_0_rgba(44,44,58,0.9)] outline-none"
      >
        <div className="shrink-0 border-b border-riga px-5 pt-4 pb-3">
          <h2 id={id} className="m-0 text-[17px] leading-[1.2] font-bold">
            {titolo}
          </h2>
          {sotto && <div className="m-0 mt-1 text-[12.5px] leading-[1.5] text-ink-medio">{sotto}</div>}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-riga px-5 py-3">{piede}</div>
      </div>
    </div>
  )
}

/**
 * La conferma di una cancellazione: si scrive una parola per poter premere.
 *
 * Un «sei sicura?» con due bottoni si conferma senza leggerlo. Scrivere il
 * nome della persona obbliga a guardare chi si sta cancellando — ed e' la
 * cosa che si vuole, visto che non si torna indietro.
 */
export function ConfermaCancella({
  titolo,
  chi,
  parola,
  onChiudi,
  onConferma,
}: {
  titolo: string
  chi: string[]
  parola: string
  onChiudi: () => void
  onConferma: () => Promise<string | null>
}) {
  const [scritto, setScritto] = useState('')
  const [inCorso, setInCorso] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)
  const giusta = scritto.trim().toLowerCase() === parola.trim().toLowerCase()
  const campo = useId()

  async function vai() {
    if (!giusta || inCorso) return
    setInCorso(true)
    setErrore(null)
    const e = await onConferma()
    setInCorso(false)
    if (e) setErrore(e)
  }

  return (
    <Finestra
      titolo={titolo}
      onChiudi={onChiudi}
      bloccata={inCorso}
      sotto="Si cancellano l’account e tutti i suoi dati: check-in, corpo, ciclo, percorso, note. Non si torna indietro."
      piede={
        <>
          <Tasto onClick={onChiudi} disabled={inCorso}>
            Annulla
          </Tasto>
          <Tasto tipo="pericolo" onClick={() => void vai()} disabled={!giusta || inCorso}>
            {inCorso ? 'Cancello…' : 'Cancella per sempre'}
          </Tasto>
        </>
      }
    >
      <ul className="m-0 flex max-h-[160px] list-none flex-wrap gap-[6px] overflow-y-auto p-0">
        {chi.map((n, i) => (
          <li key={`${n}-${i}`} className="rounded-pill bg-allarme-fondo px-[10px] py-[3px] text-[12px] font-bold text-rosso">
            {n}
          </li>
        ))}
      </ul>
      <label htmlFor={campo} className="mt-4 block text-[12.5px] text-ink-medio">
        Per confermare scrivi <b className="text-ink">{parola}</b>
      </label>
      <input
        id={campo}
        value={scritto}
        onChange={(e) => setScritto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void vai()
        }}
        autoComplete="off"
        autoFocus
        className={`${CAMPO} mt-2 w-full`}
      />
      {errore && <p className="m-0 mt-3 text-[12.5px] font-bold text-rosso">{errore}</p>}
    </Finestra>
  )
}
