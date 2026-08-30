# BAB · Demo Reel

Riproduzione animata dei frame Figma per girare uno **screen record simulato** dell'app.
Due clip separate: `checkin` (32.6s) e `checkout` (43.6s).

## Due modi di produrre gli schermi

**v1 — SVG intatti** (`src/reel/screens.ts`): gli export Figma entrano cosi' come sono.
Fedelta' immediata, ma ogni schermo e' uno stato finale: un tap non puo' cambiare nulla
dentro lo schermo, e il video ha poco il feel di un'app.

**v2 — UI ricostruita** (`src/ui/`): gli schermi sono componenti React veri, con stato.
Costa piu' tempo ma permette selezioni, slider, progress che si riempie — cioe' il feel
di app che serve al video.

La v2 non si fa a occhio: si fa con il loop di verifica qui sotto.

## Il loop di verifica

```bash
npm run diff                      # tutti gli schermi del registry
node scripts/diff.mjs checkin-1-predict
node scripts/measure.mjs checkin-1-predict
```

`diff.mjs` renderizza il componente React alle dimensioni native, renderizza **nello
stesso Chrome** l'export Figma, e li confronta pixel per pixel. Esce una percentuale e
tre immagini in `out/diff/`: `.mine`, `.ref`, `.diff` (rosso = differenza vera,
giallo = antialiasing).

> Perche' lo stesso Chrome: all'inizio rasterizzavo il riferimento con Inkscape e il
> diff misurava anche la differenza fra due rasterizzatori — ogni bordo di ogni glifo
> risultava sbagliato. Con lo stesso motore su entrambi i lati, cio' che resta e' reale.

`measure.mjs` risponde alla domanda successiva: **dove** e **di quanto**. Trova da solo
i blocchi di testo nel riferimento e per ognuno confronta larghezza, altezza e posizione.
Un Δ di 1px e' arrotondamento del line box; un Δ di 5px e' il font sbagliato.

Stato: `checkin-1-predict` a **0.88%**, tutti i blocchi entro 2px.
Il residuo e' antialiasing dei glifi — confrontiamo font vivo contro testo in outline,
sotto quella soglia non si scende.

## Cosa ha insegnato il primo schermo

- **Il codice generato da Figma non e' sempre cio' che Figma renderizza.** Dichiarava
  `font-variation-settings: 'opsz' 14` sul titolo. Misurato: con `opsz 14` il titolo esce
  266px, l'export ne misura 260. Quello vero e' l'optical sizing automatico. Seguire
  l'hint alla lettera peggiorava il diff — la misura ha corretto la documentazione.
- **`@fontsource-variable/bricolage-grotesque/index.css` carica solo l'asse `wght`.**
  Serve `opsz.css`, altrimenti gli assi che Figma usa non esistono nel font caricato.
- **Le ombre non sono `box-shadow`**: sono rettangoli pieni `rgba(0,0,0,0.04)` sfalsati
  dietro l'elemento (4px sulle card, 6px solo in basso sui bottoni). Vedi `Raised.tsx`.
- Le coordinate assolute di Figma sono corrette: lo sweep degli offset conferma che
  `(0,0)` e' gia' l'ottimo, non serve "aggiustare a occhio".

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
