-- ════════════════════════════════════════════════════════════════════════════
-- SEMI DI PROVA — squadra dimostrativa
--
-- ⚠️ SOLO PER VERIFICARE. Non eseguire su un progetto con dati veri.
--
-- A cosa serve: la dashboard squadra legge dalle viste `coach_*`, e finché non
-- esiste una squadra con dentro qualcuno non c'è modo di sapere se quelle viste
-- restituiscono le righe giuste e nascondono davvero il testo libero. Questo
-- file crea il minimo indispensabile per poterlo guardare.
--
-- PRIMA di eseguirlo servono degli utenti veri, perché `athletes.id` e
-- `team_staff.user_id` puntano a `auth.users`. Il modo più veloce:
--   Dashboard Supabase → Authentication → Users → «Add user» → Create new user
--   (con «Auto Confirm User» attivo). Due atlete e un coach bastano.
--
-- Poi metti le loro email qui sotto ed esegui tutto in una volta.
-- In fondo c'è il blocco per cancellare tutto.
-- ════════════════════════════════════════════════════════════════════════════

do $$
declare
  -- ── metti qui le email che hai creato ────────────────────────────────────
  coach_email   text := 'coach@esempio.it';
  atleta1_email text := 'giulia@esempio.it';
  atleta2_email text := 'sara@esempio.it';

  coach_id  uuid;
  a1        uuid;
  a2        uuid;
  team      uuid;
  d         date;
  i         int;
  sig       bigint;
begin
  select id into coach_id from auth.users where email = coach_email;
  select id into a1       from auth.users where email = atleta1_email;
  select id into a2       from auth.users where email = atleta2_email;

  if coach_id is null or a1 is null or a2 is null then
    raise exception 'Manca almeno un utente. Creali in Authentication → Users, poi rilancia.';
  end if;

  -- ── squadra e staff ─────────────────────────────────────────────────────
  insert into public.teams (name, sport, event_word, locale)
  values ('Under 15 — prova', 'Pallavolo', 'match', 'it')
  returning id into team;

  insert into public.team_staff (team_id, user_id, role) values (team, coach_id, 'head_coach');

  -- ── due atlete ──────────────────────────────────────────────────────────
  insert into public.athletes (id, display_name, birth_date, sport, cycle_status, contraception, locale)
  values (a1, 'Giulia', date '2012-04-10', 'Pallavolo', 'tracking',   'undisclosed', 'it'),
         (a2, 'Sara',   date '2009-09-02', 'Pallavolo', 'undisclosed','undisclosed', 'it')
  on conflict (id) do nothing;

  insert into public.team_members (team_id, athlete_id) values (team, a1), (team, a2);

  -- ── una settimana di check-in ───────────────────────────────────────────
  -- Giulia chiude il cerchio quasi ogni giorno; Sara fa solo il "prima" un paio
  -- di volte. Serve a vedere che la dashboard distingua i due casi invece di
  -- mostrare una riga uguale per tutte.
  for i in 0..6 loop
    d := current_date - i;

    insert into public.check_ins (id, athlete_id, kind, local_date, tempo_predicted, tempo_chosen,
                                  sleep, energy, hydration, muscles, note)
    values (gen_random_uuid(), a1, 'pre', d,
            (array['upbeat','steady','gentle'])[1 + (i % 3)]::tempo,
            (array['upbeat','steady','gentle'])[1 + (i % 3)]::tempo,
            4, 4, 3, 3,
            -- 🔴 Testo libero DI PROPOSITO: se compare nella dashboard, la
            -- vista è rotta. È il controllo più importante di questo file.
            'Nota privata di Giulia — non deve mai comparire nella dashboard');

    if i <> 3 then
      insert into public.check_ins (id, athlete_id, kind, local_date, tempo_chosen, effort,
                                    legs, breath, energy, session_type, pe_attended)
      values (gen_random_uuid(), a1, 'post', d,
              (array['steady','gentle','upbeat'])[1 + (i % 3)]::tempo,
              3, 4, 4, 3, 'training', (i % 2 = 0));
    end if;

    if i < 2 then
      insert into public.check_ins (id, athlete_id, kind, local_date, tempo_predicted, tempo_chosen,
                                    sleep, energy, hydration, muscles)
      values (gen_random_uuid(), a2, 'pre', d, 'steady', 'steady', 3, 3, 4, 3);
    end if;
  end loop;

  -- ── un segnale e una bandiera rossa aperta ──────────────────────────────
  insert into public.body_signals (athlete_id, created_at, region, region_free, sensation, intensity, behaviour, is_red_flag)
  values (a1, now() - interval '2 days', 'calf_r', null, 'tight', 2, 'eases', false);

  insert into public.body_signals (athlete_id, created_at, region, region_free, sensation, intensity, behaviour, is_red_flag)
  values (a2, now() - interval '3 days', 'knee_l', 'anche dietro', 'gives_way', 3, 'worse_load', true)
  returning id into sig;

  insert into public.red_flags (athlete_id, body_signal_id, opened_at, region, sensation, told_adult)
  values (a2, sig, now() - interval '3 days', 'knee_l', 'gives_way', false);

  -- ── date del ciclo (R2: lo staff le vede) ───────────────────────────────
  insert into public.cycle_events (athlete_id, kind, event_date)
  values (a1, 'period_start', current_date - 12),
         (a1, 'period_start', current_date - 41)
  on conflict do nothing;

  raise notice 'Squadra creata: %', team;
end $$;


-- ════════════════════════════════════════════════════════════════════════════
-- COSA DEVE RISULTARE
--
-- Da eseguire come il COACH (Supabase → SQL Editor esegue come postgres, che
-- vede tutto: per una prova vera serve aprire la dashboard dall'app con
-- l'utente coach). Qui restano come promemoria di cosa guardare:
--
--   select * from public.coach_athletes;      -- due atlete
--   select * from public.coach_check_ins;     -- 🔴 NESSUNA colonna `note`
--   select * from public.coach_red_flags;     -- una, non risolta, told_adult=false
--   select * from public.coach_cycle_events;  -- due date di Giulia
--
-- 🔴 Il controllo che conta: `select note from public.coach_check_ins` deve
-- FALLIRE con "column note does not exist". Se restituisce qualcosa, la
-- promessa R2 è rotta e la nota privata di Giulia è finita davanti al coach.
-- ════════════════════════════════════════════════════════════════════════════


-- ── PULIZIA ─────────────────────────────────────────────────────────────────
-- Toglie tutto quello che questo file ha creato, in ordine di dipendenza.
-- Lascia in piedi gli utenti di auth: quelli si cancellano dalla dashboard.
--
-- do $$
-- declare team uuid;
-- begin
--   select id into team from public.teams where name = 'Under 15 — prova';
--   delete from public.red_flags    where athlete_id in (select athlete_id from public.team_members where team_id = team);
--   delete from public.body_signals where athlete_id in (select athlete_id from public.team_members where team_id = team);
--   delete from public.check_ins    where athlete_id in (select athlete_id from public.team_members where team_id = team);
--   delete from public.cycle_events where athlete_id in (select athlete_id from public.team_members where team_id = team);
--   delete from public.athletes     where id in (select athlete_id from public.team_members where team_id = team);
--   delete from public.teams where id = team;   -- staff e membership vanno via in cascata
-- end $$;
