/**
 * Il bottone principale. L'ombra e' sfalsata solo in basso di 6px
 * (nel frame l'ombra sta a top+6, il corpo a top+0).
 */
export function CtaButton({
  label,
  left,
  top,
  width,
  height = 56,
}: {
  label: string
  left: number
  top: number
  width: number
  height?: number
}) {
  return (
    <div className="absolute" style={{ left, top, width, height: height + 6 }}>
      <div
        className="absolute left-0"
        style={{
          top: 6,
          width,
          height,
          borderRadius: 100,
          background: 'var(--bab-shadow)',
        }}
      />
      <div
        className="absolute left-0 top-0"
        style={{
          width,
          height,
          borderRadius: 100,
          background: 'linear-gradient(to right, var(--bab-lime-from), var(--bab-lime-to))',
          border: 'var(--bab-border-w) solid var(--bab-border)',
          boxSizing: 'border-box',
        }}
      >
        <p
          className="absolute text-center font-bold"
          style={{
            left: 0,
            top: 16.5,
            width,
            fontSize: 16,
            color: 'var(--bab-ink-max)',
            lineHeight: 'normal',
            margin: 0,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  )
}
