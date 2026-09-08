import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sfondo } from '../ui/Sfondo'
import { riempi } from '../copy/riempi'
import { Bottone } from '../ui/Bottone'
import { Testata } from '../ui/casa/Testata'
import { BarraSotto } from '../ui/casa/BarraSotto'
import { SchedaEroe } from '../ui/casa/SchedaEroe'
import { SchedaPercorso } from '../ui/casa/SchedaPercorso'
import { useLingua } from '../lib/lingua'
import { ora as formattaOra, oraDaTesto } from '../lib/ore'
import { useRisposte } from '../lib/risposte'
import {
  allenamentoDiOggi,
  caricaGiornata,
  riassuntoDelGiorno,
  statoDiOggi,
  useGiornata,
} from '../lib/giornata'
import { oraApertura, statoFinestra } from '../lib/finestre'
import type { TipoSessione } from '../lib/finestre'
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

/**
 * L'orologio finto di `?ora=`.
 *
 * Torna `null` per qualunque cosa non sia `HH:MM`, cosi' un indirizzo storto
 * non manda la home in un giorno impossibile: si guarda l'ora vera e basta.
 */
function oraFinta(testo: string | null): Date | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(testo ?? '')
  if (!m) return null
  const ore = Number(m[1])
  const minuti = Number(m[2])
  if (ore > 23 || minuti > 59) return null
  const d = new Date()
  d.setHours(ore, minuti, 0, 0)
  return d
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

  /*
   * Ogni volta che si torna qui si richiede al database cos'e' stato fatto
   * oggi. E' la stessa query dell'avvio, e serve al caso piu' banale: la
   * sessione l'ha finita da un altro telefono, o l'aveva finita ieri sera e
   * l'app e' rimasta aperta in tasca fino a stamattina.
   */
  useEffect(() => {
    void caricaGiornata()
  }, [])

  /*
   * `?ora=07:30` sposta l'orologio, ma solo per questa schermata.
   *
   * Serve alla stessa cosa di `?stato=`: guardare come si vede la home alle
   * sette di mattina senza aspettare le sette di mattina. Non apre niente —
   * chi preme il bottone finisce comunque contro la finestra vera, che sta
   * dentro al check-in e non guarda l'indirizzo.
   */
  const adesso = oraFinta(query.get('ora')) ?? new Date()

  const forzato = query.get('stato') as StatoGiornata | null
  const stato: StatoGiornata =
    forzato && ['checkin', 'checkout', 'fatto', 'riposo'].includes(forzato)
      ? forzato
      : statoDiOggi(giornata, adesso)

  const allenamento = allenamentoDiOggi(adesso)
  const nome = risposte.nome
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
            streak={giornata.striscia}
          />

          <div className="mt-[15px]">
            {stato === 'checkin' && (
              <Checkin ora={oraDaTesto(allenamento.ora, lingua)} adesso={adesso} />
            )}
            {stato === 'checkout' && <Checkout previsto={giornata.previsto} adesso={adesso} />}
            {stato === 'fatto' && <Fatto />}
            {stato === 'riposo' && <Riposo adesso={adesso} />}
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

/**
 * Il posto del bottone.
 *
 * Quando e' ora c'e' il bottone. Quando non e' ancora ora, o quando il
 * momento e' passato per sempre, al suo posto c'e' una riga che dice quando.
 * Il bottone non diventa grigio: un bottone grigio invita a premerlo e non
 * spiega niente, e chi non capisce perche' non funziona pensa che sia rotta
 * l'app, non che sia presto.
 *
 * Quando il momento e' passato ma si puo' ancora fare, il bottone resta e la
 * riga si aggiunge sotto. Il tono conta: la riga dice che si puo' ancora
 * fare, non che e' in ritardo. Un'app che rimprovera un'atleta di dodici anni
 * per un'ora di ritardo si fa chiudere, e con lei si chiude il dato.
 */
function Azione({
  tipo,
  adesso,
  children,
}: {
  tipo: TipoSessione
  adesso: Date
  children: ReactNode
}) {
  const { t } = useLingua()
  const f = t.casa.finestra
  const stato = statoFinestra(tipo, adesso)

  if (stato === 'presto') {
    const modello = tipo === 'checkin' ? f.checkinPresto : f.checkoutPresto
    return <Riga>{riempi(modello, { ora: oraApertura(tipo) })}</Riga>
  }

  /*
   * Chiusa capita solo al check-in: dopo le 15:30 la giornata e' passata al
   * check-out. Il check-out invece non chiude mai davvero — alle quattro del
   * mattino il giorno cambia, e con lui la scheda.
   */
  if (stato === 'chiusa') {
    return <Riga>{riempi(f.checkinChiuso, { ora: oraApertura('checkin') })}</Riga>
  }

  return (
    <>
      {children}
      {stato === 'ritardo' && (
        <Riga sopra>{tipo === 'checkin' ? f.checkinRitardo : f.checkoutRitardo}</Riga>
      )}
    </>
  )
}

function Riga({ children, sopra = false }: { children: ReactNode; sopra?: boolean }) {
  return (
    <p
      className={`m-0 text-center text-[12.5px] leading-[1.45] font-medium text-ink-medio ${
        sopra ? 'mt-[10px]' : ''
      }`}
    >
      {children}
    </p>
  )
}

/* ── home-1: c'e' l'allenamento e il check-in e' da fare ─────────────────── */
function Checkin({ ora, adesso }: { ora: string; adesso: Date }) {
  const { t } = useLingua()
  const vai = useNavigate()
  return (
    <SchedaEroe
      stato="checkin"
      etichetta={riempi(t.casa.checkin.etichetta, { ora })}
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
        <Azione tipo="checkin" adesso={adesso}>
          <Bottone onClick={() => vai('/sessione/checkin')}>{t.casa.checkin.azione}</Bottone>
        </Azione>
      </div>
    </SchedaEroe>
  )
}

/* ── home-2: la sessione e' finita, manca il check-out ───────────────────── */
function Checkout({ previsto, adesso }: { previsto: Tempo | null; adesso: Date }) {
  const { t } = useLingua()
  const vai = useNavigate()
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
        <Azione tipo="checkout" adesso={adesso}>
          <Bottone onClick={() => vai('/sessione/checkout')}>{t.casa.checkout.azione}</Bottone>
        </Azione>
      </div>
    </SchedaEroe>
  )
}

/* ── home-3: fatto tutto, e c'e' qualcosa da segnalare ───────────────────── */
function Fatto() {
  const { t, ts } = useLingua()
  const g = useGiornata()
  // non si tiene da parte: cambierebbe lingua e resterebbe indietro
  const riassunto = riassuntoDelGiorno(g.previsto, g.sentito, ts)
  return (
    <SchedaEroe
      stato="fatto"
      etichetta={t.casa.fatto.etichetta}
      titolo={t.casa.fatto.titolo}
      corpo={riassunto || undefined}
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
function Riposo({ adesso }: { adesso: Date }) {
  const { t } = useLingua()
  const vai = useNavigate()
  const { fattoCheckin } = useGiornata()
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
        {/*
          Nei giorni di riposo il giro e' uno solo, quello del mattino, con le
          stesse ore degli altri giorni: una regola sola da imparare, e i dati
          del mattino restano confrontabili fra i giorni con e senza
          allenamento.
        */}
        {fattoCheckin ? (
          <Riga>{t.casa.finestra.fatto}</Riga>
        ) : (
          <Azione tipo="checkin" adesso={adesso}>
            <Bottone onClick={() => vai('/sessione/checkin')}>{t.casa.riposo.azione}</Bottone>
          </Azione>
        )}
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
      riempi(t.casa.settimana.valori.checkin, {
        fatti: giorniAllenamento,
        su: giorniAllenamento,
      }),
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
