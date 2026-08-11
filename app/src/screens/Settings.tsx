import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fill, plural, useCopy, useLocale, useSetLocale, LOCALES, type Locale } from '@/copy'
import PillGroup from '@/components/PillGroup'
import { signOut, useSession } from '@/lib/session'
import { buildExport, deleteAccount, download } from '@/lib/account'
import { getProfile, updateProfile, type ProfilePatch } from '@/lib/repo'
import { flush, parked } from '@/lib/sync'
import * as db from '@/lib/db'

/**
 * Le impostazioni, che qui sono quasi tutte «i tuoi dati».
 *
 * 🔴 L'ordine sulla pagina non è casuale: prima quello che si aggiusta, poi
 * quello che si porta via, e solo in fondo quello che si cancella. Una volta
 * cancellato non si torna indietro, e l'unica cosa che protegge da un tocco
 * sbagliato è che quel tocco stia dopo tutto il resto.
 */

type ExportState =
  | { k: 'idle' }
  | { k: 'working' }
  | { k: 'done'; fromDevice: boolean; pending: number }
  | { k: 'error' }

type SaveState = 'idle' | 'saving' | 'saved' | 'queued' | 'error'

function Card({ children }: { children: React.ReactNode }) {
  return <section className="bab-card flex flex-col gap-3 px-4 py-4">{children}</section>
}

/** Gli anni compiuti. Serve solo a decidere se una domanda va fatta (R3). */
function ageFrom(birth: string): number | null {
  if (!birth) return null
  const b = new Date(birth)
  if (Number.isNaN(b.getTime())) return null
  const now = new Date()
  let a = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--
  return a
}

type Cycle = 'tracking' | 'not_yet' | 'undisclosed'
type Contraception = 'natural' | 'hormonal' | 'unsure' | 'undisclosed'

export default function Settings() {
  const t = useCopy()
  const locale = useLocale()
  const setLocale = useSetLocale()
  const nav = useNavigate()
  const { userId, connected } = useSession()

  const [queue, setQueue] = useState({ waiting: 0, stuck: 0 })
  const [exp, setExp] = useState<ExportState>({ k: 'idle' })
  const [arming, setArming] = useState(false)
  const [word, setWord] = useState('')
  const [killing, setKilling] = useState(false)
  const [killError, setKillError] = useState<'offline' | 'server' | null>(null)

  /** Il profilo com'è sul disco: serve per calcolare cosa è DAVVERO cambiato. */
  const [saved, setSaved] = useState<ProfilePatch | null>(null)
  const [name, setName] = useState('')
  const [sport, setSport] = useState('')
  const [birth, setBirth] = useState('')
  const [cycle, setCycle] = useState<Cycle>('undisclosed')
  const [contraception, setContraception] = useState<Contraception>('undisclosed')
  const [save, setSaveState] = useState<SaveState>('idle')

  const [leaving, setLeaving] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(0)

  useEffect(() => {
    let alive = true
    Promise.all([db.pending(), parked()])
      .then(([all, stuck]) => {
        if (alive) setQueue({ waiting: all.length - stuck.length, stuck: stuck.length })
      })
      .catch(() => { /* senza archivio non c'è coda da mostrare */ })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!userId) return
    let alive = true
    getProfile(userId)
      .then((p) => {
        if (!alive || !p) return
        setSaved(p as ProfilePatch)
        setName(String(p.display_name ?? ''))
        setSport(String(p.sport ?? ''))
        setBirth(String(p.birth_date ?? ''))
        setCycle((p.cycle_status as Cycle) ?? 'undisclosed')
        setContraception((p.contraception as Contraception) ?? 'undisclosed')
      })
      .catch(() => { /* niente profilo, niente da correggere */ })
    return () => { alive = false }
  }, [userId])

  const age = ageFrom(birth)
  /** 🔴 R3: sotto i 15 anni la domanda non compare proprio. */
  const asksContraception = cycle === 'tracking' && age !== null && age >= 15

  /**
   * Solo quello che è cambiato davvero.
   *
   * Mandare tutto il profilo a ogni salvataggio farebbe partire una modifica
   * anche per i campi che non ha toccato — e quelle modifiche, arrivando dopo,
   * sovrascriverebbero quello che nel frattempo ha corretto da un altro
   * dispositivo. Il confronto con la copia sul disco è ciò che rende il patch
   * un patch.
   */
  function changes(): ProfilePatch {
    const next: ProfilePatch = {
      display_name: name.trim(),
      sport: sport.trim() || null,
      birth_date: birth,
      cycle_status: cycle,
      // Se la domanda non si può fare, il valore non si tocca: mettere
      // 'undisclosed' cancellerebbe una risposta data quando si poteva.
      ...(asksContraception ? { contraception } : {}),
    }
    const out: ProfilePatch = {}
    for (const [k, v] of Object.entries(next)) {
      if (saved && JSON.stringify(saved[k as keyof ProfilePatch]) === JSON.stringify(v)) continue
      Object.assign(out, { [k]: v })
    }
    return out
  }

  const dirty = Object.keys(changes()).length > 0

  async function onSaveProfile() {
    if (!userId) return
    setSaveState('saving')
    const patch = changes()
    try {
      await updateProfile(userId, patch)
      setSaved((p) => ({ ...(p ?? {}), ...patch }))
      // 🔴 Si aspetta il giro di invio prima di dire com'è andata. Guardando
      // la coda subito dopo la scrittura, l'invio è ancora in volo e lo
      // schermo direbbe «parte appena c'è rete» anche quando la rete c'era e
      // la modifica è già arrivata.
      await flush().catch(() => {})
      const mine = (await db.pending().catch(() => []))
        .filter((o) => o.op === 'update' && o.target === userId)
      setSaveState(
        mine.some((o) => o.lastError) ? 'error'
          : mine.length > 0 ? 'queued'
          : 'saved',
      )
    } catch {
      setSaveState('error')
    }
  }

  /** La lingua si scrive in due posti: qui e nel profilo, così viaggia con lei. */
  async function onLocale(next: Locale) {
    setLocale(next)
    if (userId) await updateProfile(userId, { locale: next }).catch(() => {})
  }

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
        setQueue((q) => ({ ...q, waiting: left }))
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

      {/* 1 · Quello che si aggiusta. */}
      {saved && (
        <Card>
          <h2 className="font-display text-[18px]">{t.settings.profileTitle}</h2>
          <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
            {t.settings.profileName}
            <input value={name} onChange={(e) => { setName(e.target.value); setSaveState('idle') }}
                   maxLength={40}
                   className="bab-card px-3 py-2 text-[16px] text-[var(--color-ink)]" />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
            {t.settings.profileSport}
            <input value={sport} onChange={(e) => { setSport(e.target.value); setSaveState('idle') }}
                   maxLength={40}
                   className="bab-card px-3 py-2 text-[16px] text-[var(--color-ink)]" />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
            {t.settings.profileBirth}
            <input type="date" value={birth}
                   onChange={(e) => { setBirth(e.target.value); setSaveState('idle') }}
                   className="bab-card px-3 py-2 text-[16px] text-[var(--color-ink)]" />
          </label>

          <h3 className="bab-label pt-1">{t.settings.rhythmTitle}</h3>
          <p className="text-[13.5px] text-[var(--color-ink-soft)]">{t.settings.rhythmBody}</p>
          <PillGroup
            label={t.settings.rhythmTitle} value={cycle}
            options={[{ value: 'tracking', label: t.onboarding.rhythmYes },
                      { value: 'not_yet', label: t.onboarding.rhythmNotYet },
                      { value: 'undisclosed', label: t.onboarding.rhythmSkip }]}
            onChange={(v) => { setCycle(v as Cycle); setSaveState('idle') }}
          />
          {asksContraception && (
            <>
              <p className="bab-label">{t.settings.rhythmContraception}</p>
              <PillGroup
                label={t.settings.rhythmContraception} value={contraception}
                options={[{ value: 'hormonal', label: t.common.yes },
                          { value: 'natural', label: t.common.no },
                          { value: 'undisclosed', label: t.checkin.common.dontKnow }]}
                onChange={(v) => { setContraception(v as Contraception); setSaveState('idle') }}
              />
            </>
          )}

          <button type="button" disabled={!dirty || save === 'saving'}
                  onClick={() => void onSaveProfile()}
                  className="bab-pill self-start px-5 py-2.5 text-[15px] disabled:opacity-40"
                  style={dirty ? { background: 'var(--color-lime)' } : undefined}>
            {save === 'saving' ? t.settings.profileSaving : t.settings.profileSave}
          </button>
          {save === 'saved' && <p className="text-[14px]">{t.settings.profileSaved}</p>}
          {save === 'queued' && (
            <p className="text-[14px] text-[var(--color-ink-soft)]">{t.settings.profileQueued}</p>
          )}
          {save === 'error' && (
            <p className="text-[14px]" style={{ color: 'var(--care)' }}>{t.settings.profileError}</p>
          )}
        </Card>
      )}

      {/* 2 · La lingua. R9 dice due, quindi devono essere davvero due. */}
      <Card>
        <h2 className="font-display text-[18px]">{t.settings.langTitle}</h2>
        <PillGroup
          label={t.settings.langTitle} value={locale}
          options={(Object.keys(LOCALES) as Locale[]).map((l) => ({
            value: l, label: LOCALES[l].langName,
          }))}
          onChange={(v) => void onLocale(v as Locale)}
        />
      </Card>

      {/* 3 · Cosa non è ancora partito.
          `sync.ts` dice che le righe rimaste indietro vanno mostrate e mai
          ignorate: questo è il posto dove finalmente si vedono. */}
      {(queue.waiting > 0 || queue.stuck > 0) && (
        <Card>
          <h2 className="font-display text-[18px]">{t.settings.queueTitle}</h2>
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
        </Card>
      )}

      {/* 4 · Portarli via. */}
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
                {plural(exp.pending, t.settings.exportPendingOne, t.settings.exportPending)}
              </p>
            )}
          </div>
        )}
        {exp.k === 'error' && (
          <p className="text-[14px]" style={{ color: 'var(--care)' }}>{t.settings.exportError}</p>
        )}
      </Card>

      {connected && (
        <Card>
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
        </Card>
      )}

      {/* 5 · Farli sparire. In fondo, e con una parola da scrivere. */}
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
