# BAB — l'app

Web app mobile-first, installabile sulla home del telefono (PWA).
Stesso stack della landing: **React 19 · Vite 8 · Tailwind 4 · Supabase**.

```bash
npm install --prefix app
npm run dev --prefix app      # http://localhost:5180
npm run build --prefix app
```

## Stato

**Settimana 1 · fondamenta** — in corso.

- [x] Progetto, build, typecheck
- [x] PWA installabile, service worker, offline shell
- [x] Design system sui token della landing (crema, bordi neri, sfondo a quaderno)
- [x] Navigazione a 3 tab + "I got hurt" persistente
- [ ] Supabase: login con link via email
- [ ] Database e salvataggio dei check-in
- [ ] Sincronizzazione offline

Piano completo: [`docs/05-roadmap/03-piano-3-settimane.md`](../docs/05-roadmap/03-piano-3-settimane.md)

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
