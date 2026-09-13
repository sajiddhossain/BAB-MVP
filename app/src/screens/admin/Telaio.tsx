import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import logo from '../../assets/logo-bab.svg'

/**
 * La cornice di tutte le stanze del pannello.
 *
 * ── DUE BARRE, UNA PER SCHERMO ─────────────────────────────────────────────
 * Dal tablet in su le stanze stanno in una colonna a sinistra, che si
 * comprime ai soli segni. Sul telefono una colonna si mangia meta' schermo:
 * li' le stanze scendono in una barra in fondo, a portata di pollice, come
 * nell'app delle atlete.
 *
 * `Stanze` e' la rotta che contiene tutte le altre; `Telaio` e' l'intestazione
 * di una stanza, dentro.
 */

const STANZE: { a: string; nome: string; corto: string; segno: string; fine?: boolean }[] = [
  { a: '/admin', nome: 'Atrio', corto: 'Atrio', segno: '◧', fine: true },
  { a: '/admin/atlete', nome: 'Le atlete', corto: 'Atlete', segno: '◍' },
  { a: '/admin/scritte', nome: 'Le parole', corto: 'Parole', segno: 'Aa' },
  { a: '/admin/sezioni', nome: 'Le sezioni dell’app', corto: 'Sezioni', segno: '◑' },
]

/**
 * Aperta o compressa la decide chi guarda, e la barra se lo ricorda su questo
 * browser. La prima volta parte aperta sugli schermi larghi e compressa su
 * quelli piu' stretti, dove le parole hanno bisogno di tutta la larghezza.
 */
const CHIAVE_BARRA = 'bab.adminBarra'

function compressaAllInizio(): boolean {
  try {
    const salvata = localStorage.getItem(CHIAVE_BARRA)
    if (salvata === 'compressa') return true
    if (salvata === 'aperta') return false
  } catch {
    // senza memoria del browser si decide dalla larghezza
  }
  return !window.matchMedia('(min-width: 1280px)').matches
}

/**
 * Il logo giallo su una tessera d'inchiostro: sul bianco il giallo non si legge.
 *
 * Tre misure: `piccola` per la barra compressa (42 pixel, quanti ne ha),
 * `media` per l'intestazione del telefono — dove una tessera stretta
 * rimpicciolisce il logo fino a non riconoscerlo — e quella intera.
 */
export function Tessera({ misura = 'intera' }: { misura?: 'piccola' | 'media' | 'intera' }) {
  const forma = {
    piccola: ['h-9 w-[42px] px-[6px]', 'h-auto w-full'],
    media: ['h-9 px-[10px]', 'h-[19px] w-auto'],
    intera: ['h-10 px-3', 'h-[22px] w-auto'],
  }[misura]
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-ink bg-ink ${forma[0]}`}>
      <img src={logo} alt="" className={forma[1]} />
    </span>
  )
}

export function Stanze() {
  const [compressa, setCompressa] = useState(compressaAllInizio)

  function cambia() {
    setCompressa((c) => {
      try {
        localStorage.setItem(CHIAVE_BARRA, c ? 'aperta' : 'compressa')
      } catch {
        // resta com'e' fino a che la pagina e' aperta
      }
      return !c
    })
  }

  return (
    <div className="flex h-dvh flex-col bg-paper text-ink md:flex-row">
      <nav
        aria-label="Stanze del pannello"
        className={`hidden shrink-0 flex-col gap-1 overflow-hidden border-r-[1.5px] border-ink bg-surface py-3 transition-[width] duration-200 motion-reduce:transition-none md:flex ${
          compressa ? 'w-[64px] px-2' : 'w-[204px] px-3'
        }`}
      >
        <Link to="/admin" aria-label="BAB · amministrazione" className="mb-4 flex items-center gap-[10px] px-[3px] text-ink no-underline">
          <Tessera misura={compressa ? 'piccola' : 'intera'} />
          {!compressa && (
            <span className="text-[10px] leading-[1.25] font-bold tracking-[1px] whitespace-nowrap text-ink-mute uppercase">
              amministrazione
            </span>
          )}
        </Link>
        {STANZE.map((s) => (
          <NavLink
            key={s.a}
            to={s.a}
            end={s.fine}
            aria-label={s.nome}
            title={s.nome}
            className={({ isActive }) =>
              `bab-tocco flex h-10 items-center gap-3 rounded-[10px] border-[1.5px] px-[10px] text-[13px] font-bold no-underline ${
                isActive
                  ? 'border-ink bg-lime text-ink shadow-[2px_2px_0_rgba(44,44,58,0.9)]'
                  : 'border-transparent text-ink-medio hover:bg-chip hover:text-ink'
              }`
            }
          >
            <span aria-hidden className="flex w-[18px] shrink-0 justify-center text-[14px]">
              {s.segno}
            </span>
            {!compressa && <span className="truncate whitespace-nowrap">{s.nome}</span>}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={cambia}
          aria-expanded={!compressa}
          aria-label={compressa ? 'Espandi la barra' : 'Comprimi la barra'}
          title={compressa ? 'Espandi la barra' : 'Comprimi la barra'}
          className={`bab-tocco mt-auto flex h-10 cursor-pointer items-center rounded-[10px] border-[1.5px] border-ink bg-surface text-[16px] font-bold text-ink hover:bg-chip ${
            compressa ? 'justify-center' : 'justify-end px-[12px]'
          }`}
        >
          <span aria-hidden>{compressa ? '»' : '«'}</span>
        </button>
      </nav>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>

      <nav
        aria-label="Stanze del pannello"
        className="shrink-0 border-t-[1.5px] border-ink bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="flex h-[64px]">
          {STANZE.map((s) => (
            <NavLink
              key={s.a}
              to={s.a}
              end={s.fine}
              className={({ isActive }) =>
                `bab-tocco flex flex-1 flex-col items-center justify-center gap-[3px] no-underline ${
                  isActive ? 'text-ink' : 'text-ink-mute'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={`flex h-7 w-12 items-center justify-center rounded-pill border-[1.5px] text-[14px] font-bold ${
                      isActive ? 'border-ink bg-lime' : 'border-transparent'
                    }`}
                  >
                    {s.segno}
                  </span>
                  <span className="text-[10.5px] font-bold">{s.corto}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export function Telaio({
  nome,
  segno,
  sotto,
  destra,
  scorre = true,
  children,
}: {
  nome: string
  /** quello che sta prima del nome: le iniziali di un'atleta */
  segno?: ReactNode
  /** una riga che dice a cosa serve questa stanza, se non e' ovvio */
  sotto?: string
  /** i bottoni di questa stanza: stanno nella stessa riga, in fondo, e sul telefono vanno a capo */
  destra?: ReactNode
  /**
   * se la stanza si scorre tutta insieme, o se dentro ha colonne che si
   * scorrono per conto loro
   */
  scorre?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex h-full flex-col bg-paper text-ink">
      <header className="flex min-h-[60px] shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b-[1.5px] border-ink bg-surface px-4 py-[10px] md:px-5">
        {/* sul telefono la barra laterale non c'e': il logo torna in cima */}
        <Link to="/admin" aria-label="BAB · amministrazione" className="md:hidden">
          <Tessera misura="media" />
        </Link>
        {segno}
        <h1 className="bab-display m-0 min-w-0 shrink truncate text-[18px] leading-none font-bold md:text-[20px]">{nome}</h1>
        {sotto && <p className="m-0 hidden min-w-0 flex-1 truncate text-[12px] text-ink-medio sm:block">{sotto}</p>}
        <span className={`min-w-0 flex-1 ${sotto ? 'sm:hidden' : ''}`} />
        {destra}
      </header>
      {scorre ? (
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      ) : (
        <div className="flex min-h-0 flex-1">{children}</div>
      )}
    </div>
  )
}
