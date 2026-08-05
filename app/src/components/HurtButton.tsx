export default function HurtButton() {
  return (
    <div className="sticky top-0 z-40 flex justify-end px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-2">
      <button
        type="button"
        className="bab-pill px-4 py-2 text-[13px]"
        style={{ background: 'var(--care-tint)', borderColor: 'var(--care)', color: 'var(--care)' }}
        onClick={() => alert('Acute capture sheet — week 2')}
      >
        🩹 I got hurt
      </button>
    </div>
  )
}
