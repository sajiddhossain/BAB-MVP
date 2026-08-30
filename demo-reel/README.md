# BAB · Demo Reel

Riproduzione animata dei frame Figma per girare uno **screen record simulato** dell'app.
Due clip separate: `checkin` (32.6s) e `checkout` (43.6s).

## L'idea

Gli SVG esportati da Figma **non vengono ricostruiti in Tailwind**: entrano intatti
(`?raw` + inline) e sono la verita' visiva. React fa solo il **regista**: cornice del
device, transizioni fra schermi, scroll, dito finto che tocca i bersagli giusti.

Risultato: fedelta' 1:1 con Figma senza spendere ore a rifare 13 schermi a mano —
e senza il rischio che la copia diverga dal design.

## Comandi

```bash
npm install
npm run dev        # anteprima con timeline scrubabile su http://localhost:5199
npm run record     # registra entrambe le clip in out/
```

- `npm run record:checkin` / `npm run record:checkout` per una sola clip
- `node scripts/record.mjs all --fps 60 --scale 3` per alzare qualita'
- `node scripts/record.mjs checkin --no-gif` per saltare la GIF

Output in `out/`: `bab-checkin.mp4`, `bab-checkin.gif`, `bab-checkout.mp4`, `bab-checkout.gif`.

## Perche' la cattura e' deterministica

`scripts/record.mjs` non registra a tempo reale. Per ogni fotogramma chiama
`window.__seek(ms)`, aspetta il paint e scatta, poi manda i PNG in pipe dentro ffmpeg.
Il video non dipende dalla velocita' della macchina e non ha jitter.

Per questo il "premuto" del dito e' calcolato (`cursor.press`, 0..1) e non affidato a
una `transition` CSS: una transition andrebbe fuori sincrono con il tempo dettato dallo script.

## Dove si mettono le mani

| Cosa | File |
|---|---|
| Sequenza, durate, coordinate dei tap | `src/reel/clips.ts` |
| Motore del tempo: transizioni, scroll, cursore | `src/reel/timeline.ts` |
| Registro schermi, offset, namespacing id | `src/reel/screens.ts` |
| Cornice del telefono e status bar | `src/reel/PhoneShell.tsx` |
| Cattura video | `scripts/record.mjs` |

Le coordinate dei tap in `clips.ts` sono nello spazio del **contenuto** (lo scroll viene
sottratto a runtime) e sono state estratte dai `<rect>` degli SVG, non stimate a occhio.

## Due dettagli non ovvi negli export

- **`checkout-6-sensation-sheet.svg` e' 442x890**, non 402x874: Figma ha incluso il bleed
  dell'ombra del bottom sheet. Compensato con `offsetX: -20, offsetY: -3` in `screens.ts`.
- **`checkin-2-tune-in.svg` e' alto 1262**: e' uno schermo che scorre davvero, animato
  con `scroll: [0, 388]`.
- Figma riusa gli stessi id (`filter0_d_`, `paint0_linear_`) dentro ogni file. Inlinando
  piu SVG nello stesso DOM gli id collidono; `namespaceIds()` li prefissa per file.
- `checkin-5-make-sense` e' un PNG, non un SVG: renderizzato come `<img>`, quindi non
  animabile internamente (va bene, e' uno schermo di lettura).

## Utility

`node scripts/shot.mjs <clip> <ms...>` scatta singoli fotogrammi per ispezione veloce
(richiede il dev server attivo).
