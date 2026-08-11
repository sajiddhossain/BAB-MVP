import { useEffect, useState } from 'react'
import { useCopy } from '@/copy'
import PillGroup from '@/components/PillGroup'
import {
  ageFrom, Pane, SaveButton, SaveNote, useProfileEdit,
  type Contraception, type Cycle,
} from './shell'

/**
 * Il ritmo — cioè il ciclo, e solo dai 15 in su la contraccezione (R3).
 *
 * 🔴 Ha una schermata sua e non una riga dentro il profilo: è la cosa più
 * privata che BAB tiene, e chi apre le impostazioni per correggere il proprio
 * nome non deve trovarsela davanti.
 */
export default function SettingsRhythm() {
  const t = useCopy()
  const { saved, state, setState, diff, commit } = useProfileEdit()

  const [cycle, setCycle] = useState<Cycle>('undisclosed')
  const [contraception, setContraception] = useState<Contraception>('undisclosed')

  useEffect(() => {
    if (!saved) return
    setCycle((saved.cycle_status as Cycle) ?? 'undisclosed')
    setContraception((saved.contraception as Contraception) ?? 'undisclosed')
  }, [saved])

  const age = ageFrom(String(saved?.birth_date ?? ''))
  /** 🔴 R3: sotto i 15 anni la domanda non compare proprio. */
  const asks = cycle === 'tracking' && age !== null && age >= 15

  const next = {
    cycle_status: cycle,
    // Se la domanda non si può fare, il valore non si tocca: mettere
    // 'undisclosed' cancellerebbe una risposta data quando si poteva.
    ...(asks ? { contraception } : {}),
  }
  const dirty = Object.keys(diff(next)).length > 0

  return (
    <Pane title={t.settings.rhythmTitle} help={t.settings.rhythmBody}>
      <PillGroup
        size="lg" label={t.settings.rhythmTitle} value={cycle}
        options={[{ value: 'tracking', label: t.onboarding.rhythmYes },
                  { value: 'not_yet', label: t.onboarding.rhythmNotYet },
                  { value: 'undisclosed', label: t.onboarding.rhythmSkip }]}
        onChange={(v) => { setCycle(v as Cycle); setState('idle') }}
      />

      {asks && (
        <>
          <p className="bab-label pt-2">{t.settings.rhythmContraception}</p>
          <PillGroup
            size="lg" label={t.settings.rhythmContraception} value={contraception}
            options={[{ value: 'hormonal', label: t.common.yes },
                      { value: 'natural', label: t.common.no },
                      { value: 'undisclosed', label: t.checkin.common.dontKnow }]}
            onChange={(v) => { setContraception(v as Contraception); setState('idle') }}
          />
        </>
      )}

      <SaveButton dirty={dirty} state={state} onClick={() => void commit(next)} />
      <SaveNote state={state} />

      <p className="bab-card px-3 py-2.5 text-[13.5px]" style={{ background: 'var(--cycle-tint)' }}>
        {t.settings.rhythmPrivacy}
      </p>
    </Pane>
  )
}
