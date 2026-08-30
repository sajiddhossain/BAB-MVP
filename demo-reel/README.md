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
| checkout-2-rpe | 0.42% | | checkin-2-tune-in | 1.55% |
| checkout-1b-reveal | 0.54% | | checkin-4-sensation-sheet | 1.71% |
| checkin-1-predict | 0.86% | | checkout-6-sensation-sheet | 1.95% |
| checkout-4-energy | 0.94% | | checkout-3-satisfaction | 2.08% |
| checkout-7-close-loop | 0.97% | | checkin-3-body-map | 2.27% |
| | | | checkout-5-body-map | 2.67%\* |

\* soglia sua, dichiarata nel registry: il frame di checkout-5 mostra la figura DI
SPALLE mentre nel toggle e' acceso "Front" — nell'export era un'immagine sola e le
linguette non giravano il corpo. Ora il corpo gira davvero, quindi con "Front"
mostriamo il fronte e la figura non puo' coincidere col frame. Il resto dello
schermo si'. Le due body map hanno comunque un residuo alto per un motivo voluto:
il frame ha le macchie rosse gia' dipinte, la nostra figura parte vuota.

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
- **La figura umana era uno sprite** con le macchie rosse dipinte dentro: non
  accendibili una a una. Ora e' un disegno vettoriale con le zone vive sopra —
  vedi "La body map".

## La body map

Il disegno di partenza (`src/ui/assets/bodymap/body-map.svg`) e' **un path unico
da 78 sottotracciati**: le zone del corpo non esistono come nodi, e non esistono
nemmeno in Figma (il nodo e' un'immagine). Ma il disegno le contiene gia' come
linee.

`tools/extract-zones.py` le tira fuori: rasterizza a 2x, trova ogni area chiusa
dalle linee, ne traccia il contorno e lo semplifica. Escono **66 zone** (33 per
lato, dalla testa ai talloni) i cui contorni combaciano col tratto originale
invece di stargli vicino.

Tre cose imparate qui:

- **`np.cross` su vettori 2D e' deprecato in numpy 2** e restituisce distanze
  nulle: Douglas-Peucker riduceva ogni contorno a due punti e le zone sparivano
  senza un errore.
- **L'inseguimento di bordo alla Moore si incastra** rimbalzando fra due pixel
  adiacenti. Sostituito col tracciamento dei bordi dei pixel — ogni pixel di
  confine contribuisce il suo lato, poi si concatenano: esatto per costruzione.
- **I punti di innesco messi a occhio non si possono verificare.** Un seme sul
  braccio cadeva nel vuoto fra braccio e fianco e il riempimento esondava su
  tutto lo sfondo, senza che si notasse. Ora le zone si abbinano per baricentro
  a un elenco di aree gia' trovate, e un seme sbagliato e' un errore, non un
  silenzio.

Nel componente il tratto originale sta **sopra** le campiture come `<image>` nello
stesso viewBox: il colore resta dentro le linee, le linee restano nitide, e non
c'e' niente da allineare a mano. Il viewBox e' l'ingombro esatto del tratto, quindi
le misure del riquadro sono quelle che si vedono.

Il tocco e' tollerante: gomito e polso sono zone da ~180px, pretendere il centro
esatto le renderebbe intoccabili. Se il dito non centra nessuna zona si prende la
piu' vicina entro 46 unita' di disegno.

`python3 tools/extract-zones.py --debug` scrive anche `out/diff/zones-debug.png`,
la mappa colorata per controllare a occhio.

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
npm run dev          # prototipo camminabile + reel, esposto anche in rete locale
npm run check:proto  # verifica che tap/scroll/swipe funzionino davvero
npm run diff         # verifica la fedelta' contro Figma
npm run record       # registra entrambe le clip in out/
python3 tools/extract-zones.py --debug   # rigenera le zone della body map
```

## Il feel

Le cose che tradiscono un prototipo non sono quasi mai grosse. Queste sono
quelle che ho tolto di mezzo, e cosa dicevano:

| | prima | ora |
|---|---|---|
| barretta "Check-in 3/5" | sempre a schermo | e' un attrezzo mio, si accende con `?dev=1` |
| contorno dello stage | nero da lettore video | il colore dell'app: le bande sembrano la stessa superficie |
| tastiera aperta | il visualViewport si dimezzava e l'app si rimpiccioliva sotto le dita | non si rimisura mentre scrivi: la tastiera COPRE, non restringe |
| apertura | mezzo secondo di carattere di sistema, poi salto a Bricolage | il prototipo compare quando i font ci sono |
| barre di scorrimento | visibili | via |
| tocco | solo visto | e anche sentito, dove il dispositivo lo permette (`navigator.vibrate`; iOS Safari non ce l'ha, e li' non fingiamo) |
| pannello che sale | lo schermo dietro si scuriva e basta | arretra, si arrotonda e rientra se trascini giu' — e' il gesto che dice "questo sta SOPRA a quello" |

Sull'ultima: vale solo dentro al prototipo. E' la presentazione di uno schermo
sopra un altro, e senza navigazione non c'e' niente da presentare — nel probe
del diff lo sfondo del pannello e' un fondale, non uno schermo arretrato.

## Sul telefono

Il prototipo e' installabile: aprilo dal telefono e "Aggiungi a Home". Da li'
parte a schermo intero, senza barre del browser, con la sua icona. Funziona anche
senza rete, ma dalla seconda apertura: la prima installa il service worker senza
ancora passarci attraverso, quindi non lascia niente in cache.

Quello che lo fa sembrare un'app e non una pagina:

- lo stage da 402x874 e' scalato per riempire lo schermo. **`shrink-0` e'
  obbligatorio**: e' un flex item, e `transform: scale` non riduce la larghezza
  di *layout*, quindi su uno schermo da 375 il flex lo stringeva e tutto il
  contenuto (posizionato in assoluto) finiva tagliato a destra;
- `viewport-fit=cover` e niente zoom col doppio tocco, che su un prototipo
  tocca-e-trascina si attiva per sbaglio in continuazione;
- `100dvh` e non `vh`: su iOS `vh` conta la barra degli indirizzi anche quando e'
  sparita, e lo stage veniva piu' alto dello schermo;
- il reel si carica **su richiesta**. Si porta dietro i 13 export di Figma
  (~5MB di PNG in base64) e finiva nel bundle anche per chi apriva solo il
  prototipo: 5.4MB → 271kB (81kB gzip).

## Il prototipo

Aprendo la pagina parte il **prototipo camminabile**: tocchi e passi allo schermo dopo.

- **tap** ovunque → avanti; **tap in alto a sinistra** (il tasto indietro) → indietro
- **swipe orizzontale** → avanti/indietro; **swipe verticale** → scorre lo schermo
- `?flow=checkout` per l'altro flusso; frecce e barra spaziatrice su desktop

Il frame da 402x874 viene scalato per riempire lo schermo del telefono
(`useFit.ts`, che segue `visualViewport` perche' su iOS la barra degli indirizzi
cambia l'altezza utile mentre scrolli).

`npm run dev` stampa anche un indirizzo `Network:`: aprilo dal telefono sulla
stessa wifi. Per un link stabile, `npm run build` e pubblica `dist/`.

Le altre viste restano dove erano: `?clip=checkin` il reel da registrare,
`?probe=<id>` un singolo schermo nudo per il diff.

## Come si muove

La fedelta' statica e' una cosa, il fatto che sembri un'app e' un'altra. Le
schermate restano identiche al frame Figma **da ferme** — il diff continua a
passare su tutte e 13 — e tutto quello che segue vive nel movimento e nel
comportamento, che nel frame non ci sono.

**Si va avanti solo confermando.** Prima bastava toccare un punto qualunque
dello schermo. Era comodo per scorrere i frame, ma e' la cosa che piu' di tutte
tradisce che non e' un'app: appoggi il pollice per leggere e ti ritrovi due
schermi piu' avanti. Ora avanza il bottone principale, o un comando che chiude
il suo passo (una zona del corpo, "Somewhere else"). Indietro resta un gesto: lo
swipe da sinistra.

**I blocchi entrano sfalsati.** All'ingresso di uno schermo salgono di 10px in
sequenza invece di comparire tutti insieme. Il dettaglio che lo rende possibile:
`animation-fill-mode: backwards` e non `both` — con `both` l'ultimo fotogramma
resta applicato per sempre e il suo `transform: none` batte lo `scale` in linea
del tocco, quindi i bottoni smettevano di affondare quando li premevi.

**Il resto del movimento**, e cosa dice ognuno:

| dove | cosa fa | perche' |
|---|---|---|
| passaggio fra schermi | quello che esce si spegne e scala, quello che entra proietta ombra | dice qual e' lo schermo vivo senza disegnarci sopra un velo |
| bottoni e chip | affondano svelti, risalgono con un rimbalzo; i colori sfumano | il tocco diventa una cosa fisica invece di un cambio di colore |
| barra di avanzamento | si riempie da dov'era, non salta al valore nuovo | il passo avanti si vede |
| pallino degli slider | cresce mentre lo tieni | dice "l'ho preso io" senza scriverlo |
| zone del corpo | pulsano quando si accendono | conferma che il dito ha preso quella e non la vicina |
| bottom sheet | si trascina via dalla maniglia, e i veli si alzano insieme | il gesto e' collegato a quello che c'e' sotto |

`prefers-reduced-motion` spegne tutto, e in cattura le animazioni non partono:
altrimenti il diff fotograferebbe gli schermi a meta' ingresso.

### Si parte da foglio bianco

I componenti hanno come default lo stato del **frame Figma**: il chip gia'
scelto, gli slider dove li ha messi il designer, "2 spots added". E' giusto che
sia cosi' — e' quello che il diff confronta, e senza sarebbe impossibile
verificare la fedelta'. Ma aprire l'app e trovare le risposte gia' date non e'
un'app: e' una fotografia.

Quindi il vuoto vive nel **prototipo**, non nei componenti: `proto/blank.ts`
riempie lo store prima del primo render. Chi apre il prototipo trova il foglio
bianco; il probe del diff, che lo store non lo tocca, continua a cadere sui
default del frame. Nessuno dei due si accorge dell'altro.

Gli slider fanno eccezione, perche' un cursore non ha uno stato vuoto: ha una
posizione. Partono dal mezzo — su una scala 1–7 e' il 4, su una 0–10 e' il 5 —
che e' la risposta neutra, non una risposta gia' data. (Sono tutti larghi 302 col
pallino da 24, quindi il mezzo cade a 139 per tutti.)

**Il bottone principale resta spento finche' la domanda non ha risposta**, e si
accende quando rispondi. Vale dove il frame Figma mostra una risposta data:
checkin-1, tune-in, checkout-3, e i due sensation sheet ("Add this sensation"
senza nessuna sensazione nominata non aggiunge niente).

Compreso **checkout-1a**, il cui frame mostra il bottone acceso senza nessuna
andatura scelta: li' il filo ambra su "Gentle" e il bordo spesso su "Upbeat" non
sono una scelta fatta — sono la previsione del mattino e una variazione di stile.
Uniformarlo costa 0.22% -> 5.22% di diff, ed e' tutto il bottone; sta dichiarato
nel registry col perche'. Un bottone acceso che non porta da nessuna parte e'
peggio di uno spento che dice il motivo.

### La vita di un punto sul corpo

Non basta che una zona si accenda: deve poter tornare indietro. Il giro completo:

1. **tocchi una zona** — si accende e il pannello sale, ma il punto e' solo *in
   sospeso*: il contatore non si muove;
2. **"Add this sensation"** — ora il punto e' salvato, il pannello si chiude e si
   torna alla mappa, dove il contatore e' salito. Non si va avanti: e' "Almost
   done" che porta allo schermo dopo, scavalcando il pannello;
3. **esci con la ✕** invece di confermare e non resta niente. Altrimenti
   basterebbe sfiorare il corpo per ritrovarsi punti mai nominati;
4. **ritocchi un punto salvato** — si riapre con le TUE parole, i tuoi chip e la
   tua intensita', e il bottone dice "Update this sensation";
5. **"Remove this spot"** lo toglie, e il contatore torna indietro.

Ogni punto tiene le sue risposte: la chiave dello store porta l'id della zona
(`checkin.spot.quad-r.chips`), non una sola condivisa. Segni ginocchio e poi
spalla e non ti ritrovi le parole del ginocchio.

Due dettagli che non si vedono ma contano:

- **"Remove this spot" sta SOPRA il bottone.** Sotto finiva negli ultimi 34px del
  frame, che Figma lascia liberi apposta: li' ci passa la barra home dell'iPhone,
  e sarebbe stato un comando che non si riesce a toccare.
- **Un punto nuovo si apre vuoto** anche se il frame ha tre chip gia' scelti. Le
  chiavi sono una per zona, quindi `blank.ts` non puo' elencarle: segna che la
  sessione parte da foglio bianco, e il pannello sceglie i default di
  conseguenza. Il probe del diff non tocca lo store, legge `false`, e cade sui
  valori del frame.

Copy inventata da me, da far validare: **"Update this sensation"** e
**"Remove this spot"** non esistono nel Figma.

### I campi fanno quello che dicono

| comando | prima | ora |
|---|---|---|
| "Describe it in your own words..." | testo che sembrava un campo | campo vero, scrive e ricorda; il bordo si accende |
| "A little help ✨" con la freccia | freccia ferma | apre e chiude i chip, e il pannello si **accorcia** invece di restare col buco |
| "Somewhere else ⓘ" | bottone morto | apre il pannello intestato "Somewhere else" |
| ✕ del pannello | chiudeva | chiude, e si puo' anche trascinare via il pannello |

La tendina che si chiude e' l'unico punto un po' insidioso: il blocco sotto e'
avvolto in un `div` senza posizionamento, che sta all'origine del pannello e ha
altezza zero. I figli in assoluto risolvono quindi sulle stesse coordinate di
prima, ma il `transform` del `div` gli fa da blocco contenitore e li porta su
tutti insieme.

### Cosa si tocca davvero

| schermo | comandi |
|---|---|
| checkin-1 / checkout-1a | i tre chip del tempo |
| checkin-2 tune-in | 4 slider, le pillole della durata, i due toggle Si/No |
| checkin-3 / checkout-5 | Front/Back gira davvero il corpo; toccare una zona la accende e fa salire il sheet |
| sensation sheet (×2) | 16 chip, Si/No, slider intensita', la ✕ chiude |
| checkout-2 / checkout-4 | slider con scatti; su energy cambia anche la lettura |
| checkout-3 | le 5 facce e le 6 pillole |
| checkout-7 | Si/No sulla domanda finale |

Lo stato sta in `src/ui/state.ts`, fuori da React: sopravvive alla navigazione,
quindi tornando indietro ritrovi le tue scelte. I componenti restano
renderizzabili senza provider, cosi' il diff contro Figma continua a funzionare
(nessuno scrive nello store, quindi ogni campo cade sul default = stato Figma).

Il tocco su un comando **non** fa cambiare schermo: `Touchable` ferma la
propagazione, altrimenti il tocco arriverebbe anche allo stage.

### Cosa NON fa ancora

- L'accordion "Try this today" su checkin-5 non si apre: **lo stato aperto non
  esiste nel Figma**, mi inventerei il contenuto.
- Il testo della pillola di lettura su checkout-4 esiste in Figma solo per il
  valore 3: gli altri sei sono segnaposto miei, da far validare.
- Un punto segnato "Somewhere else" conta nel totale ma non si vede sulla
  figura: non e' una zona del disegno. Si riapre solo dal bottone.
- Non c'e' un tasto indietro DENTRO al bottom sheet: da li' si esce con la ✕,
  trascinando, o con lo swipe. Il tasto indietro appartiene allo schermo dietro,
  ed e' coperto dai veli.
- I campi di testo non si scrivono.
- Il reel (`?clip=`) usa ancora gli export SVG di Figma, non i componenti: i due
  video escono da li'. Rifarlo sui componenti e' il passo successivo.

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
