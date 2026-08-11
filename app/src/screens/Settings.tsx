import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fill, useCopy } from '@/copy'
import { useSession } from '@/lib/session'
import { buildExport, deleteAccount, download } from '@/lib/account'
import { parked } from '@/lib/sync'
import * as db from '@/lib/db'

/**
 * I due diritti del §9, in una schermata sola: portarsi via i propri dati, e
 * farli sparire.
 *
 * 🔴 L'ordine sulla pagina non è casuale. Prima si vede cosa c'è in attesa,
 * poi si scarica, e solo in fondo si cancella — perché una volta cancellato
 * non si torna indietro, e l'unica cosa che protegge da un tocco sbagliato è
 * che il tocco stia dopo tutto il resto.
 */

type ExportState =
  | { k: 'idle' }
  | { k: 'working' }
  | { k: 'done'; fromDevice: boolean; pending: number }
  | { k: 'error' }

function Card({ children }: { children: React.ReactNode }) {
  return <section className="bab-card flex flex-col gap-3 px-4 py-4">{children}</section>
}

export default function Settings() {
  const t = useCopy()
  const nav = useNavigate()
  const { userId, connected } = useSession()

  const [queue, setQueue] = useState({ waiting: 0, stuck: 0 })
  const [exp, setExp] = useState<ExportState>({ k: 'idle' })
  const [arming, setArming] = useState(false)
  const [word, setWord] = useState('')
  const [killing, setKilling] = useState(false)
  const [killError, setKillError] = useState<'offline' | 'server' | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([db.pending(), parked()])
      .then(([all, stuck]) => {
        if (alive) setQueue({ waiting: all.length - stuck.length, stuck: stuck.length })
      })
      .catch(() => { /* senza archivio non c'è coda da mostrare */ })
    return () => { alive = false }
  }, [])

  async function onExport() {
    setExp({ k: 'working' })
    try {
      const r = await buildExport(userId)
      download(r)
      setExp({ k: 'done', fromDevice: r.source === 'device', pending: r.pending })
    } catch {
      setExp({ k: 'error' })
    }
  }

  async function onDelete() {
    setKillError(null)
    setKilling(true)
    try {
      await deleteAccount()
      // Da qui in poi non c'è più un account: la radice dell'app rimanda al
      // login da sola appena si accorge che la sessione è finita.
      nav('/', { replace: true })
    } catch (e) {
      const kind = (e as { kind?: string }).kind
      setKillError(kind === 'offline' || kind === 'not-connected' ? 'offline' : 'server')
      setKilling(false)
    }
  }

  const ready = word.trim().toUpperCase() === t.settings.deleteWord

  return (
    <section className="flex flex-col gap-4 pt-2">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-[26px]">{t.settings.title}</h1>
        <Link to="/me" className="text-[13.5px] underline text-[var(--color-ink-soft)]">
          {t.settings.back}
        </Link>
      </div>

      {/* 1 · Cosa non è ancora partito.
          `sync.ts` dice che le righe rimaste indietro vanno mostrate e mai
          ignorate: questo è il posto dove finalmente si vedono. */}
      {(queue.waiting > 0 || queue.stuck > 0) && (
        <Card>
          <h2 className="font-display text-[18px]">{t.settings.queueTitle}</h2>
          {queue.waiting > 0 && (
            <p className="text-[15px] text-[var(--color-ink-soft)]">
              {fill(t.settings.queueBody, { n: queue.waiting })}
            </p>
          )}
          {queue.stuck > 0 && (
            <p className="text-[15px]" style={{ color: 'var(--care)' }}>
              {fill(t.settings.queueParked, { n: queue.stuck })}
            </p>
          )}
        </Card>
      )}

      {/* 2 · Portarli via. */}
      <Card>
        <h2 className="font-display text-[18px]">{t.settings.exportTitle}</h2>
        <p className="text-[15px] text-[var(--color-ink-soft)]">{t.settings.exportBody}</p>
        <button type="button" onClick={() => void onExport()} disabled={exp.k === 'working'}
                className="bab-pill self-start px-5 py-2.5 text-[15px]"
                style={{ background: 'var(--color-lime)' }}>
          {exp.k === 'working' ? t.settings.exportWorking : t.settings.exportCta}
        </button>
        {exp.k === 'done' && (
          <div className="flex flex-col gap-1.5 text-[14px]">
            <p>{t.settings.exportDone}</p>
            {/* Un file parziale che si sa parziale vale più di uno che sembra
                completo: tutt'e due le righe qui sotto esistono per questo. */}
            {exp.fromDevice && (
              <p className="text-[var(--color-ink-soft)]">{t.settings.exportFromDevice}</p>
            )}
            {exp.pending > 0 && (
              <p className="text-[var(--color-ink-soft)]">
                {fill(t.settings.exportPending, { n: exp.pending })}
              </p>
            )}
          </div>
        )}
        {exp.k === 'error' && (
          <p className="text-[14px]" style={{ color: 'var(--care)' }}>{t.settings.exportError}</p>
        )}
      </Card>

      {/* 3 · Farli sparire. In fondo, e con una parola da scrivere. */}
      <Card>
        <h2 className="font-display text-[18px]">{t.settings.deleteTitle}</h2>
        <p className="text-[15px] text-[var(--color-ink-soft)]">{t.settings.deleteBody}</p>
        <p className="text-[14px] text-[var(--color-ink-soft)]">{t.settings.deleteShared}</p>
        <p className="text-[14px] text-[var(--color-ink-soft)]">{t.settings.deleteExportFirst}</p>

        {!arming ? (
          <button type="button" onClick={() => setArming(true)}
                  className="bab-pill self-start px-5 py-2.5 text-[15px]"
                  style={{ borderColor: 'var(--care)', color: 'var(--care)' }}>
            {t.settings.deleteCta}
          </button>
        ) : (
          <div className="flex flex-col gap-3 rounded-[12px] px-3 py-3"
               style={{ background: 'var(--care-tint)' }}>
            {/* Scrivere una parola non è un ostacolo per sfizio: è l'unica
                differenza fra «volevo cancellare» e «ho toccato per sbaglio». */}
            <label className="text-[14.5px] font-bold" htmlFor="conferma">
              {fill(t.settings.deleteConfirm, { word: t.settings.deleteWord })}
            </label>
            <input
              id="conferma" value={word} onChange={(e) => setWord(e.target.value)}
              autoComplete="off" autoCapitalize="characters" spellCheck={false}
              className="bab-card w-full px-3 py-2 text-[16px] tracking-[0.12em]"
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={!ready || killing}
                      onClick={() => void onDelete()}
                      className="bab-pill px-4 py-2.5 text-[14.5px] disabled:opacity-40"
                      style={ready ? { background: 'var(--care)', borderColor: 'var(--care)', color: 'var(--color-surface)' } : undefined}>
                {killing ? t.settings.deleteWorking : t.settings.deleteGo}
              </button>
              <button type="button" onClick={() => { setArming(false); setWord(''); setKillError(null) }}
                      className="bab-pill px-4 py-2.5 text-[14.5px]">
                {t.settings.deleteAbort}
              </button>
            </div>
            {killError && (
              <p className="text-[14px]" style={{ color: 'var(--care)' }}>
                {killError === 'offline' ? t.settings.deleteOffline : t.settings.deleteError}
              </p>
            )}
          </div>
        )}
      </Card>

      {!connected && (
        <p className="px-1 text-[13px] text-[var(--color-ink-soft)]">{t.settings.deleteOffline}</p>
      )}
    </section>
  )
}
