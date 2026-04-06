import type { Locale } from "@/lib/i18n/config";

export const SITE_CONFIG = {
  siteUrl: "https://portfolio.example.com",
  email: "wogml3270@gmail.com",
  githubUrl: "https://github.com/wogml3270",
  linkedInUrl: "https://www.linkedin.com/in/example",
};

const SITE_COPY: Record<
  Locale,
  {
    siteName: string;
    title: string;
    description: string;
  }
> = {
  ko: {
    siteName: "박재희 Portfolio",
    title: "박재희 | Frontend Portfolio",
    description: "3년차 프론트엔드 개발자의 포트폴리오와 기술 블로그",
  },
  en: {
    siteName: "Jaehee Park Portfolio",
    title: "Jaehee Park | Frontend Portfolio",
    description: "Portfolio and technical blog of a Frontend Developer with 3 years of experience",
  },
  ja: {
    siteName: "パク・ジェヒ Portfolio",
    title: "パク・ジェヒ | Frontend Portfolio",
    description: "フロントエンドエンジニア3年目のポートフォリオと技術ブログ",
  },
};

const HOME_INTRO_BY_LOCALE: Record<
  Locale,
  {
    name: string;
    title: string;
    summary: string;
  }
> = {
  ko: {
    name: "박재희",
    title: "Frontend Developer (3년차)",
    summary:
      "사용자 경험과 유지보수성을 함께 개선하는 프론트엔드 개발자입니다. 제품의 목적과 사용자 맥락을 이해하고, 안정적인 UI 아키텍처를 만드는 데 집중합니다.",
  },
  en: {
    name: "Jaehee Park",
    title: "Frontend Developer (3 Years)",
    summary:
      "I am a Frontend Developer focused on improving user experience and maintainability together. I prioritize stable UI architecture by aligning product goals with user context.",
  },
  ja: {
    name: "パク・ジェヒ",
    title: "フロントエンド開発者（3年目）",
    summary:
      "ユーザー体験と保守性を同時に高めるフロントエンド開発者です。プロダクトの目的とユーザー文脈を理解し、安定したUIアーキテクチャの設計に注力しています。",
  },
};

const ABOUT_SUMMARY_BY_LOCALE: Record<
  Locale,
  {
    experience: string;
    strengths: string[];
    workStyle: string;
  }
> = {
  ko: {
    experience:
      "3년 동안 B2B SaaS와 컨슈머 서비스를 모두 경험하며, 데이터 밀집형 대시보드와 콘텐츠 플랫폼의 UI를 설계하고 운영했습니다.",
    strengths: [
      "도메인 요구사항을 컴포넌트/상태 구조로 명확히 분해",
      "디자인 시스템 기반으로 일관된 화면 품질 유지",
      "성능/접근성/SEO를 개발 초기부터 기본값으로 반영",
    ],
    workStyle:
      "기획-디자인-백엔드와 빠르게 합의할 수 있는 문서화와 커뮤니케이션을 중시합니다. 작은 단위로 배포하고 지표로 검증하는 방식을 선호합니다.",
  },
  en: {
    experience:
      "Over the last 3 years, I have worked across both B2B SaaS and consumer services, designing and operating UI for data-dense dashboards and content platforms.",
    strengths: [
      "Translate domain requirements into clear component and state structures",
      "Maintain visual consistency through design-system-first implementation",
      "Treat performance, accessibility, and SEO as baseline requirements",
    ],
    workStyle:
      "I value clear documentation and communication that help planning, design, and backend teams align quickly. I prefer shipping in small increments and validating with metrics.",
  },
  ja: {
    experience:
      "この3年間でB2B SaaSとコンシューマー向けサービスの両方を経験し、データ密度の高いダッシュボードやコンテンツプラットフォームのUIを設計・運用してきました。",
    strengths: [
      "ドメイン要件をコンポーネント/状態構造へ明確に分解",
      "デザインシステムを軸に画面品質の一貫性を維持",
      "パフォーマンス・アクセシビリティ・SEOを初期段階から標準化",
    ],
    workStyle:
      "企画・デザイン・バックエンドと素早く合意できるドキュメント化とコミュニケーションを重視しています。小さな単位でリリースし、指標で検証する進め方を好みます。",
  },
};

export const TECH_STACK = [
  "TypeScript",
  "React",
  "Next.js",
  "Tailwind CSS",
  "TanStack Query",
  "Zustand",
  "Vitest",
  "Playwright",
];

export function getSiteCopy(locale: Locale) {
  return SITE_COPY[locale];
}

export function getHomeIntro(locale: Locale) {
  return HOME_INTRO_BY_LOCALE[locale];
}

export function getAboutSummary(locale: Locale) {
  return ABOUT_SUMMARY_BY_LOCALE[locale];
}
