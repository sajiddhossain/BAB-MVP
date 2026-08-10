import { Link } from 'react-router-dom'
import { useCopy } from '@/copy'

/**
 * La home. Per ora mostra lo stato "fresh": è l'unica schermata che vedono ogni
 * giorno, e deve avere **una sola cosa ovvia da fare adesso**.
 *
 * Gli altri cinque stati (allenamento in corso, giornata chiusa, riposo,
 * bentornata, Care attivo) arrivano quando ci sono i dati veri per calcolarli:
 * uno switcher che li finge insegnerebbe a fidarsi di qualcosa che non c'è.
 */
export default function Today() {
  const t = useCopy()
  return (
    <section className="flex flex-col gap-4 pt-2">
      <h1 className="font-display text-[26px]">{t.tabs.today}</h1>

      <div className="bab-card flex flex-col gap-3 px-4 py-5">
        <h2 className="font-display text-[20px]">{t.today.fresh.title}</h2>
        <p className="text-[15px] text-[var(--color-ink-soft)]">{t.today.fresh.body}</p>
        <Link
          to="/checkin/pre"
          className="bab-pill px-4 py-3 text-center text-[16px]"
          style={{ background: 'var(--color-lime)' }}
        >
          {t.today.fresh.cta}
        </Link>
        <button type="button" className="text-[13.5px] text-[var(--color-ink-soft)] underline">
          {t.today.fresh.secondary}
        </button>
      </div>
    </section>
  )
}
