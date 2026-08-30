import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5199, strictPort: true },
  // porta diversa dal dev di proposito: stessa origine voleva dire che il
  // service worker della build restava attivo anche sul dev server
  preview: { port: 5198, strictPort: true },
  // gli SVG di Figma sono grossi: niente inline base64 automatico
  build: { assetsInlineLimit: 0 },
})
