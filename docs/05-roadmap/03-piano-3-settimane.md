# 03 · Piano a 3 settimane

> Vincolo dato: **tutto in 3 settimane.** Questo documento dice cosa ci sta dentro,
> cosa esce, e la distinzione che va capita prima di tutto il resto.

---

## La distinzione che viene prima di tutto

**"App pronta" e "pilota partito" sono due date diverse, e solo la prima dipende da noi.**

| | Dipende da | Fattibile in 3 settimane? |
|---|---|---|
| **L'app funzionante** | Codice e design | ✅ **Sì**, tagliando come sotto |
| **Il pilota con 20 minorenni** | Firma del medico dello sport + testo legale del consenso | ⚠️ **Solo se partono oggi in parallelo** |

Il secondo non si comprime scrivendo codice più in fretta: sono dipendenze esterne. Un
advisor clinico che deve leggere e firmare il percorso delle bandiere rosse e il layer
mestruale di un prodotto per minorenni ci mette il tempo che ci mette.

**Quindi il piano è: si costruisce a piena velocità per 3 settimane, e in parallelo si
corre dietro alla firma.** Se la firma arriva, alla settimana 3 parte il pilota. Se non
arriva, alla settimana 3 c'è comunque un'app vera e completa da mostrare a club, genitori
e investitori — che è già un risultato, e non è tempo sprecato.

🔴 **Quello che non si fa in nessuno scenario:** far usare l'app a delle minorenni senza
la firma clinica e senza il consenso legale. Non è una formalità burocratica, è la ragione
per cui il documento madre ha un'intera sezione di guardrail.

---

## Cosa entra — le 3 settimane

### Settimana 1 · Fondamenta e memoria

- Progetto **React + Vite + Tailwind**, stesso stack della landing (React 19, Vite 8,
  Tailwind 4, Supabase — già tutti in uso, zero scelte nuove da fare)
- **PWA**: installabile sulla home, a schermo intero
- **Design system** sui token della landing, in un posto solo
- Le **3 tab** che navigano
- **Supabase**: login con link via email, tabelle, salvataggio e rilettura
- **Offline-first**: si scrive sul telefono, si sincronizza dopo

*Fine settimana 1: app vuota ma vera, installabile, che si ricorda chi sei.*

### Settimana 2 · Il cuore quotidiano

- **Onboarding** completo (consenso, età, sport, ritmo con date e contraccezione)
- **Check-in pre** e **check-in post**, completi, che salvano davvero
- **Home "Oggi"** con i 6 stati calcolati sui dati veri
- **Care mode** + **cattura acuta** sempre accessibile

*Fine settimana 2: un'atleta può usarla per una giornata intera, dall'inizio alla fine.*

### Settimana 3 · Il contorno e la messa a punto

- **Percorso**, Mesi 1–2, con le missioni che si spuntano dai check-in reali
- **Me**, stadi 1 e 2 (contatore + prima ipotesi)
- **Vista «Il mio ritmo»** — fase corrente + cosa può voler dire. Piccola, ma restituisce
  qualcosa dal giorno uno in cambio del dato più intimo che chiediamo
  (vedi [ciclo e RED-S](../01-modello/03-ciclo-e-red-s.md))
- **Body-story**
- **Impostazioni**: privacy (esporta/cancella), ritmo, notifiche, aiuto
- **Strumentazione** del pilota, **pass di accessibilità**, correzione bug

*Fine settimana 3: app completa per quello che serve al pilota.*

---

## Cosa esce — e perché non fa male

| Tagliato | Perché il taglio è gratis |
|---|---|
| **Patterns stadio 3** (grafico dei segnali con le bande di fase) | Serve **9 settimane di dati** per esistere. In un pilota di 8-12 settimane non lo si vedrebbe prima della fine. Si costruisce durante il pilota. ⚠️ Ma la **vista «Il mio ritmo»** resta dentro la v1: senza, si chiederebbero le date del ciclo il primo giorno senza restituire niente per due mesi. |
| **Percorso Mesi 3–4** | Un pilota non ci arriva. Il contenuto è già scritto: è solo da inserire. |
| **Mappa corporea junior (11–13)** | Il pilota è su 13–14enni. Serve quando si allarga la fascia. |
| **Tema scuro** | Bello, irrilevante per le tre domande del pilota. |
| **Integrazione wearable** | Il principio 1 dice che l'app è utile senza. È la parte meno differenziante. |
| **Dashboard coach** | Era già fuori scope, e nel pilota la contaminerebbe. |
| **Multi-lingua** | Si spedisce una lingua sola. L'architettura i18n resta pronta. |

**Rete di sicurezza RED-S:** non è "tagliata", è **bloccata dalla firma clinica**. Se la
firma arriva entro la settimana 3, entra. Altrimenti entra appena arriva.

---

## Cosa NON si taglia, mai

🔴 Anche stringendo, queste restano:

- **Care mode e bandiere rosse** — è la ragione per cui il prodotto è sicuro
- **Cattura acuta sempre a un tocco** — un infortunio non aspetta il check-in
- **Consenso tutore + atleta** — requisito legale
- **Esporta e cancella i miei dati** — requisito GDPR
- **Target touch ≥44px e contrasto AA** — un'app che non si riesce a toccare non si usa
- **Le 3 misure del pilota** (secondi reali, suggerito vs scelto, domande saltate) —
  costano poche ore e sono irrecuperabili dopo

---

## I due rischi veri

**1. La firma clinica non arriva in tempo.**
È il rischio numero uno e non è tecnico. Mitigazione: aprirla **oggi**, e nel frattempo
costruire tutto il resto. Se slitta, slitta il pilota, non lo sviluppo.

**2. La lingua non viene decisa.**
Tutto il copy è in inglese. Se la decisione arriva alla settimana 3, la traduzione diventa
un collo di bottiglia proprio alla fine. Mitigazione: **decidere entro la settimana 1**, e
costruire con le stringhe già esterne al codice così tradurre è meccanico.

---

## In una riga

> Tre settimane bastano per **l'app**. Per il **pilota** bastano solo se la firma clinica
> e il testo legale partono oggi, in parallelo — e quella non è una gara che si vince
> scrivendo codice più in fretta.
