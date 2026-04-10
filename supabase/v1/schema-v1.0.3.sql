-- Schema Version: v1.0.3
-- Created At: 2026-04-07
-- Purpose:
--   - 문의함 관리자 메모 컬럼 추가
--   - 관리자 문의 처리 시 상태 + 메모 동시 저장 지원

begin;

create table if not exists public.schema_migrations (
  version text primary key,
  description text not null,
  applied_at timestamptz not null default timezone('utc', now())
);

alter table public.contact_messages
  add column if not exists admin_note text;

update public.contact_messages
set admin_note = ''
where admin_note is null;

alter table public.contact_messages
  alter column admin_note set default '';

alter table public.contact_messages
  alter column admin_note set not null;

insert into public.schema_migrations (version, description)
values (
  'v1.0.3',
  'contact_messages.admin_note 추가 및 문의함 관리자 메모 기능 지원'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
