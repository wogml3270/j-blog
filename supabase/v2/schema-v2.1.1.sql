-- Schema Version: v2.1.1
-- Created At: 2026-04-14
-- Purpose:
--   - about_tech_stack.category를 자유 문자열에서 고정 enum으로 전환
--   - 기존 카테고리 텍스트(한글/영문)를 enum 값으로 안전 매핑

begin;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'about_tech_category'
  ) then
    create type public.about_tech_category as enum (
      'frontend',
      'backend',
      'database',
      'infrastructure',
      'version_control',
      'other'
    );
  end if;
end $$;

alter table if exists public.about_tech_stack
  add column if not exists category_v2 public.about_tech_category;

update public.about_tech_stack
set category_v2 = case
  when category is null or btrim(category) = '' then 'other'::public.about_tech_category
  when lower(category) = 'frontend' or category like '%프론트%' or lower(category) like '%ui%'
    then 'frontend'::public.about_tech_category
  when lower(category) = 'backend' or category like '%백엔%' or lower(category) like '%server%' or lower(category) like '%api%'
    then 'backend'::public.about_tech_category
  when lower(category) = 'database' or category like '%데이터%' or lower(category) like '%db%' or lower(category) like '%sql%'
    then 'database'::public.about_tech_category
  when lower(category) = 'infrastructure' or category like '%인프라%' or category like '%운영%' or lower(category) like '%infra%' or lower(category) like '%devops%' or lower(category) like '%cloud%'
    then 'infrastructure'::public.about_tech_category
  when lower(category) = 'version_control' or category like '%버전%' or lower(category) like '%version%' or lower(category) like '%git%'
    then 'version_control'::public.about_tech_category
  else 'other'::public.about_tech_category
end
where category_v2 is null;

update public.about_tech_stack
set category_v2 = 'other'::public.about_tech_category
where category_v2 is null;

alter table if exists public.about_tech_stack
  alter column category_v2 set default 'other'::public.about_tech_category;

alter table if exists public.about_tech_stack
  alter column category_v2 set not null;

alter table if exists public.about_tech_stack
  drop column if exists category;

alter table if exists public.about_tech_stack
  rename column category_v2 to category;

drop index if exists idx_about_tech_stack_about_category_order;
create index if not exists idx_about_tech_stack_about_category_order
  on public.about_tech_stack (about_id, category, order_index);

insert into public.schema_migrations (version, description)
values ('v2.1.1', 'about_tech_stack.category enum 전환(고정 카테고리)')
on conflict (version) do nothing;

commit;

