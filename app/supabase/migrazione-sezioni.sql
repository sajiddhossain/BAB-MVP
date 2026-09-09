-- ════════════════════════════════════════════════════════════════════════════
-- LE SEZIONI DELL'APP, DA ACCENDERE E SPEGNERE SENZA RICOMPILARE
--
-- Si incolla nell'editor SQL di Supabase. Si puo' rieseguire quante volte si
-- vuole. Non dipende dalle altre migrazioni: l'ordine non conta.
--
-- ── COSA FA ────────────────────────────────────────────────────────────────
-- Ogni sezione dell'app — il percorso, le sedici parole, lo storico, il
-- profilo — puo' stare in tre stati:
--
--   'aperta'    si usa;
--   'in-arrivo' si vede nella barra in fondo e dice che arriva presto;
--   'nascosta'  sparisce, e chi ci arriva scrivendo l'indirizzo torna a casa.
--
-- Com'e' l'app appena scaricata lo dice `src/data/sezioni.ts`, dentro al
-- codice. Questa tabella tiene solo cio' che qualcuno ha cambiato dopo:
-- tabella vuota, o database spento, o nessuna rete al primo avvio, e l'app si
-- comporta come dice il codice invece di restare a meta'.
--
-- ── PERCHE' NON C'E' UNA BOZZA ─────────────────────────────────────────────
-- Le scritte hanno due colonne, bozza e pubblicato, perche' un refuso salvato
-- per sbaglio non deve finire sullo schermo di una ragazza di dodici anni.
-- Spegnere una sezione e' un'altra cosa: e' una decisione, e quando la si
-- prende la si vuole subito. Una bozza di "il percorso e' spento" non
-- vorrebbe dire niente.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.app_sections (
  -- lo stesso id che sta in `src/data/sezioni.ts`: 'percorso', 'parole', …
  id         text primary key check (char_length(id) <= 40),
  stato      text not null check (stato in ('aperta','in-arrivo','nascosta')),
  aggiornato timestamptz not null default now(),
  da         uuid references auth.users(id) on delete set null
);

-- ── CHI VEDE COSA ───────────────────────────────────────────────────────────
-- Scrive solo un admin. Non e' un controllo fatto nel browser: la anon key
-- sta dentro al pacchetto scaricato da chiunque, quindi un controllo li'
-- sarebbe una serratura su una porta senza muri. Qui decide il server.
alter table public.app_sections enable row level security;

drop policy if exists "admin accende e spegne le sezioni" on public.app_sections;
create policy "admin accende e spegne le sezioni" on public.app_sections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Leggere lo puo' chiunque, anche chi non e' ancora entrata: la barra in
-- fondo deve sapere cosa mostrare prima di sapere chi sta guardando, e qui
-- dentro non c'e' niente di privato — c'e' scritto quali pezzi dell'app
-- esistono, che e' esattamente cio' che si vede aprendola.
drop policy if exists "tutti leggono le sezioni" on public.app_sections;
create policy "tutti leggono le sezioni" on public.app_sections
  for select to anon, authenticated using (true);

-- ── LO STATO DI PARTENZA DEL PILOTA ─────────────────────────────────────────
-- Body Language non e' ancora in mano alle atlete: la voce "Percorso" resta
-- nella barra e dice che arriva presto. Si apre da qui, o dal pannello,
-- il giorno in cui si decide.
--
-- `on conflict do nothing`: rieseguendo la migrazione non si riaccende e non
-- si rispegne niente di quello che nel frattempo e' stato deciso dal pannello.
insert into public.app_sections (id, stato) values ('percorso', 'in-arrivo')
on conflict (id) do nothing;
