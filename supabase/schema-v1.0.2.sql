-- Schema Version: v1.0.2
-- Created At: 2026-04-07
-- Purpose:
--   - KO About 소개 문구를 DB에서 관리하기 위한 컬럼 추가
--   - 마이그레이션 이력 기록

begin;

create table if not exists public.schema_migrations (
  version text primary key,
  description text not null,
  applied_at timestamptz not null default timezone('utc', now())
);

alter table public.profile_content
  add column if not exists about_intro_description_ko text;

update public.profile_content
set about_intro_description_ko = '사용자 중심 UI 구현과 유지보수 가능한 구조 설계를 중요하게 생각합니다.'
where about_intro_description_ko is null or btrim(about_intro_description_ko) = '';

alter table public.profile_content
  alter column about_intro_description_ko set default '';

alter table public.profile_content
  alter column about_intro_description_ko set not null;

insert into public.schema_migrations (version, description)
values (
  'v1.0.2',
  'profile_content.about_intro_description_ko 추가 및 KO 소개 문구 DB 관리 전환'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
