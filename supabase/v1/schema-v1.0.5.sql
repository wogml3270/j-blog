-- Schema Version: v1.0.5
-- Created At: 2026-04-08
-- Purpose:
--   - 관리자 목록 페이지네이션 성능을 위한 정렬 인덱스 추가

begin;

create table if not exists public.schema_migrations (
  version text primary key,
  description text not null,
  applied_at timestamptz not null default timezone('utc', now())
);

-- 페이지네이션 정렬 기준 인덱스
create index if not exists idx_posts_updated_at_desc on public.posts (updated_at desc);
create index if not exists idx_projects_updated_at_desc on public.projects (updated_at desc);
create index if not exists idx_contact_messages_created_at_desc on public.contact_messages (created_at desc);

insert into public.schema_migrations (version, description)
values (
  'v1.0.5',
  '관리자 페이지네이션 인덱스 추가'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
