-- Schema Version: v2.0.0
-- Created At: 2026-04-14
-- Purpose:
--   - 공개 페이지명 기준 테이블 명칭 정리 (ALTER/RENAME)
--   - 다국어 콘텐츠 번역 테이블(posts/projects/about) 추가

begin;

create table if not exists public.schema_migrations (
  version text primary key,
  description text not null,
  applied_at timestamptz not null default timezone('utc', now())
);

-- =========================================================
-- [RENAME] 공개 페이지 기준 테이블 명칭 정리
-- =========================================================

do $$
begin
  if to_regclass('public.contact_messages') is not null and to_regclass('public.contacts') is null then
    execute 'alter table public.contact_messages rename to contacts';
  end if;

  if to_regclass('public.home_highlights') is not null and to_regclass('public.home_slide') is null then
    execute 'alter table public.home_highlights rename to home_slide';
  end if;

  if to_regclass('public.profile_content') is not null and to_regclass('public.about') is null then
    execute 'alter table public.profile_content rename to about';
  end if;
end $$;

-- 인덱스 명칭 정리
alter index if exists public.idx_contact_messages_created_at_desc rename to idx_contacts_created_at_desc;
alter index if exists public.idx_home_highlights_order rename to idx_home_slide_order;
alter index if exists public.idx_home_highlights_active_order rename to idx_home_slide_active_order;

-- 제약조건/트리거 이름은 존재할 때만 안전하게 변경한다.
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'contact_messages_status_check'
      and conrelid = 'public.contacts'::regclass
  ) then
    execute 'alter table public.contacts rename constraint contact_messages_status_check to contacts_status_check';
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'profile_content_singleton'
      and conrelid = 'public.about'::regclass
  ) then
    execute 'alter table public.about rename constraint profile_content_singleton to about_singleton';
  end if;

  if exists (
    select 1
    from pg_trigger
    where tgname = 'contact_messages_set_updated_at'
      and tgrelid = 'public.contacts'::regclass
  ) then
    execute 'alter trigger contact_messages_set_updated_at on public.contacts rename to contacts_set_updated_at';
  end if;

  if exists (
    select 1
    from pg_trigger
    where tgname = 'home_highlights_set_updated_at'
      and tgrelid = 'public.home_slide'::regclass
  ) then
    execute 'alter trigger home_highlights_set_updated_at on public.home_slide rename to home_slide_set_updated_at';
  end if;

  if exists (
    select 1
    from pg_trigger
    where tgname = 'profile_content_set_updated_at'
      and tgrelid = 'public.about'::regclass
  ) then
    execute 'alter trigger profile_content_set_updated_at on public.about rename to about_set_updated_at';
  end if;
end $$;

-- =========================================================
-- [TABLE] 번역 테이블 추가
-- =========================================================
create table if not exists public.posts_translations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  locale text not null,
  title text not null default '',
  description text not null default '',
  body_markdown text not null default '',
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint posts_translations_locale_check check (locale in ('ko', 'en', 'ja')),
  constraint posts_translations_unique unique (post_id, locale)
);

create table if not exists public.projects_translations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  locale text not null,
  title text not null default '',
  subtitle text not null default '',
  content_markdown text not null default '',
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint projects_translations_locale_check check (locale in ('ko', 'en', 'ja')),
  constraint projects_translations_unique unique (project_id, locale)
);

create table if not exists public.about_translations (
  id uuid primary key default gen_random_uuid(),
  about_id integer not null references public.about(id) on delete cascade,
  locale text not null,
  name text not null default '',
  title text not null default '',
  summary text not null default '',
  about_tech_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint about_translations_locale_check check (locale in ('ko', 'en', 'ja')),
  constraint about_translations_unique unique (about_id, locale)
);

create index if not exists idx_posts_translations_post_locale on public.posts_translations (post_id, locale);
create index if not exists idx_projects_translations_project_locale on public.projects_translations (project_id, locale);
create index if not exists idx_about_translations_about_locale on public.about_translations (about_id, locale);

-- updated_at 트리거 추가

drop trigger if exists posts_translations_set_updated_at on public.posts_translations;
create trigger posts_translations_set_updated_at
before update on public.posts_translations
for each row execute function public.set_updated_at();

drop trigger if exists projects_translations_set_updated_at on public.projects_translations;
create trigger projects_translations_set_updated_at
before update on public.projects_translations
for each row execute function public.set_updated_at();

drop trigger if exists about_translations_set_updated_at on public.about_translations;
create trigger about_translations_set_updated_at
before update on public.about_translations
for each row execute function public.set_updated_at();

-- =========================================================
-- [RLS] renamed 테이블 + 번역 테이블 정책 정리
-- =========================================================
alter table public.contacts enable row level security;
alter table public.home_slide enable row level security;
alter table public.about enable row level security;
alter table public.posts_translations enable row level security;
alter table public.projects_translations enable row level security;
alter table public.about_translations enable row level security;

-- contacts

drop policy if exists contact_public_insert on public.contacts;
drop policy if exists contact_admin_read on public.contacts;
drop policy if exists contact_admin_update on public.contacts;
drop policy if exists contacts_public_insert on public.contacts;
drop policy if exists contacts_admin_read on public.contacts;
drop policy if exists contacts_admin_update on public.contacts;

create policy contacts_public_insert
on public.contacts
for insert
to anon, authenticated
with check (true);

create policy contacts_admin_read
on public.contacts
for select
to authenticated
using (public.is_admin_email());

create policy contacts_admin_update
on public.contacts
for update
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- home_slide

drop policy if exists home_highlights_public_read on public.home_slide;
drop policy if exists home_highlights_admin_manage on public.home_slide;
drop policy if exists home_slide_public_read on public.home_slide;
drop policy if exists home_slide_admin_manage on public.home_slide;

create policy home_slide_public_read
on public.home_slide
for select
to anon, authenticated
using (true);

create policy home_slide_admin_manage
on public.home_slide
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- about

drop policy if exists profile_public_read on public.about;
drop policy if exists profile_admin_manage on public.about;
drop policy if exists about_public_read on public.about;
drop policy if exists about_admin_manage on public.about;

create policy about_public_read
on public.about
for select
to anon, authenticated
using (true);

create policy about_admin_manage
on public.about
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- translations: 공개 조회 + 관리자 관리

drop policy if exists posts_translations_public_read on public.posts_translations;
drop policy if exists posts_translations_admin_manage on public.posts_translations;

create policy posts_translations_public_read
on public.posts_translations
for select
to anon, authenticated
using (true);

create policy posts_translations_admin_manage
on public.posts_translations
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());


drop policy if exists projects_translations_public_read on public.projects_translations;
drop policy if exists projects_translations_admin_manage on public.projects_translations;

create policy projects_translations_public_read
on public.projects_translations
for select
to anon, authenticated
using (true);

create policy projects_translations_admin_manage
on public.projects_translations
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());


drop policy if exists about_translations_public_read on public.about_translations;
drop policy if exists about_translations_admin_manage on public.about_translations;

create policy about_translations_public_read
on public.about_translations
for select
to anon, authenticated
using (true);

create policy about_translations_admin_manage
on public.about_translations
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- 권한 재부여

grant select on public.posts, public.post_tags, public.post_tag_map, public.projects, public.about, public.home_slide,
  public.posts_translations, public.projects_translations, public.about_translations
to anon, authenticated;

grant insert on public.comments, public.contacts to anon, authenticated;

grant all privileges on public.posts_translations, public.projects_translations, public.about_translations
to authenticated;

insert into public.schema_migrations (version, description)
values (
  'v2.0.0',
  '테이블 리네임(contacts/home_slide/about) + 번역 테이블(posts/projects/about)_translations 추가'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
