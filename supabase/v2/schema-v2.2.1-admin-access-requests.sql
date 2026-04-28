-- Schema Version: v2.2.1
-- Created At: 2026-04-28
-- Purpose:
--   - admin_allowlist 권한 모델(role/is_active/expires_at) 확장
--   - admin_access_requests 테이블 신설
--   - is_admin_email / is_super_admin_email 권한 함수 보강

begin;

-- ---------------------------------------------------------
-- admin_allowlist: role/is_active/expires_at/updated_at 확장
-- ---------------------------------------------------------
alter table if exists public.admin_allowlist
  add column if not exists role text,
  add column if not exists is_active boolean,
  add column if not exists expires_at timestamptz,
  add column if not exists updated_at timestamptz;

update public.admin_allowlist
set role = case when is_super_admin then 'super_admin' else 'admin' end
where role is null or role not in ('super_admin', 'admin', 'test_admin');

update public.admin_allowlist
set is_active = true
where is_active is null;

update public.admin_allowlist
set updated_at = coalesce(updated_at, created_at, timezone('utc', now()))
where updated_at is null;

alter table if exists public.admin_allowlist
  alter column role set default 'admin',
  alter column role set not null,
  alter column is_active set default true,
  alter column is_active set not null,
  alter column updated_at set default timezone('utc', now()),
  alter column updated_at set not null;

alter table if exists public.admin_allowlist
  drop constraint if exists admin_allowlist_role_check;

alter table if exists public.admin_allowlist
  add constraint admin_allowlist_role_check
  check (role in ('super_admin', 'admin', 'test_admin'));

create index if not exists idx_admin_allowlist_role_active
  on public.admin_allowlist (role, is_active);

drop trigger if exists admin_allowlist_set_updated_at on public.admin_allowlist;
create trigger admin_allowlist_set_updated_at
before update on public.admin_allowlist
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 권한 판정 함수 보강
-- ---------------------------------------------------------
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
        and coalesce(a.is_active, true)
        and (a.expires_at is null or a.expires_at > timezone('utc', now()))
    )
$$;

create or replace function public.is_super_admin_email()
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
        and coalesce(a.is_active, true)
        and (a.expires_at is null or a.expires_at > timezone('utc', now()))
        and coalesce(a.role, case when a.is_super_admin then 'super_admin' else 'admin' end) = 'super_admin'
    )
$$;

-- 기존 정책/스크립트 호환용 별칭 유지
create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin_email();
$$;

grant execute on function public.is_admin_email() to anon, authenticated;
grant execute on function public.is_super_admin_email() to anon, authenticated;
grant execute on function public.is_admin_user() to anon, authenticated;

-- admin_allowlist 관리 정책은 super_admin만 허용
drop policy if exists admin_allowlist_admin_manage on public.admin_allowlist;
create policy admin_allowlist_admin_manage
on public.admin_allowlist
for all
to authenticated
using (public.is_super_admin_email())
with check (public.is_super_admin_email());

-- ---------------------------------------------------------
-- admin_access_requests: 권한 요청 저장소
-- ---------------------------------------------------------
create table if not exists public.admin_access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  test_admin_expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_admin_access_requests_status_requested_at
  on public.admin_access_requests (status, requested_at desc);

create index if not exists idx_admin_access_requests_email_requested_at
  on public.admin_access_requests (email, requested_at desc);

create unique index if not exists uq_admin_access_requests_pending_user
  on public.admin_access_requests (user_id)
  where status = 'pending';

drop trigger if exists admin_access_requests_set_updated_at on public.admin_access_requests;
create trigger admin_access_requests_set_updated_at
before update on public.admin_access_requests
for each row execute function public.set_updated_at();

alter table if exists public.admin_access_requests enable row level security;

grant select, insert on public.admin_access_requests to authenticated;
grant select, insert, update, delete on public.admin_access_requests to service_role;

drop policy if exists admin_access_requests_requester_read_own on public.admin_access_requests;
create policy admin_access_requests_requester_read_own
on public.admin_access_requests
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists admin_access_requests_requester_insert_own on public.admin_access_requests;
create policy admin_access_requests_requester_insert_own
on public.admin_access_requests
for insert
to authenticated
with check (
  auth.uid() = user_id
  and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  and status = 'pending'
);

drop policy if exists admin_access_requests_super_admin_read on public.admin_access_requests;
create policy admin_access_requests_super_admin_read
on public.admin_access_requests
for select
to authenticated
using (public.is_super_admin_email());

drop policy if exists admin_access_requests_super_admin_update on public.admin_access_requests;
create policy admin_access_requests_super_admin_update
on public.admin_access_requests
for update
to authenticated
using (public.is_super_admin_email())
with check (public.is_super_admin_email());

drop policy if exists admin_access_requests_super_admin_delete on public.admin_access_requests;
create policy admin_access_requests_super_admin_delete
on public.admin_access_requests
for delete
to authenticated
using (public.is_super_admin_email());

insert into public.schema_migrations (version, description)
values ('v2.2.1', '관리자 권한 모델(role/is_active/expires_at) 확장 + admin_access_requests 도입 + super_admin 정책 보강')
on conflict (version) do nothing;

commit;
