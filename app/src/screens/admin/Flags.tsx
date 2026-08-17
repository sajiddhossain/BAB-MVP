import { useState } from 'react'
import { useLocale } from '@/copy'
import { regionLabel, type RegionCode } from '@/content/bodymap'
import { SENSATIONS } from '@/content/lexicon'
import { flags, markFlag } from '@/lib/admin'
import { Card, days, Problem, useLoad, when } from './shell'

/**
 * Le bandiere rosse, di tutte le squadre.
 *
 * 🔴 §11 dice che devono escalare a un umano. Fino a oggi si aprivano e basta:
 * `told_adult` nasceva falso, `resolved_at` nullo, e nessuno poteva cambiarli —
 * né il coach né la founder. Un'escalation che non si può chiudere è un elenco
 * che cresce, e un elenco che cresce si smette di guardare.
 */
export default function Flags() {
  const [openOnly, setOpenOnly] = useState(true)
  const list = useLoad(() => flags(openOnly), [openOnly])
  const locale = useLocale()
  const [busy, setBusy] = useState<string | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  /** L'id della bandiera per cui sta chiedendo conferma prima di chiudere — mai più di una alla volta. */
  const [confirming, setConfirming] = useState<string | null>(null)

  const word = (code: string) =>
    SENSATIONS.find((s) => s.code === code)?.label[locale] ?? code

  async function mark(id: string, told: boolean, resolved: boolean) {
    setProblem(null); setBusy(id); setConfirming(null)
    try { await markFlag(id, told, resolved); list.reload() }
    catch (e) { setProblem(e instanceof Error ? e.message : String(e)) }
    finally { setBusy(null) }
  }

  if (list.error) return <Problem error={list.error} />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setOpenOnly(true)}
                className="bab-pill px-4 py-2 text-[13.5px]"
                style={openOnly ? { background: 'var(--color-ink)', borderColor: 'var(--color-ink)', color: 'var(--color-surface)' } : undefined}>
          Aperte
        </button>
        <button type="button" onClick={() => setOpenOnly(false)}
                className="bab-pill px-4 py-2 text-[13.5px]"
                style={!openOnly ? { background: 'var(--color-ink)', borderColor: 'var(--color-ink)', color: 'var(--color-surface)' } : undefined}>
          Tutte
        </button>
      </div>

      {problem && <Problem error={problem} />}

      {(list.data ?? []).length === 0 && (
        <p className="text-[14px] text-[var(--color-ink-soft)]">
          {openOnly ? 'Nessuna bandiera aperta.' : 'Nessuna bandiera, mai.'}
        </p>
      )}

      {(list.data ?? []).map((f) => {
        const old = !f.resolved_at && days(f.opened_at) >= 3
        return (
          <Card key={f.id}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-[17px]">{f.display_name}</span>
              <span className="text-[14px]">
                🚩 {regionLabel(f.region as RegionCode, locale)} — {word(f.sensation)}
              </span>
              {f.team_name && (
                <span className="text-[12.5px] text-[var(--color-ink-soft)]">{f.team_name}</span>
              )}
            </div>

            <p className="text-[13px]" style={old ? { color: 'var(--care)' } : { color: 'var(--color-ink-soft)' }}>
              Aperta {when(f.opened_at)}
              {old && ` · da ${days(f.opened_at)} giorni`}
              {f.told_adult && ` · detto a un adulto ${when(f.told_adult_at)}`}
              {f.resolved_at && ` · chiusa ${when(f.resolved_at)}`}
            </p>

            {!f.resolved_at && (
              confirming === f.id ? (
                <div className="flex flex-col gap-1.5 rounded-xl px-2.5 py-2" style={{ background: 'var(--care-tint)' }}>
                  <p className="text-[13.5px] font-bold">Chiudere questa segnalazione?</p>
                  <p className="text-[13px] text-[var(--color-ink-soft)]">Non si riapre da qui.</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={busy === f.id}
                            onClick={() => void mark(f.id, f.told_adult, true)}
                            className="bab-pill px-4 py-2 text-[13.5px] disabled:opacity-40"
                            style={{ borderColor: 'var(--care)', color: 'var(--care)' }}>
                      Sì, chiudi
                    </button>
                    <button type="button" onClick={() => setConfirming(null)}
                            className="bab-pill px-4 py-2 text-[13.5px]">
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {!f.told_adult && (
                    <button type="button" disabled={busy === f.id}
                            onClick={() => void mark(f.id, true, false)}
                            className="bab-pill px-4 py-2 text-[13.5px] disabled:opacity-40">
                      L'ha detto a un adulto
                    </button>
                  )}
                  <button type="button" disabled={busy === f.id}
                          onClick={() => setConfirming(f.id)}
                          className="bab-pill px-4 py-2 text-[13.5px] disabled:opacity-40"
                          style={{ background: 'var(--color-lime)' }}>
                    Chiudi
                  </button>
                </div>
              )
            )}
          </Card>
        )
      })}
    </div>
  )
}
