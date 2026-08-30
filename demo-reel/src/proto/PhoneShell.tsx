import type { ReactNode } from 'react'
import { STAGE } from '../proto/flows'

/**
 * Cornice del telefono per il video. Il contenuto e' esattamente 402x874, come
 * l'export Figma, quindi qui dentro il prototipo gira a scala 1.
 */
export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative"
      style={{
        width: STAGE.w + 24,
        height: STAGE.h + 24,
        padding: 12,
        borderRadius: 58,
        background: 'linear-gradient(160deg,#2a2a30,#141418 60%,#25252b)',
        boxShadow:
          '0 40px 80px -20px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08) inset',
      }}
    >
      <div
        className="relative overflow-hidden bg-[#FAF9F7]"
        style={{ width: STAGE.w, height: STAGE.h, borderRadius: 46 }}
      >
        {children}
        <StatusBar />
      </div>
    </div>
  )
}

/**
 * Gli export Figma non includono la status bar (partono dal contenuto a y=56).
 * La disegniamo noi: senza, il video non sembra un telefono.
 * Il velo sotto e' sempre acceso, cosi' il contenuto che scorre non passa
 * sopra l'ora.
 */
function StatusBar() {
  return (
    <>
      {/* Senza questo velo il contenuto che scorre passa sopra l'ora: sembra rotto. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: 46,
          background: 'rgba(240,235,230,0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />
    <div
      className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-8 text-[#1B1B22]"
      style={{ height: 44, fontSize: 15, fontWeight: 600, letterSpacing: 0.2 }}
    >
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>
      <span className="flex items-center gap-1.5">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 11.2 5.6 8.6a3.4 3.4 0 0 1 4.8 0L8 11.2Z" />
          <path
            d="M2.9 5.7a7.3 7.3 0 0 1 10.2 0"
            stroke="currentColor"
            strokeWidth="1.7"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M.6 3.1a10.6 10.6 0 0 1 14.8 0"
            stroke="currentColor"
            strokeWidth="1.7"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
          <rect
            x="0.6"
            y="0.6"
            width="22"
            height="11.8"
            rx="3.4"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeWidth="1.1"
          />
          <rect x="2.4" y="2.4" width="16" height="8.2" rx="2.2" fill="currentColor" />
          <path
            d="M24.2 4.4v4.2a2.2 2.2 0 0 0 0-4.2Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </span>
    </div>
    </>
  )
}
