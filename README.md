# BAB — MVP

**Readiness & Body Literacy per atlete femmine adolescenti (11–18).**
Riorganizzazione completa del materiale della founder in una specifica di prodotto
navigabile, per costruire il primo MVP come web app mobile-first.

---

## Cos'è questa repo

Il materiale di partenza erano 9 file in una cartella: due PDF, due immagini e cinque
prototipi HTML, senza un ordine e con versioni multiple degli stessi strumenti.

Qui dentro è stato letto tutto riga per riga, rimesso in ordine logico, confrontato per
trovare le contraddizioni, e completato con le parti mancanti.

```
fonti/          il materiale originale, mai modificato
  documenti/    i 2 PDF
  immagini/     i 2 schemi
  prototipi/    i 5 HTML, rinominati per versione
docs/           tutto il lavoro di riorganizzazione e progettazione
```

👉 **[Inizia da `docs/README.md`](docs/README.md)** — è l'indice completo.

---

## La frase che spiega il prodotto

> Quasi tutta la tecnologia sportiva misura l'atleta **dall'esterno** e le dice cosa fare.
> BAB fa l'opposto: insegna a una ragazza a **leggere il proprio corpo**.

Ogni decisione di design in questa repo è una conseguenza di quella frase.

---

## Il meccanismo, in quattro passi

```
   PREDICT              TUNE IN              COMPARE              ADJUST
   prevedi come    →    senti e nomina  →    lo scarto tra    →   scegli il tuo
   starai oggi          cosa senti           i due È il dato       tempo di oggi

                                    ⚡ Upbeat  ·  🌊 Steady  ·  🍃 Gentle
```

E la sera, il post-allenamento chiude il cerchio: `Look back → Sense → Learn → Recover`.

**La metrica del prodotto non è la forma fisica. È quanto bene si legge**, e se quello
scarto si sta accorciando.

---

## Come leggere la documentazione

| Se hai… | Leggi |
|---|---|
| **10 minuti** | [Visione](docs/00-fondamenta/01-visione-e-problema.md) + [Architettura app](docs/02-prodotto/01-architettura-informativa.md) |
| **30 minuti** | + [Principi di design](docs/00-fondamenta/03-principi-di-design.md) + [Brainstorming](docs/04-brainstorming/01-brainstorm-app-mobile.md) |
| **Devi decidere qualcosa** | [Decisioni aperte](docs/04-brainstorming/03-decisioni-aperte.md) |
| **Devi costruire** | [Mappa schermate](docs/02-prodotto/06-mappa-schermate.md) + [Design system](docs/03-design/01-design-system.md) |
| **Devi pianificare** | [Piano MVP](docs/05-roadmap/01-piano-mvp.md) |

---

## I dieci risultati principali dell'analisi

1. **La direzione di prodotto è già leggibile nel diff dei prototipi**: da v1 a v2 sono
   stati tolti input, non aggiunti. *Meno input, più significato.*
2. **Manca completamente l'onboarding**, e senza date del ciclo e contraccezione il layer
   che differenzia il prodotto non può funzionare.
3. **Due sensazioni bandiera rossa** richieste dal documento madre (`cede/instabile`,
   `gonfia/calda`) **non esistono nel lessico dei prototipi**.
4. **Mancano tutte le opzioni positive** dal lessico delle sensazioni, contro un requisito
   esplicito anti-ipervigilanza.
5. **Il pulsante "mi sono fatta male" sempre accessibile** è richiesto dal documento madre
   e non è implementato.
6. **La body-story condivisibile** — l'unico output che incarna il terzo pilastro dello
   schema strategico (COMMUNICATE) — non esiste in nessun prototipo. È probabilmente la
   feature più strategica non ancora disegnata.
7. **Ci sono tre sistemi visivi in conflitto** nel materiale, più una quarta proposta mai
   adottata. Va scelto uno, e la scelta ha implicazioni di posizionamento, non solo estetiche.
8. **Alcuni insight promessi non sono generabili** con gli input attuali: manca lo stress
   scolastico come dato dedicato, ed è la variabile del miglior insight del set campione.
9. **La formula che calcola il tempo non è validata** e va trattata come provvisoria, con
   il tempo suggerito e quello scelto loggati separatamente.
10. **Il materiale copre bene il cuore quotidiano e quasi per niente tutto il resto**:
    ~30% dell'MVP è pronto, non il 70% che i prototipi possono far sembrare.

---

## Convenzioni

- 🔴 **Non negoziabile** — deriva dal documento madre o dai guardrail clinici
- 🟡 **Proposta di design** — lettura del materiale, discutibile
- 🔵 **Domanda aperta** — serve una decisione della founder

---

## ⚠️ Nota

Specifica di design, non consiglio medico. Tutte le soglie cliniche, l'instradamento delle
bandiere rosse e i percorsi mestruali/RED-S devono essere rivisti e firmati da un medico
dello sport qualificato, e l'affidabilità degli strumenti stabilita per fascia d'età,
**prima dell'uso con minori**.
