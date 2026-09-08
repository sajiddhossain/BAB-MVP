import { useEffect } from 'react'
import { Guscio } from '../../ui/percorso/Guscio'
import { Riga, Scheda, icona } from '../../ui/percorso/pezzi'
import { riempi } from '../../copy/riempi'
import { useLingua } from '../../lib/lingua'
import { finisciLezione, useProgresso } from '../../lib/percorso'
import { LEZIONI, TINTE_LEZIONE, passiDi } from '../../data/percorso'
import type { Passo } from '../../data/percorso'
import type { PropsEsercizio } from './tipi'
import medaglia from '../../assets/percorso/medaglia.svg'
import scintilla from '../../assets/percorso/scintilla.svg'
import coppa from '../../assets/percorso/coppa.svg'
import spuntaGrande from '../../assets/percorso/spunta-grande.svg'

/** Le tinte dei cerchietti delle due parole, nell'ordine del disegno. */
const TINTE = ['#ffd1c1', '#e9d5ff']

/**
 * La lezione e' finita.
 *
 * ── QUI SI SCRIVE, E SI SCRIVE ENTRANDO ────────────────────────────────────
 * `finisciLezione` parte appena lo schermo compare, non quando si preme il
 * bottone in fondo. Chi arriva fin qui la lezione l'ha fatta: chiudere l'app
 * su questo schermo invece di premere "torna al percorso" non e' un motivo
 * per rifarla domani.
 *
 * Si scrive prima nel telefono e poi nel database, e la scrittura e' un
 * `upsert`: rientrare in una lezione gia' fatta non rompe niente e non
 * sblocca niente due volte.
 *
 * ── QUATTRO FORME, PERCHE' IL DISEGNO NE HA QUATTRO ────────────────────────
 * La medaglia grande con la scheda del progresso, la scintilla con le due
 * parole a pastiglia e la barra, la coppa piccola con gli otto pallini, la
 * coppa in mezzo dentro a un alone con la percentuale accanto al conteggio.
 * Le lezioni piu' avanti ne aggiungeranno altre.
 */
export function Fatto({
  passo,
  lezione,
  testi,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'fatto' }>>) {
  const { ts } = useLingua()
  const t = testi.fatto
  const progresso = useProgresso()

  useEffect(() => {
    void finisciLezione(lezione)
  }, [lezione])

  const incontri = (passiDi(lezione) ?? []).filter((p) => p.tipo === 'incontra')
  const tutte = LEZIONI.length * 2
  const sbloccate = progresso.fatte.length * 2
  const numeri = { fatte: sbloccate, tutte, restano: tutte - sbloccate }
  /* quanto ha aggiunto questa lezione: due parole su sedici, cioe' il 12% */
  const quota = Math.floor((2 / tutte) * 100)

  return (
    <Guscio avanzamento={avanzamento} indietro={indietro} azione={t.azione} onAzione={avanti}>
      {passo.forma === 'stat' && (
        <div className="relative mx-auto mt-[6px] flex size-[140px] items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{ background: 'linear-gradient(135deg, #ffd1c1, #e9d5ff)' }}
          />
          <img src={medaglia} alt="" aria-hidden className="relative size-[70px]" />
        </div>
      )}
      {passo.forma === 'scintilla' && (
        <div className="mx-auto mt-[26px] flex size-[150px] items-center justify-center">
          <img src={scintilla} alt="" aria-hidden className="size-[60px]" />
        </div>
      )}
      {passo.forma === 'coppa' && (
        <span
          className="mt-[20px] flex size-16 items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(135deg, #ffd1c1, #e9d5ff)' }}
        >
          <img src={coppa} alt="" aria-hidden className="size-8" />
        </span>
      )}
      {passo.forma === 'spunta' && (
        <div className="mx-auto mt-[6px] flex size-[120px] items-center justify-center">
          <img src={spuntaGrande} alt="" aria-hidden className="size-[80px]" />
        </div>
      )}
      {passo.forma === 'trofeo' && (
        <div className="relative mx-auto mt-[10px] flex size-[140px] items-center justify-center">
          {/* l'alone: e' un cerchio sfumato che sta dietro alla coppa, non un bordo */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full opacity-60 blur-[2px]"
            style={{ background: 'radial-gradient(circle, #e9d5ff 0%, transparent 70%)' }}
          />
          <img src={coppa} alt="" aria-hidden className="relative size-[67px]" />
        </div>
      )}

      <h1
        className={`bab-display m-0 text-[28px] leading-[34px] font-bold tracking-[-0.56px] text-ink ${
          passo.forma === 'coppa' || passo.forma === 'spunta' ? 'mt-[26px]' : 'mt-5 text-center'
        }`}
      >
        {t.titolo}
      </h1>

      {/*
        Nella forma `trofeo` l'etichetta sta sopra alla riga di sotto e non
        sotto: li' non annuncia le due parole, dice che lezione si e' finita.
      */}
      {t.etichetta && passo.forma === 'trofeo' && (
        <p className="m-0 mt-[30px] text-[10px] font-bold tracking-[1px] uppercase text-lilla">
          {t.etichetta}
        </p>
      )}

      {t.sotto && (
        <p
          className={`m-0 text-[15px] leading-[1.4] text-ink-soft ${
            passo.forma === 'coppa' || passo.forma === 'spunta'
              ? 'mt-4'
              : passo.forma === 'trofeo'
                ? 'mt-[6px]'
                : 'mt-4 text-center'
          }`}
        >
          {riempi(t.sotto, { ...numeri, uno: nome(incontri, 0, ts), due: nome(incontri, 1, ts) })}
        </p>
      )}

      {t.etichetta && passo.forma !== 'trofeo' && (
        <p
          className={`m-0 text-[10px] font-bold tracking-[1px] uppercase text-lilla ${
            passo.forma === 'coppa' || passo.forma === 'spunta'
              ? 'mt-[30px]'
              : 'mt-[26px] text-center'
          }`}
        >
          {t.etichetta}
        </p>
      )}

      {/* le due parole appena sbloccate: schede, pastiglie, o righe con icona */}
      {(passo.forma === 'stat' || passo.forma === 'trofeo') && (
        <div className="mt-[19px] grid grid-cols-2 gap-3">
          {incontri.map((p, i) => (
            <div
              key={p.parola}
              className="flex flex-col items-center rounded-[20px] border-[0.5px] border-[rgba(209,201,196,0.5)] bg-surface px-3 py-5 shadow-[0px_6px_20px_0px_rgba(0,0,0,0.04)]"
            >
              <span
                className="flex size-10 items-center justify-center rounded-full"
                style={{ background: TINTE[i % TINTE.length] }}
              >
                <img src={icona(p.icona)} alt="" aria-hidden className="size-5" />
              </span>
              <p className="m-0 mt-4 text-center text-[18px] font-bold text-ink">
                {ts.foglio.parole[p.parola] ?? p.parola}
              </p>
              <p className="m-0 mt-2 text-center text-[12px] leading-[1.4] text-ink-soft">
                {t.righe?.[i]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/*
        Nella forma `spunta` le due parole stanno in una scheda sola, una per
        riga: il pallino colorato, il nome, e la descrizione a destra.
      */}
      {passo.forma === 'spunta' && (
        <div className="mt-[14px]">
          <Scheda riga="linear-gradient(to bottom, #ffd1c1, var(--color-lime))">
            <div className="px-5 py-[18px] pl-[26px]">
              {incontri.map((p, i) => (
                <div key={p.parola}>
                  {i > 0 && <Riga />}
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="size-3 shrink-0 rounded-full"
                      style={{ background: TINTE[i % TINTE.length] }}
                    />
                    <span className="text-[15px] font-bold text-ink">
                      {ts.foglio.parole[p.parola] ?? p.parola}
                    </span>
                    <span className="ml-auto text-right text-[13px] leading-[1.3] text-ink-soft">
                      {t.righe?.[i]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Scheda>
        </div>
      )}

      {passo.forma === 'scintilla' && (
        <div className="mt-[22px] flex items-center justify-center gap-3">
          {incontri.map((p, i) => (
            <span
              key={p.parola}
              className="rounded-pill px-5 py-[10px] text-[15px] font-bold text-ink"
              style={{ background: TINTE[i % TINTE.length] }}
            >
              {ts.foglio.parole[p.parola] ?? p.parola}
            </span>
          ))}
        </div>
      )}

      {passo.forma === 'coppa' && (
        <div className="mt-[14px] grid grid-cols-2 gap-3">
          {incontri.map((p, i) => (
            <div
              key={p.parola}
              className="flex items-center gap-3 rounded-[16px] border-[0.5px] border-[rgba(209,201,196,0.5)] bg-surface px-4 py-3 shadow-[0px_6px_20px_0px_rgba(0,0,0,0.04)]"
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full"
                style={{ background: TINTE[i % TINTE.length] }}
              >
                <img src={icona(p.icona)} alt="" aria-hidden className="size-[14px]" />
              </span>
              <span className="truncate text-[15px] font-bold text-ink">
                {ts.foglio.parole[p.parola] ?? p.parola}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* la scheda del progresso: cambia cosa mostra sotto al conteggio */}
      <div
        className={`relative overflow-hidden rounded-[20px] border px-5 py-[22px] ${
          passo.forma === 'stat'
            ? 'mt-5 flex items-center gap-3'
            : `border-[0.5px] border-[rgba(209,201,196,0.5)] bg-surface pl-[30px] shadow-[0px_6px_20px_0px_rgba(0,0,0,0.04)] ${
                passo.forma === 'trofeo' || passo.forma === 'spunta'
                  ? 'mt-[26px] flex items-center gap-3'
                  : 'mt-[26px]'
              }`
        }`}
        style={
          passo.forma === 'stat'
            ? { borderColor: '#a3e635', background: 'linear-gradient(to right, #ecfccb, #d9f99d)' }
            : undefined
        }
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[6px]"
          style={{
            background:
              passo.forma === 'stat'
                ? '#a3e635'
                : 'linear-gradient(to bottom, #ffd1c1, var(--color-lime))',
          }}
        />
        <span className="min-w-0 flex-1">
          <span
            className={`block text-[10px] font-bold tracking-[1px] uppercase ${
              passo.forma === 'stat' ? 'text-[#2b662b]' : 'text-lilla'
            }`}
          >
            {t.etichettaProgresso}
          </span>
          <span
            className={`mt-[6px] block font-bold text-ink ${
              passo.forma === 'stat' ? 'text-[18px]' : 'bab-display text-[22px] leading-[28px]'
            }`}
          >
            {riempi(t.conteggio, numeri)}
          </span>

          {passo.forma === 'scintilla' && (
            <span className="mt-4 block h-[10px] overflow-hidden rounded-pill bg-chip">
              <span
                className="bab-avanzamento block h-full rounded-pill"
                style={{
                  width: `${(sbloccate / tutte) * 100}%`,
                  background: 'linear-gradient(to right, var(--color-lime), #a3e635)',
                }}
              />
            </span>
          )}

          {/* gli otto pallini: uno per lezione, accesi quelle finite */}
          {passo.forma === 'coppa' && (
            <span className="mt-4 flex gap-[6px]">
              {LEZIONI.map((l, i) => (
                <span
                  key={l.numero}
                  className="flex h-[17px] flex-1 items-center justify-center rounded-[9px] border border-line text-[9px] font-bold text-ink"
                  style={{
                    background: progresso.fatte.includes(l.numero)
                      ? TINTE_LEZIONE[i]
                      : 'transparent',
                  }}
                >
                  U{l.numero}
                </span>
              ))}
            </span>
          )}
        </span>

        {(passo.forma === 'stat' || passo.forma === 'trofeo' || passo.forma === 'spunta') && (
          <span
            className={`shrink-0 rounded-pill px-3 py-[6px] text-[13px] font-bold ${
              passo.forma === 'stat' ? 'bg-surface text-[#2b662b]' : 'bg-chip text-lilla'
            }`}
          >
            +{quota}%
          </span>
        )}
      </div>
    </Guscio>
  )
}

/** Il nome della parola numero `i` della lezione, per i buchi del testo. */
function nome(
  incontri: Extract<Passo, { tipo: 'incontra' }>[],
  i: number,
  ts: { foglio: { parole: Record<string, string> } },
): string {
  const p = incontri[i]?.parola
  return p ? (ts.foglio.parole[p] ?? p) : ''
}
