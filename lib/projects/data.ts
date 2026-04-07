import type { Locale } from "@/lib/i18n/config";
import type { Project, ProjectLinks } from "@/types/content";

type LocalizedText = Record<Locale, string>;
type LocalizedList = Record<Locale, string[]>;

type ProjectSeed = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  thumbnail: string;
  role: LocalizedText;
  period: string;
  techStack: string[];
  achievements: LocalizedList;
  contributions: LocalizedList;
  links: {
    live?: string;
    repo?: string;
    detail?: string;
  };
  featured: boolean;
};

function toProjectLinks(value: ProjectSeed["links"]): ProjectLinks {
  const links: ProjectLinks = [];

  if (value.live) {
    links.push({ label: "Live", url: value.live });
  }

  if (value.repo) {
    links.push({ label: "Repository", url: value.repo });
  }

  if (value.detail) {
    links.push({ label: "Case Study", url: value.detail });
  }

  return links;
}

const projectSeeds: ProjectSeed[] = [
  {
    slug: "commerce-admin-rebuild",
    title: {
      ko: "커머스 어드민 리빌드",
      en: "Commerce Admin Rebuild",
      ja: "コマース管理画面リビルド",
    },
    summary: {
      ko: "레거시 어드민을 App Router 기반으로 재구성해 초기 로딩과 배포 안정성을 개선한 프로젝트",
      en: "A rebuild of a legacy admin with App Router that improved initial loading performance and release stability.",
      ja: "レガシー管理画面をApp Routerベースで再構築し、初期表示性能とリリース安定性を改善したプロジェクト。",
    },
    thumbnail: "/projects/commerce-admin.svg",
    role: {
      ko: "Frontend Lead",
      en: "Frontend Lead",
      ja: "Frontend Lead",
    },
    period: "2025.03 - 2025.08",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "TanStack Query"],
    achievements: {
      ko: [
        "핵심 페이지 TTFB 평균 28% 개선",
        "런타임 오류 건수 월 40% 감소",
        "팀 내 공통 UI 패턴 문서화 완료",
      ],
      en: [
        "Improved average TTFB by 28% on core pages",
        "Reduced monthly runtime errors by 40%",
        "Completed shared UI pattern documentation across the team",
      ],
      ja: [
        "主要ページの平均TTFBを28%改善",
        "月次ランタイムエラー件数を40%削減",
        "チーム共通UIパターンのドキュメント化を完了",
      ],
    },
    contributions: {
      ko: [
        "라우팅/레이아웃 구조를 도메인 단위로 개편",
        "공통 데이터 패칭 훅/에러 처리 유틸 도입",
        "디자인 토큰 기반 스타일 시스템 정리",
      ],
      en: [
        "Refactored routing and layout by domain boundaries",
        "Introduced shared data fetching hooks and error handling utilities",
        "Reorganized styling around design tokens",
      ],
      ja: [
        "ルーティング/レイアウト構造をドメイン単位で再設計",
        "共通データ取得フックとエラーハンドリングユーティリティを導入",
        "デザイントークン基盤のスタイル体系を整理",
      ],
    },
    links: {
      live: "https://example.com/admin",
      repo: "https://github.com/example/commerce-admin",
      detail: "https://example.com/case-studies/commerce-admin",
    },
    featured: true,
  },
  {
    slug: "content-platform-migration",
    title: {
      ko: "콘텐츠 플랫폼 마이그레이션",
      en: "Content Platform Migration",
      ja: "コンテンツプラットフォーム移行",
    },
    summary: {
      ko: "페이지스 라우터에서 App Router로 전환하며 SEO 메타 구조와 MDX 콘텐츠 파이프라인을 정비한 프로젝트",
      en: "Migrated from Pages Router to App Router while restructuring SEO metadata and the MDX content pipeline.",
      ja: "Pages RouterからApp Routerへ移行し、SEOメタ構造とMDXコンテンツパイプラインを整備したプロジェクト。",
    },
    thumbnail: "/projects/content-platform.svg",
    role: {
      ko: "Frontend Developer",
      en: "Frontend Developer",
      ja: "Frontend Developer",
    },
    period: "2024.08 - 2025.01",
    techStack: ["Next.js", "MDX", "TypeScript", "Vercel"],
    achievements: {
      ko: [
        "블로그 유입 검색 노출 수 35% 증가",
        "콘텐츠 배포 리드타임 50% 단축",
      ],
      en: [
        "Increased blog search impressions by 35%",
        "Reduced content release lead time by 50%",
      ],
      ja: [
        "ブログ流入の検索表示回数を35%増加",
        "コンテンツ公開リードタイムを50%短縮",
      ],
    },
    contributions: {
      ko: [
        "메타데이터 템플릿/동적 생성 로직 구현",
        "콘텐츠 작성 가이드와 템플릿 수립",
        "Sitemap, Robots 자동화",
      ],
      en: [
        "Implemented metadata templates and dynamic metadata generation",
        "Defined content authoring guides and templates",
        "Automated sitemap and robots generation",
      ],
      ja: [
        "メタデータテンプレートと動的生成ロジックを実装",
        "コンテンツ作成ガイドとテンプレートを整備",
        "Sitemapとrobots生成を自動化",
      ],
    },
    links: {
      live: "https://example.com/blog",
      repo: "https://github.com/example/content-platform",
      detail: "https://example.com/case-studies/content-platform",
    },
    featured: true,
  },
  {
    slug: "analytics-dashboard",
    title: {
      ko: "실시간 분석 대시보드",
      en: "Real-time Analytics Dashboard",
      ja: "リアルタイム分析ダッシュボード",
    },
    summary: {
      ko: "대용량 지표를 다루는 대시보드 UI를 설계해 실무자가 핵심 지표를 빠르게 해석할 수 있도록 개선",
      en: "Designed a dashboard UI for high-volume metrics so operators could interpret key indicators faster.",
      ja: "大量指標を扱うダッシュボードUIを設計し、実務担当者が主要指標を素早く把握できるよう改善。",
    },
    thumbnail: "/projects/analytics-dashboard.svg",
    role: {
      ko: "Frontend Developer",
      en: "Frontend Developer",
      ja: "Frontend Developer",
    },
    period: "2023.11 - 2024.05",
    techStack: ["React", "TypeScript", "Zustand", "ECharts"],
    achievements: {
      ko: [
        "대시보드 상호작용 속도 체감 개선",
        "신규 지표 카드 개발 생산성 향상",
      ],
      en: [
        "Improved perceived dashboard interaction speed",
        "Increased development productivity for new metric cards",
      ],
      ja: [
        "ダッシュボード操作の体感速度を改善",
        "新規指標カード開発の生産性を向上",
      ],
    },
    contributions: {
      ko: [
        "차트/필터/테이블 컴포넌트 구조 재정의",
        "전역 상태와 URL 상태 동기화 패턴 도입",
        "키보드 내비게이션 접근성 개선",
      ],
      en: [
        "Redesigned architecture for chart, filter, and table components",
        "Introduced synchronization patterns between global state and URL state",
        "Improved keyboard navigation accessibility",
      ],
      ja: [
        "チャート/フィルター/テーブルのコンポーネント構造を再定義",
        "グローバル状態とURL状態の同期パターンを導入",
        "キーボードナビゲーションのアクセシビリティを改善",
      ],
    },
    links: {
      live: "https://example.com/analytics",
      repo: "https://github.com/example/analytics-dashboard",
      detail: "https://example.com/case-studies/analytics-dashboard",
    },
    featured: true,
  },
  {
    slug: "internal-design-system",
    title: {
      ko: "사내 디자인 시스템 v1",
      en: "Internal Design System v1",
      ja: "社内デザインシステム v1",
    },
    summary: {
      ko: "여러 제품에서 재사용 가능한 UI 컴포넌트와 문서 사이트를 구축한 프로젝트",
      en: "Built reusable UI components and a documentation site used across multiple products.",
      ja: "複数プロダクトで再利用可能なUIコンポーネントとドキュメントサイトを構築したプロジェクト。",
    },
    thumbnail: "/projects/design-system.svg",
    role: {
      ko: "Frontend Developer",
      en: "Frontend Developer",
      ja: "Frontend Developer",
    },
    period: "2023.04 - 2023.09",
    techStack: ["React", "TypeScript", "Storybook", "Chromatic"],
    achievements: {
      ko: ["UI 불일치 이슈 감소", "신규 화면 개발 시간 단축"],
      en: ["Reduced UI inconsistency issues", "Shortened lead time for new screen development"],
      ja: ["UI不一致の課題を削減", "新規画面開発の所要時間を短縮"],
    },
    contributions: {
      ko: [
        "버튼/폼/레이아웃 등 기반 컴포넌트 설계",
        "접근성 체크리스트와 QA 기준 수립",
      ],
      en: [
        "Designed foundational components including buttons, forms, and layouts",
        "Established accessibility checklist and QA criteria",
      ],
      ja: [
        "ボタン/フォーム/レイアウトなど基盤コンポーネントを設計",
        "アクセシビリティチェックリストとQA基準を策定",
      ],
    },
    links: {
      repo: "https://github.com/example/design-system",
      detail: "https://example.com/case-studies/design-system",
    },
    featured: false,
  },
];

function toLocalizedProject(seed: ProjectSeed, locale: Locale): Project {
  return {
    slug: seed.slug,
    title: seed.title[locale],
    summary: seed.summary[locale],
    thumbnail: seed.thumbnail,
    role: seed.role[locale],
    period: seed.period,
    techStack: seed.techStack,
    achievements: seed.achievements[locale],
    contributions: seed.contributions[locale],
    links: toProjectLinks(seed.links),
    featured: seed.featured,
  };
}

export function getAllProjects(locale: Locale): Project[] {
  return projectSeeds.map((project) => toLocalizedProject(project, locale));
}

export function getFeaturedProjects(locale: Locale, limit = 3): Project[] {
  return getAllProjects(locale).filter((project) => project.featured).slice(0, limit);
}

export function getProjectBySlug(slug: string, locale: Locale): Project | undefined {
  const project = projectSeeds.find((item) => item.slug === slug);
  return project ? toLocalizedProject(project, locale) : undefined;
}
