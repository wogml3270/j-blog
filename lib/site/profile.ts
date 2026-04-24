import type { Locale } from "@/lib/i18n/config";
import type { AboutTechItem } from "@/types/about";

export const SITE_CONFIG = {
  siteUrl: "https://j-fe-blog.vercel.app",
  email: "wogml3270@gmail.com",
  githubUrl: "https://github.com/wogml3270",
};

// 링크 공유(OG/Twitter)에서 모든 페이지에 공통으로 노출할 기본 카드 정보다.
export const SHARE_CARD_CONFIG = {
  title: "박재희 | Frontend Portfolio",
  description: "3년차 프론트엔드 개발자의 포트폴리오",
  imagePath: "/PJH-about.png",
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
    description: "3년차 프론트엔드 개발자의 포트폴리오",
  },
  en: {
    siteName: "Jaehee Park Portfolio",
    title: "박재희 | Frontend Portfolio",
    description: "3년차 프론트엔드 개발자의 포트폴리오",
  },
  ja: {
    siteName: "パク・ジェヒ Portfolio",
    title: "박재희 | Frontend Portfolio",
    description: "3년차 프론트엔드 개발자의 포트폴리오",
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

export const DEFAULT_ABOUT_PHOTO_URL = "/PJH-about.png";

export const DEFAULT_ABOUT_TECH_ITEMS: AboutTechItem[] = [
  {
    category: "frontend",
    name: "React",
    description: "컴포넌트 중심 UI 설계와 상태 분리를 구조적으로 관리합니다.",
    logoUrl: "https://cdn.simpleicons.org/react/61DAFB",
  },
  {
    category: "frontend",
    name: "Next.js",
    description: "App Router 기반 SSR/SEO 최적화와 서버-클라이언트 경계를 설계합니다.",
    logoUrl: "https://cdn.simpleicons.org/nextdotjs/FFFFFF",
  },
  {
    category: "frontend",
    name: "TypeScript",
    description: "도메인 타입을 먼저 정의해 런타임 오류를 빌드 타임에 줄입니다.",
    logoUrl: "https://cdn.simpleicons.org/typescript/3178C6",
  },
  {
    category: "frontend",
    name: "Tailwind CSS",
    description: "디자인 토큰과 유틸리티 패턴으로 빠르게 일관된 화면을 구현합니다.",
    logoUrl: "https://cdn.simpleicons.org/tailwindcss/06B6D4",
  },
  {
    category: "infrastructure",
    name: "AWS",
    description: "배포/스토리지/운영 환경을 서비스 요구사항에 맞게 구성합니다.",
    logoUrl: "https://cdn.simpleicons.org/amazonwebservices/FF9900",
  },
  {
    category: "database",
    name: "Supabase",
    description: "Postgres/RLS/Auth를 활용해 실서비스 운영 흐름을 안정적으로 구축합니다.",
    logoUrl: "https://cdn.simpleicons.org/supabase/3FCF8E",
  },
];

export function getSiteCopy(locale: Locale) {
  return SITE_COPY[locale];
}

export function getHomeIntro(locale: Locale) {
  return HOME_INTRO_BY_LOCALE[locale];
}
