-- Run this in Supabase → SQL Editor (once).
-- Server-side bot should use SUPABASE_SERVICE_ROLE_KEY in Render — it bypasses RLS.

create table if not exists public.telegram_users (
    telegram_user_id bigint primary key,
    username text,
    first_name text,
    last_name text,
    is_bot boolean not null default false,
    source text default 'bot',
    required_group_id bigint,
    updated_at timestamptz not null default now()
);

create index if not exists idx_telegram_users_group on public.telegram_users (required_group_id);
create index if not exists idx_telegram_users_updated on public.telegram_users (updated_at);

alter table public.telegram_users enable row level security;

-- With RLS on and NO policies, only the service_role JWT can read/write (recommended for this bot).
-- If you must use only the anon/publishable key, add narrow policies (test in staging first).
