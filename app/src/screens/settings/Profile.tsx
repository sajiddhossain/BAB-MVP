import { useEffect, useState } from 'react'
import { useCopy } from '@/copy'
import { Pane, SaveButton, SaveNote, useProfileEdit } from './shell'

/** I dati anagrafici, e basta. Il ciclo ha una schermata sua. */
export default function SettingsProfile() {
  const t = useCopy()
  const { saved, state, setState, diff, commit } = useProfileEdit()

  const [name, setName] = useState('')
  const [sport, setSport] = useState('')
  const [birth, setBirth] = useState('')

  useEffect(() => {
    if (!saved) return
    setName(String(saved.display_name ?? ''))
    setSport(String(saved.sport ?? ''))
    setBirth(String(saved.birth_date ?? ''))
  }, [saved])

  const next = {
    display_name: name.trim(),
    sport: sport.trim() || null,
    birth_date: birth,
  }
  const dirty = Object.keys(diff(next)).length > 0

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
      {field(t.settings.profileSport,
        <input value={sport} onChange={(e) => { setSport(e.target.value); setState('idle') }}
               maxLength={40}
               className="bab-card px-3 py-2.5 text-[16px] text-[var(--color-ink)]" />)}
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
