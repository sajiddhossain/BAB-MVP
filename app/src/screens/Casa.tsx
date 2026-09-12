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
import { svuotaCoda } from '../lib/sessione'
import {
  allenamentoDiOggi,
  caricaGiornata,
  consiglioDelGiorno,
  riassuntoDelGiorno,
  statoDiOggi,
  useGiornata,
} from '../lib/giornata'
import { oraApertura, statoFinestra } from '../lib/finestre'
import type { TipoSessione } from '../lib/finestre'
import { CAMPI_RIPOSO } from '../data/casa'
import type { StatoGiornata, Tempo } from '../data/casa'

import pallino from '../assets/casa/pallino-tempo.svg'
import lampadina from '../assets/casa/lampadina.svg'
import calendario from '../assets/casa/calendario.svg'
import spunta from '../assets/casa/spunta.svg'
import sorriso from '../assets/casa/sorriso.svg'
import campoSonno from '../assets/casa/campo-sonno.svg'
import campoEnergia from '../assets/casa/campo-energia.svg'
import campoScuola from '../assets/casa/campo-scuola.svg'
import campoUmore from '../assets/casa/campo-umore.svg'
import campoBodymap from '../assets/casa/campo-bodymap.svg'
import campoCiclo from '../assets/casa/campo-ciclo.svg'
import campoAntidolorifici from '../assets/casa/campo-antidolorifici.svg'

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
    void svuotaCoda()
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

          {/*
            Nei giorni di riposo sotto non c'e' il percorso ma il riepilogo
            della settimana: e' il giorno in cui guardarsi indietro ha senso,
            e due schede una sopra l'altra in un giorno che dovrebbe essere
            leggero sono una di troppo.
          */}
          <div className="mt-[10px]">
            {stato === 'riposo' ? (
              <Settimana />
            ) : stato === 'fatto' ? (
              <SchedaPercorso
                occhiello={t.casa.percorsoCard.occhielloFatto}
                sotto={t.casa.percorsoCard.sottoFatto}
              />
            ) : (
              <SchedaPercorso
                occhiello={t.casa.percorsoCard.occhiello}
                titolo={t.casa.percorsoCard.titolo}
                sotto={t.casa.percorsoCard.sotto}
              />
            )}
          </div>
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
      /*
        Senza l'ora dell'allenamento il puntino resterebbe appeso da solo in
        fondo all'etichetta. Capita solo nell'anteprima, dove gli allenamenti
        dell'onboarding non ci sono — ma un puntino appeso e' un difetto in
        qualunque posto compaia.
      */
      etichetta={riempi(t.casa.checkin.etichetta, { ora }).replace(/\s*·\s*$/, '')}
      titolo={t.casa.checkin.titolo}
      corpo={t.casa.checkin.corpo}
    >
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

/**
 * home-3: la giornata e' chiusa.
 *
 * Sotto alla frase del riepilogo c'e' una nota sola, con la lampadina, e dice
 * la cosa piu' utile che si possa dire guardando la settimana vera: vedi
 * `consiglioDelGiorno`.
 *
 * Il confronto fra previsto e sentito resta nella frase sopra e non e' piu'
 * anche due pastiglie: l'ha appena visto alla fine del check-out, e
 * rifarglielo vedere dieci secondi dopo non gli aggiunge niente.
 */
function Fatto() {
  const { t, ts } = useLingua()
  const g = useGiornata()
  // non si tiene da parte: cambierebbe lingua e resterebbe indietro
  const riassunto = riassuntoDelGiorno(g.previsto, g.sentito, ts)
  const consiglio = consiglioDelGiorno(g.settimana)
  return (
    <SchedaEroe
      stato="fatto"
      etichetta={t.casa.fatto.etichetta}
      titolo={t.casa.fatto.titolo}
      corpo={riassunto || undefined}
    >
      <div className="mt-1 rounded-[16px] bg-white/75 p-1">
        <div className="flex gap-3 rounded-[16px] bg-allarme-fondo px-3 py-[10px]">
          <img src={lampadina} alt="" className="mt-[3px] size-4 shrink-0" aria-hidden />
          <p className="m-0 text-[12px] leading-[1.4] text-allarme-testo">
            {t.casa.fatto.consigli[consiglio]}
          </p>
        </div>
      </div>
    </SchedaEroe>
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

/**
 * Il riepilogo della settimana, nei giorni di riposo.
 *
 * Due righe sole: quanti giorni di allenamento ha accompagnato con un
 * check-in, e come si e' sentita piu' spesso alla fine. I numeri sono quelli
 * veri (vedi `dellaSettimana`); il denominatore invece viene dall'onboarding,
 * perche' i giorni in cui si allena li ha detti lei e nel database non ci
 * sono — nessuno ci scrive gli allenamenti previsti.
 *
 * Il verde e' l'unico colore della scheda, e non e' un voto: e' lo stesso
 * verde delle cose fatte in tutto il resto dell'app. Se la settimana e'
 * andata male i numeri lo dicono da soli, senza bisogno del rosso.
 */
function Settimana() {
  const { t, ts } = useLingua()
  const r = useRisposte()
  const { settimana } = useGiornata()
  const allenamenti = new Set(Object.values(r.allenamenti).flatMap((a) => a.giorni)).size
  const facce = ts.soddisfazione.facce
  const sentita = settimana.sentita
  const faccia =
    sentita && sentita in facce ? facce[sentita as keyof typeof facce] : t.casa.settimana.nessuna

  return (
    <div
      className="overflow-hidden rounded-[22px] border border-riga p-4"
      style={{
        background:
          'linear-gradient(90deg, rgba(16,185,129,0.09) 0%, rgba(16,185,129,0) 100%), #faf9f5',
      }}
    >
      <div className="flex items-center gap-[10px]">
        <span className="flex size-7 items-center justify-center rounded-[14px] bg-verde-vivo/10">
          <img src={calendario} alt="" className="size-4" aria-hidden />
        </span>
        <span className="text-[13px] font-bold text-ink">{t.casa.settimana.titolo}</span>
      </div>

      <RigaSettimana icona={spunta} nome={t.casa.settimana.ascoltato}>
        <span className="text-[13px] font-bold text-ink">
          {riempi(t.casa.settimana.giorni, { fatti: settimana.fatti, su: allenamenti })}
        </span>
      </RigaSettimana>

      <div className="my-[10px] h-px bg-riga" />

      <RigaSettimana icona={sorriso} nome={t.casa.settimana.sentita}>
        <span className="rounded-pill bg-verde-vivo/10 px-[10px] py-1 text-[13px] font-bold text-ink">
          {faccia}
        </span>
      </RigaSettimana>
    </div>
  )
}

/**
 * Una riga del riepilogo: a sinistra cosa si misura, a destra quanto.
 *
 * Le due meta' vanno a capo invece di stringersi: su uno schermo stretto
 * "Hai ascoltato il tuo corpo" tagliato a meta' non dice piu' niente, mentre
 * su due righe dice ancora tutto.
 */
function RigaSettimana({
  icona,
  nome,
  children,
}: {
  icona: string
  nome: string
  children: ReactNode
}) {
  return (
    <div className="mt-[10px] flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <span className="flex items-center gap-2">
        <img src={icona} alt="" className="size-4 shrink-0" aria-hidden />
        <span className="text-[13px] font-medium text-ink-medio">{nome}</span>
      </span>
      {/* `ml-auto` per quando la riga va a capo: il valore resta a destra */}
      <span className="ml-auto">{children}</span>
    </div>
  )
}
