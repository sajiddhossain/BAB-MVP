import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

/**
 * La rete di sicurezza.
 *
 * Senza, un errore in un punto qualsiasi lascia lo schermo bianco: React
 * smonta tutto l'albero e non rimette niente. Uno schermo bianco non si
 * distingue da una app che non si apre, e chi lo vede pensa che sia rotta
 * per sempre.
 *
 * Qui invece resta qualcosa da leggere e un modo per uscirne. L'errore vero
 * va in console per noi, non a schermo: a chi sta usando la app non serve
 * sapere in che componente e' successo.
 */
export class Rete extends Component<{ children: ReactNode }, { rotto: boolean }> {
  state = { rotto: false }

  static getDerivedStateFromError() {
    return { rotto: true }
  }

  componentDidCatch(errore: Error, dove: ErrorInfo) {
    console.error('[rete]', errore, dove.componentStack)
  }

  render() {
    if (!this.state.rotto) return this.props.children

    /*
     * Niente qui dentro dipende da altro nostro codice: non si usano ne' i
     * testi tradotti ne' i componenti, perche' se e' uno di quelli ad essersi
     * rotto la schermata di errore si romperebbe con lui. Per lo stesso
     * motivo i colori sono scritti a mano invece che presi dai token.
     */
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#f0ebe6',
          color: '#2c2c3a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 30,
          textAlign: 'center',
          font: "15px/1.5 'Space Grotesk', system-ui, sans-serif",
        }}
      >
        <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Qualcosa si è rotto</p>
        <p style={{ margin: 0, maxWidth: 300, color: '#5c5c6e' }}>
          Non è colpa tua. Ricarica e riprova — quello che avevi scritto è al sicuro.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            height: 56,
            minWidth: 220,
            marginTop: 8,
            border: '1.5px solid #bcb8b5',
            borderRadius: 100,
            background: 'linear-gradient(to right, #d4f369, #c1de67)',
            font: "700 16px 'Space Grotesk', system-ui, sans-serif",
            color: '#2c2c3a',
          }}
        >
          Ricarica
        </button>
      </div>
    )
  }
}
