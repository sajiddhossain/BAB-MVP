import { NavLink } from 'react-router-dom'
import { useLingua } from '../../lib/lingua'
import { useTocco } from '../tocco'
import { useStatoSezione } from '../../lib/sezioni'
import home from '../../assets/casa/icon-home.svg'
import percorso from '../../assets/casa/icon-percorso.svg'
import storico from '../../assets/casa/icon-storico.svg'
import profilo from '../../assets/casa/icon-profilo.svg'
import punto from '../../assets/casa/punto-attivo.svg'

const VOCI = [
  { id: 'home', dove: '/casa', icona: home },
  { id: 'percorso', dove: '/percorso', icona: percorso },
  { id: 'storico', dove: '/storico', icona: storico },
  { id: 'profilo', dove: '/profilo', icona: profilo },
] as const

/**
 * La barra in fondo.
 *
 * Nel disegno e' alta 72 con la barretta di sistema dentro; qui i 72 sono
 * solo la barra, e sotto si aggiunge lo spazio che il telefono si prende da
 * solo — su un iPhone quella barretta la disegna il sistema, non noi, e
 * disegnarla anche qui vorrebbe dire vederla due volte.
 *
 * Le quattro voci sono link veri. Quali si vedono lo dicono le sezioni: una
 * sezione `nascosta` sparisce di qui, una `in-arrivo` resta e porta allo
 * schermo che dice che arriva presto — vedere il nome di una cosa che non
 * c'e' ancora e' una promessa, non vederla mai e' un'assenza.
 *
 * La home non si spegne: e' il posto dove si torna.
 */
export function BarraSotto() {
  const { t } = useLingua()
  const stati = {
    home: 'aperta',
    percorso: useStatoSezione('percorso'),
    storico: useStatoSezione('storico'),
    profilo: useStatoSezione('profilo'),
  } as const
  const voci = VOCI.filter((v) => stati[v.id] !== 'nascosta')
  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-10 bg-nav pb-[env(safe-area-inset-bottom)]"
      style={{ boxShadow: '0px -2px 12px 0px rgba(0,0,0,0.04)' }}
    >
      <div className="flex h-[72px]">
        {voci.map((v) => (
          <Voce key={v.id} dove={v.dove} icona={v.icona} nome={t.casa.nav[v.id]} />
        ))}
      </div>
    </nav>
  )
}

/**
 * Una voce della barra.
 *
 * Sta in un componente suo per una ragione sola: il tocco e' un gancio, e un
 * gancio dentro a un `map` non si puo' chiamare.
 *
 * Il puntino sopra all'icona affiora invece di comparire: cambiando schermo
 * quello vecchio se ne va e quello nuovo nasce nello stesso fotogramma, e
 * senza dissolvenza sembra che salti da una voce all'altra.
 */
function Voce({ dove, icona, nome }: { dove: string; icona: string; nome: string }) {
  const tocco = useTocco()
  return (
    <NavLink
      to={dove}
      {...tocco}
      className="bab-tocco relative flex flex-1 flex-col items-center pt-[14px]"
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <img
              src={punto}
              alt=""
              className="bab-affiora absolute top-[8px] size-[5px]"
              aria-hidden
            />
          )}
          <img src={icona} alt="" className="size-[22px]" aria-hidden />
          <span
            className={`mt-[5px] text-[10px] tracking-[0.3px] transition-colors duration-200 motion-reduce:transition-none ${
              isActive ? 'font-bold text-ink' : 'font-medium text-[#9e9a93]'
            }`}
          >
            {nome}
          </span>
        </>
      )}
    </NavLink>
  )
}
