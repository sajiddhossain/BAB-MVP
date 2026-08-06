# BAB — l'app

Web app mobile-first, installabile sulla home del telefono (PWA).
Stesso stack della landing: **React 19 · Vite 8 · Tailwind 4 · Supabase**.

```bash
npm install --prefix app
npm run dev --prefix app      # http://localhost:5180
npm run build --prefix app
npm run check --prefix app    # tipi + parità lingue + nessuna stringa nei componenti
```

## Stato

**Settimana 1 · fondamenta** — in corso.

- [x] Progetto, build, typecheck
- [x] PWA installabile, service worker, offline shell
- [x] Design system sui token della landing (crema, bordi neri, sfondo a quaderno)
- [x] Navigazione a 3 tab + segnalazione immediata persistente
- [x] Copy fuori dal codice (`src/copy/`) + contenuti a codici stabili (`src/content/`)
- [ ] Supabase: login con link via email
- [ ] Database e salvataggio dei check-in
- [ ] Sincronizzazione offline

Piano completo: [`docs/05-roadmap/03-piano-3-settimane.md`](../docs/05-roadmap/03-piano-3-settimane.md)

## Copy e contenuti

**Nessuna stringa nasce dentro un componente.** `npm run check` lo verifica.

```
src/copy/       copy di interfaccia — it.ts detta la forma, en.ts si conforma
src/content/    contenuti a CODICI STABILI
  bodymap.ts      27 regioni + sottoinsieme junior (11–13)
  lexicon.ts      14 sensazioni in 3 gruppi + mappatura clinica + red flag
  tempo.ts        i 3 tempi, i loro testi e i piani
  cycle.ts        le 4 fasi + derivazione dalle date
  clinical.ts     ⛔ Care mode e decode — NON FIRMATI
```

🔴 **I `code` in `bodymap.ts` e `lexicon.ts` finiscono nel database e non si
cambiano mai.** Cambiarli significa migrare i dati di tutte le atlete.

🔴 **`clinical.ts` non è firmato.** `CLINICAL_SIGNOFF.signed === false` è un
blocco di rilascio per il pilota. E una traduzione di un testo firmato non è più
il testo firmato: va rifirmata.

## Note di implementazione

- **I token stanno in un posto solo** (`src/index.css`). I prototipi in `/prototipi-v3`
  sono blu scuro: quello è il tema dei prototipi, non del prodotto. Vedi
  [design system](../docs/03-design/01-design-system.md) per il perché.
- **Ombre dure con offset, mai sfocate.** `8px` è riservato al singolo elemento
  protagonista di una schermata — così la regola "un solo next step dominante" si
  applica da sola.
- **Il bottone "I got hurt" sta fuori dal router**, perché §5 chiede che la cattura di
  una bandiera rossa acuta sia sempre a un tocco, da qualsiasi schermata.
- **Target touch ≥44px** imposto a livello di CSS globale, non schermata per schermata.
- `viewport-fit=cover` + `env(safe-area-inset-*)`: la tab bar deve stare sopra la barra
  home dell'iPhone.
