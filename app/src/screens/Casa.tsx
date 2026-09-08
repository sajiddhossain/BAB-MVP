import { useSearchParams } from 'react-router-dom'
import { Sfondo } from '../ui/Sfondo'
import { Bottone } from '../ui/Bottone'
import { Testata } from '../ui/casa/Testata'
import { BarraSotto } from '../ui/casa/BarraSotto'
import { SchedaEroe } from '../ui/casa/SchedaEroe'
import { SchedaPercorso } from '../ui/casa/SchedaPercorso'
import { useLingua } from '../lib/lingua'
import { ora as formattaOra, oraDaTesto } from '../lib/ore'
import { useRisposte } from '../lib/risposte'
import { allenamentoDiOggi, statoDiOggi, useGiornata } from '../lib/giornata'
import { TEMPI, CAMPI_RIPOSO } from '../data/casa'
import type { StatoGiornata, Tempo } from '../data/casa'

import carica from '../assets/casa/tempo-carica.svg'
import costante from '../assets/casa/tempo-costante.svg'
import leggero from '../assets/casa/tempo-leggero.svg'
import pallino from '../assets/casa/pallino-tempo.svg'
import allarme from '../assets/casa/allarme.svg'
import percorsoViola from '../assets/casa/percorso-viola.svg'
import percorsoRiposo from '../assets/casa/percorso-riposo.svg'
import campoSonno from '../assets/casa/campo-sonno.svg'
import campoEnergia from '../assets/casa/campo-energia.svg'
import campoScuola from '../assets/casa/campo-scuola.svg'
import campoUmore from '../assets/casa/campo-umore.svg'
import campoBodymap from '../assets/casa/campo-bodymap.svg'
import campoCiclo from '../assets/casa/campo-ciclo.svg'
import campoAntidolorifici from '../assets/casa/campo-antidolorifici.svg'

const ICONA_TEMPO: Record<Tempo, string> = { carica, costante, leggero }
const ICONA_CAMPO: Record<string, string> = {
  sonno: campoSonno,
  energia: campoEnergia,
  scuola: campoScuola,
  umore: campoUmore,
  bodymap: campoBodymap,
  ciclo: campoCiclo,
  antidolorifici: campoAntidolorifici,
}

/** L'etichetta della sezione fra la scheda grande e quella sotto. */
function Sezione({ children }: { children: string }) {
  return (
    <p className="m-0 mt-2 text-[11px] font-bold leading-[14px] tracking-[1.2px] text-ink-mute">
      {children}
    </p>
  )
}

/**
 * La home.
 *
 * In Figma sono quattro schermi; qui e' uno solo con quattro stati, perche'
 * quello che cambia e' la tinta della scheda grande e cosa c'e' dentro — la
 * testata, la barra in fondo e la forma delle schede sono le stesse.
 *
 * Lo stato lo decide la giornata: se oggi non ci si allena e' riposo, se non
 * ha ancora fatto il check-in e' check-in, e cosi' via. Con `?stato=` si puo'
 * forzare, che serve a guardarli tutti e quattro senza dover aspettare
 * mercoledi' — e non e' un modo per entrare da nessuna parte, cambia solo
 * cosa si vede.
 */
export function Casa() {
  const { t, lingua } = useLingua()
  const risposte = useRisposte()
  const giornata = useGiornata()
  const [query] = useSearchParams()

  const forzato = query.get('stato') as StatoGiornata | null
  const stato: StatoGiornata =
    forzato && ['checkin', 'checkout', 'fatto', 'riposo'].includes(forzato)
      ? forzato
      : statoDiOggi(giornata)

  const allenamento = allenamentoDiOggi()
  const nome = risposte.nome
  const adesso = new Date()
  const orologio = formattaOra(adesso.getHours(), adesso.getMinutes(), lingua)

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
        <Sfondo nodo="casa" />

        <div className="relative flex-1 overflow-y-auto px-[22px] pt-[calc(58px+env(safe-area-inset-top))] pb-[104px]">
          <Testata
            giorno={adesso}
            ora={stato === 'checkout' || stato === 'fatto' ? orologio : undefined}
            nome={nome}
            streak={giornata.streak}
          />

          <div className="mt-[15px]">
            {stato === 'checkin' && <Checkin ora={oraDaTesto(allenamento.ora, lingua)} />}
            {stato === 'checkout' && <Checkout previsto={giornata.previsto} />}
            {stato === 'fatto' && <Fatto />}
            {stato === 'riposo' && <Riposo />}
          </div>

          <Sezione>
            {stato === 'fatto'
              ? t.casa.sezioni.nientaltro
              : stato === 'riposo'
                ? t.casa.sezioni.percorso
                : t.casa.sezioni.intanto}
          </Sezione>

          <div className="mt-[10px]">
            {stato === 'fatto' ? (
              <SchedaPercorso
                occhiello={t.casa.percorsoCard.occhielloFatto}
                titolo={t.casa.percorsoCard.titoloFatto}
                sotto={t.casa.percorsoCard.sottoFatto}
                icona={percorsoViola}
                tinta="var(--color-viola-chiaro)"
              />
            ) : (
              <SchedaPercorso
                occhiello={
                  stato === 'riposo'
                    ? t.casa.percorsoCard.occhielloRiposo
                    : t.casa.percorsoCard.occhiello
                }
                titolo={t.casa.percorsoCard.titolo}
                sotto={
                  stato === 'riposo'
                    ? t.casa.percorsoCard.sottoRiposo
                    : t.casa.percorsoCard.sotto
                }
                icona={stato === 'riposo' ? percorsoRiposo : undefined}
              />
            )}
          </div>

          {stato === 'riposo' && (
            <div className="mt-[10px]">
              <Settimana />
            </div>
          )}
        </div>

        <BarraSotto />
      </div>
    </div>
  )
}

/* ── home-1: c'e' l'allenamento e il check-in e' da fare ─────────────────── */
function Checkin({ ora }: { ora: string }) {
  const { t } = useLingua()
  return (
    <SchedaEroe
      stato="checkin"
      etichetta={t.casa.checkin.etichetta(ora)}
      titolo={t.casa.checkin.titolo}
      corpo={t.casa.checkin.corpo}
    >
      {/* le tre anteprime del tempo: si vedono, non si toccano — il tempo si
          sceglie dentro al check-in, qui sono un assaggio di cosa chiedera' */}
      <div className="mt-3 flex gap-2">
        {TEMPI.map((tempo) => (
          <div
            key={tempo}
            className="flex h-[52px] flex-1 flex-col items-center justify-center gap-[2px] rounded-[14px] bg-white/65"
          >
            <img src={ICONA_TEMPO[tempo]} alt="" className="size-4" aria-hidden />
            <span className="text-[11px] font-bold text-ink">{t.casa.tempi[tempo]}</span>
          </div>
        ))}
      </div>

      <div className="mt-[14px]">
        <Bottone>{t.casa.checkin.azione}</Bottone>
      </div>
    </SchedaEroe>
  )
}

/* ── home-2: la sessione e' finita, manca il check-out ───────────────────── */
function Checkout({ previsto }: { previsto: Tempo | null }) {
  const { t } = useLingua()
  return (
    <SchedaEroe
      stato="checkout"
      etichetta={t.casa.checkout.etichetta}
      titolo={t.casa.checkout.titolo}
      corpo={t.casa.checkout.corpo}
    >
      {previsto && (
        <div className="mt-[22px] inline-flex h-[34px] items-center gap-2 rounded-[99px] bg-white/70 pl-[10px] pr-[14px]">
          <img src={pallino} alt="" className="size-3" aria-hidden />
          <span className="text-[11px] font-medium text-[#5b564c]">{t.casa.checkout.previsto}</span>
          <span className="text-[12px] font-bold text-ink">{t.casa.tempi[previsto]}</span>
        </div>
      )}

      <div className="mt-[14px]">
        <Bottone>{t.casa.checkout.azione}</Bottone>
      </div>
    </SchedaEroe>
  )
}

/* ── home-3: fatto tutto, e c'e' qualcosa da segnalare ───────────────────── */
function Fatto() {
  const { t } = useLingua()
  const g = useGiornata()
  return (
    <SchedaEroe
      stato="fatto"
      etichetta={t.casa.fatto.etichetta}
      titolo={t.casa.fatto.titolo}
      corpo={g.riassunto || undefined}
    >
      <div className="mt-1 rounded-[16px] bg-white/75 p-3">
        {/* quello che aveva previsto, e quello che ha sentito davvero */}
        <div className="flex items-center gap-3 px-1">
          {g.previsto && <Pastiglia tempo={g.previsto} />}
          <span className="text-[14px] font-bold text-ink-tenue" aria-hidden>
            →
          </span>
          {g.sentito && <Pastiglia tempo={g.sentito} />}
        </div>

        {g.segnalata && (
          <div className="mt-3 flex gap-3 rounded-[16px] bg-allarme-fondo p-3">
            <img src={allarme} alt="" className="mt-[2px] size-[13px] shrink-0" aria-hidden />
            <p className="m-0 text-[12px] font-bold leading-[1.4] text-allarme-testo">
              {t.casa.fatto.segnalazione}
            </p>
          </div>
        )}
      </div>
    </SchedaEroe>
  )
}

function Pastiglia({ tempo }: { tempo: Tempo }) {
  const { t } = useLingua()
  return (
    <span className="inline-flex h-8 flex-1 items-center gap-[6px] rounded-[99px] bg-chip pl-[9px] pr-3">
      <img src={ICONA_TEMPO[tempo]} alt="" className="size-4" aria-hidden />
      <span className="text-[12px] font-bold text-ink">{t.casa.tempi[tempo]}</span>
    </span>
  )
}

/* ── home-4: giorno senza allenamento ────────────────────────────────────── */
function Riposo() {
  const { t } = useLingua()
  return (
    <SchedaEroe
      stato="riposo"
      etichetta={t.casa.riposo.etichetta}
      titolo={t.casa.riposo.titolo}
      corpo={t.casa.riposo.corpo}
    >
      {/*
        Sette campi su due colonne, e l'ultimo largo il doppio. Nel disegno
        sono a coordinate fisse; qui e' una griglia, cosi' l'ultimo si prende
        le due colonne da solo invece che con una misura scritta a mano.
      */}
      <div className="mt-[14px] grid grid-cols-2 gap-2">
        {CAMPI_RIPOSO.map((campo) => (
          <div
            key={campo}
            className={`flex h-[38px] items-center gap-2 rounded-[13px] bg-white/70 px-[7px] ${
              campo === 'antidolorifici' ? 'col-span-2' : ''
            }`}
          >
            <img src={ICONA_CAMPO[campo]} alt="" className="size-4 shrink-0" aria-hidden />
            <span className="truncate text-[12px] font-bold text-[#3a3648]">
              {t.casa.riposo.campi[campo]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-[14px]">
        <Bottone>{t.casa.riposo.azione}</Bottone>
      </div>
    </SchedaEroe>
  )
}

/* la scheda del riepilogo settimanale, sotto al percorso nei giorni di riposo */
function Settimana() {
  const { t } = useLingua()
  const r = useRisposte()
  const giorniAllenamento = new Set(Object.values(r.allenamenti).flatMap((a) => a.giorni)).size

  const righe: [string, string][] = [
    [
      t.casa.settimana.righe.checkin,
      t.casa.settimana.valori.checkin(giorniAllenamento, giorniAllenamento),
    ],
    [t.casa.settimana.righe.tempo, t.casa.tempi.costante],
    [t.casa.settimana.righe.parole, t.casa.settimana.valori.nessuna],
  ]

  return (
    <div className="overflow-hidden rounded-[22px] border border-line bg-surface px-[15px] py-[15px]">
      <p className="m-0 text-[13px] font-bold text-ink">{t.casa.settimana.titolo}</p>
      {righe.map(([nome, valore], i) => (
        <div key={nome}>
          {i > 0 && <div className="my-[9px] h-px bg-riga" />}
          <div className={`flex items-baseline justify-between gap-3 ${i === 0 ? 'mt-[19px]' : ''}`}>
            <span className="text-[13px] font-medium text-ink-medio">{nome}</span>
            <span className="text-right text-[13px] font-bold text-ink">{valore}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
