import { useState } from 'react'

/**
 * La tastiera di iOS, disegnata a mano.
 *
 * Non e' decorazione: i tasti scrivono davvero nel campo. Serve perche' nel
 * video (e su computer) non esiste nessuna tastiera di sistema, e un campo che
 * si illumina senza che salga niente si vede subito che non e' un telefono.
 *
 * Le misure sono quelle vere di un iPhone in verticale: tasto alto 44, raggio
 * 5, righe distanti 12, margine laterale 3. Sotto l'ultima riga iOS lascia una
 * fascia vuota per la barra di sistema — se la togli la tastiera sembra
 * schiacciata in fondo allo schermo.
 */
const W = 402
const PAD = 3
const GAP = 6
const KEY_H = 44
const ROW_GAP = 12
const TOP = 10
const FOOT = 35
export const KEYS_H = TOP + KEY_H * 4 + ROW_GAP * 3 + FOOT
/** la barretta con "Done": prende il posto dei suggerimenti di iOS */
export const BAR_H = 44
export const KB_H = KEYS_H + BAR_H

const KEY_W = (W - PAD * 2 - GAP * 9) / 10
const WIDE = 46
const RETURN_W = 88

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

/** iOS: bianco per le lettere, grigio per i comandi */
const WHITE = '#ffffff'
const GREY = '#acb0b8'
const SHADOW = '0 1px 0 rgba(0,0,0,0.28)'

function Key({
  x,
  y,
  w,
  bg,
  label,
  glyph,
  onTap,
  font = 25,
  id,
}: {
  x: number
  y: number
  w: number
  bg: string
  label?: string
  glyph?: React.ReactNode
  onTap: () => void
  font?: number
  /* nome fisso del tasto: l'etichetta cambia col maiuscolo, questo no —
     serve al copione del video per ritrovarlo */
  id?: string
}) {
  const [down, setDown] = useState(false)
  return (
    <div
      data-key={id ?? label ?? undefined}
      onPointerDown={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setDown(true)
        onTap()
      }}
      onPointerUp={() => setDown(false)}
      onPointerCancel={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      className="absolute flex items-center justify-center"
      style={{
        left: x,
        top: y,
        width: w,
        height: KEY_H,
        borderRadius: 5,
        // iOS scurisce il tasto premuto invece di rimpicciolirlo
        background: down ? (bg === WHITE ? '#c7cbd3' : '#f7f8f9') : bg,
        boxShadow: SHADOW,
        fontSize: font,
        color: '#0b0b0d',
        lineHeight: 1,
        userSelect: 'none',
        transition: 'background 90ms ease-out',
      }}
    >
      {glyph ?? label}
    </div>
  )
}

const Shift = ({ on }: { on: boolean }) => (
  <svg width="21" height="19" viewBox="0 0 21 19" fill={on ? '#0b0b0d' : 'none'} stroke="#0b0b0d" strokeWidth="1.6" strokeLinejoin="round">
    <path d="M10.5 1.6 19.4 10h-4.6v6.9H6.2V10H1.6L10.5 1.6Z" />
  </svg>
)

const Backspace = () => (
  <svg width="25" height="19" viewBox="0 0 25 19" fill="none" stroke="#0b0b0d" strokeWidth="1.6" strokeLinecap="round">
    <path d="M7.6 2h14.3a1.6 1.6 0 0 1 1.6 1.6v11.8a1.6 1.6 0 0 1-1.6 1.6H7.6L1.4 9.5 7.6 2Z" />
    <path d="M11.6 6.9 17.4 12.6M17.4 6.9 11.6 12.6" />
  </svg>
)

const Globe = () => (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" stroke="#0b0b0d" strokeWidth="1.5">
    <circle cx="10.5" cy="10.5" r="8.6" />
    <ellipse cx="10.5" cy="10.5" rx="3.6" ry="8.6" />
    <path d="M2.2 7.8h16.6M2.2 13.2h16.6" />
  </svg>
)

export function Keyboard({
  open,
  value,
  onChange,
  onDone,
  multiline = true,
}: {
  open: boolean
  value: string
  onChange: (v: string) => void
  onDone: () => void
  /* false su un campo a riga singola: li' "return" chiude invece di andare
     a capo. Andando a capo l'a-capo finiva nello stato ma il campo lo
     buttava via, e restava una differenza invisibile fra i due. */
  multiline?: boolean
}) {
  /*
   * iOS accende il maiuscolo da solo a inizio frase e lo spegne dopo la
   * prima lettera. Senza, si scrive tutto minuscolo e si nota.
   */
  const [shiftManual, setShiftManual] = useState<boolean | null>(null)
  const auto = /(^|[.!?]\s)$/.test(value) || value === ''
  const shift = shiftManual ?? auto

  const put = (ch: string) => {
    onChange(value + (shift ? ch.toUpperCase() : ch))
    setShiftManual(null)
  }

  const rowTop = (r: number) => TOP + r * (KEY_H + ROW_GAP)
  const row2Left = (W - (KEY_W * 9 + GAP * 8)) / 2
  const row3Left = (W - (KEY_W * 7 + GAP * 6)) / 2

  return (
    <div
      className="bab-font-ui absolute inset-x-0 bottom-0"
      style={{
        height: KB_H,
        transform: open ? undefined : 'translateY(100%)',
        // la curva di iOS quando la tastiera sale
        transition: 'transform 300ms cubic-bezier(0.17,0.59,0.16,1.01)',
        zIndex: 40,
      }}
    >
      {/* barretta dei comandi: qui iOS mette i suggerimenti, noi il "Done" */}
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-end"
        style={{
          height: BAR_H,
          background: '#f6f6f8',
          borderTop: '0.5px solid rgba(0,0,0,0.16)',
          borderBottom: '0.5px solid rgba(0,0,0,0.16)',
          paddingRight: 16,
        }}
      >
        <div
          data-key="Done"
          onPointerDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onDone()
          }}
          style={{ fontSize: 17, fontWeight: 600, color: '#007aff', padding: '6px 4px' }}
        >
          Done
        </div>
      </div>

      <div className="absolute inset-x-0" style={{ top: BAR_H, height: KEYS_H, background: '#d1d3d9' }}>
        {ROWS[0].split('').map((c, i) => (
          <Key key={c} id={c} x={PAD + i * (KEY_W + GAP)} y={rowTop(0)} w={KEY_W} bg={WHITE} label={shift ? c.toUpperCase() : c} onTap={() => put(c)} />
        ))}
        {ROWS[1].split('').map((c, i) => (
          <Key key={c} id={c} x={row2Left + i * (KEY_W + GAP)} y={rowTop(1)} w={KEY_W} bg={WHITE} label={shift ? c.toUpperCase() : c} onTap={() => put(c)} />
        ))}

        <Key x={PAD} y={rowTop(2)} w={WIDE} bg={shift ? WHITE : GREY} glyph={<Shift on={shift} />} id="shift" onTap={() => setShiftManual(!shift)} />
        {ROWS[2].split('').map((c, i) => (
          <Key key={c} id={c} x={row3Left + i * (KEY_W + GAP)} y={rowTop(2)} w={KEY_W} bg={WHITE} label={shift ? c.toUpperCase() : c} onTap={() => put(c)} />
        ))}
        <Key x={W - PAD - WIDE} y={rowTop(2)} w={WIDE} bg={GREY} glyph={<Backspace />} id="backspace" onTap={() => onChange(value.slice(0, -1))} />

        <Key x={PAD} y={rowTop(3)} w={WIDE} bg={GREY} label="123" font={16} onTap={() => {}} />
        <Key x={PAD + WIDE + GAP} y={rowTop(3)} w={KEY_W} bg={GREY} glyph={<Globe />} onTap={() => {}} />
        {/* la barra spaziatrice di iOS non porta scritte */}
        <Key
          x={PAD + WIDE + GAP + KEY_W + GAP}
          y={rowTop(3)}
          w={W - PAD - RETURN_W - GAP - (PAD + WIDE + GAP + KEY_W + GAP)}
          bg={WHITE}
          id="space"
          onTap={() => onChange(value + ' ')}
        />
        <Key x={W - PAD - RETURN_W} y={rowTop(3)} w={RETURN_W} bg={GREY} label="return" font={16} onTap={() => (multiline ? onChange(value + '\n') : onDone())} />
      </div>
    </div>
  )
}
