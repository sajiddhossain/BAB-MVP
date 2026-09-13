-- ═══════════════════════════════════════════════════════════════════════════
-- IL PANNELLO GESTISCE LE ATLETE  (settembre 2026)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Da lanciare una volta sul database, dopo `migrazione-pannello.sql`. È
-- idempotente: si può rilanciare senza rompere niente.
--
-- ── PERCHÉ SERVE ───────────────────────────────────────────────────────────
-- Con `migrazione-pannello.sql` un amministratore guarda. Con questa agisce:
-- cancella un account, corregge un nome sbagliato o una data di nascita,
-- sposta una persona di squadra, le fa rifare il tutorial, scarica i suoi
-- dati, e tiene delle note sue su di lei.
--
-- Tutto passa da funzioni `security definer` che come prima riga controllano
-- `is_admin()`. Le regole (RLS) sulle tabelle delle atlete non si toccano:
-- un admin non ottiene il diritto di scriverci dentro, ottiene quattro gesti
-- precisi, e ognuno fa solo quello che dice il suo nome.


-- ── LE NOTE DI CHI AMMINISTRA ──────────────────────────────────────────────
-- Appunti privati del pannello su una persona: «l'ho sentita al telefono»,
-- «la mamma chiede di spostarla di squadra». L'atleta non le vede, lo staff
-- delle squadre nemmeno: la sola regola è `is_admin()`.
--
-- Muoiono con lei (`on delete cascade`): una nota su una persona che ha
-- cancellato l'account è un dato personale che non ha più un motivo di stare
-- qui. Se se ne va chi l'ha scritta, la nota resta e perde solo la firma.
create table if not exists public.admin_notes (
  id         uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  author     uuid default auth.uid() references auth.users(id) on delete set null,
  body       text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists admin_notes_athlete_idx on public.admin_notes (athlete_id, created_at desc);

alter table public.admin_notes enable row level security;
drop policy if exists "admin manages notes" on public.admin_notes;
create policy "admin manages notes" on public.admin_notes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select, insert, delete on public.admin_notes to authenticated;

-- La firma: l'email di chi l'ha scritta. `auth.users` non si legge dal
-- client, quindi passa da una vista, chiusa come le altre del pannello.
create or replace view public.admin_notes_signed as
  select n.id, n.athlete_id, n.body, n.created_at, n.author, u.email as author_email
  from public.admin_notes n
  left join auth.users u on u.id = n.author
  where public.is_admin();
grant select on public.admin_notes_signed to authenticated;


-- ── CANCELLARE UN'ATLETA ───────────────────────────────────────────────────
-- Reale, come `delete_my_account`: si cancella l'utente auth, e il cascade da
-- `athletes` porta via check-in, corpo, ciclo, percorso, note. Non c'è un
-- cestino e non c'è un «disattivata»: chi chiede di andarsene se ne va.
--
-- 🔴 Un account di amministrazione non si cancella da qui. Un click sbagliato
-- nell'elenco toglierebbe l'accesso al pannello a chi lo sta usando, o a
-- un'altra persona che amministra, senza nessuno che possa rimetterlo.
create or replace function public.admin_delete_athlete(p_id uuid)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin() then raise exception 'non autorizzata' using errcode = '42501'; end if;
  if exists (select 1 from public.platform_admins where user_id = p_id) then
    raise exception 'è un account di amministrazione: da qui non si cancella' using errcode = '42501';
  end if;
  if not exists (select 1 from public.athletes where id = p_id) then
    return 'non_esiste';
  end if;
  delete from auth.users where id = p_id;
  return 'cancellata';
end $$;


-- ── CORREGGERE L'ANAGRAFICA ────────────────────────────────────────────────
-- Nome, data di nascita, sport. I vincoli sono quelli della tabella (nome da
-- 1 a 40, almeno 12 anni): se il pannello manda un valore che non va, l'errore
-- è lo stesso che avrebbe avuto l'onboarding.
--
-- Gli sport sono una lista: il primo diventa `athletes.sport`, e
-- `athlete_sports` viene rimessa uguale alla lista — si tolgono quelli che
-- non ci sono più e si aggiungono i nuovi, senza toccare le date di quelli
-- che restano.
create or replace function public.admin_update_athlete(
  p_id uuid, p_display_name text, p_birth_date date, p_sports text[]
) returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare lista text[];
begin
  if not public.is_admin() then raise exception 'non autorizzata' using errcode = '42501'; end if;
  select coalesce(array_agg(distinct btrim(s)) filter (where btrim(s) <> ''), '{}')
    into lista from unnest(coalesce(p_sports, '{}')) s;

  update public.athletes
     set display_name = btrim(p_display_name),
         birth_date   = p_birth_date,
         sport        = case when cardinality(p_sports) > 0 then btrim(p_sports[1]) end
   where id = p_id;
  if not found then raise exception 'atleta non trovata' using errcode = 'P0002'; end if;

  delete from public.athlete_sports where athlete_id = p_id and not (sport = any(lista));
  insert into public.athlete_sports (athlete_id, sport)
    select p_id, s from unnest(lista) s
    on conflict (athlete_id, sport) do nothing;
end $$;


-- ── SPOSTARLA DI SQUADRA ───────────────────────────────────────────────────
-- Una squadra alla volta, come la legge `admin_athletes`. Uscire non cancella
-- niente: mette `left_at`, come `admin_detach_athlete`. `p_team` nullo vuol
-- dire «nessuna squadra».
create or replace function public.admin_set_team(p_id uuid, p_team uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin() then raise exception 'non autorizzata' using errcode = '42501'; end if;
  update public.team_members set left_at = now()
   where athlete_id = p_id and left_at is null
     and (p_team is null or team_id <> p_team);
  if p_team is not null then
    insert into public.team_members (team_id, athlete_id) values (p_team, p_id)
      on conflict (team_id, athlete_id) do update set left_at = null;
  end if;
end $$;


-- ── RIFARE IL TUTORIAL ─────────────────────────────────────────────────────
-- La guardia legge `tutorial_done` quando lei rientra: rimesso a null, la
-- prossima volta che apre BAB ci ritorna. Il battito che aveva contato resta,
-- e verrà sovrascritto solo se lo riconta.
create or replace function public.admin_reset_tutorial(p_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin() then raise exception 'non autorizzata' using errcode = '42501'; end if;
  update public.athletes set tutorial_done = null where id = p_id;
end $$;


-- ── SCARICARE I SUOI DATI ──────────────────────────────────────────────────
-- La stessa forma di `export_my_data`, per chi amministra: serve quando una
-- persona chiede i suoi dati e non riesce a scaricarli da sola.
--
-- 🔴 Il diario (`journal_entries`) resta fuori, come resta fuori dalle viste
-- del pannello (vedi `migrazione-pannello.sql`): è l'unica cosa sua che non è
-- mai stata mostrata a nessuno per progetto. Se lo chiede lei, lo scarica lei
-- dal profilo.
create or replace function public.admin_export_athlete(p_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin() then raise exception 'non autorizzata' using errcode = '42501'; end if;
  return jsonb_build_object(
    'exported_at',  now(),
    'athlete',      (select to_jsonb(a) from public.athletes a where a.id = p_id),
    'email',        (select u.email from auth.users u where u.id = p_id),
    'consents',     (select coalesce(jsonb_agg(to_jsonb(c)),'[]') from public.consents c where c.athlete_id = p_id),
    'check_ins',    (select coalesce(jsonb_agg(to_jsonb(k) order by k.local_date, k.created_at),'[]') from public.check_ins k where k.athlete_id = p_id),
    'body_signals', (select coalesce(jsonb_agg(to_jsonb(b) order by b.created_at),'[]') from public.body_signals b where b.athlete_id = p_id),
    'red_flags',    (select coalesce(jsonb_agg(to_jsonb(r)),'[]') from public.red_flags r where r.athlete_id = p_id),
    'cycle_events', (select coalesce(jsonb_agg(to_jsonb(y) order by y.event_date),'[]') from public.cycle_events y where y.athlete_id = p_id),
    'journey',      (select coalesce(jsonb_agg(to_jsonb(j)),'[]') from public.journey_progress j where j.athlete_id = p_id),
    'lessons',      (select coalesce(jsonb_agg(to_jsonb(l) order by l.lesson),'[]') from public.body_language_progress l where l.athlete_id = p_id),
    'shares',       (select coalesce(jsonb_agg(to_jsonb(s)),'[]') from public.shares s where s.athlete_id = p_id),
    'sports',       (select coalesce(jsonb_agg(to_jsonb(sp)),'[]') from public.athlete_sports sp where sp.athlete_id = p_id),
    'schedule',     (select coalesce(jsonb_agg(to_jsonb(w)),'[]') from public.athlete_schedule w where w.athlete_id = p_id),
    'events',       (select coalesce(jsonb_agg(to_jsonb(e)),'[]') from public.athlete_events e where e.athlete_id = p_id),
    'teams',        (select coalesce(jsonb_agg(to_jsonb(m)),'[]') from public.team_members m where m.athlete_id = p_id)
  );
end $$;


revoke all on function public.admin_delete_athlete(uuid)                     from public;
revoke all on function public.admin_update_athlete(uuid, text, date, text[]) from public;
revoke all on function public.admin_set_team(uuid, uuid)                     from public;
revoke all on function public.admin_reset_tutorial(uuid)                     from public;
revoke all on function public.admin_export_athlete(uuid)                     from public;
grant execute on function public.admin_delete_athlete(uuid)                     to authenticated;
grant execute on function public.admin_update_athlete(uuid, text, date, text[]) to authenticated;
grant execute on function public.admin_set_team(uuid, uuid)                     to authenticated;
grant execute on function public.admin_reset_tutorial(uuid)                     to authenticated;
grant execute on function public.admin_export_athlete(uuid)                     to authenticated;
