-- ═══════════════════════════════════════════════════════════════════════════
-- IL PANNELLO VEDE LE ATLETE  (settembre 2026)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Da lanciare una volta sul database, dopo `schema.sql`. È idempotente: si
-- può rilanciare senza rompere niente.
--
-- ── PERCHÉ SERVE ───────────────────────────────────────────────────────────
-- Fino a qui un amministratore non poteva leggere nemmeno un check-in. Le
-- regole (RLS) danno a ogni atleta le sue righe e basta, e le viste `admin_*`
-- che c'erano sono solo conteggi globali: quante sono, quante hanno fatto
-- qualcosa oggi. Con quello si sa se il pilota respira, non si sa niente di
-- nessuno.
--
-- Questa migrazione apre le viste che servono al pannello: l'elenco delle
-- atlete con dentro quanto hanno fatto, i loro check-in riga per riga, le
-- sensazioni sul corpo, le date del ciclo, le lezioni finite, la settimana.
-- Tutte con `where public.is_admin()`: girano come proprietario (come le
-- altre), e quella clausola è l'unica cosa che le tiene chiuse.
--
-- ── 🔴 LA REGOLA CHE QUESTA MIGRAZIONE SCAVALCA ────────────────────────────
-- In `schema.sql` c'è scritto, delle viste admin:
--
--     «NON legge i check-in, NON legge il ciclo, e soprattutto non legge il
--      testo libero. La regola "le sue parole sono sue" non ha eccezioni per
--      chi amministra — se le avesse, non sarebbe una regola.»
--
-- Questa migrazione la scavalca su richiesta esplicita di chi amministra BAB
-- (settembre 2026), per poter assistere una persona guardando quello che ha
-- scritto davvero. È una decisione, non una svista, e va scritta qui perché
-- chi legge lo schema fra un anno trovi le due cose insieme.
--
-- Perciò il testo libero NON è mescolato alle altre colonne: sta tutto e solo
-- nella PARTE B in fondo, in due viste sue. Tornare indietro è una riga:
--
--     drop view if exists public.admin_check_in_words, public.admin_body_signal_words;
--
-- e la promessa torna intera, senza toccare nient'altro.
--
-- `journal_entries` — il diario — resta fuori anche dalla parte B. È l'unico
-- posto dell'app che non è mai stato mostrato a nessun altro per progetto, e
-- nessuno schermo ci scrive dentro: aprirlo oggi sarebbe scavalcare una
-- promessa senza nemmeno guadagnarci un dato. Se serve, si aggiunge dopo e si
-- scrive perché.
--
-- Restano fuori anche `athlete_measurements` (altezza e peso, che l'atleta per
-- progetto non vede: `schema.sql` R5) e `ux_events` (nessuno ci scrive).


-- ── INDICI PER LE DOMANDE CHE ATTRAVERSANO LE PERSONE ──────────────────────
-- Tutti gli indici che c'erano cominciano per `athlete_id`: vanno benissimo
-- per «i giorni di questa ragazza», e per niente per «tutti i check-in di
-- ieri», che è quello che chiede un pannello. Senza questi, ogni schermata
-- dell'amministrazione legge le tabelle intere.
create index if not exists check_ins_date_idx      on public.check_ins (local_date desc);
create index if not exists body_signals_when_idx   on public.body_signals (created_at desc);
create index if not exists body_signals_zone_idx   on public.body_signals (region);
create index if not exists athletes_created_idx    on public.athletes (created_at desc);


-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE A — i fatti: numeri, scale, zone, date. Nessun testo libero.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── CHI C'È ────────────────────────────────────────────────────────────────
-- Una riga per atleta, con dentro quanto ha fatto. Prima questa vista faceva
-- `left join team_members` senza `left_at is null`: chi era passata per due
-- squadre compariva due volte, e `count(*)` non era il numero delle atlete.
-- Adesso la squadra è una sottoquery che ne prende una sola, quella di
-- adesso, e la riga per atleta è una.
--
-- L'email c'è perché senza non si riconosce nessuno: `display_name` è un
-- nome scelto e non è unico, e un uuid non dice niente. È la stessa ragione
-- per cui ce l'ha già `admin_staff`.
drop view if exists public.admin_athletes;
create view public.admin_athletes as
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
    -- gli sport sono in una tabella a parte: `athletes.sport` è solo il primo
    (select array_agg(s.sport order by s.sport)
       from public.athlete_sports s where s.athlete_id = a.id)         as sports,
    -- la squadra di adesso, se c'è: una sola, mai due
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
    -- giorni in cui ha aperto BAB e ha finito qualcosa, non quante righe
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
    -- il consenso: `false` se una delle due righe dice di no
    (select bool_and(c.granted) from public.consents c
      where c.athlete_id = a.id)                                       as consent_ok
  from public.athletes a
  left join auth.users u on u.id = a.id
  where public.is_admin();


-- ── I CHECK-IN, RIGA PER RIGA ──────────────────────────────────────────────
-- Tutte le colonne che l'app scrive davvero, più le due marche temporali che
-- dicono quanto ci ha messo. Le colonne dismesse (`hydration`, `muscles`,
-- `legs`, `breath`, `headspace`, `surprise`, `duration_bucket`) non ci sono:
-- nessuno le scrive più, e una colonna sempre vuota in un pannello è una
-- domanda a cui si risponde ogni volta «no, quella non si usa».
create or replace view public.admin_check_ins as
  select
    c.id, c.athlete_id, c.kind, c.local_date, c.local_time, c.created_at,
    c.started_at, c.completed_at,
    -- quanto ci ha messo, in secondi: c'è solo per i giri finiti
    case when c.started_at is not null and c.completed_at is not null
          and c.completed_at >= c.started_at
         then extract(epoch from (c.completed_at - c.started_at))::int
    end                                                                as seconds,
    c.tempo_predicted, c.tempo_chosen,
    c.sleep, c.sleep_hours, c.energy, c.mood, c.school_load,
    c.effort, c.satisfaction, c.brought_home,
    c.on_period, c.painkillers, c.protective_pain,
    (c.note is not null and c.note <> '')                              as has_note
  from public.check_ins c
  where public.is_admin();


-- ── IL CORPO ───────────────────────────────────────────────────────────────
-- Una riga per zona toccata. `region` tiene insieme tre cose — davanti o
-- dietro, quale zona, destra o sinistra — perché è così che l'app la scrive
-- (`front_knee_l`). Qui le separo, se no ogni conto sulle zone comincia con
-- uno `split_part` copiato a mano.
create or replace view public.admin_body_signals as
  select
    b.id, b.athlete_id, b.check_in_id, b.created_at,
    b.region,
    split_part(b.region, '_', 1)                                       as plane,
    case when b.region like '%\_l' then 'l'
         when b.region like '%\_r' then 'r' end                        as side,
    b.sensation, b.intensity, b.one_side,
    b.when_noticed, b.onset, b.session_effect, b.is_red_flag,
    (b.words is not null and b.words <> '')                            as has_words
  from public.body_signals b
  where public.is_admin();


-- ── IL CICLO ───────────────────────────────────────────────────────────────
-- Solo le date dichiarate, mai una fase. La fase è un'inferenza, e in un
-- pannello sembrerebbe un fatto (è la stessa cautela di `coach_cycle_events`).
-- Nota: l'app scrive solo `period_start`, quindi la durata non c'è — si
-- vedono gli intervalli fra un inizio e l'altro, non quanto dura.
create or replace view public.admin_cycle_events as
  select e.id, e.athlete_id, e.kind, e.event_date, e.created_at
  from public.cycle_events e
  where public.is_admin();


-- ── IL PERCORSO ────────────────────────────────────────────────────────────
-- Una riga per lezione finita. Le lezioni cominciate e mollate non ci sono
-- da nessuna parte: l'app non le scrive (scelta di `lib/percorso.ts`).
create or replace view public.admin_lessons as
  select p.athlete_id, p.lesson, p.completed_at
  from public.body_language_progress p
  where public.is_admin();


-- ── LA SUA SETTIMANA ───────────────────────────────────────────────────────
-- Quando si allena e a cosa. Serve per la domanda che vale davvero: nei
-- giorni in cui doveva allenarsi, ha fatto il check-in?
-- `start_time` e `duration_min` esistono nella tabella ma l'onboarding non li
-- scrive: qui ci sono lo stesso, così il giorno che comincerà a scriverli il
-- pannello li vede senza toccare niente.
create or replace view public.admin_schedule as
  select s.athlete_id, s.weekday, s.kind, s.sport, s.start_time, s.duration_min, s.label
  from public.athlete_schedule s
  where public.is_admin();


grant select on public.admin_athletes, public.admin_check_ins,
                public.admin_body_signals, public.admin_cycle_events,
                public.admin_lessons, public.admin_schedule
  to authenticated;


-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE B — le sue parole.
--
-- 🔴 Qui c'è il testo che le atlete hanno scritto a mano. È la parte che
-- scavalca la regola in cima a questo file. Sta separata apposta: si toglie
-- con un `drop view` e non si porta via niente altro.
-- ═══════════════════════════════════════════════════════════════════════════

-- «Aggiungi tu…» in fondo al check-out, e il vecchio campo libero della testa.
create or replace view public.admin_check_in_words as
  select w.id, w.athlete_id, w.kind, w.local_date, w.note, w.headspace_other
  from public.check_ins w
  where public.is_admin()
    and (w.note is not null or w.headspace_other is not null);

-- «Come la senti?» col dito sul corpo, e il nome della zona quando è
-- «altrove» e la mappa non ce l'ha.
create or replace view public.admin_body_signal_words as
  select b.id, b.athlete_id, b.check_in_id, b.created_at, b.region,
         b.region_free, b.words
  from public.body_signals b
  where public.is_admin()
    and (b.words is not null or b.region_free is not null);

grant select on public.admin_check_in_words, public.admin_body_signal_words
  to authenticated;
