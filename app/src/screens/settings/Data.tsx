import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { plural, useCopy } from '@/copy'
import { buildExport, download } from '@/lib/account'
import { useSession } from '@/lib/session'
import { parked } from '@/lib/sync'
import * as db from '@/lib/db'
import { Pane } from './shell'

/** §9 · Il primo dei due diritti: portarsi via i propri dati. */

type ExportState =
  | { k: 'idle' }
  | { k: 'working' }
  | { k: 'done'; fromDevice: boolean; pending: number }
  | { k: 'error' }

export default function SettingsData() {
  const t = useCopy()
  const { userId } = useSession()
  const [exp, setExp] = useState<ExportState>({ k: 'idle' })
  const [queue, setQueue] = useState({ waiting: 0, stuck: 0 })

  useEffect(() => {
    let alive = true
    Promise.all([db.pending(), parked()])
      .then(([all, stuck]) => {
        if (alive) setQueue({ waiting: all.length - stuck.length, stuck: stuck.length })
      })
      .catch(() => { /* senza archivio non c'è coda da mostrare */ })
    return () => { alive = false }
  }, [])

  async function run() {
    setExp({ k: 'working' })
    try {
      const r = await buildExport(userId)
      download(r)
      setExp({ k: 'done', fromDevice: r.source === 'device', pending: r.pending })
    } catch {
      setExp({ k: 'error' })
    }
  }

  return (
    <Pane title={t.settings.exportTitle} help={t.settings.exportBody}>
      <button type="button" onClick={() => void run()} disabled={exp.k === 'working'}
              className="bab-pill px-5 py-3 text-[16px]"
              style={{ background: 'var(--color-lime)', boxShadow: 'var(--shadow-lg)' }}>
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
              {plural(exp.pending, t.settings.exportPendingOne, t.settings.exportPending)}
            </p>
          )}
        </div>
      )}
      {exp.k === 'error' && (
        <p className="text-[14px]" style={{ color: 'var(--care)' }}>{t.settings.exportError}</p>
      )}

      {/* La via per capire cosa sta succedendo davvero, dove si va a
          guardare quando si sospetta che qualcosa non si salvi. */}
      <Link to="/settings/diagnostica"
            className="self-start text-[13.5px] underline text-[var(--color-ink-soft)]">
        {t.diag.open}
      </Link>

      {/* Cosa non è ancora partito. `sync.ts` dice che le righe rimaste
          indietro vanno mostrate e mai ignorate: questo è il posto. */}
      {(queue.waiting > 0 || queue.stuck > 0) && (
        <section className="bab-card mt-2 flex flex-col gap-2 px-4 py-4">
          <h2 className="font-display text-[17px]">{t.settings.queueTitle}</h2>
          {queue.waiting > 0 && (
            <p className="text-[15px] text-[var(--color-ink-soft)]">
              {plural(queue.waiting, t.settings.queueBodyOne, t.settings.queueBody)}
            </p>
          )}
          {queue.stuck > 0 && (
            <p className="text-[15px]" style={{ color: 'var(--care)' }}>
              {plural(queue.stuck, t.settings.queueParkedOne, t.settings.queueParked)}
            </p>
          )}
        </section>
      )}
    </Pane>
  )
}
