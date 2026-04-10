begin;

-- =========================================================
-- [POSTS] 예약 발행 시각 컬럼 추가
-- =========================================================
alter table public.posts
  add column if not exists scheduled_publish_at timestamptz;

create index if not exists idx_posts_status_scheduled_publish
  on public.posts (status, scheduled_publish_at);

comment on column public.posts.scheduled_publish_at is '예약 발행 시각(UTC). null이면 즉시 공개';

-- =========================================================
-- [META] v1.0.12 적용 기록
-- =========================================================
insert into public.schema_migrations (version, description)
values (
  'v1.0.12',
  '블로그 예약 발행(scheduled_publish_at) 컬럼 추가 및 관리자 예약 발행 UI 반영'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
