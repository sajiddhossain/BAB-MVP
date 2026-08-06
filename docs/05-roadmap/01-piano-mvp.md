# 01 · Piano MVP

> 🟡 Proposta. Le stime sono ordini di grandezza per un team piccolo (1 designer,
> 1–2 sviluppatori), non impegni.

---

## Fase 0 · Sbloccare — *prima di disegnare*

Non è lavoro di prodotto, è lavoro di decisione. Ma blocca tutto il resto.

| # | Cosa | Chi | Bloccante per |
|---|---|---|---|
| 1 | **Trovare e ingaggiare l'advisor clinico** ([D4](../04-brainstorming/03-decisioni-aperte.md)) | founder | Care mode, RED-S, ciclo, settimana 8, pilota |
| 2 | Decidere **lingua** ([D1](../04-brainstorming/03-decisioni-aperte.md)) | founder | tutto il copy |
| 3 | Decidere **visibilità coach** ([D2](../04-brainstorming/03-decisioni-aperte.md)) | founder | architettura dati, pitch ai club |
| 4 | Decidere **settimana 8** ([D3](../04-brainstorming/03-decisioni-aperte.md)) | founder + clinico | contenuto percorso |
| 5 | Confermare il **club e le atlete del pilota** | founder | tempistiche, fascia d'età, offline sì/no |

Le prime quattro sono conversazioni brevi. La prima è quella che rischia di durare
settimane, quindi va aperta **oggi**, in parallelo a tutto il resto.

---

## Fase 1 · Fondamenta di design — *~2 settimane*

| Cosa | Output |
|---|---|
| Risolvere il conflitto dei tre sistemi visivi ([D11](../04-brainstorming/03-decisioni-aperte.md)) | Un solo design system, documentato, allineato alla landing |
| Costruire i componenti base in codice | Scala emoji, pill multi-select, card, mappa corporea, blocco collassabile |
| Verificare i target touch a 360px | ⚠️ La mappa corporea è il rischio: zone piccole vs 44px |
| Traduzione e riscrittura del copy nella lingua scelta | Tutto il copy dei prototipi + le stringhe nuove |
| Onboarding — disegno completo | 6 schermate, incl. testo legale del consenso |

**Perché i componenti prima delle schermate:** la scala emoji compare 7 volte, la mappa
corporea 3, il blocco collassabile 5. Farli bene una volta vale più che disegnare 50
schermate.

---

## Fase 2 · Il nucleo quotidiano — *~3-4 settimane*

È il pezzo che il materiale copre meglio ed è il cuore del pilota.

| Cosa | Note |
|---|---|
| Onboarding completo | Consenso, età, sport, ritmo, primo check guidato |
| Home "Oggi" con **tutti** gli stati | 6 stati, non solo il caso felice |
| Flusso pre completo | Con confidenza, sorpresa, ore sonno, stress scuola |
| Flusso post completo | Con durata, "cosa ti sei portata a casa", comunicare |
| Mappa corporea completa | + intensità, tag comportamento, le 2 red flag mancanti |
| Care mode + pulsante "mi sono fatta male" | 🔴 Sicurezza. Non tagliabile. |
| Layer ciclo | Toggle, fasi derivate, contenuto educativo, i 3 stati (ce l'ho / non ancora / preferisco non dirlo) |
| Persistenza + offline base | ⚠️ Verificare il contesto del pilota |

**Criterio di uscita della fase:** una ragazza reale completa un ciclo pre→post in ≤90
secondi ciascuno, senza aiuto, e il tempo è **misurato**, non stimato.

---

## Fase 3 · Il senso e la comprensione — *~2-3 settimane*

| Cosa | Note |
|---|---|
| Tab Percorso, Mesi 1–2 (8 settimane) | Contenuto già scritto |
| Missioni collegate ai dati reali | *"check-in in 5 giorni"* diventa un contatore vero |
| Tab Me — "La mia lettura" | Trend prediction error, senza asse numerico |
| Tab Me — Patterns stadio Raccolta + Prime ipotesi | Con il contatore anti-abbandono |
| Body-story settimanale | 🔴 La feature strategica. Selezione + anteprima + condivisione. |
| Impostazioni privacy | Esporta, cancella, disattiva ritmo |

---

## Fase 4 · Sicurezza e conformità — *in parallelo, chiude prima del pilota*

| Cosa | Chi |
|---|---|
| **Firma clinica** su Care mode, red flag, lessico, RED-S, ciclo, settimana 8 | advisor clinico |
| Rete di sicurezza RED-S implementata e approvata | dev + clinico |
| Testo di consenso tutore/atleta, GDPR, minori | legale |
| Verifica accessibilità: contrasto AA, `prefers-reduced-motion`, target 44px, mai solo colore | designer |
| Protocollo del pilota: cosa si misura, come, chi è l'adulto responsabile | founder |

🔴 **Nessuna di queste è tagliabile per anticipare il pilota.** Sono minorenni.

---

## Fase 5 · Pilota — *8-12 settimane*

Come da ricerca: **~20 atlete, 13–14 anni**, stesso set di domande ogni giorno.

Criteri di uscita completi in [scope MVP](../04-brainstorming/02-scope-mvp.md). In sintesi:

| Domanda | Soglia |
|---|---|
| Aderenza (% giorni con pre-check) | ≥ 60% |
| Ritenzione a 4 settimane | ≥ 70% |
| Tempo mediano di completamento | ≤ 90 s |
| Previsione compilata | ≥ 85% |
| Bandiere rosse comunicate a un adulto | 100% |

**Strumentazione da mettere prima di partire** (facile da dimenticare, impossibile da
recuperare dopo):
- Timestamp di apertura e chiusura di ogni check-in → per misurare i secondi reali.
- Log dell'andatura **suggerita** vs quella **scelta** → il dato più prezioso per personalizzare
  le soglie.
- Log dei campi saltati, dove è possibile saltarli.
- MAIA-Y a T0, T+2 mesi, T+4 mesi come baseline di tratto.

---

## Dopo il pilota — v1.1

In ordine di priorità, se il pilota va bene:

1. Percorso Mesi 3–4 (contenuto già scritto)
2. Patterns stadio Fingerprint completo
3. Mappa corporea junior (11–13) + affidabilità test-retest per fascia d'età
4. Glossario personale
5. Tema scuro
6. Multi-lingua (contenuti)

E, separatamente, la **validazione vera** descritta in §13: affidabilità della mappa
corporea per fascia d'età, e validazione within-athlete del prediction error contro esiti
reali. Non è lavoro di prodotto ed è quello che permette al prodotto di fare affermazioni.

---

## Il rischio numero uno

Non è tecnico. È questo:

> **Le prime tre settimane l'app non ha niente da mostrarle.**

Il valore del prodotto — i pattern, il fingerprint, la lettura che si affina — esiste solo
dopo settimane di dati. Ma la decisione di continuare o abbandonare l'atleta la prende nei
primi giorni.

Le tre contromisure previste, in ordine di efficacia:
1. **Il percorso** — dà una ragione per esserci oggi che non dipende dai dati accumulati.
   È per questo che il journey non è un extra: è l'antidoto al problema strutturale del prodotto.
2. **Il Compare** — restituisce valore dal **primo giorno**, perché confronta due cose
   della stessa giornata. È l'unica parte del prodotto che funziona a dati zero.
3. **Il contatore nello stadio Raccolta** — trasforma il vuoto da fallimento in progresso.

🟡 Se dovessi tagliare qualcosa per arrivare al pilota, non taglierei nessuna delle tre.
Taglierei prima la body-story, poi i Patterns oltre lo stadio Raccolta.
