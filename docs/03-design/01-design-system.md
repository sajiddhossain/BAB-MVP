# 01 · Design system

> Fonti confrontate: la **landing BAB in produzione** (`BAB_Landing/src/index.css`,
> `index.html`, componenti), i **prototipi HTML** del pacchetto MVP, il documento
> `ui_ux_component_specs.md`, e `bab_style_research.md`.

---

## Il problema: tre direzioni visive in conflitto

Il materiale contiene **tre sistemi visivi diversi e incompatibili**. Questa è la prima
cosa da risolvere, prima di disegnare qualsiasi schermata.

| | **A · Landing (in produzione)** | **B · Prototipi MVP** | **C · `ui_ux_component_specs.md`** |
|---|---|---|---|
| **Sfondo** | Crema `#FAF9F6` + griglia a puntini tipo quaderno | Navy scuro `#0E1322` (con light mode `#EEF1F9`) | Blu notte `#080C12` |
| **Superfici** | Bianco, bordo nero 3px, ombra offset dura | Pannelli `#161D30`, bordo sottile, ombra morbida | Glassmorphism, blur 20px, bordo in gradiente |
| **Accento** | Teal `#34BBC0` + lime `#D2EC7C` + coral `#FF6B5C` | Arancio `#FF9F45` + teal `#24B6B0` + viola `#8B83F5` | Teal `#34BBC0` + lime `#DAE69A` |
| **Font display** | Bricolage Grotesque | font di sistema | Corben |
| **Font testo** | Space Grotesk | font di sistema | Plus Jakarta Sans |
| **Personalità** | Neo-brutalista, quaderno, gioiosa | Sportiva scura, sobria | Premium tech, Y2K vetro |

E `bab_style_research.md` ne propone una **quarta** ("CAMPO VIVO": Cormorant Garamond +
DM Sans, terracotta e verde campo), mai implementata.

---

## La raccomandazione: 🟡 estendere il sistema della landing (A)

**Il sistema visivo dell'app deve essere il sistema della landing.** Non un cugino,
non una variante scura: lo stesso.

### Perché — quattro ragioni, in ordine di peso

**1. Il dark tech premium è l'estetica di ciò contro cui BAB è definita.**
`#080C12` + glassmorphism + anelli di progresso è, letteralmente, il linguaggio visivo di
Whoop e Oura. Ma la frase fondativa del prodotto è *"quasi tutta la tecnologia sportiva
misura l'atleta dall'esterno; noi facciamo l'opposto"*. Adottare l'estetica di quel mondo
comunica esattamente il contrario del posizionamento — e lo comunica prima che l'utente
legga una parola.

**2. La metafora del quaderno è già il prodotto giusto.**
La landing ha uno sfondo a **griglia di puntini con righe leggere** — un quaderno. BAB è
un diario del corpo, non una dashboard. Il fondo crema con puntini dice *"questo è un
posto dove annoti come stai"*. Il fondo nero con vetro dice *"questo è un cruscotto che
ti misura"*. È la scelta di superficie più significativa dell'intero prodotto.

**3. Continuità di fiducia landing → app.**
Il percorso è: genitore/club vede la landing → l'atleta scarica l'app. Se la seconda non
somiglia alla prima, si perde tutto il capitale di fiducia costruito. La guida UX della
landing (`docs/ux/01-principio-fiducia.md`) è costruita interamente su questo tema.

**4. I prototipi già supportano il chiaro.**
Tutti e cinque hanno un blocco `@media (prefers-color-scheme: light)` con fondo `#EEF1F9`.
Il passaggio a un tema chiaro non è una riscrittura, è una ri-tokenizzazione.

### Cosa si prende dagli altri due sistemi

- **Da B (prototipi):** i **colori dei tre tempi**. Sono buoni e semanticamente giusti.
  Vanno però riportati sulla palette BAB (vedi sotto).
- **Da C (`ui_ux_component_specs`):** la **geometria** — margini 16px, gap 24px sezione,
  16px card, 12px lista; il viewport target 360/393/430; icone 24×24 in primitive
  geometriche. È lavoro buono e riutilizzabile.
  ❌ Si scartano: glassmorphism, palette scura, Corben.
- ❌ **Da `bab_style_research.md`:** nulla. È una proposta del giugno 2025 mai adottata;
  la landing ha preso un'altra strada. Va archiviata per non generare confusione.

---

## I token

### Colori — base

```css
/* Superfici */
--bab-canvas:      #FAF9F6;   /* crema — lo sfondo, il "foglio" */
--bab-surface:     #FFFFFF;   /* card */
--bab-surface-alt: #E8E4D8;   /* sabbia — superficie secondaria */
--bab-ink:         #0F0F12;   /* inchiostro — testo, bordi, ombre */
--bab-ink-soft:    #5C6A86;   /* testo secondario */

/* Brand */
--bab-teal:        #34BBC0;   /* accento interattivo */
--bab-vividteal:   #1F7A63;   /* brand primario */
--bab-deepteal:    #143F36;   /* superfici scure "spazio sicuro" */
--bab-lime:        #D4F46A;   /* energia positiva, "vai" */
--bab-gold:        #FFC042;   /* ricompensa, traguardo */
--bab-coral:       #FF6B5C;   /* energia, sfida, allerta */
--bab-pink:        #FF8FB1;   /* corpo, ciclo */
--bab-lavender:    #B8A9E8;   /* umore, emozioni */
--bab-sky:         #8FD4E8;   /* calma, respiro, recupero */
```

*(già definiti in `BAB_Landing/src/index.css` — non sono nuovi, sono i token esistenti)*

### Colori — semantici dell'app

Qui va fatta la mappatura, che oggi non esiste:

```css
/* I tre tempi */
--tempo-upbeat:    var(--bab-coral);      /* ⚡ energia, spinta */
--tempo-steady:    var(--bab-teal);       /* 🌊 controllo, qualità */
--tempo-gentle:    var(--bab-lavender);   /* 🍃 recupero, cura */

/* Stati */
--care:            var(--bab-coral);      /* 🛡️ Care mode */
--cycle:           var(--bab-pink);       /* 🌙 layer ritmo */
--growth:          var(--bab-lime);       /* 🌱 progresso, insight */

/* Fasi del ciclo (sfondo grafici, sempre desaturate) */
--phase-menstrual:   color-mix(in srgb, var(--bab-pink) 22%, transparent);
--phase-follicular:  color-mix(in srgb, var(--bab-lime) 22%, transparent);
--phase-ovulation:   color-mix(in srgb, var(--bab-gold) 22%, transparent);
--phase-luteal:      color-mix(in srgb, var(--bab-lavender) 22%, transparent);
```

> **Nota sulla scelta dei tempi.** I prototipi usano arancio/teal/viola. Ho mantenuto la
> stessa logica cromatica (caldo → freddo → morbido) mappandola su coral/teal/lavender
> della palette BAB. Il lavanda per Gentle è particolarmente adatto: è il colore "umore/
> emozioni" del sistema, e Gentle è il tempo che richiede più permesso emotivo per essere
> scelto.
>
> 🔴 **Vincolo:** nessun rosso allarme. Il coral `#FF6B5C` è il punto più caldo consentito,
> e non si usa mai per comunicare un problema — solo energia. Il Care mode usa coral come
> **cornice**, mai come riempimento di un badge d'allarme (§10, "nessun punteggio nocebo").

### Tipografia

```css
--font-display: "Bricolage Grotesque", sans-serif;   /* titoli */
--font-body:    "Space Grotesk", sans-serif;         /* testo, UI */
```

Stessi della landing. Nessun font nuovo.

| Ruolo | Font | Dimensione | Interlinea | Peso |
|---|---|---|---|---|
| H1 display | Bricolage | 32px | 110% | 800 |
| H2 sezione | Bricolage | 24px | 120% | 700 |
| H3 card | Bricolage | 18px | 130% | 700 |
| Corpo | Space Grotesk | 16px | 150% | 400 |
| Corpo piccolo | Space Grotesk | 14px | 140% | 400 |
| Label / tag | Space Grotesk | 12px | 130% | 700, +0.08em, MAIUSC |

> **Regola dalla guida UX della landing:** *"maiuscolo con parsimonia — ottimo per label
> e badge corti, dannoso per la leggibilità su frasi lunghe."* Il corpo lungo è sempre
> in case normale. In un'app dove il copy educativo è lungo, questo conta molto.

### Forma e profondità

Il DNA visivo della landing, misurato sul codice reale:

```css
--bab-border:  3px solid var(--bab-ink);
--bab-radius:  16px;         /* card */
--bab-radius-pill: 999px;    /* bottoni, chip */
--bab-shadow-sm: 4px 4px 0 0 var(--bab-ink);
--bab-shadow-md: 6px 6px 0 0 var(--bab-ink);
--bab-shadow-lg: 8px 8px 0 0 var(--bab-ink);
/* varianti colorate per elementi selezionati */
--bab-shadow-teal: 6px 6px 0 0 var(--bab-teal);
--bab-shadow-lime: 6px 6px 0 0 var(--bab-lime);
```

**Ombre dure con offset, mai sfocate.** Niente blur, niente glassmorphism, niente
gradiente sui bordi. È l'elemento più riconoscibile del brand e va portato nell'app.

🟡 **Adattamento per mobile:** su schermo piccolo le ombre 8px diventano ingombranti.
Proposta di scala: `4px` per elementi in lista/chip, `6px` per card principali, `8px`
riservato al singolo elemento protagonista della schermata (di solito il bottone primario).
Questo implementa automaticamente la regola *"un solo next step dominante"*.

### Spaziatura e geometria

Presa da `ui_ux_component_specs.md`, che è già corretta:

```
Margini laterali:        16px
Padding verticale:       24px
Gap sezione ↔ sezione:   24px
Gap interno card:        16px
Gap elementi in lista:   12px
Viewport target:         360 / 393 / 430 px
```

---

## Componenti chiave

### 1 · La scala a 5 emoji

Il componente più ripetuto dell'app (7 istanze tra pre e post).

```
┌────┬────┬────┬────┬────┐
│ 🪨 │ 🪵 │ 🍂 │ 🪶 │ 🦋 │
│  1 │  2 │  3 │  4 │  5 │
└────┴────┴────┴────┴────┘
 Pesante / dolorante   Leggera e scattante
```

- Griglia a 5 colonne uguali, gap 7px.
- Target touch **≥ 44×44px** 🔴 (regola accessibilità dalla guida landing).
- Selezionato: bordo 3px nel colore del canale + ombra offset colorata.
- ⚠️ **Non affidare mai il significato al solo colore**: il numero 1–5 sotto l'emoji resta
  sempre visibile, e gli estremi sono etichettati a parole sotto la scala.

### 2 · Le pill multi-select (Headspace, sensazioni, fasi)

Chip a bordo pieno, raggio 999px, selezione a toggle. Bordo 2px, ombra 3px quando attivo.

### 3 · La card tempo (risultato)

L'elemento più grande dell'app. Fondo = tint del colore del tempo (12–16%), bordo 3px
inchiostro, ombra 8px. Icona in un quadrato di 52px con il colore pieno.

### 4 · La mappa corporea SVG

- `viewBox="0 0 200 400"`, larghezza resa ~150–200px su mobile.
- Zone: riempimento `--bab-surface-alt`, bordo inchiostro 1.5px.
- Hover/attivo: riempimento nel colore del tint corrispondente.
- Già loggata: riempimento tint + bordo 2px, così le zone toccate restano visibili.
- ⚠️ Le zone piccole (mani, ginocchia) vanno verificate contro il target 44px su 360px di
  larghezza. Se non passano, o si ingrandisce la figura o si riduce il numero di zone.

### 5 · Il blocco educativo collassabile

```
▸ Rivedi la differenza tra i due tipi di dolore
```

Espanso le prime 2 settimane, poi chiuso. Pattern riutilizzabile per tutti i contenuti
didattici (fasi del ciclo, decode the ache, la scienza).

---

## Motion

Dalla guida UX della landing, che si applica identica:

- Animazioni d'ingresso **brevi e una volta sola**. Mai loop nelle zone di calma.
- 🔴 **`prefers-reduced-motion` rispettato ovunque.** Testuale dalla guida: *"per un
  pubblico ansioso, il movimento ridotto è cura, non ripiego."*
- Transizioni tra schermate: **250ms, ease-out** (da `ui_ux_component_specs`).
- Feedback tattile sui bottoni: `scale: 96%` alla pressione.
- ❌ Nessuna animazione celebrativa su un risultato di check-in. Il risultato non è una
  vittoria da festeggiare — è un'informazione da leggere.

---

## Il ritmo energia / calma

La guida della landing ha una regola che si applica alla perfezione all'app:

> Alterna deliberatamente **zone ENERGIA** (neobrutalismo pieno: bordi spessi, ombre dure)
> e **zone CALMA** (bassa complessità, fondo neutro, un solo accento, più spazio bianco).
> **Mai due picchi di energia consecutivi.**

Traduzione per l'app:

| Zona | Energia | Calma | Note |
|---|---|---|---|
| Home "Oggi" | ●●● | ● | Una card protagonista |
| Step del check-in | ● | ●●● | Massima calma: è un lavoro di introspezione |
| Card risultato tempo | ●●● | ● | Il momento più espressivo dell'app |
| Compare / Adjust | ● | ●●● | Si legge, non si celebra |
| **Care mode** | ● | ●●● | 🔴 Deliberatamente **calmo**. Il panico non aiuta. |
| Percorso | ●● | ●● | |
| Patterns | ● | ●●● | I dati chiedono sobrietà |
| Body-story | ●● | ●● | Deve essere bella da mostrare |

> Il Care mode in zona calma è controintuitivo e va difeso: l'istinto sarebbe fare rumore
> visivo su una bandiera rossa. Ma il principio §10 dice *"nessun punteggio nocebo, proteggi
> uno spazio neutro e a bassa attivazione"*. Un'adolescente allarmata segnala **meno**, non
> di più. La serietà si comunica con la chiarezza dell'istruzione, non col colore.

---

## 🔵 Da decidere

1. **Tema scuro:** si supporta? I prototipi ce l'hanno già. 🟡 Proposta: sì, ma come
   inversione dei token, mantenendo bordi e ombre offset (non passando a glassmorphism).
2. **`ui_ux_component_specs.md` va aggiornato o archiviato?** Attualmente descrive un
   sistema visivo che contraddice la landing in produzione. Se resta com'è, chi lo legge
   costruirà la cosa sbagliata.
3. **L'avatar Tamagotchi** descritto in `ui_ux_component_specs` §5 — vedi
   [brainstorming](../04-brainstorming/01-brainstorm-app-mobile.md), dove lo valuto contro
   i principi.
