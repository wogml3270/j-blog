-- Schema Version: v2.2.3
-- Created At: 2026-04-28
-- Purpose:
--   - 관리자 역할별 수정 권한 정책을 위한 콘텐츠 작성자 컬럼 보강
--   - posts/projects created_by 보강 및 인덱스 추가

begin;

alter table if exists public.posts
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table if exists public.projects
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create index if not exists idx_posts_created_by
  on public.posts (created_by);

create index if not exists idx_projects_created_by
  on public.projects (created_by);

insert into public.schema_migrations (version, description)
values ('v2.2.3', '관리자 역할별 글 수정권한을 위한 posts/projects created_by 보강')
on conflict (version) do nothing;

commit;
