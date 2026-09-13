import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'

/**
 * La cornice di tutte le stanze del pannello.
 *
 * ── LA BARRA A SINISTRA ────────────────────────────────────────────────────
 * Prima da ogni stanza si tornava all'atrio con «← Pannello», e da li' si
 * sceglieva un'altra stanza: due click per passare dalle atlete alle parole.
 * Adesso le stanze stanno in una colonna fissa, e quella in cui sei e' accesa.
 *
 * Sugli schermi stretti la colonna tiene solo i segni: le parole hanno tre
 * colonne sue, e duecento pixel di barra gliene porterebbero via una.
 *
 * `Stanze` e' la rotta che contiene tutte le altre; `Telaio` e' l'intestazione
 * di una stanza, dentro.
 */

const STANZE: { a: string; nome: string; segno: string; fine?: boolean }[] = [
  { a: '/admin', nome: 'Atrio', segno: '◧', fine: true },
  { a: '/admin/atlete', nome: 'Le atlete', segno: '◍' },
  { a: '/admin/scritte', nome: 'Le parole', segno: 'Aa' },
  { a: '/admin/sezioni', nome: 'Le sezioni dell’app', segno: '◑' },
]

/**
 * Aperta o compressa la decide chi guarda, e la barra se lo ricorda su questo
 * browser. La prima volta parte aperta sugli schermi larghi e compressa su
 * quelli stretti, dove le parole hanno bisogno di tutta la larghezza.
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
    <div className="flex h-dvh bg-paper text-ink">
      <nav
        aria-label="Stanze del pannello"
        className={`flex shrink-0 flex-col gap-1 overflow-hidden border-r-[1.5px] border-ink bg-surface py-3 transition-[width] duration-200 motion-reduce:transition-none ${
          compressa ? 'w-[64px] px-2' : 'w-[204px] px-3'
        }`}
      >
        <Link to="/admin" aria-label="BAB · amministrazione" className="mb-4 flex items-center gap-[10px] px-[3px] text-ink no-underline">
          <span className="bab-display flex h-9 w-[42px] shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-ink bg-ink text-[13px] font-bold text-lime">
            BAB
          </span>
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
      <div className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>
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
  /** i bottoni di questa stanza: stanno nella stessa riga, in fondo */
  destra?: ReactNode
  /**
   * se la stanza si scorre tutta insieme, o se dentro ha colonne che si
   * scorrono per conto loro
   */
  scorre?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex h-dvh flex-col bg-paper text-ink">
      <header className="flex min-h-[60px] shrink-0 items-center gap-3 border-b-[1.5px] border-ink bg-surface px-5 py-[10px]">
        {segno}
        <h1 className="bab-display m-0 shrink-0 text-[20px] leading-none font-bold">{nome}</h1>
        {sotto && <p className="m-0 min-w-0 flex-1 truncate text-[12px] text-ink-medio">{sotto}</p>}
        {!sotto && <span className="min-w-0 flex-1" />}
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
