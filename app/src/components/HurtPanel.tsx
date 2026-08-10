import { useState } from 'react'
import { fill, useCopy, useLocale } from '@/copy'
import BodyMap from './BodyMap'
import { regionLabel, type RegionCode } from '@/content/bodymap'
import { SENSATIONS, isRedFlag } from '@/content/lexicon'
import { CARE } from '@/content/clinical'
import { useSession } from '@/lib/session'
import { saveAcuteSignal } from '@/lib/repo'

/**
 * «Mi sono fatta male» — tre tocchi dal problema all'istruzione.
 *
 * 🔴 §5: raggiungibile sempre, da ogni schermata, senza passare da un check-in.
 * 🔴 Il Care mode compare **anche se non è connessa e anche se il salvataggio
 * fallisce**: sapere cosa fare quando fa male non può dipendere da un account
 * o dal campo. Salvare è importante; dirle di fermarsi lo è di più.
 */

/** Le sensazioni acute: le due bandiere rosse più quelle che di solito arrivano di colpo. */
const ACUTE = ['gives_way', 'swollen', 'sharp', 'burning', 'tingly', 'tender', 'crampy']

/** Grassetto e corsivo dal copy, senza tirare dentro un parser markdown. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong>
        : p.startsWith('*') ? <em key={i}>{p.slice(1, -1)}</em>
        : <span key={i}>{p}</span>,
      )}
    </>
  )
}

type Step = 'where' | 'what' | 'care'

export default function HurtPanel({ onClose }: { onClose: () => void }) {
  const t = useCopy()
  const locale = useLocale()
  const { userId } = useSession()
  const [step, setStep] = useState<Step>('where')
  const [region, setRegion] = useState<RegionCode | null>(null)
  const [sensation, setSensation] = useState<string | null>(null)

  const red = sensation ? isRedFlag(sensation) : false
  const where = region ? regionLabel(region, locale) : ''
  const what = sensation ? SENSATIONS.find((s) => s.code === sensation)!.label[locale] : ''

  /**
   * Le etichette sono scritte per stare da sole ("Ginocchio sinistro"), ma qui
   * finiscono in mezzo a una frase — e «Il mio Ginocchio sinistro» stona.
   * Sono tutti nomi comuni, quindi la minuscola è sempre corretta.
   */
  const lower = (x: string) => (x ? x.charAt(0).toLowerCase() + x.slice(1) : x)
  const inSentence = { what: lower(what), where: lower(where) }

  async function choose(code: string) {
    setSensation(code)
    setStep('care')
    // Il Care è già sullo schermo: se il salvataggio non riesce, non deve
    // togliere l'istruzione. Per questo non si aspetta e non si blocca.
    if (userId && region) {
      try {
        await saveAcuteSignal({
          athlete_id: userId, region, sensation: code, is_red_flag: isRedFlag(code),
        })
      } catch { /* resta in coda locale; la sicurezza non dipende da questo */ }
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--color-canvas)] px-4 pb-16 pt-[calc(env(safe-area-inset-top)+16px)]">
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-[26px] leading-tight">{t.hurt.title}</h1>
          <button type="button" onClick={onClose} className="bab-pill px-3 py-2 text-[13px]">
            {t.hurt.close}
          </button>
        </div>

        {step === 'where' && (
          <>
            <p className="text-[15px] text-[var(--color-ink-soft)]">{t.hurt.lede}</p>
            <h2 className="bab-label">{t.hurt.whereStep}</h2>
            <BodyMap
              tone="care"
              selected={region}
              onSelect={(c) => { setRegion(c); setStep('what') }}
            />
          </>
        )}

        {step === 'what' && (
          <>
            <h2 className="bab-label">{t.hurt.whatStep}</h2>
            <p className="text-[15px] text-[var(--color-ink-soft)]">{where}</p>
            <div className="flex flex-col gap-2">
              {ACUTE.map((code) => {
                const s = SENSATIONS.find((x) => x.code === code)!
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => void choose(code)}
                    className="bab-card flex items-center gap-2 px-4 py-3 text-left text-[15px]"
                  >
                    {s.redFlag && <span aria-hidden>🚩</span>}
                    {s.label[locale]}
                  </button>
                )
              })}
            </div>
            <button type="button" onClick={() => setStep('where')} className="bab-pill self-start px-4 py-2 text-[13px]">
              {t.checkin.common.back}
            </button>
          </>
        )}

        {step === 'care' && (
          <div
            className="bab-card flex flex-col gap-3 px-4 py-4"
            style={{ background: 'var(--care-tint)', borderColor: 'var(--care)' }}
            role="alert"
          >
            <h2 className="font-display text-[18px]">{CARE.title[locale]}</h2>

            <p className="text-[15px]">
              <Rich text={red
                ? fill(CARE.openerRedFlag[locale], inSentence)
                : CARE.openerSelfReported[locale]} />
            </p>

            <ol className="flex list-decimal flex-col gap-2 pl-5 text-[15px]">
              {CARE.steps[locale].map((s, i) => (
                <li key={i}>
                  <Rich text={fill(s, {
                    when: red ? CARE.whenUrgent[locale] : CARE.whenToday[locale],
                  })} />
                </li>
              ))}
            </ol>

            <p className="text-[15px]">
              <Rich text={fill(CARE.borrowWords[locale], inSentence)} />
            </p>

            <button type="button" onClick={onClose} className="bab-pill px-4 py-2 text-[13px]">
              {t.hurt.close}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
