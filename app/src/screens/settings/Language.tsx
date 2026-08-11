import { useCopy, useLocale, useSetLocale, LOCALES, type Locale } from '@/copy'
import PillGroup from '@/components/PillGroup'
import { updateProfile } from '@/lib/repo'
import { useSession } from '@/lib/session'
import { Pane } from './shell'

/** R9 dice italiano E inglese, quindi la scelta deve esistere davvero. */
export default function SettingsLanguage() {
  const t = useCopy()
  const locale = useLocale()
  const setLocale = useSetLocale()
  const { userId } = useSession()

  /**
   * La lingua si scrive in due posti: qui sul dispositivo, e nel profilo — così
   * su un telefono nuovo si ritrova senza doverla riscegliere.
   *
   * Nessun bottone «salva»: cambia sotto le dita, e si vede subito perché tutta
   * l'interfaccia cambia con lei. Un salvataggio da confermare, qui, sarebbe
   * solo un passaggio in più per una cosa già ovvia.
   */
  async function pick(next: Locale) {
    setLocale(next)
    if (userId) await updateProfile(userId, { locale: next }).catch(() => {})
  }

  return (
    <Pane title={t.settings.langTitle}>
      <PillGroup
        size="lg" label={t.settings.langTitle} value={locale}
        options={(Object.keys(LOCALES) as Locale[]).map((l) => ({
          value: l, label: LOCALES[l].langName,
        }))}
        onChange={(v) => void pick(v as Locale)}
      />
      <p className="text-[13.5px] text-[var(--color-ink-soft)]">{t.settings.langNote}</p>
    </Pane>
  )
}
