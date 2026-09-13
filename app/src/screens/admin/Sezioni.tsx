import { useEffect, useState } from 'react'
import { SEZIONI } from '../../data/sezioni'
import type { StatoSezione } from '../../data/sezioni'
import { cambiaSezione, caricaSezioni, statiDiAdesso } from '../../lib/sezioni'
import { Telaio } from './Telaio'
import { BLOCCO } from './pezzi'


/**
 * Accendere e spegnere i pezzi dell'app.
 *
 * Tre stati e non due, per il motivo scritto in `data/sezioni.ts`: fra
 * "si usa" e "non esiste" c'e' "arriva presto", ed e' quello che serve quasi
 * sempre — un'atleta che vede il nome di una cosa che sta arrivando e' in un
 * posto diverso da una che non lo vede mai.
 *
 * Qui non c'e' la bozza. Le scritte hanno bozza e pubblicato perche' un
 * refuso non deve arrivare a una ragazza di dodici anni; spegnere una sezione
 * invece e' una decisione, e quando la si prende la si vuole subito.
 */
const STATI: { id: StatoSezione; nome: string; cosa: string }[] = [
  { id: 'aperta', nome: 'Aperta', cosa: 'Si usa.' },
  {
    id: 'in-arrivo',
    nome: 'In arrivo',
    cosa: 'Si vede nella barra in fondo, si tocca, e dice che arriva presto.',
  },
  {
    id: 'nascosta',
    nome: 'Nascosta',
    cosa: 'Sparisce dalla barra. Chi ci arriva scrivendo l’indirizzo torna alla home.',
  },
]

export function Sezioni() {
  const [stati, setStati] = useState(statiDiAdesso)
  const [stato, setStato] = useState('')

  useEffect(() => {
    void caricaSezioni().then(() => setStati(statiDiAdesso()))
  }, [])

  async function cambia(id: string, nuovo: StatoSezione) {
    const prima = stati[id]
    setStati((s) => ({ ...s, [id]: nuovo }))
    setStato('salvo…')
    const errore = await cambiaSezione(id, nuovo)
    if (errore) {
      setStati((s) => ({ ...s, [id]: prima }))
      setStato(`non salvato: ${errore}`)
      return
    }
    setStato('fatto — le atlete lo vedono al prossimo giro')
  }

  return (
    <Telaio
      nome="Sezioni dell’app"
      sotto="Cosa è acceso e cosa no"
      destra={<span className="text-[12px] text-ink-medio">{stato}</span>}
    >
      <div className="max-w-[640px] p-6">
        <p className="m-0 text-[13px] leading-[1.6] text-ink-medio">
          Non è una bozza: quello che scegli qui vale subito, senza pubblicare. Nell’anteprima
          delle scritte le sezioni restano sempre aperte, se no spegnendone una non potresti
          più correggerne le parole.
        </p>

        <ul className="m-0 mt-5 flex list-none flex-col gap-3 p-0">
          {SEZIONI.map((s) => (
            <li key={s.id} className={`${BLOCCO} p-4`}>
              <p className="m-0 text-[14px] font-bold">{s.nome}</p>
              <p className="m-0 mt-1 text-[12px] leading-[1.5] text-ink-medio">{s.cosa}</p>
              <div className="mt-3 flex flex-wrap gap-1 rounded-pill bg-chip p-1">
                {STATI.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => void cambia(s.id, v.id)}
                    title={v.cosa}
                    className={`bab-tocco flex-1 rounded-pill px-3 py-[6px] text-[12.5px] font-bold ${
                      stati[s.id] === v.id
                        ? 'bg-lime text-ink shadow-[0_0_0_1.5px_#2c2c3a]'
                        : 'text-ink-medio hover:text-ink'
                    }`}
                  >
                    {v.nome}
                  </button>
                ))}
              </div>
              <p className="m-0 mt-2 text-[11.5px] leading-[1.5] text-ink-mute">
                {STATI.find((v) => v.id === stati[s.id])?.cosa}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Telaio>
  )
}

