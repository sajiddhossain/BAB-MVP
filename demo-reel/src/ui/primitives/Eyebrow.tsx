/** "STEP 1 · PREDICT" con la sua icona a sinistra. */
export function Eyebrow({
  icon,
  children,
  top = 130,
  left = 31,
  iconSize = 19.5,
}: {
  icon: string
  children: string
  top?: number
  left?: number
  iconSize?: number
}) {
  return (
    <>
      <img
        src={icon}
        alt=""
        className="absolute"
        style={{ left, top, width: iconSize, height: iconSize }}
      />
      <p
        className="absolute whitespace-nowrap font-bold uppercase"
        style={{
          left: left + 25,
          top,
          fontSize: 16,
          letterSpacing: '1px',
          color: 'var(--bab-ink)',
          lineHeight: 'normal',
          margin: 0,
        }}
      >
        {children}
      </p>
    </>
  )
}
