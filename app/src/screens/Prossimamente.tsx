import { Sfondo } from '../ui/Sfondo'
import { BarraSotto } from '../ui/casa/BarraSotto'
import { useLingua } from '../lib/lingua'
import { azzera } from '../lib/risposte'
import { esci } from '../lib/conto'
import { useNavigate } from 'react-router-dom'

/**
 * Le tre destinazioni della barra che non esistono ancora.
 *
 * Non e' uno schermo del disegno: e' un posto dove atterrare, cosi' toccando
 * "Percorso" non si finisce fuori dalla app. Sul profilo ci sono per ora le
 * due cose che servono a provare: la lingua e il ricomincia da capo.
 */
export function Prossimamente({ titolo, profilo = false }: { titolo: string; profilo?: boolean }) {
  const { lingua, cambia } = useLingua()
  const vai = useNavigate()

  return (
    /*
      `h-dvh` e non `min-h-dvh`: con il minimo il contenitore cresce insieme
      al contenuto, l'area interna non arriva mai a dover scorrere, e la barra
      in fondo — che sta attaccata al fondo del contenitore — se ne va sotto
      allo schermo. Nei giorni di riposo la scheda e' alta 410 e succedeva
      davvero. Con l'altezza fissa scorre il dentro e la barra resta.
    */
    <div className="flex h-dvh justify-center bg-paper">
      <div className="relative flex w-full max-w-[402px] flex-col overflow-hidden">
        <Sfondo nodo="prossimamente" />

        <div className="relative flex-1 overflow-y-auto px-[22px] pt-[calc(58px+env(safe-area-inset-top))] pb-[104px]">
          <p className="bab-display m-0 text-[19px] font-bold text-ink">{titolo}</p>
          <p className="m-0 mt-2 text-[13px] text-ink-medio">
            {lingua === 'it' ? 'Arriva presto.' : 'Coming soon.'}
          </p>

          {profilo && (
            <>
              <div className="mt-8 flex gap-2">
                {(['it', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => cambia(l)}
                    className={`h-11 flex-1 rounded-[12px] border-[1.5px] text-[13px] font-bold ${
                      lingua === l ? 'border-ink bg-lime' : 'border-line bg-surface'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  azzera()
                  void esci().then(() => vai('/onboarding/accesso'))
                }}
                className="mt-4 h-11 w-full rounded-[12px] border-[1.5px] border-line bg-surface text-[13px] font-bold text-ink"
              >
                {lingua === 'it' ? 'Ricomincia da capo' : 'Start over'}
              </button>
            </>
          )}
        </div>

        <BarraSotto />
      </div>
    </div>
  )
}
