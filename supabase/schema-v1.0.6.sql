-- Schema Version: v1.0.6
-- Created At: 2026-04-08
-- Purpose:
--   - 관리자의 "에디터 사용" 체크 상태를 DB에 저장할 수 있도록 컬럼 추가
--   - posts / projects 모두 use_markdown_editor(boolean)로 통일

begin;

create table if not exists public.schema_migrations (
  version text primary key,
  description text not null,
  applied_at timestamptz not null default timezone('utc', now())
);

-- 게시글: 본문 편집기 사용 여부 저장 컬럼
alter table public.posts
  add column if not exists use_markdown_editor boolean not null default false;

-- 프로젝트: 요약 편집기 사용 여부 저장 컬럼
alter table public.projects
  add column if not exists use_markdown_editor boolean not null default false;

-- 기존 레코드의 null 가능성을 방지하기 위한 백필
update public.posts
set use_markdown_editor = false
where use_markdown_editor is null;

update public.projects
set use_markdown_editor = false
where use_markdown_editor is null;

insert into public.schema_migrations (version, description)
values (
  'v1.0.6',
  'posts/projects에 use_markdown_editor(boolean) 컬럼 추가 및 기존 데이터 백필'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
