import { instrumentation, skippedFields } from '@/lib/admin'
import { Card, Problem, Stat, useLoad } from './shell'

/**
 * I tre numeri del pilota, letti finalmente.
 *
 * 🔴 `started_at`/`completed_at`, `tempo_suggested`/`tempo_chosen` e
 * `skipped_fields` sono scritti dal primo check-in del pilota
 * (`docs/05-roadmap/01-piano-mvp.md`: «impossibile da recuperare dopo»), ma
 * fino a questo schermo nessuno li aveva mai letti — restavano solo salvati.
 * Qui non c'è niente che una riga sola non avesse già: solo aggregati, come
 * `admin_pulse`.
 */

/** "1m 20s", non "80 secondi": è quello che una persona legge a colpo d'occhio. */
function seconds(n: number | null): string {
  if (n === null) return '—'
  const m = Math.floor(n / 60)
  const s = n % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const FIELD_LABEL: Record<string, string> = {
  tempo_predicted: 'Previsione (pre)',
  prediction_confidence: 'Quanto ci credo',
  sleep_hours: 'Ore di sonno',
  sleep: 'Sonno',
  energy: 'Energia',
  hydration: 'Idratazione',
  muscles: 'Muscoli',
  headspace: 'Testa',
  surprise: 'Sorpresa',
  school_load: 'Scuola',
  body: 'Mappa corporea',
  tempo_chosen: 'Andatura scelta',
  effort: 'Sforzo (RPE)',
  duration_bucket: 'Durata sessione',
  session_type: 'Tipo sessione',
  legs: 'Gambe',
  breath: 'Respiro',
  painkillers: 'Antidolorifici',
  brought_home: 'Cosa mi porto a casa',
  note: 'Riflessione libera',
}

export default function Instrumentation() {
  const { data, error } = useLoad(instrumentation)
  const fields = useLoad(skippedFields)

  if (error) return <Problem error={error} />
  if (!data) return <p className="text-[14px] text-[var(--color-ink-soft)]">Un attimo…</p>

  const timedPct = data.checkins_30d > 0 ? Math.round((data.timed_30d * 100) / data.checkins_30d) : 0
  const overriddenPct = data.suggested_pairs_30d > 0
    ? Math.round((data.suggested_overridden_30d * 100) / data.suggested_pairs_30d)
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Secondi reali" wide>
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat n={data.timed_30d} label={`check-in con orario, su ${data.checkins_30d} (30 giorni)`}
                warn={timedPct < 80} />
        </div>
        {data.timed_30d > 0 ? (
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <div className="flex flex-col">
              <span className="font-display text-[24px] leading-none">{seconds(data.median_seconds_pre_30d)}</span>
              <span className="mt-1 text-[12.5px] text-[var(--color-ink-soft)]">mediana check-in mattutino</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-[24px] leading-none">{seconds(data.median_seconds_post_30d)}</span>
              <span className="mt-1 text-[12.5px] text-[var(--color-ink-soft)]">mediana check-in serale</span>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-[var(--color-ink-soft)]">
            Nessun check-in con le due marche temporali negli ultimi 30 giorni.
          </p>
        )}
        <p className="text-[12.5px] text-[var(--color-ink-soft)]">
          Il {timedPct}% dei check-in ha sia l'apertura che la chiusura salvate — è quello che rende
          possibile la mediana qui sopra. Mediana, non media: un telefono lasciato aperto in tasca non
          deve pesare come un check-in vero. I 90 secondi non erano un tetto: un check-in lento può
          voler dire che sta ascoltando meglio.
        </p>
      </Card>

      <Card title="Suggerito vs scelto">
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat n={data.suggested_pairs_30d} label="check-in con un suggerimento (30 giorni)" />
          <Stat n={data.suggested_overridden_30d} label="in cui ha scelto diversamente" />
        </div>
        <p className="text-[12.5px] text-[var(--color-ink-soft)]">
          Il {overriddenPct}% delle volte corregge il modello invece di accettarlo. È il dato più
          prezioso del pilota (`lib/tempo.ts`): un numero vicino allo 0% vuol dire che le soglie
          stanno già azzeccando l'andatura, non che nessuno le guarda.
        </p>
      </Card>

      <Card title="Domande saltate" wide>
        {fields.error && <Problem error={fields.error} />}
        {fields.data && fields.data.length === 0 && (
          <p className="text-[13px] text-[var(--color-ink-soft)]">
            Nessun campo saltato negli ultimi 30 giorni.
          </p>
        )}
        {fields.data && fields.data.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {fields.data.map((f) => (
              <li key={f.field} className="flex items-center justify-between gap-3 text-[13.5px]">
                <span>{FIELD_LABEL[f.field] ?? f.field}</span>
                <span className="font-display text-[15px]">{f.n}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[12.5px] text-[var(--color-ink-soft)]">
          Dove il check-in fa più attrito, sommato su tutte — non chi salta, solo cosa si salta di più.
        </p>
      </Card>
    </div>
  )
}
