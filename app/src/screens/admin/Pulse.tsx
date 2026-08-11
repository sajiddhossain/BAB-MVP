import { Link } from 'react-router-dom'
import { pulse } from '@/lib/admin'
import { Card, Problem, Stat, useLoad } from './shell'

/**
 * Il battito del pilota. Solo conteggi.
 *
 * 🔴 Dice se il prodotto sta funzionando, non cosa ha scritto qualcuno. Se un
 * giorno servisse sapere di più, la domanda giusta non è «aggiungo una colonna
 * alla vista» ma «chi ha diritto di saperlo».
 */
export default function Pulse() {
  const { data, error } = useLoad(pulse)

  if (error) return <Problem error={error} />
  if (!data) return <p className="text-[14px] text-[var(--color-ink-soft)]">Un attimo…</p>

  /**
   * 🔴 Il cerchio chiuso è LA metrica. Un pre senza il suo post non produce
   * nessun prediction error, e il prediction error è l'unica cosa che il pilota
   * deve misurare. Se questa percentuale resta bassa, il pilota sta raccogliendo
   * molto meno di quanto il numero di check-in faccia sembrare.
   */
  const closed = data.checkins_7d > 0
    ? Math.round((data.posts_7d * 2 * 100) / data.checkins_7d)
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Oggi">
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat n={data.athletes_today} label="atlete hanno fatto il check-in" />
          <Stat n={data.checkins_today} label="check-in oggi" />
        </div>
        <p className="text-[12.5px] text-[var(--color-ink-soft)]">
          Su {data.athletes} iscritte in {data.teams} squadre.
        </p>
      </Card>

      <Card title="Ultimi 7 giorni">
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat n={data.checkins_7d} label="check-in" />
          <Stat n={data.posts_7d} label="di cui serali" />
          <Stat n={data.signals_7d} label="sensazioni sulla mappa" />
        </div>
        <p className="text-[12.5px] text-[var(--color-ink-soft)]">
          Circa il {closed}% dei check-in è un cerchio chiuso (mattina + sera). È l'unica
          coppia che produce lo scarto fra previsione e realtà — quello che il pilota misura.
        </p>
      </Card>

      <Card title="Bandiere rosse">
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat n={data.flags_open} label="aperte" warn />
          <Stat n={data.flags_untold} label="non ancora dette a un adulto" warn />
          <Stat n={data.flags_stale} label="aperte da più di 3 giorni" warn />
        </div>
        <p className="text-[12.5px] text-[var(--color-ink-soft)]">
          Una bandiera aperta da giorni non è un dato: è una persona che sta aspettando.
        </p>
        <Link to="/admin/bandiere" className="bab-pill self-start px-4 py-2 text-[13.5px]">
          Guardale
        </Link>
      </Card>

      <Card title="Crescita e consensi">
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat n={data.athletes_new_7d} label="nuove in 7 giorni" />
          <Stat n={data.consents_refused} label="consensi negati" warn />
        </div>
        <p className="text-[12.5px] text-[var(--color-ink-soft)]">
          Un consenso negato non è un errore: è una scelta legittima, e va saputa.
        </p>
      </Card>
    </div>
  )
}
