import { Schermo } from '../ui/Schermo'
import { Titolo, Occhiello } from '../ui/Testo'
import { Bottone } from '../ui/Bottone'
import { useLingua } from '../lib/lingua'
import { azzera, useRisposte } from '../lib/risposte'
import { useNavigate } from 'react-router-dom'

/**
 * Dove si finisce dopo l'onboarding.
 *
 * Non e' uno schermo del disegno: e' un capolinea, perche' il primo giorno
 * (indovina, conta, confronta) e la app vera vengono dopo. Serve a vedere
 * che l'onboarding ha davvero raccolto quello che doveva.
 */
export function Casa() {
  const { t, lingua, cambia } = useLingua()
  const r = useRisposte()
  const vai = useNavigate()

  return (
    <Schermo nodo="casa" azione={<Bottone onClick={() => { azzera(); vai('/onboarding/accesso') }}>{lingua === 'it' ? 'Ricomincia' : 'Start over'}</Bottone>}>
      <Occhiello>BAB</Occhiello>
      <Titolo>
        {r.nome ? (lingua === 'it' ? `Ciao ${r.nome}` : `Hi ${r.nome}`) : t.riepilogo.titolo}
      </Titolo>

      <div className="mt-6 flex gap-2">
        {(['it', 'en'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => cambia(l)}
            className={`h-10 flex-1 rounded-[12px] border-[1.5px] text-[13px] font-bold ${
              lingua === l ? 'border-ink bg-lime' : 'border-line bg-surface'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <pre className="mt-6 overflow-x-auto rounded-[18px] border-[1.5px] border-line bg-surface p-4 text-[11px] leading-[1.6] text-ink-soft">
        {JSON.stringify(r, null, 2)}
      </pre>
    </Schermo>
  )
}
