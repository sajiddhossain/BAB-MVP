-- ════════════════════════════════════════════════════════════════════════════
-- DA INCOLLARE NELL'EDITOR SQL DI SUPABASE, UNA VOLTA SOLA.
--
-- E' lo stesso blocco che sta in fondo a `schema.sql`, staccato qui perche'
-- si possa incollare senza rilanciare tutto lo schema. Rieseguirlo non fa
-- danni: toglie i vincoli prima di rimetterli, e il cambio di tipo di
-- `sensation` scatta solo se non e' gia' stato fatto.
--
-- Finche' non gira, il check-in e il check-out funzionano sullo schermo ma
-- non riescono a salvare.
-- ════════════════════════════════════════════════════════════════════════════

-- ALLARGAMENTO PER GLI SCHERMI DEL CHECK-IN E DEL CHECK-OUT (settembre 2026)
-- ════════════════════════════════════════════════════════════════════════════
-- I dodici schermi disegnati chiedono su scale piu' larghe di quelle previste
-- qui. Si allargano le colonne invece di convertire nell'app: una conversione
-- e' un posto dove la scala della schermata e la scala del dato si possono
-- scollare senza che nessuno se ne accorga — e a scollarsi sarebbero i numeri
-- di un'atleta.
--
-- Quando questo blocco e' stato scritto `check_ins` e `body_signals` erano
-- vuote (verificato, zero righe): non c'e' niente da riscalare. Su un database
-- con dati dentro NON eseguirlo cosi' com'e'.
--
-- I vincoli si tolgono cercandoli per colonna e non per nome: il nome che
-- Postgres da' a un check dipende da come e' nata la colonna, e qui alcune
-- sono nate nel `create table` e altre in un `alter table` piu' sotto.

do $$
declare c record;
begin
  for c in
    select con.conname, rel.relname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace ns on ns.oid = rel.relnamespace
    where ns.nspname = 'public'
      and con.contype = 'c'
      and (
        (rel.relname = 'check_ins'    and pg_get_constraintdef(con.oid) ~ '\m(mood|school_load|brought_home)\M') or
        (rel.relname = 'body_signals' and pg_get_constraintdef(con.oid) ~ '\m(sensation|intensity)\M')
      )
  loop
    execute format('alter table public.%I drop constraint %I', c.relname, c.conname);
  end loop;
end $$;

-- L'umore era una VAS 0–100. La schermata ha sette tacche, come sonno ed
-- energia: tre scale uguali si confrontano fra loro, una diversa no.
alter table public.check_ins add constraint check_ins_mood_check
  check (mood between 1 and 7);

-- Il carico scolastico era 1–3; la schermata ne mostra sette.
alter table public.check_ins add constraint check_ins_school_load_check
  check (school_load between 1 and 7);

-- "Cosa hai portato a casa": cinque codici piu' un po' di margine. La frase
-- che scrive lei NON va qui — va in `note`, che e' fuori dalla vista del
-- coach: le sue parole restano sue.
alter table public.check_ins add constraint check_ins_brought_home_check
  check (brought_home is null or array_length(brought_home,1) <= 6);

-- "Senti un dolore di tipo protettivo?", l'ultima domanda del check-out.
-- E' la sola domanda di tutto il giro che chiede un giudizio invece di una
-- sensazione, e sta in una colonna sua perche' e' anche la sola che puo'
-- portare a coinvolgere un adulto.
alter table public.check_ins add column if not exists protective_pain boolean;

-- Un check-in per tipo per giorno. Non c'era, e senza, rifare un check-out
-- gia' fatto scriveva una seconda riga invece di correggere la prima — e il
-- confronto previsione/esito avrebbe trovato due esiti per una previsione.
create unique index if not exists check_ins_uno_per_giorno
  on public.check_ins (athlete_id, kind, local_date);

-- ── body_signals ────────────────────────────────────────────────────────────
-- La vista del coach va tolta prima: seleziona `sensation`, e Postgres non
-- lascia cambiare il tipo di una colonna che una vista sta guardando.
drop view if exists public.coach_body_signals;

-- Una sensazione ha piu' di una parola: "teso · indolenzito · bruciante".
-- Erano tre pastiglie accese sullo stesso punto gia' nel primo disegno.
--
-- Il cambio di tipo si fa solo se la colonna e' ancora `text`: rieseguendo
-- questo file su un database gia' migrato, `array[sensation]` su una colonna
-- che e' gia' un array darebbe un array a due dimensioni e fallirebbe.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'body_signals'
      and column_name = 'sensation' and data_type <> 'ARRAY'
  ) then
    execute 'alter table public.body_signals alter column sensation type text[] using
               case when sensation is null then null else array[sensation] end';
  end if;
end $$;
alter table public.body_signals add constraint body_signals_sensation_check
  check (array_length(sensation,1) between 1 and 4);

-- L'intensita': il cursore va da 0 a 10 come l'RPE, non piu' da 1 a 5.
alter table public.body_signals add constraint body_signals_intensity_check
  check (intensity between 0 and 10);

-- "Solo da un lato?" e' la domanda che separa un dolore che protegge da uno
-- che ha solo lavorato: senza, le parole da sole non bastano a distinguerli.
alter table public.body_signals add column if not exists one_side boolean;

-- Le sue parole, quando le pastiglie non le bastano. Testo libero: resta
-- fuori dalla vista del coach come tutto il resto del testo libero.
alter table public.body_signals add column if not exists words text;
alter table public.body_signals drop constraint if exists body_signals_words_check;
alter table public.body_signals add constraint body_signals_words_check
  check (words is null or char_length(words) <= 200);

create or replace view public.coach_body_signals as
  select id, athlete_id, check_in_id, created_at,
         region,                         -- `region_free` NO: e' testo libero
         sensation, intensity, one_side, behaviour, is_red_flag
                                         -- `words` NO: sono le sue parole
  from public.body_signals
  where public.is_staff_of(athlete_id);
grant select on public.coach_body_signals to authenticated;

-- La vista del coach guadagna `protective_pain` in fondo. E' l'unico campo
-- nuovo che ci entra: sonno, umore e scuola c'erano gia', e le parole libere
-- restano fuori. Un dolore protettivo dichiarato e' esattamente cio' che §11
-- vuole che arrivi a un adulto — tenerlo solo nel telefono sarebbe il modo
-- piu' silenzioso di non farlo arrivare a nessuno.
create or replace view public.coach_check_ins as
  select id, athlete_id, kind, local_date, created_at,
         tempo_predicted, prediction_confidence, tempo_suggested, tempo_chosen,
         sleep, energy, mood, effort, satisfaction,
         hydration, muscles, legs, breath,  -- storiche, non piu' scritte
         headspace, surprise,            -- headspace_other NO: e' testo libero
         sleep_hours, school_load, painkillers, on_period,
         brought_home,                   -- `note` NO: sono le sue parole
         session_type, duration_bucket, pe_attended,
         started_at, completed_at,
         protective_pain
  from public.check_ins
  where public.is_staff_of(athlete_id);
grant select on public.coach_check_ins to authenticated;
