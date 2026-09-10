-- ─────────────────────────────────────────────────────────────────────────────
-- "È comparsa dopo": la quarta risposta a «cosa le ha fatto la sessione?»
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Le altre tre — si e' sciolta, e' rimasta uguale, e' peggiorata — raccontano
-- cos'e' successo a una sensazione che c'era gia'. Se e' nata durante
-- l'allenamento nessuna delle tre e' vera, e finora l'unico modo di dirlo era
-- lasciare la domanda in bianco: cioe' perdere il dato proprio nel caso in cui
-- e' piu' interessante.
--
-- Da lanciare PRIMA di mandare online la versione che la mostra: senza,
-- scegliendo quella risposta il salvataggio viene rifiutato dal vincolo e la
-- sensazione resta in coda.
--
-- Si puo' rilanciare quante volte si vuole: il vincolo viene tolto e rimesso.

alter table public.body_signals drop constraint if exists body_signals_session_effect_check;
alter table public.body_signals add constraint body_signals_session_effect_check
  check (
    session_effect is null
    or session_effect in ('warmed_out', 'unchanged', 'worse', 'appeared_after')
  );
