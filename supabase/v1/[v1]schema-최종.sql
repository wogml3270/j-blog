-- Schema Version: v1.0.15-final
-- File: [v1]schema-최종.sql
-- Purpose:
--   - v1.0.0 ~ v1.0.15 누적 결과를 반영한 최종 구조 스키마
--   - 현재 애플리케이션 코드 기준 컬럼/제약/RLS/트리거를 일관되게 정리
-- Notes:
--   - 이 파일은 “최종 구조 기준” 초기화/재구성용 통합 스키마다.
--   - 샘플 더미 데이터(posts/projects/contact_messages)는 포함하지 않는다.

begin;

create extension if not exists pgcrypto;

-- =========================================================
-- [TYPE] Enum
-- =========================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'publish_status') then
    create type public.publish_status as enum ('draft', 'published');
  end if;

  if not exists (select 1 from pg_type where typname = 'home_highlight_source') then
    create type public.home_highlight_source as enum ('project', 'post');
  end if;
end
$$;

-- =========================================================
-- [META] Migration History
-- =========================================================
create table if not exists public.schema_migrations (
  version text primary key,
  description text not null,
  applied_at timestamptz not null default timezone('utc', now())
);

-- =========================================================
-- [AUTH] Admin Allowlist
-- =========================================================
create table if not exists public.admin_allowlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_super_admin boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

-- =========================================================
-- [BLOG] Posts / Tags
-- =========================================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  thumbnail text,
  body_markdown text not null,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  scheduled_publish_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  featured boolean not null default false,
  use_markdown_editor boolean not null default false,
  sync_slug_with_title boolean not null default false
);

create table if not exists public.post_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.post_tag_map (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.post_tags(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, tag_id)
);

-- =========================================================
-- [PROJECT] Projects
-- =========================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  home_summary text not null default '',
  summary text not null,
  thumbnail text not null,
  role text not null,
  period text not null,
  start_date date,
  end_date date,
  tech_stack jsonb not null default '[]'::jsonb,
  achievements jsonb not null default '[]'::jsonb,
  contributions jsonb not null default '[]'::jsonb,
  links jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  sync_slug_with_title boolean not null default false,
  use_markdown_editor boolean not null default false
);

-- =========================================================
-- [PROFILE] About Singleton
-- =========================================================
create table if not exists public.profile_content (
  id integer primary key,
  name text not null default '',
  title text not null default '',
  summary text not null default '',
  about_photo_url text not null default '/profile/default-photo.svg',
  about_tech_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profile_content_singleton check (id = 1)
);

insert into public.profile_content (
  id,
  name,
  title,
  summary,
  about_photo_url,
  about_tech_items
)
values (
  1,
  '',
  '',
  '',
  '/profile/default-photo.svg',
  '[]'::jsonb
)
on conflict (id) do nothing;

-- =========================================================
-- [COMMENTS] Blog Comments
-- =========================================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  author_email text not null,
  author_nickname text not null,
  author_avatar_url text,
  content text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamptz not null default timezone('utc', now())
);

-- =========================================================
-- [CONTACT] Contact Inbox
-- =========================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  admin_note text not null default '',
  status text not null check (status in ('new', 'replied')) default 'new',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- =========================================================
-- [HOME] Hero Highlights
-- =========================================================
create table if not exists public.home_highlights (
  id uuid primary key default gen_random_uuid(),
  source_type public.home_highlight_source not null,
  source_id uuid not null,
  order_index integer not null default 0,
  is_active boolean not null default true,
  override_cta_label text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (source_type, source_id)
);

-- =========================================================
-- [FUNCTION] Updated At Trigger
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists profile_content_set_updated_at on public.profile_content;
create trigger profile_content_set_updated_at
before update on public.profile_content
for each row
execute function public.set_updated_at();

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row
execute function public.set_updated_at();

drop trigger if exists home_highlights_set_updated_at on public.home_highlights;
create trigger home_highlights_set_updated_at
before update on public.home_highlights
for each row
execute function public.set_updated_at();

-- =========================================================
-- [FUNCTION] Auth Helpers
-- =========================================================
create or replace function public.is_verified_email()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'email_verified')::boolean, false)
$$;

create or replace function public.is_admin_email()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_verified_email()
    and exists (
      select 1
      from public.admin_allowlist a
      where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
$$;

-- =========================================================
-- [INDEX]
-- =========================================================
create index if not exists idx_posts_updated_at_desc on public.posts (updated_at desc);
create index if not exists idx_posts_status_scheduled_publish on public.posts (status, scheduled_publish_at);
create index if not exists idx_projects_updated_at_desc on public.projects (updated_at desc);
create index if not exists idx_contact_messages_created_at_desc on public.contact_messages (created_at desc);
create index if not exists idx_home_highlights_order on public.home_highlights (order_index asc);
create index if not exists idx_home_highlights_active_order on public.home_highlights (is_active, order_index asc);

-- =========================================================
-- [GRANT]
-- =========================================================
grant usage on schema public to anon, authenticated;
grant select on public.posts, public.post_tags, public.post_tag_map, public.projects, public.profile_content, public.home_highlights to anon, authenticated;
grant insert on public.comments, public.contact_messages to anon, authenticated;
grant execute on function public.is_admin_email() to anon, authenticated;
grant execute on function public.is_verified_email() to anon, authenticated;

-- =========================================================
-- [RLS Enable]
-- =========================================================
alter table public.admin_allowlist enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;
alter table public.post_tag_map enable row level security;
alter table public.projects enable row level security;
alter table public.profile_content enable row level security;
alter table public.comments enable row level security;
alter table public.contact_messages enable row level security;
alter table public.home_highlights enable row level security;

-- =========================================================
-- [POLICY] Admin Allowlist
-- =========================================================
drop policy if exists admin_allowlist_self_read on public.admin_allowlist;
create policy admin_allowlist_self_read
on public.admin_allowlist
for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists admin_allowlist_admin_manage on public.admin_allowlist;
create policy admin_allowlist_admin_manage
on public.admin_allowlist
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- =========================================================
-- [POLICY] Posts
-- =========================================================
drop policy if exists posts_public_read on public.posts;
create policy posts_public_read
on public.posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists posts_admin_manage on public.posts;
create policy posts_admin_manage
on public.posts
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- =========================================================
-- [POLICY] Post Tags
-- =========================================================
drop policy if exists post_tags_public_read on public.post_tags;
create policy post_tags_public_read
on public.post_tags
for select
to anon, authenticated
using (true);

drop policy if exists post_tags_admin_manage on public.post_tags;
create policy post_tags_admin_manage
on public.post_tags
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists post_tag_map_public_read on public.post_tag_map;
create policy post_tag_map_public_read
on public.post_tag_map
for select
to anon, authenticated
using (true);

drop policy if exists post_tag_map_admin_manage on public.post_tag_map;
create policy post_tag_map_admin_manage
on public.post_tag_map
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- =========================================================
-- [POLICY] Projects
-- =========================================================
drop policy if exists projects_public_read on public.projects;
create policy projects_public_read
on public.projects
for select
to anon, authenticated
using (status = 'published');

drop policy if exists projects_admin_manage on public.projects;
create policy projects_admin_manage
on public.projects
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- =========================================================
-- [POLICY] Profile
-- =========================================================
drop policy if exists profile_public_read on public.profile_content;
create policy profile_public_read
on public.profile_content
for select
to anon, authenticated
using (true);

drop policy if exists profile_admin_manage on public.profile_content;
create policy profile_admin_manage
on public.profile_content
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- =========================================================
-- [POLICY] Comments
-- =========================================================
drop policy if exists comments_public_read on public.comments;
create policy comments_public_read
on public.comments
for select
to anon, authenticated
using (status = 'approved');

drop policy if exists comments_user_insert on public.comments;
create policy comments_user_insert
on public.comments
for insert
to authenticated
with check (auth.uid() = author_user_id);

drop policy if exists comments_admin_update on public.comments;
create policy comments_admin_update
on public.comments
for update
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists comments_admin_delete on public.comments;
create policy comments_admin_delete
on public.comments
for delete
to authenticated
using (public.is_admin_email());

-- =========================================================
-- [POLICY] Contact
-- =========================================================
drop policy if exists contact_public_insert on public.contact_messages;
create policy contact_public_insert
on public.contact_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists contact_admin_read on public.contact_messages;
create policy contact_admin_read
on public.contact_messages
for select
to authenticated
using (public.is_admin_email());

drop policy if exists contact_admin_update on public.contact_messages;
create policy contact_admin_update
on public.contact_messages
for update
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- =========================================================
-- [POLICY] Home Highlights
-- =========================================================
drop policy if exists home_highlights_public_read on public.home_highlights;
create policy home_highlights_public_read
on public.home_highlights
for select
to anon, authenticated
using (is_active = true);

drop policy if exists home_highlights_admin_manage on public.home_highlights;
create policy home_highlights_admin_manage
on public.home_highlights
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- =========================================================
-- [SEED] 운영 기본값
-- =========================================================
insert into public.admin_allowlist (email, is_super_admin)
values ('wogml3270@gmail.com', true)
on conflict (email) do update
set is_super_admin = excluded.is_super_admin;

insert into public.admin_allowlist (email, is_super_admin)
values ('wogml3270@naver.com', true)
on conflict (email) do update
set is_super_admin = excluded.is_super_admin;

insert into storage.buckets (id, name, public)
values ('project-thumbnails', 'project-thumbnails', true)
on conflict (id) do update
set public = excluded.public;

insert into public.schema_migrations (version, description)
values
  ('v1.0.0', '초기 베이스라인 스키마'),
  ('v1.0.1', '이력 테이블 도입 + profile/projects/posts/comments 보정 + allowlist/버킷 보정'),
  ('v1.0.2', 'profile_content.about_intro_description_ko 추가 및 KO 소개 문구 DB 관리 전환'),
  ('v1.0.3', 'contact_messages.admin_note 추가 및 문의함 관리자 메모 기능 지원'),
  ('v1.0.4', 'posts.reading_time 제거'),
  ('v1.0.5', '관리자 페이지네이션 인덱스 추가'),
  ('v1.0.6', 'posts/projects에 use_markdown_editor(boolean) 컬럼 추가 및 기존 데이터 백필'),
  ('v1.0.7', 'posts.featured(boolean) 컬럼 추가 및 기존 데이터 백필'),
  ('v1.0.8', 'home_highlights 테이블 추가 + profile_content about_photo_url/about_tech_items 컬럼 확장'),
  ('v1.0.9', '관리자 이미지 업로드 공통화 및 페이지별 스토리지 폴더 규칙 적용'),
  ('v1.0.10', '프로젝트 홈요약 컬럼 추가 및 블로그/프로젝트 슬러그-제목 동기화 여부 저장'),
  ('v1.0.11', '홈 하이라이트에서 제목/설명/이미지 오버라이드 제거 및 CTA 오버라이드만 유지'),
  ('v1.0.12', '블로그 예약 발행(scheduled_publish_at) 컬럼 추가 및 관리자 예약 발행 UI 반영'),
  ('v1.0.13', 'About 단순화 리뉴얼: profile_content의 미사용 컬럼 5종 제거'),
  ('v1.0.14', 'About status 제거 + profile_content 공개정책 단순화 + 더미 데이터 정리'),
  ('v1.0.15', '기존 더미 데이터 정리 + 현실적인 샘플 데이터(posts/projects/contact) 재구성'),
  ('v1.0.15-final', 'v1 최종 통합 구조 스키마')
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
