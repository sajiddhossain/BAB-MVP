import { Schermo } from '../../ui/Schermo'
import { Bottone } from '../../ui/Bottone'
import { Nota, Occhiello, Scheda, Titolo, icona } from '../../ui/tutorial/pezzi'
import { useLingua } from '../../lib/lingua'
import { bandaDi } from '../../data/tutorial'
import { useTutorial } from '../../lib/tutorial'
import type { PropsTutorial } from './tipi'

/* 20-reveal — 3889:363 / 3958:432 */
export function Confronto({ passo, nodo, verso, avanzamento, avanti, indietro }: PropsTutorial) {
  const { tt } = useLingua()
  const t = tt.confronto
  const ti = tt.indovina
  const { ipotesi, bpm } = useTutorial()

  /*
   * Senza numero non c'è niente da confrontare.
   *
   * Capita arrivando qui con l'indirizzo scritto a mano, o ricaricando dopo
   * aver svuotato i dati del sito. Si torna a contare invece di mostrare una
   * scheda con dentro dei trattini.
   */
  if (bpm === null || ipotesi === null) {
    return (
      <Schermo
        nodo={nodo}
        verso={verso}
        stacco={32}
        margini={24}
        avanzamento={avanzamento}
        indietro={indietro}
        azione={<Bottone onClick={indietro}>{tt.conta.via}</Bottone>}
      >
        <Occhiello segno={passo.segno}>{t.occhiello}</Occhiello>
        <Titolo>{t.titolo}</Titolo>
      </Schermo>
    )
  }

  const contata = bandaDi(bpm)
  const azzeccato = contata === ipotesi
  const nome = (b: typeof contata) => ti.carte[['lento', 'medio', 'veloce'].indexOf(b)].nome

  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      stacco={32}
      margini={24}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={<Bottone onClick={avanti}>{t.azione}</Bottone>}
    >
      <Occhiello segno={passo.segno}>{t.occhiello}</Occhiello>
      <Titolo>{t.titolo}</Titolo>

      <div className="mt-[26px]">
        <Scheda>
          <div className="px-[18px] py-[18px]">
            <p className="bab-display m-0 text-center text-[46px] leading-none font-extrabold text-[#ef545e]">
              {bpm}
            </p>
            <p className="m-0 mt-3 text-center text-[11px] tracking-[0.5px] text-ink-mute">
              {t.unita}
            </p>

            <div className="mt-4 flex gap-3">
              <Riquadro etichetta={t.tuaIpotesi} valore={nome(ipotesi)} buono />
              <Riquadro etichetta={t.haiContato} valore={nome(contata)} buono={azzeccato} />
            </div>

            <div className="mt-4 rounded-[14px] border border-[#0dab8d] bg-[#ebf9f6] px-[13px] py-[13px]">
              <p className="m-0 text-[13px] leading-[1.4] text-ink">
                {azzeccato ? t.azzeccato : t.mancato}
              </p>
            </div>
          </div>
        </Scheda>
      </div>

      <div className="mt-5">
        <Nota>{t.chiusa}</Nota>
      </div>
    </Schermo>
  )
}

/** Una delle due caselle del confronto: verde quando le due cose si somigliano. */
function Riquadro({
  etichetta,
  valore,
  buono,
}: {
  etichetta: string
  valore: string
  buono: boolean
}) {
  return (
    <div
      className="min-w-0 flex-1 rounded-[14px] border px-3 py-[9px] text-center"
      style={
        buono
          ? { borderColor: '#10b981', background: '#e5f5f1' }
          : { borderColor: '#ef545e', background: '#fcebed' }
      }
    >
      <p className="m-0 text-[11px] text-ink-mute">{etichetta}</p>
      <p
        className="m-0 mt-1 text-[16px] font-bold"
        style={{ color: buono ? '#10ab81' : '#ef545e' }}
      >
        {valore}
      </p>
    </div>
  )
}

/* 21-wrap — 3909:31 / 3958:206 */
export function Andiamo({
  passo,
  nodo,
  verso,
  avanzamento,
  avanti,
  indietro,
  salvando,
}: PropsTutorial) {
  const { tt } = useLingua()
  const t = tt.andiamo
  const righe = [
    { segno: 'sole', ...t.checkin },
    { segno: 'luna', ...t.checkout },
  ]

  return (
    <Schermo
      nodo={nodo}
      verso={verso}
      stacco={32}
      margini={24}
      avanzamento={avanzamento}
      indietro={indietro}
      azione={
        <Bottone attivo={!salvando} onClick={avanti}>
          {t.azione}
        </Bottone>
      }
    >
      <Occhiello segno={passo.segno}>{t.occhiello}</Occhiello>
      <Titolo>{t.titolo}</Titolo>
      <p className="m-0 mt-4 text-[15px] leading-[1.5] tracking-[-0.3px] text-ink">{t.corpo}</p>

      <div className="mt-[38px]">
        <Scheda>
          <div className="flex flex-col gap-4 px-5 py-5">
            {righe.map((r) => (
              <div key={r.titolo} className="flex gap-[12px]">
                <img src={icona(r.segno)} alt="" aria-hidden className="mt-[2px] size-[18px] shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-bold text-ink">{r.titolo}</span>
                  <span className="mt-[4px] block text-[13px] leading-[18px] tracking-[-0.26px] text-ink-medio">
                    {r.testo}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Scheda>
      </div>
    </Schermo>
  )
}
