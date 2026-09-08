import { Guscio } from '../../ui/percorso/Guscio'
import { Testa } from '../../ui/percorso/pezzi'
import { riempi } from '../../copy/riempi'
import { useLingua } from '../../lib/lingua'
import type { Passo } from '../../data/percorso'
import type { PropsEsercizio } from './tipi'
import triangolo from '../../assets/percorso/triangolo.svg'

/**
 * La bandiera rossa.
 *
 * L'unico schermo del percorso senza niente da rispondere: si legge, e si va
 * avanti. Sta solo nelle lezioni dove il disegno lo mette — quelle delle
 * parole che possono voler dire che serve un adulto.
 *
 * Non c'e' un bottone "ho capito" e non c'e' una verifica: mettere una
 * risposta giusta su uno schermo che dice "fermati e chiama qualcuno"
 * trasformerebbe un avvertimento in un quiz.
 *
 * I colori non sono quelli del resto della lezione: sono il rosso tenue delle
 * schede d'allarme che l'app usa gia' nel check-in, cosi' questo schermo
 * somiglia a quello che l'atleta vedra' il giorno in cui il segnale arriva
 * davvero.
 */
export function Allarme({
  testi,
  parole,
  avanzamento,
  indietro,
  avanti,
}: PropsEsercizio<Extract<Passo, { tipo: 'allarme' }>>) {
  const t = testi.allarme
  const { tpe } = useLingua()
  const buchi = { uno: parole[0], due: parole[1] }
  if (!t) return null

  return (
    <Guscio
      avanzamento={avanzamento}
      indietro={indietro}
      azione={t.azione || tpe.comune.continua}
      onAzione={avanti}
    >
      <Testa occhiello={t.occhiello} titolo={t.titolo} />

      <div
        className="relative mt-[38px] overflow-hidden rounded-[20px] border px-6 py-6 pl-[30px]"
        style={{
          borderColor: 'var(--color-rosso-bordo)',
          background: 'var(--color-allarme-fondo)',
        }}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[6px]"
          style={{ background: 'var(--color-rosso)' }}
        />
        <div className="flex items-center gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'var(--color-rosso-bordo)' }}
          >
            <img src={triangolo} alt="" aria-hidden className="size-[18px]" />
          </span>
          <p
            className="m-0 text-[18px] leading-[1.3] font-bold"
            style={{ color: 'var(--color-allarme-testo)' }}
          >
            {riempi(t.intestazione, buchi)}
          </p>
        </div>

        <p
          className="m-0 mt-5 text-[14px] leading-[1.5]"
          style={{ color: 'var(--color-allarme-testo)' }}
        >
          {riempi(t.testo, buchi)}
        </p>

        {/* cosa fare adesso, staccato dal resto: e' l'unica riga che conta */}
        <div
          className="relative mt-5 overflow-hidden rounded-[16px] px-4 py-[14px] pl-5"
          style={{ background: 'var(--color-surface)' }}
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[6px]"
            style={{ background: 'var(--color-rosso)' }}
          />
          <p
            className="m-0 text-[14px] leading-[1.4] font-bold"
            style={{ color: 'var(--color-allarme-testo)' }}
          >
            {riempi(t.dafare, buchi)}
          </p>
        </div>
      </div>

      {t.nota && (
        <p className="m-0 mt-[38px] text-[13px] leading-[1.5] text-ink-soft">
          {riempi(t.nota, buchi)}
        </p>
      )}
    </Guscio>
  )
}
