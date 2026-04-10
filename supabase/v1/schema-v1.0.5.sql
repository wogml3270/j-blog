-- Schema Version: v1.0.5
-- Created At: 2026-04-08
-- Purpose:
--   - 관리자 목록 페이지네이션 성능을 위한 정렬 인덱스 추가
--   - 테스트용 더미 데이터(posts/projects/contact_messages 각 10건) 추가

begin;

create table if not exists public.schema_migrations (
  version text primary key,
  description text not null,
  applied_at timestamptz not null default timezone('utc', now())
);

-- 페이지네이션 정렬 기준 인덱스
create index if not exists idx_posts_updated_at_desc on public.posts (updated_at desc);
create index if not exists idx_projects_updated_at_desc on public.projects (updated_at desc);
create index if not exists idx_contact_messages_created_at_desc on public.contact_messages (created_at desc);

-- 테스트용 게시글 10건
insert into public.posts (
  slug,
  title,
  description,
  thumbnail,
  body_markdown,
  status,
  published_at
)
select
  format('dummy-post-%s', gs) as slug,
  format('더미 블로그 글 %s', gs) as title,
  format('관리자 페이지 테스트용 더미 글 설명 %s', gs) as description,
  null as thumbnail,
  format('# 더미 글 %s\n\n이 문서는 관리자 페이지네이션/상세 편집 테스트용입니다.', gs) as body_markdown,
  case when gs <= 7 then 'published'::public.publish_status else 'draft'::public.publish_status end as status,
  case when gs <= 7 then timezone('utc', now()) - (gs || ' day')::interval else null end as published_at
from generate_series(1, 10) as gs
on conflict (slug) do nothing;

-- 테스트용 프로젝트 10건
insert into public.projects (
  slug,
  title,
  summary,
  thumbnail,
  role,
  period,
  start_date,
  end_date,
  tech_stack,
  achievements,
  contributions,
  links,
  featured,
  status
)
select
  format('dummy-project-%s', gs) as slug,
  format('더미 프로젝트 %s', gs) as title,
  format('관리자 프로젝트 탭 테스트를 위한 더미 요약 %s', gs) as summary,
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80' as thumbnail,
  'Frontend Developer' as role,
  format('2025.%s - 2026.%s', lpad(((gs % 12) + 1)::text, 2, '0'), lpad(((gs % 12) + 1)::text, 2, '0')) as period,
  (date '2025-01-01' + (gs * 7))::date as start_date,
  (date '2025-03-01' + (gs * 7))::date as end_date,
  jsonb_build_array('TypeScript', 'Next.js', 'Supabase') as tech_stack,
  jsonb_build_array(format('성과 항목 %s-1', gs), format('성과 항목 %s-2', gs)) as achievements,
  jsonb_build_array(format('기여 항목 %s-1', gs), format('기여 항목 %s-2', gs)) as contributions,
  jsonb_build_array(
    jsonb_build_object('label', 'Repository', 'url', format('https://github.com/example/dummy-project-%s', gs)),
    jsonb_build_object('label', 'Demo', 'url', format('https://example.com/projects/dummy-project-%s', gs))
  ) as links,
  (gs <= 3) as featured,
  case when gs <= 7 then 'published'::public.publish_status else 'draft'::public.publish_status end as status
from generate_series(1, 10) as gs
on conflict (slug) do nothing;

-- 테스트용 문의 10건(중복 삽입 방지)
insert into public.contact_messages (
  name,
  email,
  subject,
  message,
  admin_note,
  status
)
select
  format('테스터%s', gs) as name,
  format('tester%s@example.com', gs) as email,
  format('[더미] 문의 테스트 %s', gs) as subject,
  format('문의 본문 테스트 데이터 %s 입니다.', gs) as message,
  '' as admin_note,
  case when gs <= 4 then 'new' when gs <= 7 then 'read' else 'replied' end as status
from generate_series(1, 10) as gs
where not exists (
  select 1
  from public.contact_messages cm
  where cm.subject = format('[더미] 문의 테스트 %s', gs)
);

insert into public.schema_migrations (version, description)
values (
  'v1.0.5',
  '관리자 페이지네이션 인덱스 추가 + 테스트 더미 데이터(posts/projects/contact_messages 각 10건) 삽입'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
