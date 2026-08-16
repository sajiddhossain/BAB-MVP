import { Component, type ReactNode } from 'react'
import { readLocale } from '@/lib/locale'
import Mascot from './Mascot'

/**
 * L'ultima rete, sopra tutto il resto — anche sopra `CopyProvider` e il
 * router, in `main.tsx`.
 *
 * 🔴 Senza questo, un'eccezione non gestita in QUALSIASI componente smonta
 * l'intero albero React e lascia uno schermo bianco — compreso `HurtButton`,
 * che sta fuori dal router apposta perché "mi sono fatta male" deve restare
 * raggiungibile da ovunque (§5). Uno schermo bianco è l'unico guasto che
 * rompe davvero quella promessa: proprio quando qualcosa è già andato
 * storto, sparisce anche la via d'uscita.
 *
 * Per questo il fallback qui sotto non passa da `useCopy`/`CopyProvider` (che
 * potrebbero essere loro stessi nell'albero rotto): legge la lingua
 * direttamente da `readLocale` — già scritta per fallire in silenzio — e
 * porta con sé un promemoria di sicurezza statico, non uno stralcio del
 * vero Care mode. Quello che salva davvero è il ricaricamento: IndexedDB
 * non dipende da React, quindi quello che ha scritto resta lì ad aspettarla.
 */

const TEXT = {
  it: {
    title: 'Qualcosa si è inceppato',
    body: 'Ricarica per continuare — quello che hai scritto resta salvato sul telefono, non si perde.',
    reload: 'Ricarica',
    careTitle: 'Se ti sei fatta male',
    careBody: 'Fermati, non forzare, e parlane con un adulto o con chi ti segue. In un\'emergenza, chiama il numero di emergenza del tuo paese.',
  },
  en: {
    title: 'Something broke',
    body: 'Reload to continue — what you wrote stays saved on your phone, nothing is lost.',
    reload: 'Reload',
    careTitle: 'If you got hurt',
    careBody: 'Stop, don\'t push through it, and tell an adult or whoever looks after your training. In an emergency, call your local emergency number.',
  },
} as const

type State = { broke: boolean }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { broke: false }

  static getDerivedStateFromError(): State {
    return { broke: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.broke) return this.props.children

    const t = TEXT[readLocale()] ?? TEXT.it

    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center gap-4 px-6 text-center"
           style={{ background: 'var(--color-canvas)', color: 'var(--color-ink)' }}>
        <Mascot size={48} />
        <h1 className="font-display text-[22px] leading-tight">{t.title}</h1>
        <p className="text-[15px]" style={{ color: 'var(--color-ink-soft)' }}>{t.body}</p>
        <button type="button" onClick={() => window.location.reload()}
                className="bab-pill px-5 py-3 text-[16px]"
                style={{ background: 'var(--color-lime)', boxShadow: 'var(--shadow-lg)' }}>
          {t.reload}
        </button>
        <div className="bab-card mt-2 flex flex-col gap-1 px-4 py-3.5 text-left"
             style={{ background: 'var(--care-tint)', borderColor: 'var(--care)' }}>
          <p className="text-[14px] font-bold">{t.careTitle}</p>
          <p className="text-[13.5px]">{t.careBody}</p>
        </div>
      </div>
    )
  }
}
