-- ════════════════════════════════════════════════════════════════════════════
-- LE SCRITTE DELL'APP, CAMBIABILI SENZA RICOMPILARE
--
-- Si incolla nell'editor SQL di Supabase. Si puo' rieseguire quante volte si
-- vuole. E' indipendente da `migrazione-sessione.sql`: l'ordine non conta.
--
-- ── COSA FA ────────────────────────────────────────────────────────────────
-- I testi dell'app restano dove sono, dentro a `src/copy/`, compilati
-- nell'applicazione. Questa tabella tiene solo cio' che qualcuno ha CAMBIATO
-- dopo. Tabella vuota = l'app dice esattamente quello che ha sempre detto, e
-- ogni scritta torna com'era togliendo la sua riga.
--
-- E' la differenza fra "i testi vivono nel database" e "i testi hanno delle
-- correzioni nel database": nel primo caso un'atleta senza rete apre un'app
-- muta, nel secondo apre l'app di sempre.
--
-- ── CHI PUO' SCRIVERE ──────────────────────────────────────────────────────
-- Solo chi sta in `platform_admins`. Non e' una password controllata nel
-- browser: la anon key sta dentro al pacchetto scaricato da chiunque, quindi
-- un controllo fatto nel browser sarebbe una serratura su una porta senza
-- muri. Qui decide il server, riga per riga.
--
-- Il primo admin si aggiunge a mano, una volta sola (vedi schema.sql).
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.copy_overrides (
  -- il percorso della scritta dentro all'albero dei testi, senza la lingua:
  -- `sessione.ritmoPrima.titolo`, `testi.accesso.azione`, `parole.schede.teso.metafora`
  chiave     text not null check (char_length(chiave) <= 200),
  lingua     text not null check (lingua in ('it','en')),

  -- Due colonne e non una: `bozza` e' quello che sta scrivendo chi scrive,
  -- `vivo` e' quello che vedono le atlete. Finche' nessuno pubblica, le due
  -- non si toccano — e un refuso salvato per sbaglio resta nell'anteprima di
  -- chi l'ha scritto invece che sullo schermo di una ragazza di dodici anni.
  --
  -- jsonb e non text perche' una scritta puo' anche essere una LISTA di
  -- stringhe: i quattro passi di "Prova questo oggi", i nomi dei giorni.
  bozza      jsonb,
  vivo       jsonb,

  aggiornato timestamptz not null default now(),
  da         uuid references auth.users(id) on delete set null,

  primary key (chiave, lingua)
);

-- Un valore e' una stringa oppure una lista di stringhe. Niente numeri,
-- niente oggetti: se un giorno servisse altro, e' meglio accorgersene qui che
-- vederlo comparire storto su uno schermo.
create or replace function public.copy_valore_valido(v jsonb)
returns boolean language sql immutable as $$
  select v is null
      or jsonb_typeof(v) = 'string'
      or (
        jsonb_typeof(v) = 'array'
        and not exists (
          select 1 from jsonb_array_elements(v) e where jsonb_typeof(e) <> 'string'
        )
      );
$$;

alter table public.copy_overrides drop constraint if exists copy_overrides_bozza_check;
alter table public.copy_overrides add constraint copy_overrides_bozza_check
  check (public.copy_valore_valido(bozza));
alter table public.copy_overrides drop constraint if exists copy_overrides_vivo_check;
alter table public.copy_overrides add constraint copy_overrides_vivo_check
  check (public.copy_valore_valido(vivo));


-- ── CHI VEDE COSA ───────────────────────────────────────────────────────────
-- La tabella la vede solo un admin, bozza compresa.
alter table public.copy_overrides enable row level security;
drop policy if exists "admin scrive le scritte" on public.copy_overrides;
create policy "admin scrive le scritte" on public.copy_overrides
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- L'app legge da questa vista, che mostra SOLO la colonna pubblicata.
--
-- La legge anche chi non e' ancora entrata: il primo schermo dell'app e'
-- quello dell'accesso, e viene prima di qualsiasi sessione. Non c'e' niente
-- di riservato qui dentro — sono le scritte che l'app mostra a tutte, e
-- chiunque le puo' leggere aprendo l'app.
create or replace view public.copy_vivo as
  select chiave, lingua, vivo as valore
  from public.copy_overrides
  where vivo is not null;
grant select on public.copy_vivo to anon, authenticated;
