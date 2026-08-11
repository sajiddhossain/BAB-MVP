import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCopy } from '@/copy'
import { getProfile, updateProfile, type ProfilePatch } from '@/lib/repo'
import { useSession } from '@/lib/session'
import { flush } from '@/lib/sync'
import * as db from '@/lib/db'

/**
 * La cornice delle impostazioni, e il pezzo che sanno in due.
 *
 * 🔴 Le impostazioni erano una schermata sola con sette blocchi impilati: il
 * nome, il ciclo, la lingua, la coda, l'export, l'uscita e la cancellazione.
 * Sette cose che non c'entrano niente l'una con l'altra, e in fondo alla stessa
 * pagina quella che non si può disfare. Adesso sono un indice e cinque
 * schermate, e la cancellazione sta dietro due passaggi invece che dietro uno
 * scorrimento.
 */

export function Pane({ title, help, children, back = '/settings' }: {
  title: string
  help?: string
  children: React.ReactNode
  /** Dove torna la freccia. L'agenda ha un livello suo, e ci si torna dentro. */
  back?: string
}) {
  const t = useCopy()
  return (
    <section className="flex flex-col gap-4 pt-2">
      <div className="flex items-center gap-3">
        <Link to={back} aria-label={t.settings.back}
              className="bab-pill flex h-11 w-11 shrink-0 items-center justify-center text-[17px]">
          <span aria-hidden>←</span>
        </Link>
        <h1 className="font-display text-[24px] leading-tight">{title}</h1>
      </div>
      {help && <p className="text-[15px] text-[var(--color-ink-soft)]">{help}</p>}
      {children}
    </section>
  )
}

export type Cycle = 'tracking' | 'not_yet' | 'undisclosed'
export type Contraception = 'natural' | 'hormonal' | 'unsure' | 'undisclosed'
export type SaveState = 'idle' | 'saving' | 'saved' | 'queued' | 'error'

/** Gli anni compiuti. Serve solo a decidere se una domanda va fatta (R3). */
export function ageFrom(birth: string): number | null {
  if (!birth) return null
  const b = new Date(birth)
  if (Number.isNaN(b.getTime())) return null
  const now = new Date()
  let a = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--
  return a
}

/**
 * Correggere il profilo, da qualunque schermata lo faccia.
 *
 * Sta qui e non dentro una schermata perché lo usano in due — i dati anagrafici
 * e il ritmo — e la parte delicata è la stessa per tutt'e due.
 */
export function useProfileEdit() {
  const { userId } = useSession()
  /** Il profilo com'è sul disco: serve per calcolare cosa è DAVVERO cambiato. */
  const [saved, setSaved] = useState<ProfilePatch | null>(null)
  const [state, setState] = useState<SaveState>('idle')

  useEffect(() => {
    if (!userId) return
    let alive = true
    getProfile(userId)
      .then((p) => { if (alive && p) setSaved(p as ProfilePatch) })
      .catch(() => { /* niente profilo, niente da correggere */ })
    return () => { alive = false }
  }, [userId])

  /**
   * Solo quello che è cambiato davvero.
   *
   * Mandare tutto il profilo a ogni salvataggio farebbe partire una modifica
   * anche per i campi che non ha toccato — e quelle modifiche, arrivando dopo,
   * sovrascriverebbero quello che nel frattempo ha corretto da un altro
   * dispositivo. Il confronto con la copia sul disco è ciò che rende il patch
   * un patch.
   */
  function diff(next: ProfilePatch): ProfilePatch {
    const out: ProfilePatch = {}
    for (const [k, v] of Object.entries(next)) {
      if (saved && JSON.stringify(saved[k as keyof ProfilePatch]) === JSON.stringify(v)) continue
      Object.assign(out, { [k]: v })
    }
    return out
  }

  async function commit(next: ProfilePatch) {
    if (!userId) return
    const patch = diff(next)
    if (Object.keys(patch).length === 0) return
    await saveAndSettle(
      async () => {
        await updateProfile(userId, patch)
        setSaved((p) => ({ ...(p ?? {}), ...patch }))
      },
      (o) => o.op === 'update' && o.target === userId,
      setState,
    )
  }

  return { userId, saved, state, setState, diff, commit }
}

/**
 * Salva, aspetta il giro di invio, e poi dice com'è andata.
 *
 * 🔴 L'attesa non è cortesia. Guardando la coda subito dopo la scrittura,
 * l'invio è ancora in volo e lo schermo direbbe «parte appena c'è rete» anche
 * quando la rete c'era e la modifica è già arrivata — un messaggio falso, e
 * proprio quello che la fa dubitare se ha salvato o no.
 *
 * `mine` dice quali righe della coda riguardano questa schermata: senza, una
 * cosa rimasta indietro da tutt'altra parte farebbe dire «non è partito» a chi
 * ha appena salvato benissimo.
 */
export async function saveAndSettle(
  run: () => Promise<void>,
  mine: (op: db.PendingOp) => boolean,
  setState: (s: SaveState) => void,
): Promise<void> {
  setState('saving')
  try {
    await run()
    await flush().catch(() => {})
    const left = (await db.pending().catch(() => [])).filter(mine)
    setState(
      left.some((o) => o.lastError) ? 'error'
        : left.length > 0 ? 'queued'
        : 'saved',
    )
  } catch {
    setState('error')
  }
}

/** L'esito del salvataggio, detto allo stesso modo ovunque si salvi. */
export function SaveNote({ state }: { state: SaveState }) {
  const t = useCopy()
  if (state === 'saved') return <p className="text-[14px]">{t.settings.profileSaved}</p>
  if (state === 'queued') {
    return <p className="text-[14px] text-[var(--color-ink-soft)]">{t.settings.profileQueued}</p>
  }
  if (state === 'error') {
    return <p className="text-[14px]" style={{ color: 'var(--care)' }}>{t.settings.profileError}</p>
  }
  return null
}

export function SaveButton({ dirty, state, onClick }: {
  dirty: boolean; state: SaveState; onClick: () => void
}) {
  const t = useCopy()
  return (
    <button type="button" disabled={!dirty || state === 'saving'} onClick={onClick}
            className="bab-pill px-5 py-3 text-[16px] disabled:opacity-40"
            style={dirty ? { background: 'var(--color-lime)', boxShadow: 'var(--shadow-lg)' } : undefined}>
      {state === 'saving' ? t.settings.profileSaving : t.settings.profileSave}
    </button>
  )
}
