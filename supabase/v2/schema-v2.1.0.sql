-- Schema Version: v2.1.0
-- Created At: 2026-04-14
-- Purpose:
--   - about_translations 제거 + about locale row 통합(KO=1, EN=2, JA=3)
--   - posts/projects 번역 테이블을 posts_en/posts_ja, projects_en/projects_ja로 분리
--   - about_tech_stack 테이블 신설 및 카테고리 탭 기반 기술스택 관리

begin;

-- 일부 기존 정책/스크립트 호환을 위해 is_admin_user()를 is_admin_email() 별칭으로 제공한다.
create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select public.is_admin_email();
$$;

-- =========================================================
-- [ABOUT] locale row 모델 전환
-- =========================================================
alter table if exists public.about add column if not exists locale text;
update public.about set locale = 'ko' where locale is null;
alter table if exists public.about alter column locale set not null;

-- 기존 singleton 제약 제거(id=1 고정 해제)
alter table if exists public.about drop constraint if exists about_singleton;
alter table if exists public.about drop constraint if exists profile_content_singleton;

-- locale 고유 제약 추가
alter table if exists public.about drop constraint if exists about_locale_unique;
alter table if exists public.about add constraint about_locale_unique unique (locale);

-- EN/JA row 기본 생성(기존 KO 기준)
insert into public.about (id, locale, name, title, summary, about_photo_url)
select 2, 'en', coalesce(name, ''), coalesce(title, ''), coalesce(summary, ''), coalesce(about_photo_url, '/profile/default-photo.svg')
from public.about
where id = 1
on conflict (id) do nothing;

insert into public.about (id, locale, name, title, summary, about_photo_url)
select 3, 'ja', coalesce(name, ''), coalesce(title, ''), coalesce(summary, ''), coalesce(about_photo_url, '/profile/default-photo.svg')
from public.about
where id = 1
on conflict (id) do nothing;

-- locale/id 보정
update public.about set locale = 'ko' where id = 1;
update public.about set locale = 'en' where id = 2;
update public.about set locale = 'ja' where id = 3;

-- =========================================================
-- [ABOUT] 기술스택 분리 테이블
-- =========================================================
create table if not exists public.about_tech_stack (
  id uuid primary key default gen_random_uuid(),
  about_id integer not null references public.about(id) on delete cascade,
  category text not null default '기타',
  name text not null,
  description text not null,
  logo_url text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_about_tech_stack_about_category_order
  on public.about_tech_stack (about_id, category, order_index);

-- KO about_tech_items -> about_tech_stack 이관
insert into public.about_tech_stack (about_id, category, name, description, logo_url, order_index)
select
  1 as about_id,
  coalesce(nullif(trim(item->>'category'), ''), '기타') as category,
  coalesce(trim(item->>'name'), '') as name,
  coalesce(trim(item->>'description'), '') as description,
  coalesce(trim(item->>'logoUrl'), '') as logo_url,
  ord - 1 as order_index
from public.about a,
     lateral jsonb_array_elements(coalesce(a.about_tech_items, '[]'::jsonb)) with ordinality as tech(item, ord)
where a.id = 1
  and coalesce(trim(item->>'name'), '') <> ''
  and coalesce(trim(item->>'description'), '') <> ''
  and coalesce(trim(item->>'logoUrl'), '') <> ''
on conflict do nothing;

-- about_translations(EN/JA)의 기본 텍스트를 about row로 이관
update public.about a
set
  name = t.name,
  title = t.title,
  summary = t.summary
from public.about_translations t
where a.locale = t.locale
  and t.locale in ('en', 'ja');

-- about_translations(EN/JA) 기술스택 이관
insert into public.about_tech_stack (about_id, category, name, description, logo_url, order_index)
select
  case t.locale when 'en' then 2 when 'ja' then 3 end as about_id,
  coalesce(nullif(trim(item->>'category'), ''), '기타') as category,
  coalesce(trim(item->>'name'), '') as name,
  coalesce(trim(item->>'description'), '') as description,
  coalesce(trim(item->>'logoUrl'), '') as logo_url,
  ord - 1 as order_index
from public.about_translations t,
     lateral jsonb_array_elements(coalesce(t.about_tech_items, '[]'::jsonb)) with ordinality as tech(item, ord)
where t.locale in ('en', 'ja')
  and coalesce(trim(item->>'name'), '') <> ''
  and coalesce(trim(item->>'description'), '') <> ''
  and coalesce(trim(item->>'logoUrl'), '') <> ''
on conflict do nothing;

-- about의 기존 json 컬럼 제거
alter table if exists public.about drop column if exists about_tech_items;

-- =========================================================
-- [POST] 번역 테이블 분리
-- =========================================================
create table if not exists public.posts_en (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references public.posts(id) on delete cascade,
  title text not null default '',
  description text not null default '',
  body_markdown text not null default '',
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.posts_ja (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references public.posts(id) on delete cascade,
  title text not null default '',
  description text not null default '',
  body_markdown text not null default '',
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.posts_en (post_id, title, description, body_markdown, tags)
select post_id, title, description, body_markdown, tags
from public.posts_translations
where locale = 'en'
on conflict (post_id) do update
set
  title = excluded.title,
  description = excluded.description,
  body_markdown = excluded.body_markdown,
  tags = excluded.tags,
  updated_at = timezone('utc', now());

insert into public.posts_ja (post_id, title, description, body_markdown, tags)
select post_id, title, description, body_markdown, tags
from public.posts_translations
where locale = 'ja'
on conflict (post_id) do update
set
  title = excluded.title,
  description = excluded.description,
  body_markdown = excluded.body_markdown,
  tags = excluded.tags,
  updated_at = timezone('utc', now());

-- =========================================================
-- [PROJECT] 번역 테이블 분리
-- =========================================================
create table if not exists public.projects_en (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  title text not null default '',
  subtitle text not null default '',
  content_markdown text not null default '',
  tags text[] not null default '{}'::text[],
  achievements text[] not null default '{}'::text[],
  contributions text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects_ja (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  title text not null default '',
  subtitle text not null default '',
  content_markdown text not null default '',
  tags text[] not null default '{}'::text[],
  achievements text[] not null default '{}'::text[],
  contributions text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

do $$
declare
  has_achievements boolean := false;
  has_contributions boolean := false;
  achievements_expr text := '''{}''::text[]';
  contributions_expr text := '''{}''::text[]';
begin
  if to_regclass('public.projects_translations') is null then
    raise notice 'projects_translations 테이블이 없어 projects_en/projects_ja 데이터 이관을 건너뜁니다.';
    return;
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects_translations'
      and column_name = 'achievements'
  ) into has_achievements;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects_translations'
      and column_name = 'contributions'
  ) into has_contributions;

  if has_achievements then
    achievements_expr := 'coalesce(achievements, ''{}''::text[])';
  end if;

  if has_contributions then
    contributions_expr := 'coalesce(contributions, ''{}''::text[])';
  end if;

  execute format($sql$
    insert into public.projects_en (project_id, title, subtitle, content_markdown, tags, achievements, contributions)
    select project_id, title, subtitle, content_markdown, tags, %s, %s
    from public.projects_translations
    where locale = 'en'
    on conflict (project_id) do update
    set
      title = excluded.title,
      subtitle = excluded.subtitle,
      content_markdown = excluded.content_markdown,
      tags = excluded.tags,
      achievements = excluded.achievements,
      contributions = excluded.contributions,
      updated_at = timezone('utc', now());
  $sql$, achievements_expr, contributions_expr);

  execute format($sql$
    insert into public.projects_ja (project_id, title, subtitle, content_markdown, tags, achievements, contributions)
    select project_id, title, subtitle, content_markdown, tags, %s, %s
    from public.projects_translations
    where locale = 'ja'
    on conflict (project_id) do update
    set
      title = excluded.title,
      subtitle = excluded.subtitle,
      content_markdown = excluded.content_markdown,
      tags = excluded.tags,
      achievements = excluded.achievements,
      contributions = excluded.contributions,
      updated_at = timezone('utc', now());
  $sql$, achievements_expr, contributions_expr);
end $$;

-- =========================================================
-- [TRIGGER] updated_at
-- =========================================================
drop trigger if exists about_tech_stack_set_updated_at on public.about_tech_stack;
create trigger about_tech_stack_set_updated_at
before update on public.about_tech_stack
for each row execute function public.set_updated_at();

drop trigger if exists posts_en_set_updated_at on public.posts_en;
create trigger posts_en_set_updated_at
before update on public.posts_en
for each row execute function public.set_updated_at();

drop trigger if exists posts_ja_set_updated_at on public.posts_ja;
create trigger posts_ja_set_updated_at
before update on public.posts_ja
for each row execute function public.set_updated_at();

drop trigger if exists projects_en_set_updated_at on public.projects_en;
create trigger projects_en_set_updated_at
before update on public.projects_en
for each row execute function public.set_updated_at();

drop trigger if exists projects_ja_set_updated_at on public.projects_ja;
create trigger projects_ja_set_updated_at
before update on public.projects_ja
for each row execute function public.set_updated_at();

-- =========================================================
-- [RLS] 신규 테이블 정책
-- =========================================================
alter table public.about_tech_stack enable row level security;
alter table public.posts_en enable row level security;
alter table public.posts_ja enable row level security;
alter table public.projects_en enable row level security;
alter table public.projects_ja enable row level security;

-- about_tech_stack
drop policy if exists about_tech_stack_public_read on public.about_tech_stack;
drop policy if exists about_tech_stack_admin_manage on public.about_tech_stack;
create policy about_tech_stack_public_read
on public.about_tech_stack
for select
to anon, authenticated
using (true);
create policy about_tech_stack_admin_manage
on public.about_tech_stack
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- posts_en / posts_ja
drop policy if exists posts_en_public_read on public.posts_en;
drop policy if exists posts_en_admin_manage on public.posts_en;
create policy posts_en_public_read
on public.posts_en
for select
to anon, authenticated
using (true);
create policy posts_en_admin_manage
on public.posts_en
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists posts_ja_public_read on public.posts_ja;
drop policy if exists posts_ja_admin_manage on public.posts_ja;
create policy posts_ja_public_read
on public.posts_ja
for select
to anon, authenticated
using (true);
create policy posts_ja_admin_manage
on public.posts_ja
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- projects_en / projects_ja
drop policy if exists projects_en_public_read on public.projects_en;
drop policy if exists projects_en_admin_manage on public.projects_en;
create policy projects_en_public_read
on public.projects_en
for select
to anon, authenticated
using (true);
create policy projects_en_admin_manage
on public.projects_en
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists projects_ja_public_read on public.projects_ja;
drop policy if exists projects_ja_admin_manage on public.projects_ja;
create policy projects_ja_public_read
on public.projects_ja
for select
to anon, authenticated
using (true);
create policy projects_ja_admin_manage
on public.projects_ja
for all
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- =========================================================
-- [GRANT] 신규 테이블 권한
-- =========================================================
grant select on public.about_tech_stack, public.posts_en, public.posts_ja, public.projects_en, public.projects_ja
  to anon, authenticated;

grant all privileges on public.about_tech_stack, public.posts_en, public.posts_ja, public.projects_en, public.projects_ja
  to service_role;

-- =========================================================
-- [CLEANUP] 구 번역 테이블 제거
-- =========================================================
drop table if exists public.about_translations;
drop table if exists public.posts_translations;
drop table if exists public.projects_translations;

insert into public.schema_migrations (version, description)
values ('v2.1.0', 'about locale row 통합 + posts/projects 번역 분리 테이블 + about_tech_stack 신설')
on conflict (version) do nothing;

commit;
