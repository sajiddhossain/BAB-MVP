import { useState } from 'react'
import {
  attachAthlete, attachStaff, createTeam, detachAthlete, rosterOf, staffOf, teams,
} from '@/lib/admin'
import { Card, Field, inputClass, Problem, useLoad, when } from './shell'

/**
 * Squadre, staff, roster.
 *
 * 🔴 È il pezzo che fa partire un pilota senza passare da chi ha la password
 * del database. Finora creare una squadra e iscriverci qualcuno voleva dire
 * scrivere SQL a mano: ogni nuova atleta era una query, e ogni query era un
 * momento in cui sbagliare uuid.
 */

const ROLES = ['head_coach', 'coach', 'physio', 'staff']

export default function Teams() {
  const list = useLoad(teams)
  const [open, setOpen] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [sport, setSport] = useState('')
  const [word, setWord] = useState('match')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  async function add() {
    setProblem(null); setBusy(true)
    try {
      await createTeam({ name: name.trim(), sport: sport.trim(), event_word: word, locale: 'it' })
      setName(''); setSport('')
      list.reload()
    } catch (e) {
      setProblem(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  if (list.error) return <Problem error={list.error} />

  return (
    <div className="flex flex-col gap-4">
      <Card title="Nuova squadra">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Nome">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Sport">
            <input value={sport} onChange={(e) => setSport(e.target.value)} className={inputClass} />
          </Field>
          {/* R5: cambia il vocabolario di tutta la dashboard — «gare» per
              atletica e nuoto, «partite» per pallavolo e calcio. */}
          <Field label="Come si chiamano gli impegni">
            <select value={word} onChange={(e) => setWord(e.target.value)} className={inputClass}>
              <option value="competition">Gare</option>
              <option value="match">Partite</option>
            </select>
          </Field>
          <button type="button" disabled={busy || name.trim().length < 2 || !sport.trim()}
                  onClick={() => void add()}
                  className="bab-pill px-5 py-2.5 text-[14px] disabled:opacity-40"
                  style={{ background: 'var(--color-lime)' }}>
            Crea
          </button>
        </div>
        {problem && <Problem error={problem} />}
      </Card>

      {(list.data ?? []).length === 0 && (
        <p className="text-[14px] text-[var(--color-ink-soft)]">
          Nessuna squadra. Creane una qui sopra: senza, nessun coach vede nessuno.
        </p>
      )}

      {(list.data ?? []).map((team) => (
        <Card key={team.id} title={`${team.name} · ${team.sport}`}>
          <button type="button" onClick={() => setOpen(open === team.id ? null : team.id)}
                  className="bab-pill self-start px-4 py-2 text-[13.5px]">
            {open === team.id ? 'Chiudi' : 'Apri'}
          </button>
          {open === team.id && <TeamDetail teamId={team.id} />}
        </Card>
      ))}
    </div>
  )
}

function TeamDetail({ teamId }: { teamId: string }) {
  const staff = useLoad(() => staffOf(teamId), [teamId])
  const roster = useLoad(() => rosterOf(teamId), [teamId])

  const [staffEmail, setStaffEmail] = useState('')
  const [staffRole, setStaffRole] = useState('coach')
  const [athleteEmail, setAthleteEmail] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<void>, after: () => void) => {
    setProblem(null); setBusy(true)
    try { await fn(); after() }
    catch (e) { setProblem(e instanceof Error ? e.message : String(e)) }
    finally { setBusy(false) }
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      {problem && <Problem error={problem} />}

      <div className="flex flex-col gap-2">
        <p className="bab-label">Staff</p>
        <ul className="flex flex-col gap-1 text-[13.5px]">
          {(staff.data ?? []).map((s) => (
            <li key={s.user_id} className="flex gap-3">
              <span className="flex-1">{s.email}</span>
              <span className="text-[var(--color-ink-soft)]">{s.role}</span>
              <span className="text-[var(--color-ink-soft)]">{when(s.added_at)}</span>
            </li>
          ))}
          {(staff.data ?? []).length === 0 && (
            <li className="text-[var(--color-ink-soft)]">Nessuno. Questa squadra non la vede nessuno.</li>
          )}
        </ul>
        <div className="flex flex-wrap items-end gap-2">
          <Field label="Email di chi allena">
            <input value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)}
                   type="email" className={inputClass} />
          </Field>
          <Field label="Ruolo">
            <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)} className={inputClass}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <button type="button" disabled={busy || !staffEmail.includes('@')}
                  onClick={() => void run(
                    () => attachStaff(teamId, staffEmail, staffRole),
                    () => { setStaffEmail(''); staff.reload() },
                  )}
                  className="bab-pill px-4 py-2.5 text-[13.5px] disabled:opacity-40">
            Aggiungi
          </button>
        </div>
        {/* 🔴 Detto prima, non dopo il messaggio d'errore. */}
        <p className="text-[12px] text-[var(--color-ink-soft)]">
          Deve essere già entrata in BAB almeno una volta: BAB non crea account per conto di altri.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="bab-label">Atlete</p>
        <ul className="flex flex-col gap-1 text-[13.5px]">
          {(roster.data ?? []).map((a) => (
            <li key={a.id} className="flex items-center gap-3">
              <span className="flex-1">{a.display_name}</span>
              <span className="text-[var(--color-ink-soft)]">{a.age} anni</span>
              <button type="button" disabled={busy}
                      onClick={() => void run(
                        () => detachAthlete(teamId, a.id),
                        () => roster.reload(),
                      )}
                      className="bab-pill px-3 py-1.5 text-[12.5px]"
                      style={{ borderColor: 'var(--care)', color: 'var(--care)' }}>
                Togli
              </button>
            </li>
          ))}
          {(roster.data ?? []).length === 0 && (
            <li className="text-[var(--color-ink-soft)]">Ancora nessuna.</li>
          )}
        </ul>
        <div className="flex flex-wrap items-end gap-2">
          <Field label="Email dell'atleta">
            <input value={athleteEmail} onChange={(e) => setAthleteEmail(e.target.value)}
                   type="email" className={inputClass} />
          </Field>
          <button type="button" disabled={busy || !athleteEmail.includes('@')}
                  onClick={() => void run(
                    () => attachAthlete(teamId, athleteEmail),
                    () => { setAthleteEmail(''); roster.reload() },
                  )}
                  className="bab-pill px-4 py-2.5 text-[13.5px] disabled:opacity-40">
            Iscrivi
          </button>
        </div>
        <p className="text-[12px] text-[var(--color-ink-soft)]">
          Deve aver già finito l'onboarding. «Togli» non cancella niente: mette una data di
          uscita, lo staff smette di vederla, e le sue righe restano sue.
        </p>
      </div>
    </div>
  )
}
