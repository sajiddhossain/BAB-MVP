import { NavLink } from 'react-router-dom'
import { useLingua } from '../../lib/lingua'
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
 * Le quattro voci sono link veri: le tre destinazioni non esistono ancora,
 * ma quando esisteranno la barra non va toccata.
 */
export function BarraSotto() {
  const { t } = useLingua()
  return (
    <nav
      className="absolute inset-x-0 bottom-0 z-10 bg-nav pb-[env(safe-area-inset-bottom)]"
      style={{ boxShadow: '0px -2px 12px 0px rgba(0,0,0,0.04)' }}
    >
      <div className="flex h-[72px]">
        {VOCI.map((v) => (
          <NavLink key={v.id} to={v.dove} className="relative flex flex-1 flex-col items-center pt-[14px]">
            {({ isActive }) => (
              <>
                {isActive && (
                  <img src={punto} alt="" className="absolute top-[8px] size-[5px]" aria-hidden />
                )}
                <img src={v.icona} alt="" className="size-[22px]" aria-hidden />
                <span
                  className={`mt-[5px] text-[10px] tracking-[0.3px] ${
                    isActive ? 'font-bold text-ink' : 'font-medium text-[#9e9a93]'
                  }`}
                >
                  {t.casa.nav[v.id]}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
