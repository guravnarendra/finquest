-- FinQuest — Supabase schema
-- Run in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Tables are intentionally simple: one row per finished test attempt.
-- The app works without Supabase (localStorage fallback); with these
-- tables it also saves to the cloud and powers the Leaderboard page.

create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  player_name text not null default 'Player',
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  score int not null default 0 check (score >= 0 and score <= 100),
  mcq_score int not null default 0,
  scenario_score int not null default 0,
  correct_count int not null default 0,
  total_questions int not null default 10,
  grade text,
  risk_profile text,
  verdict text,
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Leaderboard / history reads
create index if not exists test_attempts_score_idx
  on public.test_attempts (score desc, created_at desc);
create index if not exists test_attempts_created_idx
  on public.test_attempts (created_at desc);

-- Public read + insert so the anon key in the browser can play.
-- No update/delete from the browser. Tighten this later if you add auth.
alter table public.test_attempts enable row level security;

drop policy if exists "Anyone can read attempts" on public.test_attempts;
create policy "Anyone can read attempts"
  on public.test_attempts for select using (true);

drop policy if exists "Anyone can insert attempts" on public.test_attempts;
create policy "Anyone can insert attempts"
  on public.test_attempts for insert with check (true);
