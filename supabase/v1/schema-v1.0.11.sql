begin;

-- =========================================================
-- [HOME HIGHLIGHTS] CTA 오버라이드만 유지
-- =========================================================
alter table public.home_highlights
  drop column if exists override_title;

alter table public.home_highlights
  drop column if exists override_description;

alter table public.home_highlights
  drop column if exists override_image_url;

-- =========================================================
-- [META] v1.0.11 적용 기록
-- =========================================================
insert into public.schema_migrations (version, description)
values (
  'v1.0.11',
  '홈 하이라이트에서 제목/설명/이미지 오버라이드 제거 및 CTA 오버라이드만 유지'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
