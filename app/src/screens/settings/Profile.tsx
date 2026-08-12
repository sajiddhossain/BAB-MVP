import { useEffect, useState } from 'react'
import { useCopy, useLocale } from '@/copy'
import PillGroup from '@/components/PillGroup'
import { SPORTS } from '@/content/sports'
import { listSports } from '@/lib/repo'
import { setSports } from '@/lib/sports'
import { Pane, SaveButton, SaveNote, saveAndSettle, useProfileEdit } from './shell'

/** I dati anagrafici, e basta. Il ciclo ha una schermata sua. */
export default function SettingsProfile() {
  const t = useCopy()
  const locale = useLocale()
  const { userId, saved, state, setState, diff, commit } = useProfileEdit()

  const [name, setName] = useState('')
  const [birth, setBirth] = useState('')

  // Gli sport vivono in una tabella a sé (R3-bis) — non nel profilo — quindi
  // hanno il loro caricamento e il loro stato di "salvato".
  const [sports, setSportsState] = useState<string[]>([])
  const [otherSport, setOtherSport] = useState('')
  const [sportsWas, setSportsWas] = useState<string[]>([])
  const [sportsState, setSportsSaveState] = useState<'idle' | 'saving' | 'saved' | 'queued' | 'error'>('idle')

  useEffect(() => {
    if (!saved) return
    setName(String(saved.display_name ?? ''))
    setBirth(String(saved.birth_date ?? ''))
  }, [saved])

  useEffect(() => {
    let alive = true
    listSports()
      .then((rows) => {
        if (!alive) return
        const known = rows.map((r) => r.sport).filter((s) => SPORTS.some((sp) => sp.code === s))
        const custom = rows.map((r) => r.sport).find((s) => !SPORTS.some((sp) => sp.code === s))
        const picked = custom ? [...known, 'other'] : known
        setSportsState(picked); setOtherSport(custom ?? ''); setSportsWas(rows.map((r) => r.sport))
      })
      .catch(() => { /* nessuno sport da riassumere */ })
    return () => { alive = false }
  }, [])

  const effectiveSports = sports
    .map((c) => (c === 'other' ? otherSport.trim() : c))
    .filter((s, i, arr) => s.length > 0 && arr.indexOf(s) === i)

  const next = {
    display_name: name.trim(),
    sport: effectiveSports[0] ?? null,
    birth_date: birth,
  }
  const dirty = Object.keys(diff(next)).length > 0
  const sportsDirty = effectiveSports.length !== sportsWas.length
    || effectiveSports.some((s) => !sportsWas.includes(s))

  const toggleSport = (code: string) =>
    setSportsState((p) => (p.includes(code) ? p.filter((x) => x !== code) : [...p, code]))

  async function saveSportsList() {
    if (!userId) return
    await saveAndSettle(
      async () => {
        await setSports(userId, effectiveSports)
        setSportsWas(effectiveSports)
      },
      (o) => o.table === 'athlete_sports',
      setSportsSaveState,
    )
    // Il primo sport resta anche in `athletes.sport` — chi lo legge da lì
    // (il riepilogo delle impostazioni) vede il cambiamento senza ricaricare.
    await commit({ ...next, sport: effectiveSports[0] ?? null })
  }

  const field = (label: string, node: React.ReactNode) => (
    <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
      {label}{node}
    </label>
  )

  return (
    <Pane title={t.settings.profileTitle}>
      {field(t.settings.profileName,
        <input value={name} onChange={(e) => { setName(e.target.value); setState('idle') }}
               maxLength={40}
               className="bab-card px-3 py-2.5 text-[16px] text-[var(--color-ink)]" />)}

      <div className="flex flex-col gap-1.5">
        <p className="bab-label">{t.onboarding.sportLabel}</p>
        <PillGroup label={t.onboarding.sportLabel} value={sports}
                   options={SPORTS.map((s) => ({ value: s.code, label: s.label[locale] }))}
                   onChange={(c) => { toggleSport(c); setSportsSaveState('idle') }} />
        {sports.includes('other') && (
          <input value={otherSport}
                 onChange={(e) => { setOtherSport(e.target.value); setSportsSaveState('idle') }}
                 maxLength={40} placeholder={t.onboarding.sportOtherPlaceholder}
                 className="bab-card px-3 py-2.5 text-[16px] text-[var(--color-ink)]" />
        )}
        <SaveButton dirty={sportsDirty} state={sportsState} onClick={() => void saveSportsList()} />
        <SaveNote state={sportsState} />
      </div>

      {/* 🔴 La data di nascita non è anagrafe: decide se la domanda sulla
          contraccezione esiste (R3). Correggerla qui cambia l'altra schermata. */}
      {field(t.settings.profileBirth,
        <input type="date" value={birth}
               onChange={(e) => { setBirth(e.target.value); setState('idle') }}
               className="bab-card px-3 py-2.5 text-[16px] text-[var(--color-ink)]" />)}

      <SaveButton dirty={dirty} state={state} onClick={() => void commit(next)} />
      <SaveNote state={state} />
    </Pane>
  )
}
