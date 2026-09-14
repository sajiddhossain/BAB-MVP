import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { leggiAtlete } from '../../lib/admin'
import type { Atleta } from '../../lib/admin'
import { leggiImpostazioniAtleta, leggiOrari, salvaImpostazioniAtleta, salvaOrari } from '../../lib/gestione'
import { MINUTI_MAX, ORARI_DI_PARTENZA, minutiDalRisveglio } from '../../lib/impostazioni'
import type { Orari, Orario } from '../../lib/impostazioni'
import { Telaio } from './Telaio'
import { ElencoSezioni } from './Sezioni'
import { CAMPO, CampoMinuti, Iniziale, Riquadro, Tasto } from './pezzi'

/**
 * Le cose che si cambiano al volo, in un posto solo.
 *
 * Gli orari di check-in e check-out, gli account di prova, le sezioni
 * dell'app. Niente bozza: come le sezioni, quello che si salva qui vale
 * subito — le atlete lo trovano la prossima volta che aprono l'app.
 *
 * ── GLI ORARI SI SALVANO INSIEME ───────────────────────────────────────────
 * I due riquadri degli orari hanno un bottone solo. Stanno nella stessa riga
 * del database, e salvarne meta' lascerebbe per un momento un giorno con i
 * margini nuovi e le finestre fisse vecchie.
 *
 * Le eccezioni di una singola atleta non stanno qui: stanno nella sua
 * scheda, dove si guarda lei.
 */
export function Impostazioni() {
  const [orari, setOrari] = useState<Orari | null>(null)
  const [salvati, setSalvati] = useState<Orari | null>(null)
  const [errore, setErrore] = useState<string | null>(null)
  const [avviso, setAvviso] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    void leggiOrari().then((e) => {
      if (e.ok) {
        setOrari(e.dato)
        setSalvati(e.dato)
      } else {
        setErrore(e.perche)
        setOrari(ORARI_DI_PARTENZA)
        setSalvati(ORARI_DI_PARTENZA)
      }
    })
  }, [])

  useEffect(() => {
    if (!avviso) return
    const t = setTimeout(() => setAvviso(null), 5000)
    return () => clearTimeout(t)
  }, [avviso])

  const problemi = orari ? controlla(orari) : []
  const cambiati = !!orari && !!salvati && JSON.stringify(orari) !== JSON.stringify(salvati)

  async function salva() {
    if (!orari || problemi.length || salvo) return
    setSalvo(true)
    setErrore(null)
    const e = await salvaOrari(orari)
    setSalvo(false)
    if (!e.ok) return setErrore(e.perche)
    setSalvati(orari)
    setAvviso('Orari salvati. Le atlete li trovano la prossima volta che aprono l’app.')
  }

  const fissa = (k: 'checkin' | 'checkout', campo: keyof Orario, v: string) =>
    orari && setOrari({ ...orari, fisse: { ...orari.fisse, [k]: { ...orari.fisse[k], [campo]: v } } })

  return (
    <Telaio nome="Impostazioni" sotto="Quello che salvi qui vale subito, per tutte">
      <div className="mx-auto flex max-w-[780px] flex-col gap-4 p-4 md:p-6">
        {orari && (
          <>
            <Riquadro titolo="Orari attorno all’allenamento">
              <p className="m-0 mb-3 text-[12.5px] leading-[1.55] text-ink-medio">
                Nei giorni in cui ha scritto gli orari dell’allenamento. Si possono cambiare anche per
                una sola atleta, dalla sua scheda.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <CampoMinuti
                  nome="Il check-in apre"
                  dopo="minuti prima dell’allenamento"
                  valore={orari.prima}
                  onCambia={(v) => setOrari({ ...orari, prima: v ?? Number.NaN })}
                  max={MINUTI_MAX}
                />
                <CampoMinuti
                  nome="Il check-out resta aperto"
                  dopo="minuti dopo la fine"
                  valore={orari.dopo}
                  onCambia={(v) => setOrari({ ...orari, dopo: v ?? Number.NaN })}
                  max={MINUTI_MAX}
                />
                <CampoMinuti
                  nome="Si può recuperare"
                  dopo="minuti dopo, in ritardo"
                  valore={orari.ritardo}
                  onCambia={(v) => setOrari({ ...orari, ritardo: v ?? Number.NaN })}
                  max={MINUTI_MAX}
                />
              </div>
              <p className="m-0 mt-3 text-[11.5px] leading-[1.5] text-ink-mute">
                Con 0 in «Si può recuperare», finito il suo momento il check-in e il check-out non si fanno
                più.
              </p>
            </Riquadro>

            <Riquadro titolo="Orari dei giorni senza orari">
              <p className="m-0 mb-3 text-[12.5px] leading-[1.55] text-ink-medio">
                Giorni di riposo, sola educazione fisica, o chi non ha scritto gli orari dell’allenamento.
                Il giorno dell’atleta comincia alle 04:00: un check-out all’una di notte è ancora della
                sera prima.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[440px] border-collapse text-[12.5px]">
                  <thead>
                    <tr className="text-left text-[10.5px] tracking-[0.4px] text-ink-mute uppercase">
                      <th className="pb-2 font-bold" />
                      <th className="pb-2 font-bold">Apre</th>
                      <th className="pb-2 font-bold">Chiude</th>
                      <th className="pb-2 font-bold">Si recupera fino alle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['checkin', 'checkout'] as const).map((k) => (
                      <tr key={k} className="border-t border-riga">
                        <th scope="row" className="py-2 pr-3 text-left text-[13px] font-bold whitespace-nowrap">
                          {k === 'checkin' ? 'Check-in' : 'Check-out'}
                        </th>
                        {(['apre', 'chiude', 'ultimo'] as const).map((campo) => (
                          <td key={campo} className="py-2 pr-2">
                            <input
                              type="time"
                              value={orari.fisse[k][campo]}
                              onChange={(e) => fissa(k, campo, e.target.value)}
                              aria-label={`${k === 'checkin' ? 'Check-in' : 'Check-out'}: ${
                                campo === 'apre' ? 'apre' : campo === 'chiude' ? 'chiude' : 'si recupera fino alle'
                              }`}
                              className={`${CAMPO} w-[112px] tabular-nums`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Riquadro>

            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
              {problemi.length > 0 && (
                <ul className="m-0 list-none p-0 text-[12.5px] font-bold text-rosso sm:mr-auto">
                  {problemi.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
              {avviso && (
                <p role="status" className="m-0 text-[12.5px] font-bold text-verde-acceso sm:mr-auto">
                  {avviso}
                </p>
              )}
              {errore && <p className="m-0 text-[12.5px] font-bold text-rosso sm:mr-auto">{errore}</p>}
              <Tasto onClick={() => salvati && setOrari(salvati)} disabled={!cambiati || salvo}>
                Annulla
              </Tasto>
              <Tasto tipo="primo" onClick={() => void salva()} disabled={!cambiati || problemi.length > 0 || salvo}>
                {salvo ? 'Salvo…' : 'Salva gli orari'}
              </Tasto>
            </div>
          </>
        )}

        <AccountDiProva />

        <Riquadro titolo="Le sezioni dell’app">
          <ElencoSezioni />
        </Riquadro>
      </div>
    </Telaio>
  )
}

/** quello che non va negli orari, in parole: se c'e' qualcosa, non si salva */
function controlla(o: Orari): string[] {
  const fuori: string[] = []
  if (![o.prima, o.dopo, o.ritardo].every(Number.isFinite)) fuori.push('Manca un numero di minuti.')
  else if ([o.prima, o.dopo, o.ritardo].some((n) => n > MINUTI_MAX)) fuori.push(`I minuti vanno da 0 a ${MINUTI_MAX}.`)
  for (const k of ['checkin', 'checkout'] as const) {
    const f = o.fisse[k]
    const nome = k === 'checkin' ? 'check-in' : 'check-out'
    if (!f.apre || !f.chiude || !f.ultimo) {
      fuori.push(`Manca un’ora nel ${nome}.`)
      continue
    }
    // contate dalle quattro del mattino, e il fondo del giorno e' 1440 e non 0
    const a = minutiDalRisveglio(f.apre)
    const c = minutiDalRisveglio(f.chiude) || 1440
    const u = minutiDalRisveglio(f.ultimo) || 1440
    if (c <= a) fuori.push(`Nel ${nome} l’ora in cui chiude viene prima di quella in cui apre.`)
    else if (u < c) fuori.push(`Nel ${nome} il recupero finisce prima che il momento chiuda.`)
  }
  return fuori
}

/**
 * Chi e' di prova.
 *
 * Accendere e spegnere passa dalla stessa riga delle eccezioni della
 * scheda: si rilegge prima di scrivere, cosi' togliere la prova non cancella
 * gli orari speciali che quella persona aveva.
 */
function AccountDiProva() {
  const [atlete, setAtlete] = useState<Atleta[] | null>(null)
  const [letto, setLetto] = useState(false)
  const [scelta, setScelta] = useState('')
  const [giro, setGiro] = useState(0)
  const [lavoro, setLavoro] = useState(false)
  const [avviso, setAvviso] = useState<{ testo: string; male?: boolean } | null>(null)

  useEffect(() => {
    void leggiAtlete().then((a) => {
      setAtlete(a)
      setLetto(true)
    })
  }, [giro])

  const prove = (atlete ?? []).filter((a) => a.is_test)
  const altre = (atlete ?? []).filter((a) => !a.is_test).sort((x, y) => x.display_name.localeCompare(y.display_name, 'it'))

  async function imposta(id: string, prova: boolean) {
    setLavoro(true)
    const ora = await leggiImpostazioniAtleta(id)
    const e = ora.ok ? await salvaImpostazioniAtleta(id, { ...ora.dato, prova }) : ora
    setLavoro(false)
    if (!e.ok) return setAvviso({ testo: e.perche, male: true })
    setScelta('')
    setAvviso({ testo: prova ? 'Account di prova acceso.' : 'Tornata un account come gli altri.' })
    setGiro((g) => g + 1)
  }

  return (
    <Riquadro titolo="Account di prova">
      <p className="m-0 text-[12.5px] leading-[1.55] text-ink-medio">
        Per mostrare l’app o provarla senza aspettare l’ora giusta. Su questi account check-in e
        check-out sono sempre aperti e si possono rifare: il nuovo sostituisce quello di oggi. I loro
        dati si salvano, ma restano fuori dai numeri e dai file di tutte.
      </p>

      {letto && !atlete && <p className="m-0 mt-3 text-[12.5px] text-ink-medio">Non riesco a leggere le atlete.</p>}

      {atlete && (
        <>
          <ul className="m-0 mt-3 flex list-none flex-col p-0">
            {prove.length === 0 && <li className="text-[12.5px] text-ink-mute">Nessun account di prova.</li>}
            {prove.map((a) => (
              <li key={a.id} className="flex items-center gap-3 border-t border-riga py-2 first:border-t-0">
                <Link to={`/admin/atlete/${a.id}`} className="flex min-w-0 flex-1 items-center gap-[10px] text-ink no-underline">
                  <Iniziale id={a.id} nome={a.display_name} />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-bold">{a.display_name}</span>
                    <span className="block truncate text-[11.5px] text-ink-mute">{a.email ?? a.id.slice(0, 8)}</span>
                  </span>
                </Link>
                <Tasto piccolo onClick={() => void imposta(a.id, false)} disabled={lavoro}>
                  Togli
                </Tasto>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-col gap-2 border-t border-riga pt-3 sm:flex-row">
            <select
              value={scelta}
              onChange={(e) => setScelta(e.target.value)}
              aria-label="Account da rendere di prova"
              className={`${CAMPO} min-w-0 flex-1`}
            >
              <option value="">Scegli un account…</option>
              {altre.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.display_name}
                  {a.email ? ` · ${a.email}` : ''}
                </option>
              ))}
            </select>
            <Tasto tipo="primo" piccolo onClick={() => void imposta(scelta, true)} disabled={!scelta || lavoro}>
              Rendi di prova
            </Tasto>
          </div>
        </>
      )}

      {avviso && (
        <p role="status" className={`m-0 mt-2 text-[12.5px] font-bold ${avviso.male ? 'text-rosso' : 'text-verde-acceso'}`}>
          {avviso.testo}
        </p>
      )}
    </Riquadro>
  )
}
