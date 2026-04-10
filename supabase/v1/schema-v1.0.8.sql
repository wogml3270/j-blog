-- Schema Version: v1.0.8
-- Created At: 2026-04-09
-- Purpose:
--   - 홈 Hero 슬라이드 운영용 home_highlights 테이블 추가
--   - About 페이지 미디어 운영을 위한 profile_content 컬럼 확장

begin;

create table if not exists public.schema_migrations (
  version text primary key,
  description text not null,
  applied_at timestamptz not null default timezone('utc', now())
);

-- About: 프로필 사진 URL 추가
alter table public.profile_content
  add column if not exists about_photo_url text;

update public.profile_content
set about_photo_url = '/profile/default-photo.svg'
where about_photo_url is null or btrim(about_photo_url) = '';

alter table public.profile_content
  alter column about_photo_url set default '/profile/default-photo.svg';

alter table public.profile_content
  alter column about_photo_url set not null;

-- About: 기술 로고/설명 메타 추가
alter table public.profile_content
  add column if not exists about_tech_items jsonb;

update public.profile_content
set about_tech_items = '[]'::jsonb
where about_tech_items is null;

alter table public.profile_content
  alter column about_tech_items set default '[]'::jsonb;

alter table public.profile_content
  alter column about_tech_items set not null;

-- Home Highlight 소스 타입 제약
do $$
begin
  if not exists (select 1 from pg_type where typname = 'home_highlight_source') then
    create type public.home_highlight_source as enum ('project', 'post');
  end if;
end
$$;

create table if not exists public.home_highlights (
  id uuid primary key default gen_random_uuid(),
  source_type public.home_highlight_source not null,
  source_id uuid not null,
  order_index integer not null default 0,
  is_active boolean not null default true,
  override_title text,
  override_description text,
  override_image_url text,
  override_cta_label text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (source_type, source_id)
);

create index if not exists idx_home_highlights_order on public.home_highlights (order_index asc);
create index if not exists idx_home_highlights_active_order on public.home_highlights (is_active, order_index asc);

drop trigger if exists home_highlights_set_updated_at on public.home_highlights;
create trigger home_highlights_set_updated_at
before update on public.home_highlights
for each row
execute function public.set_updated_at();

grant select on public.home_highlights to anon, authenticated;

alter table public.home_highlights enable row level security;

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

insert into public.schema_migrations (version, description)
values (
  'v1.0.8',
  'home_highlights 테이블 추가 + profile_content about_photo_url/about_tech_items 컬럼 확장'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
