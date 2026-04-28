-- Schema Version: v2.2.2
-- Created At: 2026-04-28
-- Purpose:
--   - admin_access_requests.status를 text+check에서 enum으로 전환
--   - RLS 정책 의존성으로 인한 타입 변경 오류(0A000) 해결

begin;

-- ---------------------------------------------------------
-- status 참조 정책 제거 (컬럼 타입 변경 전 필수)
-- ---------------------------------------------------------
drop policy if exists admin_access_requests_requester_read_own on public.admin_access_requests;
drop policy if exists admin_access_requests_requester_insert_own on public.admin_access_requests;
drop policy if exists admin_access_requests_super_admin_read on public.admin_access_requests;
drop policy if exists admin_access_requests_super_admin_update on public.admin_access_requests;
drop policy if exists admin_access_requests_super_admin_delete on public.admin_access_requests;

-- partial unique index도 status 타입에 의존하므로 먼저 제거한다.
drop index if exists public.uq_admin_access_requests_pending_user;

-- ---------------------------------------------------------
-- enum 타입 생성
-- ---------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'admin_access_request_status'
      and n.nspname = 'public'
  ) then
    create type public.admin_access_request_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

-- ---------------------------------------------------------
-- text -> enum 전환
-- ---------------------------------------------------------
alter table public.admin_access_requests
  drop constraint if exists admin_access_requests_status_check;

alter table public.admin_access_requests
  alter column status drop default,
  alter column status type public.admin_access_request_status
  using (
    case
      when status::text in ('pending', 'approved', 'rejected')
        then status::text::public.admin_access_request_status
      else 'pending'::public.admin_access_request_status
    end
  ),
  alter column status set default 'pending'::public.admin_access_request_status;

-- ---------------------------------------------------------
-- 정책 재생성
-- ---------------------------------------------------------
create policy admin_access_requests_requester_read_own
on public.admin_access_requests
for select
to authenticated
using (auth.uid() = user_id);

create policy admin_access_requests_requester_insert_own
on public.admin_access_requests
for insert
to authenticated
with check (
  auth.uid() = user_id
  and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  and status = 'pending'::public.admin_access_request_status
);

create policy admin_access_requests_super_admin_read
on public.admin_access_requests
for select
to authenticated
using (public.is_super_admin_email());

create policy admin_access_requests_super_admin_update
on public.admin_access_requests
for update
to authenticated
using (public.is_super_admin_email())
with check (public.is_super_admin_email());

create policy admin_access_requests_super_admin_delete
on public.admin_access_requests
for delete
to authenticated
using (public.is_super_admin_email());

-- status enum 전환 후 partial unique index를 재생성한다.
create unique index if not exists uq_admin_access_requests_pending_user
  on public.admin_access_requests (user_id)
  where status = 'pending'::public.admin_access_request_status;

insert into public.schema_migrations (version, description)
values ('v2.2.2', 'admin_access_requests.status enum 전환 및 정책 재생성')
on conflict (version) do nothing;

commit;
