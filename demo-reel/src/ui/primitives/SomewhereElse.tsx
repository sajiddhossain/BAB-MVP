/**
 * Il bottone "Somewhere else ⓘ".
 * Nota: il glifo ⓘ non esiste in Space Grotesk, quindi Figma e Chrome ripiegano
 * su fallback diversi. E' l'unico punto di questi schermi che non converge.
 */
export function SomewhereElse({ right, top }: { right: number; top: number }) {
  return (
    <div
      className="absolute flex items-center justify-center gap-[8px]"
      style={{
        right,
        top,
        height: 41,
        padding: '0 16px',
        borderRadius: 100,
        background: 'var(--bab-surface)',
        border: '1.5px solid var(--bab-bg)',
        boxSizing: 'border-box',
        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.05))',
      }}
    >
      <p className="whitespace-nowrap font-bold" style={{ fontSize: 14, lineHeight: 'normal', margin: 0, color: 'var(--bab-ink-mute)' }}>
        Somewhere else
      </p>
      <div className="flex items-center justify-center" style={{ width: 20, height: 20, borderRadius: 100, background: 'var(--bab-bg)' }}>
        <p className="font-bold" style={{ fontSize: 12, lineHeight: 'normal', margin: 0, color: 'var(--bab-ink-soft)' }}>
          ⓘ
        </p>
      </div>
    </div>
  )
}
