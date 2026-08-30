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

### Stato: 13 schermi su 13

| schermo | diff | | schermo | diff |
|---|---|---|---|---|
| checkout-1a-pick-tempo | 0.22% | | checkin-5-make-sense | 1.06% |
| checkout-2-rpe | 0.42% | | checkout-5-body-map | 1.31% |
| checkout-1b-reveal | 0.54% | | checkin-3-body-map | 1.44% |
| checkin-1-predict | 0.90% | | checkin-2-tune-in | 1.55% |
| checkout-4-energy | 0.94% | | checkin-4-sensation-sheet | 1.71% |
| checkout-7-close-loop | 0.97% | | checkout-6-sensation-sheet | 1.95% |
| | | | checkout-3-satisfaction | 2.08% |

Il residuo e' antialiasing dei glifi — confrontiamo font vivo contro testo gia' in
outline, sotto quella soglia non si scende. La percentuale cresce con la QUANTITA'
di testo: checkout-3 ha 40+ blocchi ed e' visivamente identico pur stando a 2.08%.
Il cancello vero e' `measure.mjs`: scostamento massimo <= 2px.

Due punti non convergono e non e' un difetto del codice: i glifi `ⓘ` e `✨` non
esistono in Space Grotesk, e Figma e Chrome ripiegano su fallback diversi (nell'export
Figma `✨` e' addirittura un quadrato vuoto).

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

## Cosa hanno insegnato gli altri dodici

- **Lo stroke di Figma non consuma spazio di layout.** In CSS il `border` lo consuma:
  le pill di checkout-3 perdevano 3px di contenuto e il testo andava a capo su due
  righe. Ovunque il layout dipenda da padding usiamo `outline` + `outline-offset`
  negativo, che disegna dentro senza togliere spazio.
- **I figli di un contenitore con bordo sono relativi al contenuto.** Su checkout-5
  il corpo umano sta a `129/330`, non a `127.5/328.5` come dice la somma delle
  coordinate annidate: e' il bordo da 1.5px. Da solo valeva 3.52% -> 1.31%.
- **Il tracking dichiarato non e' sempre quello renderizzato.** Il titolo di
  checkin-3 dichiara `-0.5px` e renderizza `-0.3px`. Verificare per blocco con
  `sweep.mjs`, non fidarsi dell'hint.
- **Le stesse icone hanno colori diversi fra schermi.** La nota musicale e' `#4AB5A0`
  su tune-in e `#10B981` su checkout-4: riusare l'asset sbagliato non si vede a occhio
  ma il diff lo prende.
- **Figma non centra sempre le etichette dei bottoni.** Su checkout-4 l'etichetta del
  CTA e' centrata in una scatola da 354 dentro un bottone da 342: centrarla sul
  bottone la sposta di 5px.
- **La figura umana e' uno sprite** con fronte e retro affiancati: il toggle Front/Back
  sposta il ritaglio, non cambia immagine. Le macchie rosse sono dipinte dentro il
  raster, quindi non sono accendibili una a una.

## Strumenti

| comando | a cosa risponde |
|---|---|
| `node scripts/diff.mjs [id...]` | quanto sbaglio |
| `node scripts/measure.mjs <id>` | dove e di quanto, blocco per blocco |
| `node scripts/align.mjs <id>` | e' spostato o e' sbagliato? |
| `node scripts/sweep.mjs "<testo>" --prop letterSpacing --target N` | quale valore fa combaciare |

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
