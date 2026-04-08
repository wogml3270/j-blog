-- Schema Version: v1.0.7
-- Created At: 2026-04-08
-- Purpose:
--   - 블로그 글의 메인 페이지 노출 여부를 제어하기 위한 featured 컬럼 추가

begin;

create table if not exists public.schema_migrations (
  version text primary key,
  description text not null,
  applied_at timestamptz not null default timezone('utc', now())
);

-- posts: 메인 페이지 노출 여부
alter table public.posts
  add column if not exists featured boolean not null default false;

-- 기존 레코드 null 백필
update public.posts
set featured = false
where featured is null;

insert into public.schema_migrations (version, description)
values (
  'v1.0.7',
  'posts.featured(boolean) 컬럼 추가 및 기존 데이터 백필'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
