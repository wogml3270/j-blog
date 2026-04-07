import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const projects = [
  {
    slug: "commerce-admin-rebuild",
    title: "커머스 어드민 리빌드",
    summary: "레거시 어드민을 App Router 기반으로 재구성해 초기 로딩과 배포 안정성을 개선한 프로젝트",
    thumbnail: "/projects/commerce-admin.svg",
    role: "Frontend Lead",
    period: "2025.03 - 2025.08",
    tech_stack: ["Next.js", "TypeScript", "Tailwind CSS", "TanStack Query"],
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
    status: "published",
  },
  {
    slug: "content-platform-migration",
    title: "콘텐츠 플랫폼 마이그레이션",
    summary: "페이지스 라우터에서 App Router로 전환하며 SEO 메타 구조와 MDX 콘텐츠 파이프라인을 정비한 프로젝트",
    thumbnail: "/projects/content-platform.svg",
    role: "Frontend Developer",
    period: "2024.08 - 2025.01",
    tech_stack: ["Next.js", "MDX", "TypeScript", "Vercel"],
    achievements: ["블로그 유입 검색 노출 수 35% 증가", "콘텐츠 배포 리드타임 50% 단축"],
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
    status: "published",
  },
  {
    slug: "analytics-dashboard",
    title: "실시간 분석 대시보드",
    summary: "대용량 지표를 다루는 대시보드 UI를 설계해 실무자가 핵심 지표를 빠르게 해석할 수 있도록 개선",
    thumbnail: "/projects/analytics-dashboard.svg",
    role: "Frontend Developer",
    period: "2023.11 - 2024.05",
    tech_stack: ["React", "TypeScript", "Zustand", "ECharts"],
    achievements: ["대시보드 상호작용 속도 체감 개선", "신규 지표 카드 개발 생산성 향상"],
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
    status: "published",
  },
];

const profile = {
  id: 1,
  name: "박재희",
  title: "Frontend Developer (3년차)",
  summary:
    "사용자 경험과 유지보수성을 함께 개선하는 프론트엔드 개발자입니다. 제품의 목적과 사용자 맥락을 이해하고, 안정적인 UI 아키텍처를 만드는 데 집중합니다.",
  about_intro_description_ko:
    "사용자 중심 UI 구현과 유지보수 가능한 구조 설계를 중요하게 생각합니다.",
  tech_stack: [
    "TypeScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "TanStack Query",
    "Zustand",
    "Vitest",
    "Playwright",
  ],
  about_experience:
    "3년 동안 B2B SaaS와 컨슈머 서비스를 모두 경험하며, 데이터 밀집형 대시보드와 콘텐츠 플랫폼의 UI를 설계하고 운영했습니다.",
  strengths: [
    "도메인 요구사항을 컴포넌트/상태 구조로 명확히 분해",
    "디자인 시스템 기반으로 일관된 화면 품질 유지",
    "성능/접근성/SEO를 개발 초기부터 기본값으로 반영",
  ],
  work_style:
    "기획-디자인-백엔드와 빠르게 합의할 수 있는 문서화와 커뮤니케이션을 중시합니다. 작은 단위로 배포하고 지표로 검증하는 방식을 선호합니다.",
  status: "published",
};

function parseMdxMetadata(source) {
  const match = source.match(/export const metadata = ({[\s\S]*?});/);

  if (!match) {
    return null;
  }

  const metadata = Function(`"use strict"; return (${match[1]});`)();
  const body = source.slice(match.index + match[0].length).trim();

  const markdown = body
    .replace(/<h([2-4]) id="[^"]*">([^<]+)<\/h\1>/g, (_, level, text) =>
      `${"#".repeat(Number(level))} ${text}`,
    )
    .replace(/<[^>]+>/g, "")
    .trim();

  return {
    metadata,
    markdown,
  };
}

async function ensureAllowlist() {
  const envEmails = (process.env.ADMIN_ALLOWED_EMAILS ?? "wogml3270@gmail.com")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const rows = [...new Set(envEmails)].map((email, index) => ({
    email,
    is_super_admin: index === 0,
  }));

  const { error } = await supabase
    .from("admin_allowlist")
    .upsert(rows, { onConflict: "email" });

  if (error) {
    throw error;
  }
}

async function seedProfile() {
  const { error } = await supabase
    .from("profile_content")
    .upsert(profile, { onConflict: "id" });

  if (error) {
    throw error;
  }
}

async function seedProjects() {
  const { error } = await supabase.from("projects").upsert(projects, { onConflict: "slug" });

  if (error) {
    throw error;
  }
}

async function syncPostTags(postId, tags) {
  const normalized = [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))];

  await supabase.from("post_tag_map").delete().eq("post_id", postId);

  if (normalized.length === 0) {
    return;
  }

  const { data: tagRows, error: tagError } = await supabase
    .from("post_tags")
    .upsert(normalized.map((name) => ({ name })), { onConflict: "name" })
    .select("id");

  if (tagError || !tagRows) {
    throw tagError ?? new Error("Failed to upsert tags");
  }

  const tagIds = tagRows.map((item) => item.id).filter(Boolean);

  if (tagIds.length === 0) {
    return;
  }

  const { error: mapError } = await supabase
    .from("post_tag_map")
    .insert(tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })));

  if (mapError) {
    throw mapError;
  }
}

async function seedPostsFromMdx() {
  const contentDir = path.join(process.cwd(), "content", "blog");
  const files = (await fs.readdir(contentDir)).filter((file) => file.endsWith(".mdx"));

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const source = await fs.readFile(filePath, "utf8");
    const parsed = parseMdxMetadata(source);

    if (!parsed) {
      continue;
    }

    const { metadata, markdown } = parsed;

    const { data, error } = await supabase
      .from("posts")
      .upsert(
        {
          slug: metadata.slug,
          title: metadata.title,
          description: metadata.description,
          body_markdown: markdown,
          reading_time: metadata.readingTime ?? "5분",
          status: "published",
          published_at: metadata.date,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error(`Failed to upsert post: ${metadata.slug}`);
    }

    await syncPostTags(data.id, metadata.tags ?? []);
  }
}

async function run() {
  await ensureAllowlist();
  await seedProfile();
  await seedProjects();
  await seedPostsFromMdx();

  console.log("Supabase seed completed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
