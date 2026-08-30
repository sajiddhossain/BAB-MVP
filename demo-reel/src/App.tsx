import { UiProbe } from './dev/UiProbe'
import { Prototype } from './proto/Prototype'
import { PhoneShell } from './proto/PhoneShell'
import { FLOWS } from './proto/flows'

const params = new URLSearchParams(location.search)
const probe = params.get('probe')
/**
 * ?reel=1 e' quello che registra scripts/record.mjs: lo stesso prototipo
 * camminabile, dentro la cornice di un telefono e su fondale scuro. Non e' una
 * modalita' a parte con una sua vita — il video mostra l'app, non una sua
 * riproduzione.
 */
const reel = params.get('reel') === '1'
/*
 * Lo screencast di Chrome ignora il deviceScaleFactor e ci manda i fotogrammi
 * alla risoluzione CSS del viewport. Per registrare a 2x non serve un trucco
 * nel registratore: basta ingrandire la pagina, che essendo tutta vettori e
 * testo viene rasterizzata piu' grande, non stirata.
 */
const zoom = Number(params.get('zoom') ?? 1)
const flow = FLOWS[params.get('flow') ?? 'checkin'] ?? FLOWS.checkin

// il probe deve essere nudo: niente fondale, niente animazioni d'ingresso
if (probe) document.body.dataset.capture = '1'

export default function App() {
  if (probe) return <UiProbe id={probe} />
  if (reel)
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0e0e11]">
        <div className="bab-proto" style={{ zoom }}>
          <PhoneShell>
            <Prototype flow={flow} boxed />
          </PhoneShell>
        </div>
      </div>
    )
  return (
    <div className="bab-proto">
      <Prototype flow={flow} />
    </div>
  )
}
