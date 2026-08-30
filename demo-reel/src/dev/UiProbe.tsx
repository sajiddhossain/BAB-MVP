import { UI_SCREENS } from '../ui/registry'

/**
 * Pagina di servizio usata dal diff: renderizza UNO schermo nudo,
 * senza cornice ne' controlli, alle sue dimensioni native.
 * Cosi' lo screenshot e' confrontabile 1:1 con l'export Figma.
 */
export function UiProbe({ id }: { id: string }) {
  const entry = UI_SCREENS[id]
  if (!entry) return <div style={{ color: '#fff' }}>schermo sconosciuto: {id}</div>
  const Comp = entry.Component
  return (
    <div id="probe" style={{ width: entry.width, height: entry.height }}>
      <Comp />
    </div>
  )
}
