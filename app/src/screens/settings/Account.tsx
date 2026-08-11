import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fill, plural, useCopy } from '@/copy'
import { deleteAccount } from '@/lib/account'
import { signOut, useSession } from '@/lib/session'
import { flush } from '@/lib/sync'
import * as db from '@/lib/db'
import { Pane } from './shell'

/**
 * Uscire, e cancellare.
 *
 * 🔴 Prima stavano in fondo alla stessa pagina di tutto il resto, e l'unica
 * cosa che separava un tocco distratto dalla cancellazione definitiva era la
 * lunghezza dello scorrimento. Adesso è una schermata a sé, in cui si entra
 * apposta — e dentro c'è comunque la parola da scrivere.
 */
export default function SettingsAccount() {
  const t = useCopy()
  const nav = useNavigate()
  const { connected } = useSession()

  const [leaving, setLeaving] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(0)

  const [arming, setArming] = useState(false)
  const [word, setWord] = useState('')
  const [killing, setKilling] = useState(false)
  const [killError, setKillError] = useState<'offline' | 'server' | null>(null)

  /**
   * 🔴 Uscire SVUOTA l'archivio locale, e non è eccesso di zelo.
   *
   * Le letture locali non filtrano per atleta — non hanno mai avuto bisogno di
   * farlo, perché su un telefono c'è una persona sola. Ma se qui restassero i
   * dati di chi esce, la prossima che entra su questo stesso telefono si
   * troverebbe i check-in di un'altra mescolati ai suoi. Succede in una
   * squadra, col telefono prestato in spogliatoio.
   *
   * Prima però si prova a svuotare la coda: quello che non è ancora partito
   * verrebbe cancellato insieme al resto, e va detto prima, non dopo.
   */
  async function onSignOut() {
    setLeaving(true)
    try {
      await flush().catch(() => {})
      const left = (await db.pending().catch(() => [])).length
      if (left > 0 && confirmLeave === 0) {
        setConfirmLeave(left)
        setLeaving(false)
        return
      }
      await db.wipe().catch(() => {})
      await signOut()
      nav('/', { replace: true })
    } finally {
      setLeaving(false)
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
    <Pane title={t.settings.accountTitle}>
      {connected && (
        <section className="bab-card flex flex-col gap-3 px-4 py-4">
          <h2 className="font-display text-[18px]">{t.settings.signOutTitle}</h2>
          <p className="text-[15px] text-[var(--color-ink-soft)]">{t.settings.signOutBody}</p>
          {confirmLeave > 0 && (
            <p className="text-[14.5px]" style={{ color: 'var(--care)' }}>
              {plural(confirmLeave, t.settings.signOutPendingOne, t.settings.signOutPending)}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void onSignOut()} disabled={leaving}
                    className="bab-pill px-5 py-2.5 text-[15px]">
              {leaving ? t.settings.signOutWorking
                : confirmLeave > 0 ? plural(confirmLeave, t.settings.signOutAnywayOne, t.settings.signOutAnyway)
                : t.settings.signOutCta}
            </button>
            {confirmLeave > 0 && (
              <button type="button" onClick={() => setConfirmLeave(0)}
                      className="bab-pill px-5 py-2.5 text-[15px]">
                {t.settings.signOutWait}
              </button>
            )}
          </div>
        </section>
      )}

      {/* §9 · Il secondo diritto: farli sparire. */}
      <section className="bab-card flex flex-col gap-3 px-4 py-4">
        <h2 className="font-display text-[18px]">{t.settings.deleteTitle}</h2>
        <p className="text-[15px] text-[var(--color-ink-soft)]">{t.settings.deleteBody}</p>
        <p className="text-[14px] text-[var(--color-ink-soft)]">{t.settings.deleteShared}</p>
        <p className="text-[14px] text-[var(--color-ink-soft)]">
          {t.settings.deleteExportFirst}{' '}
          <Link to="/settings/dati" className="underline">{t.settings.exportCta}</Link>
        </p>

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
              <button type="button" disabled={!ready || killing} onClick={() => void onDelete()}
                      className="bab-pill px-4 py-2.5 text-[14.5px] disabled:opacity-40"
                      style={ready
                        ? { background: 'var(--care)', borderColor: 'var(--care)', color: 'var(--color-surface)' }
                        : undefined}>
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
      </section>

      {!connected && (
        <p className="px-1 text-[13px] text-[var(--color-ink-soft)]">{t.settings.deleteOffline}</p>
      )}
    </Pane>
  )
}
