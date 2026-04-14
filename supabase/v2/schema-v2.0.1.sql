-- Schema Version: v2.0.1
-- Created At: 2026-04-14
-- Purpose:
--   - projects EN/JA 번역에 성과/기여 필드 추가

begin;

-- 프로젝트 번역에서도 locale별 성과/주요 기여를 저장할 수 있도록 컬럼을 확장한다.
alter table if exists public.projects_translations
  add column if not exists achievements text[] not null default '{}'::text[];

alter table if exists public.projects_translations
  add column if not exists contributions text[] not null default '{}'::text[];

insert into public.schema_migrations (version, description)
values ('v2.0.1', 'projects_translations locale별 성과/기여 컬럼 추가')
on conflict (version) do nothing;

commit;
