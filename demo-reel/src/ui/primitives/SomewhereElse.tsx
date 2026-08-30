import { Touchable } from './Touchable'

/**
 * Il bottone "Somewhere else ⓘ": per quando quello che senti non sta in nessuna
 * delle zone del disegno. Apre lo stesso pannello, intestato "Somewhere else".
 *
 * Nota: il glifo ⓘ non esiste in Space Grotesk, quindi Figma e Chrome ripiegano
 * su fallback diversi. E' l'unico punto di questi schermi che non converge.
 */
export function SomewhereElse({ right, top, onTap }: { right: number; top: number; onTap?: () => void }) {
  return (
    <Touchable
      onTap={onTap}
      press={onTap ? 0.95 : 1}
      stop={!!onTap}
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
    </Touchable>
  )
}
