import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { leggiPolso } from '../../lib/admin'
import type { Polso } from '../../lib/admin'
import { Numero } from './pezzi'
import { Tessera } from './Telaio'

/**
 * L'atrio: la prima cosa che si vede entrando in /admin.
 *
 * Prima /admin era una stanza sola — le scritte — e tutto il resto sarebbe
 * dovuto entrare li' dentro, in un pannello sempre piu' pieno. Adesso e' un
 * atrio: si entra, si vede a colpo d'occhio come sta andando, e si sceglie
 * dove andare.
 *
 * ── LE STANZE CHE NON CI SONO ANCORA ───────────────────────────────────────
 * I numeri si vedono, ma non si aprono. E' voluto: un riquadro che dice "in
 * arrivo" dice due cose vere insieme — che quella cosa e' prevista, e che
 * oggi non c'e'. Un riquadro che si apre su una pagina vuota non dice niente
 * e fa perdere un click ogni volta.
 *
 * ── I NUMERI IN CIMA ───────────────────────────────────────────────────────
 * Sono quelli veri, letti da `admin_pulse`, e sono pochi perche' pochi ne
 * lascia leggere il database (il perche' sta in `lib/admin.ts`). Quando non
 * si e' collegate non compare uno zero: compare una riga che dice che non si
 * e' collegate. Uno zero finto e' peggio di nessun numero.
 */
export function Atrio() {
  const [polso, setPolso] = useState<Polso | null>(null)
  const [letto, setLetto] = useState(false)

  useEffect(() => {
    void leggiPolso().then((p) => {
      setPolso(p)
      setLetto(true)
    })
  }, [])

  return (
    <div className="min-h-full bg-paper text-ink">
      <div className="mx-auto max-w-[920px] px-4 py-6 md:px-6 md:py-10">
        {/* sul telefono l'atrio non ha ne' intestazione ne' barra laterale: il logo sta qui */}
        <div className="mb-4 md:hidden">
          <Tessera />
        </div>
        <p className="m-0 text-[11px] font-bold tracking-[1.2px] text-ink-mute uppercase">
          BAB · amministrazione
        </p>
        <h1 className="bab-display m-0 mt-[6px] text-[28px] leading-[1.1] font-bold md:text-[34px]">Cosa vuoi fare?</h1>

        <Polsi polso={polso} letto={letto} />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Stanza
            a="/admin/scritte"
            nome="Le parole"
            cosa="Ogni scritta dell’app, cambiata toccandola dentro allo schermo dov’è. Bozza prima, pubblicata quando decidi tu."
            segno="Aa"
          />
          <Stanza
            a="/admin/impostazioni"
            nome="Impostazioni"
            cosa="Gli orari di check-in e check-out, gli account di prova, le sezioni dell’app accese e spente. Vale subito."
            segno="⚙︎"
          />
          <Stanza
            a="/admin/atlete"
            nome="Le atlete"
            cosa="Chi c’è, cosa ha scritto, il suo corpo giorno per giorno. Una scheda per persona."
            segno="◍"
          />
          <Stanza
            nome="I numeri"
            cosa="Come sta andando il pilota: quante tornano, dove si arenano, cosa dice il corpo di tutte insieme."
            segno="◔"
            arrivo="Viene dopo le atlete: le stesse viste nuove, guardate dall’alto invece che una per una."
          />
        </div>
      </div>
    </div>
  )
}

/** La riga dei numeri veri, sotto al titolo. */
function Polsi({ polso, letto }: { polso: Polso | null; letto: boolean }) {
  if (!letto) {
    return <p className="m-0 mt-6 text-[13px] text-ink-mute">Leggo i numeri…</p>
  }
  if (!polso) {
    return (
      <p className="m-0 mt-6 text-[13px] text-ink-medio">
        Non riesco a leggere i numeri: o non sei collegata al database, o le viste
        <code className="mx-1 text-[12px]">admin_*</code>
        non ci sono.
      </p>
    )
  }
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
      <Numero quanto={polso.athletes} cosa="atlete" nota={`+${polso.athletes_new_7d} in sette giorni`} />
      <Numero quanto={polso.athletes_today} cosa="hanno fatto qualcosa oggi" />
      <Numero quanto={polso.checkins_7d} cosa="check-in in sette giorni" nota={`${polso.posts_7d} sono check-out`} />
      <Numero quanto={polso.signals_7d} cosa="sensazioni sul corpo, in sette giorni" />
      {polso.consents_refused > 0 && (
        <Numero quanto={polso.consents_refused} cosa="consensi rifiutati" allarme />
      )}
    </div>
  )
}

/**
 * Un riquadro dell'atrio.
 *
 * Con `a` e' una porta e si apre; con `arrivo` e' un cartello e dice perche'
 * non ancora. Le due cose si somigliano apposta — sono la stessa stanza in
 * due momenti — ma quella che non si apre non ha il bordo scuro ne' l'ombra:
 * a colpo d'occhio si vede quali si possono toccare senza doverle provare.
 */
function Stanza({
  a,
  nome,
  cosa,
  segno,
  arrivo,
}: {
  a?: string
  nome: string
  cosa: string
  segno: ReactNode
  arrivo?: string
}) {
  const dentro = (
    <>
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`flex size-9 shrink-0 items-center justify-center rounded-[10px] border-[1.5px] text-[15px] font-bold ${
            a ? 'border-line bg-lime' : 'border-line bg-chip text-ink-mute'
          }`}
        >
          {segno}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] leading-none font-bold">{nome}</span>
          <span className="mt-[7px] block text-[12.5px] leading-[1.5] text-ink-medio">{cosa}</span>
        </span>
      </div>
      {arrivo && (
        <span className="mt-3 block border-t border-riga pt-3 text-[11.5px] leading-[1.45] text-ink-mute">
          <span className="font-bold text-ink-medio">In arrivo.</span> {arrivo}
        </span>
      )}
    </>
  )

  if (!a) {
    return (
      <div className="rounded-[16px] border-[1.5px] border-dashed border-line bg-surface/60 p-5">
        {dentro}
      </div>
    )
  }
  return (
    <Link
      to={a}
      className="bab-tocco block rounded-[16px] border-[1.5px] border-ink bg-surface p-5 text-ink no-underline shadow-[4px_4px_0_rgba(44,44,58,0.18)]"
    >
      {dentro}
    </Link>
  )
}
