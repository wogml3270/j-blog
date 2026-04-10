begin;

-- =========================================================
-- [STORAGE] 관리자 업로드 버킷 보정
-- =========================================================
-- 업로드 폴더 규칙:
--   about/YYYY-MM-DD/...
--   blog/YYYY-MM-DD/...
--   projects/YYYY-MM-DD/...
--   home/YYYY-MM-DD/...
insert into storage.buckets (id, name, public)
values ('project-thumbnails', 'project-thumbnails', true)
on conflict (id) do update
set public = excluded.public;

-- =========================================================
-- [META] v1.0.9 적용 기록
-- =========================================================
insert into public.schema_migrations (version, description)
values (
  'v1.0.9',
  '관리자 이미지 업로드 공통화 및 페이지별 스토리지 폴더 규칙 적용'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
