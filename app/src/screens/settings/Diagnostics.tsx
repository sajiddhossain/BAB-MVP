import { useEffect, useState } from 'react'
import { fill, plural, useCopy } from '@/copy'
import { useSession } from '@/lib/session'
import { flush, parked } from '@/lib/sync'
import * as db from '@/lib/db'
import { Pane } from './shell'

/**
 * «Come sta l'app».
 *
 * 🔴 La apre LEI, non solo noi. Quando un'atleta scrive «non mi si salva
 * niente», l'unica risposta possibile finora era «apri la console del browser»
 * — cioè nessuna risposta. Qui c'è la stessa informazione, scritta in modo che
 * possa leggerla ad alta voce al telefono.
 *
 * 🔴 Il rapporto che si copia NON contiene niente di quello che ha scritto:
 * solo quante righe, di quale tabella, e l'errore del server. Un tasto «copia»
 * che porta con sé una nota del diario sarebbe il modo peggiore di aiutare.
 */

type Snapshot = {
  storage: boolean
  records: number
  waiting: number
  stuck: { table: string; op: string; attempts: number; error: string }[]
}

export default function Diagnostics() {
  const t = useCopy()
  const { userId, connected } = useSession()
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [busy, setBusy] = useState(false)
  const [pushed, setPushed] = useState<{ sent: number; left: number } | null>(null)
  const [copied, setCopied] = useState(false)

  async function look() {
    try {
      const [all, stuckOps] = await Promise.all([db.pending(), parked()])
      let records = 0
      for (const table of db.TABLES) {
        records += (await db.list(table).catch(() => [])).length
      }
      setSnap({
        storage: true,
        records,
        waiting: all.length - stuckOps.length,
        stuck: stuckOps.map((o) => ({
          table: o.table, op: o.op ?? 'insert', attempts: o.attempts,
          error: o.lastError ?? '',
        })),
      })
    } catch {
      setSnap({ storage: false, records: 0, waiting: 0, stuck: [] })
    }
  }

  useEffect(() => { void look() }, [])

  async function push() {
    setBusy(true); setPushed(null)
    try {
      const r = await flush()
      const left = (await db.pending().catch(() => [])).length
      setPushed({ sent: r.sent, left })
      await look()
    } catch { /* il rapporto qui sotto racconta comunque com'è messa */ }
    finally { setBusy(false) }
  }

  const report = [
    `server: ${connected ? 'collegato' : 'non collegato'}`,
    `sessione: ${userId ? 'entrata' : 'no'}`,
    `archivio: ${snap?.storage ? 'ok' : 'non leggibile'}`,
    `righe locali: ${snap?.records ?? 0}`,
    `in attesa: ${snap?.waiting ?? 0}`,
    ...(snap?.stuck ?? []).map((s) => `ferma: ${s.table} ${s.op} ×${s.attempts} — ${s.error}`),
    `agente: ${navigator.userAgent}`,
  ].join('\n')

  const line = (text: string, warn = false) => (
    <p className="text-[14.5px]" style={warn ? { color: 'var(--care)' } : undefined}>{text}</p>
  )

  return (
    <Pane title={t.diag.title} help={t.diag.lede}>
      <section className="bab-card flex flex-col gap-1.5 px-4 py-4">
        <h2 className="bab-label">{t.diag.serverTitle}</h2>
        {line(connected ? t.diag.serverOn : t.diag.serverOff, !connected)}
        {line(userId ? t.diag.sessionOn : t.diag.sessionOff, !userId)}
      </section>

      <section className="bab-card flex flex-col gap-1.5 px-4 py-4">
        <h2 className="bab-label">{t.diag.storageTitle}</h2>
        {snap?.storage === false
          ? line(t.diag.storageOff, true)
          : (
            <>
              {line(t.diag.storageOn)}
              {line(fill(t.diag.storageCount, { n: snap?.records ?? 0 }))}
            </>
          )}
      </section>

      <section className="bab-card flex flex-col gap-2 px-4 py-4">
        <h2 className="bab-label">{t.diag.queueTitle}</h2>
        {(snap?.waiting ?? 0) === 0 && (snap?.stuck.length ?? 0) === 0
          ? line(t.diag.queueNone)
          : (
            <>
              {(snap?.waiting ?? 0) > 0 &&
                line(plural(snap!.waiting, t.diag.queueWaitingOne, t.diag.queueWaiting))}
              {(snap?.stuck.length ?? 0) > 0 && (
                <>
                  {line(plural(snap!.stuck.length, t.diag.queueStuckOne, t.diag.queueStuck), true)}
                  {/* L'errore del server, testuale. Non lo capirà lei — lo capiamo
                      noi quando ce lo legge, ed è tutto il punto di questa riga. */}
                  <ul className="flex flex-col gap-1 text-[12.5px] text-[var(--color-ink-soft)]">
                    {snap!.stuck.map((s, i) => (
                      <li key={i}>{s.table} · {s.op} · {s.attempts}× · {s.error}</li>
                    ))}
                  </ul>
                </>
              )}
              <p className="text-[13px]" style={{ color: 'var(--care)' }}>{t.diag.dontWipe}</p>
            </>
          )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button type="button" disabled={busy || !connected} onClick={() => void push()}
                  className="bab-pill px-4 py-2.5 text-[14px] disabled:opacity-40">
            {busy ? t.diag.pushing : t.diag.push}
          </button>
          <button type="button"
                  onClick={() => { void navigator.clipboard?.writeText(report); setCopied(true) }}
                  className="bab-pill px-4 py-2.5 text-[14px]">
            {copied ? t.diag.copied : t.diag.copy}
          </button>
        </div>
        {pushed && line(fill(t.diag.pushDone, { n: pushed.sent, left: pushed.left }))}
      </section>
    </Pane>
  )
}
