# Roadmap MVP — documento PDF

Documento di sintesi in stile BAB, pensato per essere condiviso fuori dalla repo:
founder, club, advisor clinico, potenziali investitori.

| File | |
|---|---|
| `roadmap-mvp.pdf` | Il documento, A4, 10 pagine |
| `roadmap-mvp.html` | Il sorgente — si modifica questo, non il PDF |

## Rigenerare il PDF

```bash
cd docs/roadmap-mvp
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --virtual-time-budget=15000 \
  --no-pdf-header-footer --print-to-pdf=roadmap-mvp.pdf \
  "file://$PWD/roadmap-mvp.html"
```

I font arrivano da Google Fonts, quindi serve connessione durante il rendering.

## Contenuto

| Pag. | Sezione |
|---|---|
| 1 | Copertina |
| 2 | Il prodotto: meccanismo, metrica, i tre output, vincoli non negoziabili |
| 3–4 | Stato attuale: inventario 50 schermate, cosa è già risolto |
| 5–6 | Il piano: timeline e le cinque fasi |
| 7–8 | Scope: cosa esce e perché, criteri di successo del pilota |
| 9–10 | Condizioni: decisioni richieste e registro dei rischi |

## Note di stile

Segue il sistema visivo della landing, non quello dei prototipi: crema `#FAF9F6`,
inchiostro `#0F0F12`, bordi 2.5px e ombre dure con offset, Bricolage Grotesque per i
titoli e Space Grotesk per il testo. La copertina usa lo sfondo a quaderno.

I colori hanno un ruolo semantico coerente col resto: teal = prodotto, lavanda = stato,
lime = piano e sicurezza, giallo = in corso, corallo = attenzione e condizioni.

## Vincoli

- Ogni sezione sta dentro l'altezza utile di una A4 (267 mm). Se aggiungi contenuto,
  verifica: le sezioni che sforano generano pagine mezze vuote.
- Il disclaimer «specifica di prodotto, non consiglio medico» è in copertina e ripetuto
  nel piè di pagina di ogni pagina. **Non va rimosso.**
