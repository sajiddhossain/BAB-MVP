# 01 · Cosa tracciamo

> Fonte: documento madre §4.1, §4.2, §6 + prototipi `01-pre-training` e `02-post-training`.

---

## I 6 domini di segnale

Principio guida: **una mappa corporea è spaziale; la maggior parte degli stati corporei
non lo è.** Ogni dominio si cattura con il metodo che gli è proprio — non si forza tutto
sulla mappa.

| Dominio | Metodo di cattura | Note |
|---|---|---|
| **Gambe e corpo** (muscoloscheletrico) | Mappa corporea — primaria | Regione + sensazione + intensità + tag di comportamento |
| **Respiro e cuore** (sforzo/attivazione) | Scalare; mappa opzionale | Sforzo + "nervi" 1–5; tap su petto/gola ammessi, non forzati |
| **Energia e sete** | Scalare 1–5 | Non localizzabile. **Nessun cibo/fame.** |
| **Sonno e recupero** | Scalare 1–5 + ore approssimative | Non localizzabile; richiamato nel pre-check |
| **Focus e umore** | Emoji / 1–5 | Non localizzabile |
| **Ciclo** (layer femminile) | Calendario + mappa discreta | Opt-in, privacy-guarded; contesto + rete di sicurezza RED-S |

### 🟡 Nota di design: come i prototipi hanno tradotto questi domini

I prototipi non usano i nomi dei domini: usano la parola **"canali"** (*channels*), che
è molto più adatta a un'undicenne. È una buona traduzione e va tenuta.

**Pre-allenamento (v2 — versione di riferimento):**

| Canale | Estremi della scala | Emoji scale (1→5) |
|---|---|---|
| 😴 **Sleep** — quanto sei riposata da stanotte | Barely slept → Deep & rested | 🦥 🐢 🐨 🐰 🦁 |
| 🔋 **Energy** — la tua carica adesso | Running on empty → Full of go | 🌧️ ⛅ 🌤️ ☀️ 🔥 |
| 💧 **Hydration** — quanto ti senti idratata | Parched / dry → Fully watered | 🏜️ 🌵 🌾 🌿 🌊 |
| 💪 **Muscles & body** — pesantezza vs elasticità | Heavy / sore → Light & springy | 🪨 🪵 🍂 🪶 🦋 |
| 🧠 **Headspace** | *multi-select, non scalare* | vedi sotto |

**Headspace** è a selezione multipla, non una scala:
`🌀 Distracted · 🫣 Insecure · 😣 Stressed · 😵‍💫 Overwhelmed · 😌 Calm · 🎯 Focused · 😎 Confident · ➕ Other`

Con un campo libero (max 60 caratteri) se sceglie "Other".

> **Perché questa è una scelta forte.** Chiedere "dai un voto al tuo umore da 1 a 5" a
> una quattordicenne produce dati poveri e un'esperienza fredda. Chiederle di **nominare**
> ciò che sente produce dati più ricchi *e* allena esattamente la competenza che il
> prodotto vuole costruire. Le emoji-scale sono usate solo dove la grandezza ha davvero
> una direzione (sonno, energia, idratazione, muscoli).
>
> Dietro le quinte il multi-select viene ricondotto a un valore 1–5 per il calcolo del
> tempo: `3 + (n. positive) − (n. negative)`, clampato a [1,5]. L'atleta non lo vede mai.

**Post-allenamento (v2):**

| Canale | Estremi | Emoji scale |
|---|---|---|
| 🔥 **Effort** — quanto è stata dura davvero (= sRPE) | Gentle → Absolutely maxed | 😌 🙂 😅 🥵 🥴 |
| 💪 **Legs & muscles** | Trashed / heavy → Light & fine | 🪨 🪵 🍂 🪶 🦋 |
| 🫁 **Breathing & heart** | Still pounding → Settled & calm | 🌩️ 🌧️ 🌥️ 🌤️ ☀️ |
| 🔋 **Energy right now** | Drained → Still buzzing | 🪫 🔅 🔆 ✨ ⚡ |
| 🧠 **Headspace** | *stesso multi-select del pre* | — |

Le scale emoji sono **coerenti per famiglia semantica**: la famiglia "natura pesante →
leggera" (🪨 🪵 🍂 🪶 🦋) ricompare identica per i muscoli sia nel pre che nel post. È
una scelta ottima: crea un vocabolario visivo che l'atleta impara una volta sola.

---

## I 7 indicatori core (Temm & Beato)

Insieme piccolo, validato, a basso costo: **essenzialmente l'indice di Hooper + carico +
umore**, catturato su scala 1–5 dentro gli stessi check-in.

> Tenuti pochi **di proposito**: più item erodono l'aderenza dei giovani.

| Indicatore | Tipo | Perché (evidenza) |
|---|---|---|
| **Sonno** (qualità + ore) | Fisio | Marker centrale di recupero; Hooper (Temm, Beato) |
| **Fatica / freschezza** | Fisio | Segnale di readiness centrale e multifattoriale (Temm) |
| **Indolenzimento muscolare** | Fisio | DOMS + consapevolezza infortuni (Temm, Beato) |
| **Session-RPE** (carico) | Fisio | Misura di carico "green-standard" validata nei giovani (Temm) |
| **Stress** (incl. scuola/esami) | Psico | Lo stress giovanile è ciclico; alza il rischio malattia/infortunio (Temm) |
| **Umore / motivazione** | Psico | Marker soggettivo di readiness e benessere (Beato) |
| **FC a riposo al mattino** | Fisio (opzionale) | Readiness autonomica — solo baseline individuale (Beato) |

### ⚠️ Gap rilevato tra documento madre e prototipi

| Indicatore | Nel doc madre | Nei prototipi v2 | Nota |
|---|---|---|---|
| Sonno | ✅ qualità **+ ore** | ⚠️ solo qualità | Le **ore mancano**. Il doc le chiede esplicitamente ("rough hours"). |
| Stress scuola/esami | ✅ indicatore core | ⚠️ solo dentro Headspace (`Stressed`) | Il PDF `before & after` aveva un asse dedicato "chilled → exam week". Nel journey (Settimana 3, 6) lo stress scolastico è un tema centrale, e negli insight campione le settimane d'esame sono uno dei pattern chiave. **Senza un input dedicato quell'insight non è generabile.** |
| Antidolorifici | ✅ nello schema a 3 colonne + PDF | ❌ assente dai prototipi | È nello schema strategico ("Painkillers") ed è un indicatore rilevante. |
| Ore sonno | vedi sopra | ❌ | |

🟡 **Proposta:** reintrodurre nel pre-check tre micro-input a costo bassissimo:
- **Ore di sonno** — un selettore rapido a scaglioni (`<6 · 6-7 · 7-8 · 8-9 · 9+`), 1 tocco.
- **Scuola oggi** — slider a 3 stati (`tranquilla · impegnativa · settimana d'esami`), 1 tocco.
- **Antidolorifici** — toggle sì/no, mostrato **solo** se ha segnalato dolore. 0 tocchi nel caso normale.

Costo totale: +2 tocchi nel caso tipico. In cambio si sbloccano gli insight più
interessanti (stress ≠ ciclo) e un indicatore di sicurezza. Vedi
[decisioni aperte](../04-brainstorming/03-decisioni-aperte.md).

---

## I tre tier wearable (§6)

| Tier | Input | Cosa aggiunge |
|---|---|---|
| **Tier 0 — Tutte (gratis)** | Check-in + mappa corpo + log ciclo | Il loop completo di body literacy: consapevolezza + insight |
| **Tier 1 — Wearable semplice** | + FC a riposo e sonno | Un flag di contesto grezzo *recuperata / provata* vs la sua baseline |
| **Tier 2 — Capace di HRV** | + HRV mattutina (RMSSD) | Layer autonomico opzionale — **solo a livello individuale, mai il decisore** |

🔴 **Per l'MVP: solo Tier 0.** Il documento è esplicito sul fatto che l'app è pienamente
utile senza device, e aggiungere integrazioni wearable in v1 significherebbe spendere il
budget di sviluppo sulla parte meno differenziante del prodotto.

---

## La mappa corporea

Implementata in entrambi i prototipi, identica, **e questo è giusto**: la stessa mappa
pre e post permette il confronto cross-day (l'evoluzione dell'indolenzimento).

**Front (18 zone):** Head · Neck & shoulders · Chest · Left/Right arm · Left/Right hand ·
Tummy & core · Hips · Left/Right quad · Left/Right knee · Left/Right shin · Left/Right foot

**Back (18 zone):** Head · Neck · Upper back & shoulders · Left/Right arm · Left/Right hand ·
Lower back · Glutes · Left/Right hamstring · Left/Right knee · Left/Right calf ·
Left/Right heel & ankle

**Extra:** `All over` · `Somewhere else` (campo libero, max 40 caratteri)

**Flusso di interazione:** tocca zona → si apre il pannello sensazioni → scegli parola →
si crea un chip `📍 Zona — Sensazione` → la zona resta marcata sulla figura. Rimovibile con ×.

### ⚠️ Gap: intensità e tag di comportamento

Il documento madre §4.3 dice: *"Ogni tap prende anche un'**intensità (1–5)** e un **tag di
comportamento** (migliora col riscaldamento / peggiora col carico / c'è anche a riposo)."*

**Nei prototipi non ci sono.** Sono due input mancanti e non banali: il tag di comportamento
è precisamente il discriminante clinico tra dolore adattivo e protettivo.

🟡 **Proposta:** dopo la scelta della sensazione, una riga sola con 3 pill:
`migliora scaldandomi · peggiora sotto carico · c'è anche ferma`
e una micro-scala di intensità a 3 livelli (`un po' · abbastanza · parecchio`) invece di 1-5,
per non appesantire. Costo: +2 tocchi solo quando segnala qualcosa.

### 🔵 Scalatura per età (11–13)

Il §10 chiede regioni corporee **più semplici per 11–13 anni**. Le 36 zone attuali sono
probabilmente troppe per una undicenne.

🟡 **Proposta:** una variante "junior" a ~12 zone (testa/collo · spalle · braccia · petto ·
pancia · schiena alta · schiena bassa · sedere · cosce · ginocchia · polpacci/stinchi · piedi),
attivata automaticamente dall'età dichiarata in onboarding.
