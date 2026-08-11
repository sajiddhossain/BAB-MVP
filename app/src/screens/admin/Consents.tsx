import { consents } from '@/lib/admin'
import { Card, Problem, useLoad, when } from './shell'

/**
 * Chi ha accettato quale versione del testo, e quando.
 *
 * 🔴 Non è una curiosità: è la prova. Se il testo legale cambia, il consenso di
 * ieri non dice niente su quello che c'è scritto oggi — per questo ogni riga
 * porta la sua `text_version`. Senza questa schermata, dimostrarlo vuol dire
 * aprire il database.
 */

const KIND: Record<string, string> = {
  athlete: 'Atleta',
  guardian: 'Chi ne ha la tutela',
  research: 'Ricerca',
}

export default function Consents() {
  const list = useLoad(consents)

  if (list.error) return <Problem error={list.error} />

  const rows = list.data ?? []
  /** Le versioni in circolazione: se sono più d'una, non tutte hanno letto lo stesso. */
  const versions = [...new Set(rows.map((r) => r.text_version))]

  return (
    <div className="flex flex-col gap-4">
      <Card title="Versioni in circolazione">
        <p className="text-[14px]">
          {versions.length === 0 ? 'Ancora nessun consenso.' : versions.join(' · ')}
        </p>
        {versions.length > 1 && (
          <p className="text-[13px]" style={{ color: 'var(--care)' }}>
            Più di una versione: chi ha accettato la vecchia non ha accettato quella nuova.
          </p>
        )}
      </Card>

      <Card title={`Consensi (${rows.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-[var(--color-ink-soft)]">
                <th className="py-1 pr-4">Atleta</th>
                <th className="py-1 pr-4">Tipo</th>
                <th className="py-1 pr-4">Versione</th>
                <th className="py-1 pr-4">Esito</th>
                <th className="py-1">Quando</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t" style={{ borderColor: 'var(--color-sand)' }}>
                  <td className="py-1.5 pr-4">{c.display_name}</td>
                  <td className="py-1.5 pr-4">{KIND[c.kind] ?? c.kind}</td>
                  <td className="py-1.5 pr-4">{c.text_version}</td>
                  <td className="py-1.5 pr-4"
                      style={c.granted ? undefined : { color: 'var(--care)' }}>
                    {c.granted ? 'Sì' : 'No'}
                  </td>
                  <td className="py-1.5">{when(c.granted_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="text-[13.5px] text-[var(--color-ink-soft)]">
            Nessuno ha ancora finito l'onboarding.
          </p>
        )}
      </Card>
    </div>
  )
}
