import { useCopy } from '@/copy'

/**
 * §5: la segnalazione di una bandiera rossa acuta è sempre a un tocco, da
 * qualsiasi schermata. Per questo vive fuori dal router.
 */
export default function HurtButton() {
  const t = useCopy()
  return (
    <div className="sticky top-0 z-40 flex justify-end px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-2">
      <button
        type="button"
        className="bab-pill px-4 py-2 text-[13px]"
        style={{ background: 'var(--care-tint)', borderColor: 'var(--care)', color: 'var(--care)' }}
      >
        🩹 {t.hurt.button}
      </button>
    </div>
  )
}
