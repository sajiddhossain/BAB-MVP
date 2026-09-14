-- ═══════════════════════════════════════════════════════════════════════════
-- LE IMPOSTAZIONI DEL PANNELLO  (settembre 2026)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Da lanciare una volta sul database, dopo `migrazione-pannello.sql` e
-- `migrazione-gestione.sql`. È idempotente: si può rilanciare.
--
-- ── COSA FA ────────────────────────────────────────────────────────────────
-- Gli orari di check-in e check-out erano numeri scritti nel codice: trenta
-- minuti prima dell'allenamento, trenta dopo, e le finestre fisse dei giorni
-- senza orari. Cambiarli voleva dire ricompilare. Da qui si cambiano dal
-- pannello, a due livelli:
--
--   `app_settings`       un valore per tutte;
--   `athlete_settings`   le eccezioni di una sola atleta, e l'interruttore
--                        «account di prova».
--
-- Come per le sezioni: il codice dice com'è l'app di partenza, e queste
-- tabelle tengono solo quello che qualcuno ha cambiato. Tabelle vuote, o
-- database che non risponde, e l'app si comporta come prima.
--
-- ── L'ACCOUNT DI PROVA ─────────────────────────────────────────────────────
-- Serve a mostrare l'app o a provarla senza aspettare l'ora giusta: check-in
-- e check-out sempre aperti, e rifattibili. I suoi check-in si salvano come
-- tutti gli altri — così il giro si prova fino in fondo, pannello compreso —
-- ma le viste dei numeri qui sotto non li contano.


-- ── PER TUTTE ──────────────────────────────────────────────────────────────
create table if not exists public.app_settings (
  -- 'orari': { prima, dopo, ritardo, fisse: { checkin: {apre,chiude,ultimo}, checkout: {…} } }
  id         text primary key check (char_length(id) <= 40),
  value      jsonb not null,
  aggiornato timestamptz not null default now(),
  da         uuid default auth.uid() references auth.users(id) on delete set null
);

alter table public.app_settings enable row level security;

drop policy if exists "admin cambia le impostazioni" on public.app_settings;
create policy "admin cambia le impostazioni" on public.app_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Leggerle può chiunque, anche prima di entrare: sono orari, e l'app deve
-- sapere quando apre il check-in prima di sapere chi sta guardando.
drop policy if exists "tutti leggono le impostazioni" on public.app_settings;
create policy "tutti leggono le impostazioni" on public.app_settings
  for select to anon, authenticated using (true);

grant select on public.app_settings to anon, authenticated;
grant insert, update, delete on public.app_settings to authenticated;

insert into public.app_settings (id, value) values ('orari', jsonb_build_object(
  'prima', 30, 'dopo', 30, 'ritardo', 0,
  'fisse', jsonb_build_object(
    'checkin',  jsonb_build_object('apre', '05:00', 'chiude', '12:00', 'ultimo', '15:30'),
    'checkout', jsonb_build_object('apre', '15:30', 'chiude', '23:30', 'ultimo', '04:00')
  )
)) on conflict (id) do nothing;


-- ── PER UNA SOLA ───────────────────────────────────────────────────────────
-- Una colonna nulla vuol dire «vale l'impostazione generale».
create table if not exists public.athlete_settings (
  athlete_id     uuid primary key references public.athletes(id) on delete cascade,
  is_test        boolean  not null default false,
  checkin_before smallint check (checkin_before is null or checkin_before between 0 and 240),
  checkout_after smallint check (checkout_after is null or checkout_after between 0 and 240),
  late_minutes   smallint check (late_minutes   is null or late_minutes   between 0 and 240),
  aggiornato     timestamptz not null default now(),
  da             uuid default auth.uid() references auth.users(id) on delete set null
);

alter table public.athlete_settings enable row level security;

drop policy if exists "admin cambia le impostazioni di un'atleta" on public.athlete_settings;
create policy "admin cambia le impostazioni di un'atleta" on public.athlete_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Lei legge la sua riga e basta: l'app deve sapere se è di prova e quali
-- orari valgono per lei. Scriverla non può — se potesse, basterebbe una
-- chiamata diretta per aprirsi il check-in a qualunque ora.
drop policy if exists "lei legge le sue impostazioni" on public.athlete_settings;
create policy "lei legge le sue impostazioni" on public.athlete_settings
  for select to authenticated using (athlete_id = auth.uid());

grant select, insert, update, delete on public.athlete_settings to authenticated;

-- Vero se l'account è di prova. `security definer` perché la usano le viste
-- dei numeri, che non devono dipendere dalle regole di chi le legge.
create or replace function public.di_prova(p_athlete uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce((select s.is_test from public.athlete_settings s where s.athlete_id = p_athlete), false);
$$;
revoke all on function public.di_prova(uuid) from public;
grant execute on function public.di_prova(uuid) to authenticated;


-- ── L'ELENCO SA CHI È DI PROVA ─────────────────────────────────────────────
-- La stessa vista di `migrazione-pannello.sql`, con una colonna in fondo.
-- `create or replace` lascia aggiungere colonne solo in coda: per questo
-- `is_test` è l'ultima.
create or replace view public.admin_athletes as
  select
    a.id,
    a.created_at,
    a.display_name,
    a.athlete_code,
    u.email,
    a.birth_date,
    public.age_years(a.birth_date)                                    as age,
    a.sport,
    a.locale,
    a.cycle_status,
    a.contraception,
    a.first_period_age,
    a.first_bpm,
    a.tutorial_done,
    (select array_agg(s.sport order by s.sport)
       from public.athlete_sports s where s.athlete_id = a.id)         as sports,
    (select t.name from public.team_members m
       join public.teams t on t.id = m.team_id
      where m.athlete_id = a.id and m.left_at is null
      order by m.joined_at limit 1)                                    as team_name,
    (select count(*) from public.check_ins c
      where c.athlete_id = a.id)                                       as checkins,
    (select count(*) from public.check_ins c
      where c.athlete_id = a.id and c.kind = 'pre')                    as checkins_pre,
    (select count(*) from public.check_ins c
      where c.athlete_id = a.id and c.kind = 'post')                   as checkins_post,
    (select min(c.local_date) from public.check_ins c
      where c.athlete_id = a.id)                                       as first_day,
    (select max(c.local_date) from public.check_ins c
      where c.athlete_id = a.id)                                       as last_day,
    (select count(distinct c.local_date) from public.check_ins c
      where c.athlete_id = a.id and c.local_date >= current_date - 7)  as days_7d,
    (select count(distinct c.local_date) from public.check_ins c
      where c.athlete_id = a.id and c.local_date >= current_date - 30) as days_30d,
    (select count(*) from public.body_signals b
      where b.athlete_id = a.id)                                       as signals,
    (select count(*) from public.body_signals b
      where b.athlete_id = a.id and b.is_red_flag)                     as signals_flagged,
    (select count(*) from public.body_language_progress p
      where p.athlete_id = a.id)                                       as lessons_done,
    (select count(*) from public.cycle_events e
      where e.athlete_id = a.id)                                       as cycle_marks,
    (select bool_and(c.granted) from public.consents c
      where c.athlete_id = a.id)                                       as consent_ok,
    public.di_prova(a.id)                                              as is_test
  from public.athletes a
  left join auth.users u on u.id = a.id
  where public.is_admin();


-- ── I NUMERI DELL'ATRIO NON CONTANO LE PROVE ───────────────────────────────
-- Le stesse colonne di `schema.sql`, nello stesso ordine, con le righe degli
-- account di prova tolte da ogni conto.
create or replace view public.admin_pulse as
  select
    (select count(*) from public.athletes a where not public.di_prova(a.id))    as athletes,
    (select count(*) from public.athletes a
      where created_at >= now() - interval '7 days' and not public.di_prova(a.id)) as athletes_new_7d,
    (select count(*) from public.teams)                                          as teams,
    (select count(*) from public.check_ins c
      where local_date = current_date and not public.di_prova(c.athlete_id))    as checkins_today,
    (select count(distinct athlete_id) from public.check_ins c
      where local_date = current_date and not public.di_prova(c.athlete_id))    as athletes_today,
    (select count(*) from public.check_ins c
      where local_date >= current_date - 7 and not public.di_prova(c.athlete_id)) as checkins_7d,
    (select count(*) from public.check_ins c
      where kind = 'post' and local_date >= current_date - 7
        and not public.di_prova(c.athlete_id))                                   as posts_7d,
    (select count(*) from public.body_signals b
      where created_at >= now() - interval '7 days'
        and not public.di_prova(b.athlete_id))                                   as signals_7d,
    (select count(*) from public.red_flags where resolved_at is null)            as flags_open,
    (select count(*) from public.red_flags
      where resolved_at is null and told_adult = false)                          as flags_untold,
    (select count(*) from public.red_flags
      where resolved_at is null and opened_at < now() - interval '3 days')       as flags_stale,
    (select count(*) from public.consents where granted = false)                 as consents_refused
  where public.is_admin();
