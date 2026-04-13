-- Schema Version: v1.0.15
-- Created At: 2026-04-13
-- Purpose:
--   - 기존 테스트/더미 데이터 정리
--   - 현재 스키마 기준 현실적인 샘플 데이터(posts/projects/contact_messages) 재구성

begin;

create table if not exists public.schema_migrations (
  version text primary key,
  description text not null,
  applied_at timestamptz not null default timezone('utc', now())
);

-- =========================================================
-- [CONTACT] 상태값 정규화 (read -> replied)
-- =========================================================
update public.contact_messages
set status = 'replied'
where status = 'read';

alter table public.contact_messages
  drop constraint if exists contact_messages_status_check;

alter table public.contact_messages
  add constraint contact_messages_status_check
  check (status in ('new', 'replied'));

-- =========================================================
-- [CLEANUP] 기존 테스트/더미 데이터 제거
-- =========================================================
with seed_post_slugs as (
  select unnest(array[
    'state-machine-nextjs-admin',
    'nextjs-i18n-practical-guide',
    'supabase-rls-auth-design',
    'web-performance-budget-automation',
    'design-system-token-pipeline',
    'markdown-editor-governance',
    'dashboard-query-ux-pattern',
    'image-upload-storage-strategy',
    'release-train-feature-flags',
    'observability-incident-notes'
  ]) as slug
)
delete from public.post_tag_map
where post_id in (
  select p.id
  from public.posts p
  where p.slug like 'dummy-post-%'
     or p.slug like 'dummy-%'
     or p.slug like 'test-%'
     or p.slug like 'sample-%'
     or p.title like '[더미]%'
     or exists (select 1 from seed_post_slugs s where s.slug = p.slug)
);

with seed_post_slugs as (
  select unnest(array[
    'state-machine-nextjs-admin',
    'nextjs-i18n-practical-guide',
    'supabase-rls-auth-design',
    'web-performance-budget-automation',
    'design-system-token-pipeline',
    'markdown-editor-governance',
    'dashboard-query-ux-pattern',
    'image-upload-storage-strategy',
    'release-train-feature-flags',
    'observability-incident-notes'
  ]) as slug
)
delete from public.posts p
where p.slug like 'dummy-post-%'
   or p.slug like 'dummy-%'
   or p.slug like 'test-%'
   or p.slug like 'sample-%'
   or p.title like '[더미]%'
   or exists (select 1 from seed_post_slugs s where s.slug = p.slug);

with seed_project_slugs as (
  select unnest(array[
    'commerce-admin-frontend',
    'analytics-workspace',
    'content-ops-platform',
    'design-system-foundation',
    'realtime-monitoring-console',
    'team-collaboration-board',
    'ai-assisted-support-desk',
    'payment-risk-dashboard',
    'logistics-visibility-suite',
    'experiment-platform'
  ]) as slug
)
delete from public.projects p
where p.slug like 'dummy-project-%'
   or p.slug like 'dummy-%'
   or p.slug like 'test-%'
   or p.slug like 'sample-%'
   or p.title like '[더미]%'
   or exists (select 1 from seed_project_slugs s where s.slug = p.slug);

delete from public.contact_messages
where subject like '[더미] 문의 테스트 %'
   or subject like '[더미]%'
   or email like 'seed-user-%@portfolio.local';

-- =========================================================
-- [SEED] 블로그 샘플 데이터 (10)
-- =========================================================
with seed_posts as (
  select *
  from (
    values
      (
        'state-machine-nextjs-admin',
        '상태 전이로 관리하는 Next.js 관리자 폼',
        '복잡한 관리자 입력 흐름을 상태 전이 모델로 단순화한 구현 기록',
        '/blog/default-thumbnail.svg',
        E'## 문제\n폼 상태가 페이지 전환마다 꼬이는 문제가 있었습니다.\n\n## 해결\n- 상태 전이 다이어그램 정리\n- 저장/이동 가드 분리\n- 드로어 생명주기와 에디터 마운트 동기화\n\n## 결과\n운영 중 재현되던 회귀 이슈를 안정적으로 줄였습니다.',
        'published',
        timezone('utc', now()) - interval '21 days',
        null,
        true,
        true,
        false,
        array['Next.js', '상태관리', 'Admin UX']::text[]
      ),
      (
        'nextjs-i18n-practical-guide',
        'Next.js i18n 운영에서 놓치기 쉬운 포인트',
        'ko/en/ja 3개 언어 운영 시 URL, 메타, 폰트 전략을 정리한 가이드',
        '/blog/default-thumbnail.svg',
        E'## 핵심\n다국어는 라우팅보다 운영 규칙이 중요합니다.\n\n- 기본 로케일 정책\n- canonical/hreflang 정합성\n- locale별 폰트 렌더 우선순위',
        'published',
        timezone('utc', now()) - interval '19 days',
        null,
        true,
        true,
        false,
        array['i18n', 'SEO', 'Next.js']::text[]
      ),
      (
        'supabase-rls-auth-design',
        'Supabase RLS와 소셜 로그인 권한 설계',
        'allowlist 기반 관리자 권한 모델을 RLS로 안전하게 묶는 방법',
        '/blog/default-thumbnail.svg',
        E'## 권한 모델\n이메일 검증 + allowlist 조합을 기준으로 관리자 권한을 부여합니다.\n\n## 체크리스트\n- RLS 기본 deny\n- 관리자 정책 분리\n- 콜백/리다이렉트 URL 정합성 확인',
        'published',
        timezone('utc', now()) - interval '16 days',
        null,
        false,
        true,
        false,
        array['Supabase', 'RLS', 'Auth']::text[]
      ),
      (
        'web-performance-budget-automation',
        '성능 예산을 CI에 연결하는 실전 방법',
        'Web Vitals 기준선을 정하고 회귀를 자동으로 감지하는 파이프라인 소개',
        '/blog/default-thumbnail.svg',
        E'## 목표\n변경이 있을 때 체감 성능 하락을 빠르게 발견합니다.\n\n- 주요 지표 임계치 정의\n- 빌드 단계 경고/실패 기준 설정\n- 리포트 공유 자동화',
        'published',
        timezone('utc', now()) - interval '14 days',
        null,
        false,
        true,
        false,
        array['성능', 'CI', 'Web Vitals']::text[]
      ),
      (
        'design-system-token-pipeline',
        '디자인 토큰 파이프라인 설계 노트',
        '디자인 토큰을 테마/컴포넌트에 안전하게 반영하기 위한 운영 방식',
        '/blog/default-thumbnail.svg',
        E'## 설계 원칙\n토큰은 값 그 자체보다 변경 전파 경로가 중요합니다.\n\n- semantic token 계층\n- 라이트/다크 동시 관리\n- 컴포넌트 레벨 fallback 전략',
        'published',
        timezone('utc', now()) - interval '11 days',
        null,
        true,
        true,
        false,
        array['Design System', '토큰', 'UI']::text[]
      ),
      (
        'markdown-editor-governance',
        'Markdown 에디터 운영 가이드라인',
        '에디터 자유도와 콘텐츠 일관성 사이 균형을 맞추는 규칙 정리',
        '/blog/default-thumbnail.svg',
        E'## 운영 기준\n마크다운은 표현 자유도가 높아도 최소한의 형식 규칙이 필요합니다.\n\n- 제목 깊이 제한\n- 이미지 용량/캡션 규칙\n- 링크 검수 체크',
        'published',
        timezone('utc', now()) - interval '9 days',
        null,
        false,
        true,
        true,
        array['Markdown', '콘텐츠 운영', '에디터']::text[]
      ),
      (
        'dashboard-query-ux-pattern',
        '관리자 대시보드 쿼리/UX 패턴 정리',
        '리스트-상세 드로어 구조에서 URL 동기화를 안정적으로 유지하는 방법',
        '/blog/default-thumbnail.svg',
        E'## 요약\n페이지네이션, 필터, 상세 ID 쿼리를 동시에 다룰 때 규칙을 먼저 정해야 합니다.\n\n- URL이 단일 소스 오브 트루스\n- 이동 시 dirty guard\n- 재진입 복원성 확보',
        'published',
        timezone('utc', now()) - interval '7 days',
        null,
        false,
        true,
        false,
        array['Dashboard', 'URL State', 'UX']::text[]
      ),
      (
        'image-upload-storage-strategy',
        'Supabase Storage 업로드 전략 정리',
        '관리자 업로드 파일을 폴더 규칙으로 일관되게 관리하는 방법',
        '/blog/default-thumbnail.svg',
        E'## 범위\n블로그/프로젝트/소개 이미지 업로드 경로를 통일했습니다.\n\n- 경로 규칙 표준화\n- 미리보기/실패 복구 UX\n- 보안 정책 점검',
        'draft',
        null,
        null,
        false,
        true,
        true,
        array['Storage', '업로드', 'Supabase']::text[]
      ),
      (
        'release-train-feature-flags',
        'Feature Flag 기반 릴리즈 트레인 운영',
        '작은 배포를 자주 하면서도 위험을 낮추는 릴리즈 운영 패턴',
        '/blog/default-thumbnail.svg',
        E'## 핵심\n릴리즈는 코드 완료 시점이 아니라 노출 제어 시점으로 분리해야 합니다.\n\n- 점진적 노출\n- 롤백 절차 간소화\n- 모니터링 기반 의사결정',
        'draft',
        null,
        null,
        false,
        true,
        true,
        array['Feature Flag', '배포', '운영']::text[]
      ),
      (
        'observability-incident-notes',
        '장애 대응을 위한 관측성 노트',
        '로그/메트릭/트레이스 관점에서 장애 대응 시간을 줄이는 실무 노하우',
        '/blog/default-thumbnail.svg',
        E'## 운영 포인트\n문제 발생 시점의 증거를 빠르게 모으는 체계가 핵심입니다.\n\n- 경보 노이즈 줄이기\n- 대시보드 기준선 유지\n- 회고 템플릿 표준화',
        'published',
        timezone('utc', now()) + interval '4 days',
        timezone('utc', now()) + interval '4 days',
        false,
        true,
        false,
        array['Observability', '운영', '장애대응']::text[]
      )
  ) as t(
    slug,
    title,
    description,
    thumbnail,
    body_markdown,
    status,
    published_at,
    scheduled_publish_at,
    featured,
    use_markdown_editor,
    sync_slug_with_title,
    tags
  )
)
insert into public.posts (
  slug,
  title,
  description,
  thumbnail,
  body_markdown,
  status,
  published_at,
  scheduled_publish_at,
  featured,
  use_markdown_editor,
  sync_slug_with_title
)
select
  slug,
  title,
  description,
  nullif(thumbnail, ''),
  body_markdown,
  status::public.publish_status,
  published_at,
  scheduled_publish_at,
  featured,
  use_markdown_editor,
  sync_slug_with_title
from seed_posts
on conflict (slug)
do update set
  title = excluded.title,
  description = excluded.description,
  thumbnail = excluded.thumbnail,
  body_markdown = excluded.body_markdown,
  status = excluded.status,
  published_at = excluded.published_at,
  scheduled_publish_at = excluded.scheduled_publish_at,
  featured = excluded.featured,
  use_markdown_editor = excluded.use_markdown_editor,
  sync_slug_with_title = excluded.sync_slug_with_title;

with seed_posts as (
  select *
  from (
    values
      ('state-machine-nextjs-admin', array['Next.js', '상태관리', 'Admin UX']::text[]),
      ('nextjs-i18n-practical-guide', array['i18n', 'SEO', 'Next.js']::text[]),
      ('supabase-rls-auth-design', array['Supabase', 'RLS', 'Auth']::text[]),
      ('web-performance-budget-automation', array['성능', 'CI', 'Web Vitals']::text[]),
      ('design-system-token-pipeline', array['Design System', '토큰', 'UI']::text[]),
      ('markdown-editor-governance', array['Markdown', '콘텐츠 운영', '에디터']::text[]),
      ('dashboard-query-ux-pattern', array['Dashboard', 'URL State', 'UX']::text[]),
      ('image-upload-storage-strategy', array['Storage', '업로드', 'Supabase']::text[]),
      ('release-train-feature-flags', array['Feature Flag', '배포', '운영']::text[]),
      ('observability-incident-notes', array['Observability', '운영', '장애대응']::text[])
  ) as t(slug, tags)
),
all_tags as (
  select distinct trim(tag_name) as name
  from seed_posts,
  unnest(tags) as tag_name
  where trim(tag_name) <> ''
)
insert into public.post_tags (name)
select name
from all_tags
on conflict (name) do nothing;

with seed_posts as (
  select *
  from (
    values
      ('state-machine-nextjs-admin', array['Next.js', '상태관리', 'Admin UX']::text[]),
      ('nextjs-i18n-practical-guide', array['i18n', 'SEO', 'Next.js']::text[]),
      ('supabase-rls-auth-design', array['Supabase', 'RLS', 'Auth']::text[]),
      ('web-performance-budget-automation', array['성능', 'CI', 'Web Vitals']::text[]),
      ('design-system-token-pipeline', array['Design System', '토큰', 'UI']::text[]),
      ('markdown-editor-governance', array['Markdown', '콘텐츠 운영', '에디터']::text[]),
      ('dashboard-query-ux-pattern', array['Dashboard', 'URL State', 'UX']::text[]),
      ('image-upload-storage-strategy', array['Storage', '업로드', 'Supabase']::text[]),
      ('release-train-feature-flags', array['Feature Flag', '배포', '운영']::text[]),
      ('observability-incident-notes', array['Observability', '운영', '장애대응']::text[])
  ) as t(slug, tags)
)
delete from public.post_tag_map
where post_id in (
  select p.id
  from public.posts p
  join seed_posts s on s.slug = p.slug
);

with seed_posts as (
  select *
  from (
    values
      ('state-machine-nextjs-admin', array['Next.js', '상태관리', 'Admin UX']::text[]),
      ('nextjs-i18n-practical-guide', array['i18n', 'SEO', 'Next.js']::text[]),
      ('supabase-rls-auth-design', array['Supabase', 'RLS', 'Auth']::text[]),
      ('web-performance-budget-automation', array['성능', 'CI', 'Web Vitals']::text[]),
      ('design-system-token-pipeline', array['Design System', '토큰', 'UI']::text[]),
      ('markdown-editor-governance', array['Markdown', '콘텐츠 운영', '에디터']::text[]),
      ('dashboard-query-ux-pattern', array['Dashboard', 'URL State', 'UX']::text[]),
      ('image-upload-storage-strategy', array['Storage', '업로드', 'Supabase']::text[]),
      ('release-train-feature-flags', array['Feature Flag', '배포', '운영']::text[]),
      ('observability-incident-notes', array['Observability', '운영', '장애대응']::text[])
  ) as t(slug, tags)
),
expanded as (
  select p.id as post_id, trim(tag_name) as tag_name
  from seed_posts s
  join public.posts p on p.slug = s.slug
  cross join unnest(s.tags) as tag_name
  where trim(tag_name) <> ''
)
insert into public.post_tag_map (post_id, tag_id)
select e.post_id, t.id
from expanded e
join public.post_tags t on t.name = e.tag_name
on conflict (post_id, tag_id) do nothing;

-- =========================================================
-- [SEED] 프로젝트 샘플 데이터 (10)
-- =========================================================
with seed_projects as (
  select *
  from (
    values
      (
        'commerce-admin-frontend',
        '커머스 운영 어드민 프론트엔드',
        '주문/재고/프로모션을 한 화면에서 운영하는 관리자 콘솔',
        E'## 프로젝트 개요\n운영팀이 주문 상태, 재고, 프로모션을 빠르게 처리할 수 있도록 관리자 콘솔을 구축했습니다.\n\n## 기여 내용\n- 주문 상세 화면 응답 속도 개선\n- 재고 경고 흐름 정비\n- 운영 지표 시각화 컴포넌트 표준화',
        '/projects/commerce-admin.svg',
        'Frontend Lead',
        '2025.01 - 2025.06',
        '2025-01-01',
        '2025-06-30',
        '["Next.js","TypeScript","TanStack Query","Zustand"]'::jsonb,
        '["주문 상세 진입 시간 38% 단축","운영팀 반복 작업 3단계 축소"]'::jsonb,
        '["공통 상태 모델 설계","운영 정책 반영 UI 가이드 정립"]'::jsonb,
        '[{"label":"Case Study","url":"https://example.com/case/commerce-admin"},{"label":"Demo","url":"https://example.com/demo/commerce-admin"}]'::jsonb,
        true,
        'published',
        true,
        false
      ),
      (
        'analytics-workspace',
        '제품 분석 워크스페이스',
        '핵심 KPI와 이벤트 퍼널을 한 번에 추적하는 분석 대시보드',
        E'## 프로젝트 개요\n기획/운영/개발이 같은 지표를 보고 의사결정할 수 있도록 분석 화면을 통합했습니다.\n\n## 기여 내용\n- 퍼널 비교 화면 추가\n- 기간 필터 UX 고도화\n- 성능 예산 기반 차트 최적화',
        '/projects/analytics-dashboard.svg',
        'Frontend Developer',
        '2025.03 - 2025.09',
        '2025-03-01',
        '2025-09-30',
        '["React","TypeScript","D3","Supabase"]'::jsonb,
        '["분석 리포트 생성 시간 45% 단축","지표 조회 실패율 60% 감소"]'::jsonb,
        '["대시보드 정보 구조 재설계","공통 차트 컴포넌트 구축"]'::jsonb,
        '[{"label":"Case Study","url":"https://example.com/case/analytics"},{"label":"Demo","url":"https://example.com/demo/analytics"}]'::jsonb,
        true,
        'published',
        true,
        false
      ),
      (
        'content-ops-platform',
        '콘텐츠 운영 플랫폼',
        '편집/검수/발행 워크플로우를 통합한 CMS 운영 도구',
        E'## 프로젝트 개요\n발행 단계가 분산된 기존 운영 흐름을 하나의 플랫폼으로 통합했습니다.\n\n## 기여 내용\n- 예약 발행 정책 반영\n- 권한별 화면 분기 설계\n- 히스토리 비교 UI 구축',
        '/projects/content-platform.svg',
        'Frontend Developer',
        '2025.05 - 2025.11',
        '2025-05-01',
        '2025-11-30',
        '["Next.js","MDX","Supabase","Tailwind CSS"]'::jsonb,
        '["검수-발행 리드타임 32% 개선","콘텐츠 오류 재발률 감소"]'::jsonb,
        '["에디터 UX 설계","운영 정책 기반 상태 전환 구현"]'::jsonb,
        '[{"label":"Case Study","url":"https://example.com/case/content-platform"}]'::jsonb,
        true,
        'published',
        true,
        false
      ),
      (
        'design-system-foundation',
        '디자인 시스템 파운데이션',
        '브랜드 확장에 맞춘 토큰/컴포넌트/문서 체계를 구축',
        E'## 프로젝트 개요\n화면 품질 편차를 줄이기 위해 디자인 시스템 기반 개발 프로세스를 정립했습니다.\n\n## 기여 내용\n- 시맨틱 토큰 계층 설계\n- 접근성 가이드 체크리스트 도입\n- 관리자/공개 공통 컴포넌트화',
        '/projects/design-system.svg',
        'Frontend Developer',
        '2025.02 - 2025.08',
        '2025-02-01',
        '2025-08-31',
        '["Design Tokens","Storybook","TypeScript","Tailwind CSS"]'::jsonb,
        '["중복 스타일 코드 40% 감소","컴포넌트 재사용률 증가"]'::jsonb,
        '["토큰 파이프라인 구성","문서화 템플릿 수립"]'::jsonb,
        '[{"label":"Case Study","url":"https://example.com/case/design-system"}]'::jsonb,
        true,
        'published',
        true,
        false
      ),
      (
        'realtime-monitoring-console',
        '실시간 모니터링 콘솔',
        '장애 감지를 위한 운영 모니터링 대시보드와 알림 흐름 구현',
        E'## 프로젝트 개요\n실시간 이벤트를 한 화면에서 추적하고 알림 대응 시간을 단축했습니다.\n\n## 기여 내용\n- 상태 배지 규칙 통일\n- 이슈 우선순위 시각화\n- 이벤트 로그 탐색 UX 개선',
        '/projects/analytics-dashboard.svg',
        'Frontend Developer',
        '2025.07 - 2025.12',
        '2025-07-01',
        '2025-12-31',
        '["React","WebSocket","TypeScript","Recharts"]'::jsonb,
        '["탐지 후 조치 시간 평균 28% 단축"]'::jsonb,
        '["실시간 리스트 가상화","경보 UI 우선순위 체계 설계"]'::jsonb,
        '[{"label":"Demo","url":"https://example.com/demo/monitoring"}]'::jsonb,
        false,
        'published',
        true,
        false
      ),
      (
        'team-collaboration-board',
        '협업 보드 워크플로우 개선',
        '팀 협업 보드의 상태 전환/권한 흐름을 재설계한 프로젝트',
        E'## 프로젝트 개요\n보드 기반 협업의 병목 구간을 줄이기 위해 인터랙션을 단순화했습니다.\n\n## 기여 내용\n- 카드 상세 패널 성능 개선\n- 필터/검색 쿼리 통합\n- 모바일 편집 플로우 최적화',
        '/projects/content-platform.svg',
        'Frontend Engineer',
        '2025.10 - 2026.01',
        '2025-10-01',
        '2026-01-31',
        '["Next.js","Dnd-kit","Zustand","Supabase"]'::jsonb,
        '["작업 이동 실패 케이스 70% 감소"]'::jsonb,
        '["드래그앤드롭 접근성 개선","URL 상태 동기화 정비"]'::jsonb,
        '[{"label":"Case Study","url":"https://example.com/case/collaboration-board"}]'::jsonb,
        false,
        'published',
        true,
        true
      ),
      (
        'ai-assisted-support-desk',
        'AI 보조 고객지원 데스크',
        '문의 분류와 답변 초안을 돕는 지원 도구 MVP',
        E'## 프로젝트 개요\n반복 문의 대응 시간을 줄이기 위한 AI 보조 워크플로우를 실험했습니다.\n\n## 기여 내용\n- 문의 분류 라벨링 UI\n- 운영자 피드백 루프 반영\n- 품질 검수 단계 분리',
        '/projects/commerce-admin.svg',
        'Frontend Engineer',
        '2026.01 - 2026.04',
        '2026-01-01',
        '2026-04-30',
        '["Next.js","OpenAI API","Supabase","TypeScript"]'::jsonb,
        '["응답 초안 작성 시간 50% 절감(파일럿)"]'::jsonb,
        '["운영자 검수 중심 UX 구현"]'::jsonb,
        '[{"label":"Demo","url":"https://example.com/demo/support-desk"}]'::jsonb,
        false,
        'draft',
        true,
        true
      ),
      (
        'payment-risk-dashboard',
        '결제 리스크 대시보드',
        '이상 거래 패턴을 탐지하고 운영팀이 조치하는 리스크 관리 화면',
        E'## 프로젝트 개요\n리스크 이벤트를 유형별로 빠르게 파악하고 대응할 수 있도록 대시보드를 구성했습니다.\n\n## 기여 내용\n- 고위험 거래 라벨링 UX\n- 상세 패널 트랜잭션 타임라인\n- 운영 액션 기록 로그 제공',
        '/projects/design-system.svg',
        'Frontend Engineer',
        '2025.08 - 2026.02',
        '2025-08-01',
        '2026-02-28',
        '["React","TypeScript","TanStack Query","Chart.js"]'::jsonb,
        '["리스크 판별 수동 작업 시간 35% 절감"]'::jsonb,
        '["경보-조치 이력 연결 UX 구현"]'::jsonb,
        '[{"label":"Case Study","url":"https://example.com/case/payment-risk"}]'::jsonb,
        false,
        'published',
        true,
        false
      ),
      (
        'logistics-visibility-suite',
        '물류 가시성 스위트',
        '배송 상태와 지연 원인을 추적하는 운영 화면 개선 프로젝트',
        E'## 프로젝트 개요\n운송 구간별 상태를 가시화해 운영 의사결정 속도를 높였습니다.\n\n## 기여 내용\n- 상태 라벨 표준화\n- 지도/리스트 동기화\n- 지연 알림 기준 재정의',
        '/projects/analytics-dashboard.svg',
        'Frontend Engineer',
        '2025.06 - 2025.12',
        '2025-06-01',
        '2025-12-31',
        '["Next.js","Mapbox","TypeScript","Supabase"]'::jsonb,
        '["지연 원인 파악 시간 평균 41% 개선"]'::jsonb,
        '["운영자 기준 화면 레이아웃 재설계"]'::jsonb,
        '[{"label":"Demo","url":"https://example.com/demo/logistics"}]'::jsonb,
        false,
        'published',
        true,
        false
      ),
      (
        'experiment-platform',
        '실험(AB 테스트) 운영 플랫폼',
        '실험 설정/배포/결과 조회를 통합한 운영 도구',
        E'## 프로젝트 개요\n기획-개발-분석이 하나의 흐름에서 실험을 운영할 수 있도록 통합했습니다.\n\n## 기여 내용\n- 실험 상태 전이 모델링\n- 롤백 시나리오 UX 제공\n- 결과 해석 보조 시각화',
        '/projects/content-platform.svg',
        'Frontend Engineer',
        '2026.02 - 2026.05',
        '2026-02-01',
        '2026-05-31',
        '["React","TypeScript","Feature Flags","Supabase"]'::jsonb,
        '["실험 준비 리드타임 30% 감소(내부 지표)"]'::jsonb,
        '["실험 설정 검증 플로우 구현"]'::jsonb,
        '[{"label":"Case Study","url":"https://example.com/case/experiment-platform"}]'::jsonb,
        false,
        'draft',
        true,
        true
      )
  ) as t(
    slug,
    title,
    home_summary,
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
    status,
    use_markdown_editor,
    sync_slug_with_title
  )
)
insert into public.projects (
  slug,
  title,
  home_summary,
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
  status,
  use_markdown_editor,
  sync_slug_with_title
)
select
  slug,
  title,
  home_summary,
  summary,
  thumbnail,
  role,
  period,
  start_date::date,
  end_date::date,
  tech_stack,
  achievements,
  contributions,
  links,
  featured,
  status::public.publish_status,
  use_markdown_editor,
  sync_slug_with_title
from seed_projects
on conflict (slug)
do update set
  title = excluded.title,
  home_summary = excluded.home_summary,
  summary = excluded.summary,
  thumbnail = excluded.thumbnail,
  role = excluded.role,
  period = excluded.period,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  tech_stack = excluded.tech_stack,
  achievements = excluded.achievements,
  contributions = excluded.contributions,
  links = excluded.links,
  featured = excluded.featured,
  status = excluded.status,
  use_markdown_editor = excluded.use_markdown_editor,
  sync_slug_with_title = excluded.sync_slug_with_title;

-- =========================================================
-- [SEED] 문의 샘플 데이터 (10)
-- =========================================================
insert into public.contact_messages (
  name,
  email,
  subject,
  message,
  admin_note,
  status,
  created_at,
  updated_at
)
values
  (
    '김유나',
    'seed-user-01@portfolio.local',
    '프로젝트 협업 문의드립니다',
    '현재 운영 중인 서비스의 관리자 화면 개선을 검토 중입니다. 간단한 미팅 가능하실까요?',
    '신규 리드. 포트폴리오 링크 확인 요청 예정',
    'new',
    timezone('utc', now()) - interval '3 days',
    timezone('utc', now()) - interval '3 days'
  ),
  (
    '박민수',
    'seed-user-02@portfolio.local',
    '이력서 전달 및 포지션 제안',
    '프론트엔드 포지션 제안드리고 싶습니다. 연락 가능한 시간대를 알려주세요.',
    '답변 완료, 메일 회신함',
    'replied',
    timezone('utc', now()) - interval '9 days',
    timezone('utc', now()) - interval '8 days'
  ),
  (
    '이지현',
    'seed-user-03@portfolio.local',
    '디자인 시스템 구축 경험 문의',
    '디자인 시스템 전환 사례가 인상적이었습니다. 관련 경험을 조금 더 듣고 싶습니다.',
    '',
    'new',
    timezone('utc', now()) - interval '1 day',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    '최도윤',
    'seed-user-04@portfolio.local',
    '블로그 글 인용 가능 여부 문의',
    '블로그 내용을 사내 스터디 자료로 인용해도 될지 문의드립니다.',
    '출처 표기 조건으로 안내 완료',
    'replied',
    timezone('utc', now()) - interval '13 days',
    timezone('utc', now()) - interval '12 days'
  ),
  (
    '정하린',
    'seed-user-05@portfolio.local',
    '관리자 페이지 UX 리뷰 요청',
    '현재 운영 중인 관리자 페이지의 UX 리뷰를 의뢰하고 싶습니다.',
    '',
    'new',
    timezone('utc', now()) - interval '5 days',
    timezone('utc', now()) - interval '5 days'
  ),
  (
    '오세준',
    'seed-user-06@portfolio.local',
    '강의/세미나 발표 제안',
    '사내 테크 세미나에서 프론트엔드 운영 경험 공유 발표를 부탁드리고 싶습니다.',
    '일정 확인 후 답변 예정',
    'new',
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    '한지민',
    'seed-user-07@portfolio.local',
    '오픈소스 기여 협업 문의',
    '공통 컴포넌트 라이브러리 개선 작업에 함께 참여 가능하신지 궁금합니다.',
    '답변 완료, GitHub 이슈 공유',
    'replied',
    timezone('utc', now()) - interval '15 days',
    timezone('utc', now()) - interval '14 days'
  ),
  (
    '배준호',
    'seed-user-08@portfolio.local',
    '포트폴리오 기술 질문',
    '프로젝트의 상태관리 구조를 어떤 기준으로 나눴는지 질문드립니다.',
    '',
    'new',
    timezone('utc', now()) - interval '6 days',
    timezone('utc', now()) - interval '6 days'
  ),
  (
    '윤서연',
    'seed-user-09@portfolio.local',
    '채용 관련 추가 질문',
    '근무 형태와 협업 프로세스 관련 추가 질문이 있습니다.',
    '답변 완료',
    'replied',
    timezone('utc', now()) - interval '11 days',
    timezone('utc', now()) - interval '10 days'
  ),
  (
    '임건우',
    'seed-user-10@portfolio.local',
    '프로젝트 레퍼런스 확인 요청',
    '최근 작업하신 프로젝트 중 참고 가능한 공개 화면이 있는지 문의드립니다.',
    '',
    'new',
    timezone('utc', now()) - interval '4 days',
    timezone('utc', now()) - interval '4 days'
  );

-- =========================================================
-- [META] v1.0.15 적용 기록
-- =========================================================
insert into public.schema_migrations (version, description)
values (
  'v1.0.15',
  '기존 더미 데이터 정리 + 현실적인 샘플 데이터(posts/projects/contact) 재구성'
)
on conflict (version) do update
set
  description = excluded.description,
  applied_at = timezone('utc', now());

commit;
