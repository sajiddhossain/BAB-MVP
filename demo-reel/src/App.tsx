import { Suspense, lazy } from 'react'
import { UiProbe } from './dev/UiProbe'
import { Prototype } from './proto/Prototype'
import { FLOWS } from './proto/flows'

const params = new URLSearchParams(location.search)
const capture = params.get('capture') === '1'
const probe = params.get('probe')

// il reel serve alla registrazione: ci si arriva con ?clip=. Di default,
// aprendo la pagina sul telefono, parte il prototipo camminabile.
const isReel = capture || params.has('clip') || location.hash.startsWith('#reel')
const flow = FLOWS[params.get('flow') ?? 'checkin'] ?? FLOWS.checkin

if (capture || probe) document.body.dataset.capture = '1'

/*
 * Import dinamico, non statico: il reel si porta dietro i 13 export SVG di
 * Figma, cioe' ~5MB di PNG in base64. Con l'import statico li scaricava anche
 * chi apre solo il prototipo sul telefono.
 */
const LazyReel = lazy(async () => {
  const [{ CLIPS }, page] = await Promise.all([import('./reel/clips'), import('./reel/ReelPage')])
  const clipId = params.get('clip') ?? location.hash.replace('#', '') ?? 'checkin'
  const clip = CLIPS[clipId] ?? CLIPS.checkin
  const Page = page.default
  return { default: () => <Page clip={clip} capture={capture} /> }
})

export default function App() {
  if (probe) return <UiProbe id={probe} />
  if (isReel)
    return (
      <Suspense fallback={null}>
        <LazyReel />
      </Suspense>
    )
  return (
    <div className="bab-proto">
      <Prototype flow={flow} />
    </div>
  )
}
