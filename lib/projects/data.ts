import type { Project } from "@/types/content";

const projects: Project[] = [
  {
    slug: "commerce-admin-rebuild",
    title: "커머스 어드민 리빌드",
    summary:
      "레거시 어드민을 App Router 기반으로 재구성해 초기 로딩과 배포 안정성을 개선한 프로젝트",
    thumbnail: "/projects/commerce-admin.svg",
    role: "Frontend Lead",
    period: "2025.03 - 2025.08",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "TanStack Query"],
    achievements: [
      "핵심 페이지 TTFB 평균 28% 개선",
      "런타임 오류 건수 월 40% 감소",
      "팀 내 공통 UI 패턴 문서화 완료",
    ],
    contributions: [
      "라우팅/레이아웃 구조를 도메인 단위로 개편",
      "공통 데이터 패칭 훅/에러 처리 유틸 도입",
      "디자인 토큰 기반 스타일 시스템 정리",
    ],
    links: {
      live: "https://example.com/admin",
      repo: "https://github.com/example/commerce-admin",
      detail: "https://example.com/case-studies/commerce-admin",
    },
    featured: true,
  },
  {
    slug: "content-platform-migration",
    title: "콘텐츠 플랫폼 마이그레이션",
    summary:
      "페이지스 라우터에서 App Router로 전환하며 SEO 메타 구조와 MDX 콘텐츠 파이프라인을 정비한 프로젝트",
    thumbnail: "/projects/content-platform.svg",
    role: "Frontend Engineer",
    period: "2024.08 - 2025.01",
    techStack: ["Next.js", "MDX", "TypeScript", "Vercel"],
    achievements: [
      "블로그 유입 검색 노출 수 35% 증가",
      "콘텐츠 배포 리드타임 50% 단축",
    ],
    contributions: [
      "메타데이터 템플릿/동적 생성 로직 구현",
      "콘텐츠 작성 가이드와 템플릿 수립",
      "Sitemap, Robots 자동화",
    ],
    links: {
      live: "https://example.com/blog",
      repo: "https://github.com/example/content-platform",
      detail: "https://example.com/case-studies/content-platform",
    },
    featured: true,
  },
  {
    slug: "analytics-dashboard",
    title: "실시간 분석 대시보드",
    summary:
      "대용량 지표를 다루는 대시보드 UI를 설계해 실무자가 핵심 지표를 빠르게 해석할 수 있도록 개선",
    thumbnail: "/projects/analytics-dashboard.svg",
    role: "Frontend Engineer",
    period: "2023.11 - 2024.05",
    techStack: ["React", "TypeScript", "Zustand", "ECharts"],
    achievements: [
      "대시보드 상호작용 속도 체감 개선",
      "신규 지표 카드 개발 생산성 향상",
    ],
    contributions: [
      "차트/필터/테이블 컴포넌트 구조 재정의",
      "전역 상태와 URL 상태 동기화 패턴 도입",
      "키보드 내비게이션 접근성 개선",
    ],
    links: {
      live: "https://example.com/analytics",
      repo: "https://github.com/example/analytics-dashboard",
      detail: "https://example.com/case-studies/analytics-dashboard",
    },
    featured: true,
  },
  {
    slug: "internal-design-system",
    title: "사내 디자인 시스템 v1",
    summary:
      "여러 제품에서 재사용 가능한 UI 컴포넌트와 문서 사이트를 구축한 프로젝트",
    thumbnail: "/projects/design-system.svg",
    role: "Frontend Engineer",
    period: "2023.04 - 2023.09",
    techStack: ["React", "TypeScript", "Storybook", "Chromatic"],
    achievements: ["UI 불일치 이슈 감소", "신규 화면 개발 시간 단축"],
    contributions: [
      "버튼/폼/레이아웃 등 기반 컴포넌트 설계",
      "접근성 체크리스트와 QA 기준 수립",
    ],
    links: {
      repo: "https://github.com/example/design-system",
      detail: "https://example.com/case-studies/design-system",
    },
    featured: false,
  },
];

export function getAllProjects(): Project[] {
  return [...projects];
}

export function getFeaturedProjects(limit = 3): Project[] {
  return projects.filter((project) => project.featured).slice(0, limit);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
