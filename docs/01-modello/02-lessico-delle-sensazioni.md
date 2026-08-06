# 02 · Lessico delle sensazioni

> Fonte: documento sorgente §4.3 + blocchi "Decode your ache" dei due prototipi.
>
> ✅ **I gap descritti in questo documento sono stati chiusi** nei prototipi
> [`/prototipi-v3`](../../prototipi-v3/). Le sezioni sotto restano come traccia
> dell'analisi e come motivazione delle scelte.

---

## Il principio

Sulla mappa corporea lei tocca **sensazioni, non solo dolore** — con opzioni neutre e
positive incluse, per costruire literacy ed evitare l'ipervigilanza.

**Ogni parola mappa dietro le quinte a una categoria clinica. Lei descrive; l'app non
diagnostica mai.** 🔴

---

## La tabella di mappatura (§4.3)

| Lei tocca… | Categoria clinica | Lean / azione |
|---|---|---|
| **Strong / warm / light / fine** | Normale / positivo | Neutro — rinforza i buoni segnali |
| **Sore / achy** | Tipo DOMS | Solitamente adattivo; attenzione a timing e bilateralità |
| **Tight / stiff** | Tensione muscolare/fasciale | Monitorare; mobilità, non allarme |
| **Sharp / stabbing** | Nocicettivo acuto | ⚠️ Cautela — soprattutto se nuovo o focale |
| **Burning / tingling / numb** | Possibile neurale | ⚠️ Cautela — segnalare se persiste |
| **Unstable / gives way** | Instabilità articolare | 🚩 **Bandiera rossa** (ginocchio/caviglia comuni nelle ragazze) |
| **Swollen / hot** | Infiammazione | 🚩 **Bandiera rossa → valutare** |

---

## ⚠️ Divergenza tra documento sorgente e prototipi

Il lessico implementato nei prototipi **non coincide** con quello del documento sorgente.

| Prototipi (8 opzioni) | Doc madre | Stato |
|---|---|---|
| Tight / stiff | ✅ presente | ok |
| Sore / achy | ✅ presente | ok |
| Burning | ✅ presente | ok |
| Sharp | ✅ presente | ok |
| Heavy / tired | ➖ assente nel doc | aggiunta dei prototipi — utile, categoria "fatica" |
| Tender | ➖ assente nel doc | aggiunta — vicina a DOMS |
| Buzzy / tingly | ≈ "tingling" | ok, riformulato in teen-speak |
| Crampy | ➖ assente nel doc | aggiunta — importante per il ciclo |
| — | ❌ **Unstable / gives way** | 🚩 **MANCA una bandiera rossa** |
| — | ❌ **Swollen / hot** | 🚩 **MANCA una bandiera rossa** |
| — | ❌ **Numb** | ⚠️ manca (cautela neurale) |
| — | ❌ **Strong / warm / light / fine** | ⚠️ mancano **tutte le opzioni positive** |

### Le due conseguenze sono serie

**1. Mancano due bandiere rosse dal lessico.** `Unstable / gives way` e `Swollen / hot`
sono le due categorie che il documento marca esplicitamente come red flag. Nei prototipi
l'atleta non ha una parola per dirle. Il flusso attuale le cattura solo indirettamente,
tramite la domanda binaria "senti dolore del tipo 🛡️ protettivo?" — ma quella domanda
richiede che sia lei a fare la classificazione clinica. È esattamente ciò che il modello
dice di **non** chiederle.

**2. Mancano tutte le opzioni positive.** Il documento è esplicito: *"opzioni neutre e
positive incluse, per costruire literacy ed evitare l'ipervigilanza"*. Un lessico fatto
solo di parole negative insegna implicitamente che il corpo è un posto da cui arrivano
solo problemi. Su una popolazione con alta sensibilità all'immagine corporea, questo è
un rischio reale, non un dettaglio.

### 🟡 Proposta: lessico unificato a 12 voci, in due gruppi visivi

**Gruppo "va bene" (verde/neutro) — 4 voci**
`💪 Forte · 🔥 Calda / attiva · 🪶 Leggera · ✨ Tutto ok`

**Gruppo "qualcosa da notare" (neutro/ambra) — 8 voci**
`Tesa / rigida · Dolorante / indolenzita · Che brucia · Pesante / stanca ·
Sensibile al tocco · Formicolio / intorpidita · Crampi · Fitta / acuta`

**Gruppo "da far vedere" (rosso, con instradamento automatico) — 2 voci**
`Cede / instabile · Gonfia / calda al tatto`

Le ultime due, se toccate, **attivano il Care mode da sole**, senza passare dalla domanda
binaria. Questo toglie all'atleta il peso della classificazione clinica e lo restituisce
al sistema, che è dove deve stare.

---

## Il blocco educativo "Decode your ache"

I prototipi contengono un blocco didattico che precede la domanda sul dolore. È scritto
molto bene e va conservato quasi parola per parola.

### Due colonne affiancate

**✅ Working & everyday ache** (dolore che lavora / quotidiano)
- Il **bruciore** dei muscoli che lavorano forte, e il fiatone
- Muscoli che si sentono **tesi o rigidi**
- Indolenzimento abbastanza **uguale su entrambi i lati**
- Un dolore che **passa mentre ti scaldi**
- Dolori sordi che vanno e vengono — **pancia o schiena bassa crampose, o sensazione di gonfiore e pesantezza**

**🛡️ Protective pain** (dolore protettivo)
- **Acuto, che punge, improvviso**
- **Dentro un'articolazione o un osso**
- Solo su **un lato**, o che ti fa zoppicare
- **Peggiora** mentre vai avanti, o **fa male di notte**

### La regola d'oro, in una riga

> **Il segnale:** i dolori che lavorano passano scaldandosi e si sistemano in un giorno
> o due. Il dolore protettivo resta, si acuisce, o cambia come ti muovi.
> **Quando non sei sicura, chiamalo protettivo.**

Quest'ultima frase è la migliore riga di sicurezza di tutto il materiale: risolve
l'incertezza a favore della cautela **senza generare ansia**, perché la incornicia come
una regola pratica e non come una minaccia.

### Nota sul post-allenamento

Nella versione post, il blocco cambia leggermente: sparisce "passa scaldandosi" (non ha
senso dopo) e compare *"Nuovo, e **che non passa** mentre ti raffreddi"*. È un adattamento
contestuale corretto, da preservare.

---

## Nota sull'inclusione del dolore mestruale

Nella colonna "working & everyday ache" c'è: *"pancia o schiena bassa crampose, o
sensazione di gonfiore e pesantezza"*.

🟡 Scelta di design importante e da difendere: **normalizza il dolore mestruale dentro
la categoria "normale"** invece di trattarlo come anomalia. Per un'adolescente che sta
imparando cosa aspettarsi dal proprio corpo, questa singola riga fa un lavoro
sproporzionato. Va tenuta.
