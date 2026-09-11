-- Run on the NEW Neon database only. Rerunnable. Never touches Supabase.
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mode text NOT NULL CHECK (mode IN ('achille', 'eracle')),
  theme text NOT NULL CHECK (theme IN ('classica', 'intrattenimento', 'trash', 'mista')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100 AND length(btrim(name)) > 0),
  streak integer NOT NULL CHECK (streak >= 0),
  score integer NOT NULL CHECK (score >= 0),
  timestamp timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT leaderboard_player UNIQUE (mode, theme, name)
);
CREATE INDEX IF NOT EXISTS leaderboard_ranking
  ON public.leaderboard (theme, mode, streak DESC, score DESC, timestamp ASC, id ASC);
