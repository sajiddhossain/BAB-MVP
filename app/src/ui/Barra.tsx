import freccia from '../assets/arrow-left.svg'

/**
 * La barra in cima: il tasto indietro e l'avanzamento.
 *
 * L'avanzamento e' una frazione, non una larghezza in pixel: nel disegno il
 * riempimento e' largo 120 su 288, ma quel numero vale per quello schermo li'.
 */
export function Barra({ avanzamento, indietro }: { avanzamento: number; indietro?: () => void }) {
  return (
    <div className="relative mx-6 flex h-11 items-center gap-4">
      <button
        type="button"
        onClick={indietro}
        aria-label="Indietro"
        className="flex size-11 shrink-0 items-center justify-center rounded-[22px] border-[1.5px] border-line bg-surface"
        style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.06))' }}
      >
        <img src={freccia} alt="" className="size-[18px]" />
      </button>
      <div
        className="h-4 flex-1 rounded-[99px] border border-line bg-surface"
        style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.05))' }}
      >
        <div className="p-[3px]">
          <div
            className="bab-avanzamento h-2 rounded-[99px]"
            style={{
              width: `${Math.max(0, Math.min(1, avanzamento)) * 100}%`,
              background: 'linear-gradient(to right, var(--color-lime), var(--color-lime-deep))',
            }}
          />
        </div>
      </div>
    </div>
  )
}
