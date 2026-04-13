-- Schema Version: v1.0.14
-- Created At: 2026-04-13
-- Purpose:
--   - profile_content.status 컬럼 제거 및 공개 조회 정책 단순화
--   - 기존 더미 데이터(posts/projects/contact_messages) 정리

begin;

-- [RLS] profile_content 공개 조회 정책은 status 의존을 제거하고 상시 조회로 전환

drop policy if exists profile_public_read on public.profile_content;

alter table public.profile_content
  drop column if exists status;

create policy profile_public_read
on public.profile_content
for select
to anon, authenticated
using (true);

-- [CLEANUP] 테스트용 더미 데이터 삭제

delete from public.posts
where slug like 'dummy-post-%';

delete from public.projects
where slug like 'dummy-project-%';

delete from public.contact_messages
where subject like '[더미] 문의 테스트 %';

-- [META] v1.0.5 마이그레이션 설명 보정

update public.schema_migrations
set
  description = '관리자 페이지네이션 인덱스 추가',
  applied_at = timezone('utc', now())
where version = 'v1.0.5';

-- [META] v1.0.14 적용 기록

insert into public.schema_migrations (version, description)
values (
  'v1.0.14',
  'About status 제거 + profile_content 공개정책 단순화 + 더미 데이터 정리'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
