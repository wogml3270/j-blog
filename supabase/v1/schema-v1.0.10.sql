begin;

-- =========================================================
-- [PROJECTS] 홈 노출 요약 + 슬러그 동기화 여부 컬럼 추가
-- =========================================================
alter table public.projects
  add column if not exists home_summary text not null default '';

alter table public.projects
  add column if not exists sync_slug_with_title boolean not null default false;

comment on column public.projects.home_summary is '홈 하이라이트/카드에 노출할 짧은 요약 텍스트';
comment on column public.projects.sync_slug_with_title is '관리자에서 슬러그를 제목과 자동 동기화할지 여부';

-- 기존 데이터는 summary 기반으로 홈 요약을 170자 이내로 백필한다.
update public.projects
set home_summary = left(
  trim(
    regexp_replace(
      regexp_replace(summary, E'[\\n\\r]+', ' ', 'g'),
      E'[#>*_`~\\[\\]\\(\\)-]+',
      ' ',
      'g'
    )
  ),
  170
)
where coalesce(trim(home_summary), '') = '';

-- =========================================================
-- [POSTS] 슬러그 동기화 여부 컬럼 추가
-- =========================================================
alter table public.posts
  add column if not exists sync_slug_with_title boolean not null default false;

comment on column public.posts.sync_slug_with_title is '관리자에서 슬러그를 제목과 자동 동기화할지 여부';

-- =========================================================
-- [META] v1.0.10 적용 기록
-- =========================================================
insert into public.schema_migrations (version, description)
values (
  'v1.0.10',
  '프로젝트 홈요약 컬럼 추가 및 블로그/프로젝트 슬러그-제목 동기화 여부 저장'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
