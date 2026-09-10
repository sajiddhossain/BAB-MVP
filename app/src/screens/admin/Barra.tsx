import { Link } from 'react-router-dom'
import type { Lingua } from '../../lib/lingua'

/**
 * La barra in cima alla scrivania.
 *
 * Ci sono le tre cose che valgono per tutte le scritte e non per lo schermo
 * aperto: in che lingua stai scrivendo, cosa stai cercando, e quante bozze
 * aspettano di essere pubblicate.
 *
 * Prima erano sparse: la lingua in un angolo della barra laterale, la ricerca
 * chiusa dentro a un elenco in fondo alla colonna destra, e le bozze in
 * attesa solo come numero su un bottone che compariva e spariva. Tre cose che
 * riguardano tutto, in tre posti che riguardavano una parte.
 *
 * Le sezioni dell'app stavano qui dentro, dietro a un interruttore che
 * scambiava mezza pagina. Adesso sono una stanza a se' nell'atrio: non hanno
 * niente a che vedere con le parole, e tenerle qui voleva dire che per
 * accendere il percorso bisognava prima entrare nei testi.
 */
export function Barra({
  lingua,
  onLingua,
  cerca,
  onCerca,
  quanteBozze,
  onBozze,
}: {
  lingua: Lingua
  onLingua: (l: Lingua) => void
  cerca: string
  onCerca: (v: string) => void
  quanteBozze: number
  onBozze: () => void
}) {
  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-line bg-surface px-4 py-[10px]">
      <Link
        to="/admin"
        className="bab-tocco shrink-0 rounded-pill border border-line bg-chip px-3 py-[5px] text-[12px] font-bold text-ink-medio no-underline"
      >
        ← Pannello
      </Link>
      <p className="m-0 shrink-0 text-[14px] font-bold">Le parole</p>

      <div className="flex shrink-0 gap-1 rounded-pill bg-chip p-[3px]">
        {(['it', 'en'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onLingua(l)}
            aria-pressed={lingua === l}
            className={`bab-tocco rounded-pill px-3 py-1 text-[12px] font-bold ${
              lingua === l ? 'bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.10)]' : 'text-ink-medio'
            }`}
          >
            {l === 'it' ? 'Italiano' : 'English'}
          </button>
        ))}
      </div>

      {/*
        La ricerca sta qui e non piu' chiusa in fondo: e' la strada di chi sa
        cosa cercare ma non su quale schermo si legge, ed era a due click
        sotto la piega.
      */}
      <div className="relative min-w-0 flex-1">
        <input
          type="search"
          value={cerca}
          onChange={(e) => onCerca(e.target.value)}
          placeholder="Cerca una parola o una frase, in tutta l’app…"
          aria-label="Cerca una scritta"
          className="h-9 w-full rounded-pill border border-line bg-chip pr-9 pl-4 text-[12.5px] text-ink outline-none placeholder:text-ink-mute focus:border-verde-acceso focus:bg-surface"
        />
        {cerca !== '' && (
          <button
            type="button"
            onClick={() => onCerca('')}
            aria-label="Svuota la ricerca"
            className="absolute top-0 right-1 flex h-9 w-8 items-center justify-center text-[13px] text-ink-mute"
          >
            ✕
          </button>
        )}
      </div>

      {/*
        Il conto delle bozze c'e' sempre, anche a zero. Un bottone che compare
        solo quando c'e' qualcosa e' un bottone che non si impara: si scopre
        per caso, e quando serve non si sa dove guardare.
      */}
      <button
        type="button"
        onClick={onBozze}
        className={`bab-tocco shrink-0 rounded-pill border-[1.5px] px-4 py-[6px] text-[12px] font-bold ${
          quanteBozze > 0 ? 'border-line bg-lime' : 'border-line bg-chip text-ink-medio'
        }`}
      >
        {quanteBozze === 0
          ? 'Niente da pubblicare'
          : quanteBozze === 1
            ? '1 da pubblicare'
            : `${quanteBozze} da pubblicare`}
      </button>
    </header>
  )
}
