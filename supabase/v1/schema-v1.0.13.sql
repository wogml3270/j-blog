begin;

-- =========================================================
-- [PROFILE] About 단순화: 사용하지 않는 컬럼 제거
-- =========================================================
alter table public.profile_content
  drop column if exists tech_stack,
  drop column if exists strengths,
  drop column if exists work_style,
  drop column if exists about_intro_description_ko,
  drop column if exists about_experience;

-- =========================================================
-- [META] v1.0.13 적용 기록
-- =========================================================
insert into public.schema_migrations (version, description)
values (
  'v1.0.13',
  'About 단순화 리뉴얼: profile_content의 미사용 컬럼 5종 제거'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
