-- Schema Version: v1.0.1
-- Created At: 2026-04-07
-- Purpose:
--   1) 마이그레이션 이력 테이블(schema_migrations) 도입
--   2) 현재 운영에 필요한 스키마 보정(컬럼/버킷/관리자 allowlist) 반영
-- Notes:
--   - v1.0.0 적용 이후 실행하는 증분 마이그레이션 파일입니다.
--   - 재실행해도 안전하도록 IF NOT EXISTS / ON CONFLICT 패턴을 사용했습니다.

begin;

-- =========================================================
-- [CREATE] 마이그레이션 이력 테이블
-- =========================================================
create table if not exists public.schema_migrations (
  version text primary key,
  description text not null,
  applied_at timestamptz not null default timezone('utc', now())
);

comment on table public.schema_migrations is '수동 SQL 마이그레이션 적용 이력';
comment on column public.schema_migrations.version is '예: v1.0.1';
comment on column public.schema_migrations.description is '버전 변경 요약';
comment on column public.schema_migrations.applied_at is '적용 시각(UTC)';

insert into public.schema_migrations (version, description)
values ('v1.0.0', '초기 베이스라인 스키마')
on conflict (version) do nothing;

-- =========================================================
-- [ALTER] profile_content 보정
-- =========================================================
alter table public.profile_content
  add column if not exists tech_stack jsonb;

update public.profile_content
set tech_stack = '[]'::jsonb
where tech_stack is null;

alter table public.profile_content
  alter column tech_stack set default '[]'::jsonb;

alter table public.profile_content
  alter column tech_stack set not null;

-- =========================================================
-- [ALTER] projects 보정
-- =========================================================
alter table public.projects
  add column if not exists start_date date;

alter table public.projects
  add column if not exists end_date date;

-- =========================================================
-- [ALTER] posts 보정
-- =========================================================
alter table public.posts
  add column if not exists thumbnail text;

-- =========================================================
-- [ALTER] comments 보정
-- =========================================================
alter table public.comments
  add column if not exists author_email text;

alter table public.comments
  add column if not exists author_nickname text;

alter table public.comments
  add column if not exists author_avatar_url text;

update public.comments
set
  author_email = coalesce(nullif(author_email, ''), 'unknown@example.com'),
  author_nickname = coalesce(nullif(author_nickname, ''), '익명 사용자')
where author_email is null
   or author_email = ''
   or author_nickname is null
   or author_nickname = '';

alter table public.comments
  alter column author_email set not null;

alter table public.comments
  alter column author_nickname set not null;

-- =========================================================
-- [DATA] 관리자 allowlist 보정
-- =========================================================
insert into public.admin_allowlist (email, is_super_admin)
values ('wogml3270@gmail.com', true)
on conflict (email) do update
set is_super_admin = excluded.is_super_admin;

insert into public.admin_allowlist (email, is_super_admin)
values ('wogml3270@naver.com', true)
on conflict (email) do update
set is_super_admin = excluded.is_super_admin;

-- =========================================================
-- [DATA] 스토리지 버킷 보정
-- =========================================================
insert into storage.buckets (id, name, public)
values ('project-thumbnails', 'project-thumbnails', true)
on conflict (id) do nothing;

-- =========================================================
-- [META] v1.0.1 적용 기록
-- =========================================================
insert into public.schema_migrations (version, description)
values (
  'v1.0.1',
  '이력 테이블 도입 + profile/projects/posts/comments 보정 + allowlist/버킷 보정'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;

-- Rollback 참고(수동):
-- 1) schema_migrations 기록 삭제:
--    delete from public.schema_migrations where version in ('v1.0.1');
-- 2) 컬럼 삭제는 서비스 영향이 크므로 즉시 rollback보다 단계적 축소 권장
--    (예: 앱 코드 정리 -> 데이터 백업 -> drop column).
