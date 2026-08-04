# 03 · Flusso post-allenamento

> Fonte: `fonti/prototipi/02-post-training-reflect--v2-LATEST.html` + documento madre §5
> + `fonti/documenti/BAB before & after Training.pdf` + `fonti/immagini/note-before-after-training.jpeg`.
>
> **Budget: ≤ 60–90 secondi.** 🔴 **Timing: pochi minuti dopo la fine**, non la sera. 🔴

---

## I quattro step (§5)

| # | Step | Cosa cattura |
|---|---|---|
| 4 | **Look back** | La lettura mattutina era giusta? → **è il session prediction error, il segnale principale** |
| 5 | **Sense & locate** | Segnali acuti / di sforzo — **non ancora DOMS** (quello appare domattina) |
| 6 | **Learn + load** | L'insight + un tocco di session-RPE |
| 7 | **Recover + comunicare** | Nudge di recupero food-neutral + prompt opzionale per dirlo a un adulto |

Nel prototipo diventano: `Look back → Sense → Learn → Recover`.

---

## Perché "pochi minuti dopo", e non la sera

Il copy del prototipo lo spiega, ed è una spiegazione corretta:

> Qualche minuto dopo aver finito, tutto è ancora forte — un momento fantastico per
> imparare i tuoi segnali.

Il razionale scientifico dietro: si sta catturando lo **stato acuto post-sforzo** (respiro,
cuore, gambe, energia), che decade in fretta. Il DOMS **non** si cattura qui — si cattura
automaticamente nel pre-check di domani (segnale cross-day, §5).

🟡 **Conseguenza di prodotto:** la notifica del post-check non è "stasera ricordati". È
un promemoria basato sull'orario di fine allenamento dichiarato, con una finestra breve.
E se lo fa più tardi, l'app lo accetta ma lo tagga come "a freddo" — perché il dato ha
un valore diverso.

---

## Schermata per schermata

### Step 1 · Look back

Due input:

**A. In quale tempo ti sei allenata davvero?**
`⚡ Upbeat` (Sforzo pieno) · `🌊 Steady` (Tecnica / qualità) · `🍃 Gentle` (Recupero)

> Nota: chiede il tempo **effettivo**, non ricorda quello previsto. Giusto: chiederlo
> senza mostrare la previsione evita l'ancoraggio, e permette il confronto onesto dopo.

**B. 🔥 Quanto è stata dura davvero?** — scala 1–5, `Gentle → Absolutely maxed`
Emoji: 😌 🙂 😅 🥵 🥴

🔴 **Questo è il session-RPE**, l'unica misura di carico validata per questa popolazione
(Temm). Non è opzionale e non si può togliere.

⚠️ **Manca dal prototipo:** la **durata** della sessione. sRPE in senso proprio è
`RPE × durata in minuti`. Senza durata, si sta catturando solo la R di RPE.
Lo schema strategico della founder lo elenca esplicitamente (`Training: Type · Duration ·
Load · PE · Competition`).

🟡 **Proposta:** un selettore a scaglioni sopra la scala di sforzo — `<45' · 1h · 1h30 ·
2h · 2h+` — un tocco. Più il tipo di sessione se il giorno è ambiguo (`allenamento ·
partita · PE · palestra`).

---

### Step 2 · Sense — pinpoint & name it

Stessa mappa corporea del pre-check. **Identica di proposito** 🔴: è quello che rende
possibile il confronto cross-day.

Copy adattato al contesto post:
> Qualche minuto dopo aver finito, tutto è ancora forte — un momento fantastico per
> imparare i tuoi segnali. […] Aggiungine quante ne noti, o nessuna se è tutto tranquillo.

---

### Step 2b · Sense — una lettura veloce

Tre scale + Headspace:

| Canale | Estremi | Emoji |
|---|---|---|
| 💪 **Legs & muscles** | Trashed / heavy → Light & fine | 🪨 🪵 🍂 🪶 🦋 |
| 🫁 **Breathing & heart** | Still pounding → Settled & calm | 🌩️ 🌧️ 🌥️ 🌤️ ☀️ |
| 🔋 **Energy right now** | Drained → Still buzzing | 🪫 🔅 🔆 ✨ ⚡ |
| 🧠 **Headspace** | multi-select, identico al pre | — |

Nota sui domini (§4.1): `Breathing & heart` è il dominio *"respiro e cuore (sforzo/attivazione)"*,
catturato come scalare — con la nota *"tap su petto/gola ammessi, non forzati"*.
⚠️ Nel prototipo la parte "nervi" del dominio (`effort + nerves 1–5`) non è catturata
separatamente: è assorbita da Headspace. 🟡 Accettabile, ma va annotato.

---

### Step 3 · Decode any ache

Versione post del blocco educativo. Differenza rispetto al pre:
- Sparisce *"passa mentre ti scaldi"* (non applicabile dopo).
- Compare *"Nuovo, e **che non passa** mentre ti raffreddi"*.

Introduzione:
> Alcune cose appaiono solo quando ti fermi. Nomina solo la sensazione — decidere cosa
> farne viene dopo.

Poi la domanda binaria sul dolore protettivo.

---

### Step 4 · Il risultato — Learn + Recover

#### A · La card "Learn" — il session prediction error

Il prototipo genera **8 esiti diversi** incrociando tempo dichiarato × sforzo × stato del
corpo. È la parte più intelligente del materiale e va conservata integralmente.

```
bodyAvg = (legs + breath + energy + headspaceValue) / 4
effort  = 1..5
```

| Tempo | Condizione | Titolo | Messaggio |
|---|---|---|---|
| ⚡ Upbeat | `bodyAvg ≥ 3.5` | 🎯 **Lettura perfetta** | Ti sei fidata di te per un giorno Upbeat e il tuo corpo l'ha gestito bene. Fissa come si sente questo — è il tuo riferimento per un buon giorno Upbeat con recupero. |
| ⚡ Upbeat | `bodyAvg < 2.5` | 🍃 **Il tuo corpo ha preso tanto oggi** | Quella sessione Upbeat è costata più del solito — e notare quel divario tra fatica e come ti senti adesso *è* la lezione. È una spinta ad andare Steady o Gentle domani. Non è andato storto niente; hai solo imparato qualcosa su oggi. |
| ⚡ Upbeat | altrimenti | ⚡ **Un giorno Upbeat solido e onesto** | Hai spinto forte e sei piacevolmente stanca — è esattamente giusto dopo lavoro vero. Questo è il tipo buono di vuoto. |
| 🌊 Steady | `effort ≥ 4 && bodyAvg < 3` | 👀 **Uno Steady che è diventato Upbeat** | Avevi chiamato un giorno Steady ma hai finito per spingere forte — e il tuo corpo lo sente. Vale uno sguardo curioso: cosa ti ha fatto andare più forte del previsto? È una cosa utile da notare. |
| 🌊 Steady | `bodyAvg ≥ 4 && effort ≤ 2` | 🌤️ **Ne avevi ancora nel serbatoio** | Steady è stato facile e sei ancora fresca — forse oggi avevi di più. Non è un errore: un giorno di qualità non è mai sprecato, e adesso conosci la tua lettura un po' meglio. |
| 🌊 Steady | altrimenti | 🎯 **Giorno Steady ben calibrato** | Sforzo controllato, corpo in buona forma. Questo è allenarsi con abilità — qualità invece che quantità, esattamente come previsto. |
| 🍃 Gentle | `effort ≥ 4` | 👀 **Un Gentle diventato lavoro vero** | Doveva essere gentile, ma è diventato uno sforzo serio. Se il tuo corpo aveva bisogno di riposo, tienici un occhio — il recupero conta solo quando è davvero facile. Nessun dramma, solo qualcosa da notare. |
| 🍃 Gentle | altrimenti | 🍃 **Un vero giorno Gentle — ben giocato** | Hai tenuto gentile e hai lasciato ricostruire il tuo corpo. È qui che i tuoi giorni duri diventano silenziosamente forza. Sceglierlo richiede più sicurezza che spingere. |

> **Perché questa matrice è così buona:** in **nessuno** degli 8 esiti c'è un giudizio
> negativo. I due casi problematici (Steady→Upbeat, Gentle→lavoro vero) sono formulati come
> *"vale uno sguardo curioso"* e *"nessun dramma, solo qualcosa da notare"*. È la
> discriminazione senza il giudizio: esattamente ciò che il principio 10 chiede per il
> dolore, applicato qui al comportamento.

#### B · Recap

Riecheggia quello che ha inserito, poi lascia una domanda aperta:

> Hai fatto una pausa e hai nominato N sensazioni: **[zona (sensazione), …]**. Farlo —
> localizzarla e darle una parola — è esattamente il muscolo che stiamo allenando.
>
> 🧠 Headspace dopo: **[…]**.
>
> Ti sei allenata in **[tempo]**, l'hai sentita **[N]/5** dura, e adesso il tuo corpo legge
> circa **[N]/5**.
>
> *Una domanda tranquilla su cui vale la pena fermarsi: cosa ti ha sorpresa di più di oggi
> — e quale segnale te l'ha detto per primo?*

> 🟡 Quella domanda finale è ottima e **non ha un campo di risposta**. È una domanda
> retorica. Proposta: darle un campo di testo facoltativo. È il posto naturale per il
> "**What did you bring home?**" del PDF originale, e produce il materiale più prezioso
> per la body-story settimanale.

#### C · Recover — cosa chiede il tuo corpo adesso

Nudge food-**neutral** 🔴 (mai quantità, mai "abbastanza", mai calorie):

Caso normale:
- Rifornisci quando hai fame — un pasto o uno spuntino come si deve rimette a posto quello
  che hai usato e ti aiuta a ricostruire.
- Reidratati con calma — continua a bere.
- *(se è stata dura)* Oggi è stato uno sforzo grosso, quindi **proteggi il tuo sonno stanotte**
  — è quando questo allenamento diventa davvero forza.
- Qualche minuto di stretching facile o una camminata leggera ti aiuta a scendere di giri.

Caso Gentle facile:
- Rifornisci con un pasto normale ed equilibrato quando hai fame, e bevi acqua.
- Lascia che il tuo corpo si goda il giorno facile — stretching leggero se ti va.
- Una buona notte di sonno stanotte sigilla il recupero.

> **Nota sul food-safe:** questo copy passa il test. Dice *"quando hai fame"* (segue il
> segnale del corpo, non impone), *"un pasto come si deve"* (nessuna quantificazione), e
> non nomina mai calorie, porzioni o "abbastanza".

#### D · Comunicare *(punto 7 del §5, mancante dal prototipo)*

Il §5 chiude il post-check con: *"Recover + (optional) **communicate**. […] optional prompt
to tell an adult."*

⚠️ Nel prototipo non c'è.

🟡 **Proposta:** un blocco finale, sempre opzionale, sempre in fondo:

> **C'è qualcosa che vale la pena dire a qualcuno?**
> `📋 Copia una frase per il coach` · `Non oggi`

Se ha segnalato dolore protettivo, questo blocco non è opzionale ed è già nel Care mode.

#### E · La chiusura

> Ogni volta che confronti la tua lettura mattutina con quello che è successo davvero, le
> tue previsioni diventano un po' più precise. È tutto il gioco — stai imparando a fidarti
> di te. 🌱

---

## Cosa il PDF originale aveva e il prototipo ha perso

Il `BAB before & after Training.pdf` e l'immagine di appunti contengono due domande che
nei prototipi sono sparite:

| Domanda originale | Opzioni | Stato |
|---|---|---|
| **Livello di soddisfazione** | Deluso · frustrato · soddisfatto · fiducioso · orgoglioso | ❌ persa |
| **Cosa hai imparato oggi? / What did you bring home?** | Imparato qualcosa di nuovo · ascoltato il mio corpo · aiutato un compagno · mostrato gentilezza verso me stessa · eseguito correttamente un esercizio | ❌ persa |

🟡 **Raccomandazione: recuperare la seconda, valutare la prima.**

La domanda *"cosa ti sei portata a casa?"* è la migliore del materiale originale, per tre
ragioni:
1. È l'unica che misura qualcosa che **non è il corpo** — competenza, relazione, gentilezza
   verso sé.
2. Le opzioni includono **"ascoltato il mio corpo"** e **"mostrato gentilezza verso me stessa"**,
   che sono letteralmente gli obiettivi del prodotto. Renderle selezionabili le rende visibili
   come cose che contano.
3. Costa **un tocco** e produce il contenuto migliore per la body-story settimanale.

La domanda sulla **soddisfazione** invece è più rischiosa: `deluso / frustrato` introducono
un giudizio sulla performance in un prodotto che ha deciso di non giudicare la performance.
🔵 Da discutere con la founder.

---

## Cosa sblocca il bottone finale

Nel prototipo: tempo + sforzo + tutte e 3 le scale + Headspace + domanda dolore.
La mappa corporea resta facoltativa. 🟡 Corretto, stessa logica del pre-check.
