-- Schema Version: v1.0.4
-- Created At: 2026-04-08
-- Purpose:
--   - blog reading_time 컬럼 제거

begin;

create table if not exists public.schema_migrations (
  version text primary key,
  description text not null,
  applied_at timestamptz not null default timezone('utc', now())
);

alter table public.posts
  drop column if exists reading_time;

insert into public.schema_migrations (version, description)
values (
  'v1.0.4',
  'posts.reading_time 제거'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
