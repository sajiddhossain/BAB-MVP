import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCopy, useLocale } from '@/copy'
import { useSession } from '@/lib/session'
import { recentJournalEntries, removeJournalEntry, saveJournalEntry } from '@/lib/repo'
import { CloseIcon, FeatherIcon } from '@/components/icons'
import Loading from '@/components/Loading'

/**
 * Il diario — commento Figma id:1883772406: "qualcos'altro che vuoi
 * condividere con BAB? Puoi scriverlo qui e puoi vederlo solo tu".
 *
 * 🔴 Diverso dalla nota di fine check-in (che resta, e resta legata a un
 * allenamento): questo si scrive quando vuole, non solo dopo essersi
 * allenata. Vedi `journal_entries` in schema.sql per come resta privato —
 * nessuna vista coach/admin la legge, mai.
 */

type Entry = { id: string; body: string; created_at: string }

export default function Journal() {
  const t = useCopy()
  const locale = useLocale()
  const { userId } = useSession()
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)

  async function load() {
    const rows = await recentJournalEntries()
    setEntries(rows as Entry[])
  }
  useEffect(() => { void load() }, [])

  async function save() {
    const body = draft.trim()
    if (!body || !userId) return
    setSaving(true)
    await saveJournalEntry(userId, body)
    setDraft('')
    await load()
    setSaving(false)
  }

  async function remove(id: string) {
    setConfirming(null)
    await removeJournalEntry(id)
    setEntries((es) => es ? es.filter((e) => e.id !== id) : es)
  }

  const when = (iso: string) =>
    new Date(iso).toLocaleString(locale === 'it' ? 'it-IT' : 'en-US', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })

  if (!entries) return <Loading label={t.common.loading} />

  return (
    <section className="flex flex-col gap-4 pt-2">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-[26px]">{t.journal.title}</h1>
        <Link to="/me" className="text-[13.5px] underline text-[var(--color-ink-soft)]">
          {t.settings.back}
        </Link>
      </div>
      <p className="text-[14px] text-[var(--color-ink-soft)]">{t.journal.help}</p>

      <div className="bab-card flex flex-col gap-2 px-4 py-3.5">
        <textarea
          value={draft} onChange={(e) => setDraft(e.target.value)}
          maxLength={2000} rows={4} placeholder={t.journal.placeholder}
          aria-label={t.journal.placeholder}
          className="resize-none bg-transparent text-[15px] text-[var(--color-ink)] outline-none"
        />
        <button type="button" disabled={!draft.trim() || saving} onClick={() => void save()}
                className="bab-pill self-end px-4 py-2 text-[14px] disabled:opacity-40"
                style={{ background: 'var(--color-lime)' }}>
          {t.journal.save}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <FeatherIcon size={32} color="var(--color-ink-soft)" />
          <p className="text-[14px] text-[var(--color-ink-soft)]">{t.journal.empty}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((e) => (
            <li key={e.id} className="bab-card flex flex-col gap-1.5 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[12px] text-[var(--color-ink-soft)]">{when(e.created_at)}</span>
                {confirming !== e.id && (
                  <button type="button" onClick={() => setConfirming(e.id)} aria-label={t.journal.deleteLabel}
                          className="shrink-0 text-[var(--color-ink-soft)]">
                    <CloseIcon size={14} />
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap text-[15px]">{e.body}</p>
              {confirming === e.id && (
                <div className="flex flex-col gap-1.5 rounded-xl px-2.5 py-2" style={{ background: 'var(--care-tint)' }}>
                  <p className="text-[13px] font-bold">{t.journal.deleteConfirmTitle}</p>
                  <p className="text-[12.5px] text-[var(--color-ink-soft)]">{t.journal.deleteConfirmBody}</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void remove(e.id)}
                            className="bab-pill px-3 py-1.5 text-[13px]"
                            style={{ borderColor: 'var(--care)', color: 'var(--care)' }}>
                      {t.journal.deleteConfirmYes}
                    </button>
                    <button type="button" onClick={() => setConfirming(null)}
                            className="bab-pill px-3 py-1.5 text-[13px]">
                      {t.journal.deleteConfirmNo}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
