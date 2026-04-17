import { promises as fs } from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();
const DOC_GROUPS = [
  { key: "worklog", dir: path.join(REPO_ROOT, "docs", "worklogs") },
  { key: "refactor", dir: path.join(REPO_ROOT, "docs", "refector") },
];
const OUTPUT_PATH = path.join(REPO_ROOT, "supabase", "v2", "schema-v2.1.3-docs-blog-reseed.sql");
const TRANSLATION_EN_PATH = path.join(REPO_ROOT, "data", "blog-seed-translations.en.json");
const TRANSLATION_JA_PATH = path.join(REPO_ROOT, "data", "blog-seed-translations.ja.json");
const TAG_OVERRIDES_PATH = path.join(REPO_ROOT, "data", "blog-seed-tag-overrides.json");
const DEFAULT_THUMBNAIL = "/blog/default-thumbnail.svg";
const FIXED_TIME_UTC = "T00:00:00Z";

const TAXONOMY = [
  "i18n",
  "seo",
  "supabase",
  "vercel",
  "admin",
  "ui-ux",
  "animation",
  "refactor",
  "database",
  "auth",
  "deployment",
  "performance",
  "bugfix",
  "monitoring",
  "workflow",
];

const TAXONOMY_SET = new Set(TAXONOMY);

const JA_TAG_MAP = {
  i18n: "多言語対応",
  seo: "SEO",
  supabase: "Supabase",
  vercel: "Vercel",
  admin: "管理者",
  "ui-ux": "UI/UX",
  animation: "アニメーション",
  refactor: "リファクタリング",
  database: "データベース",
  auth: "認証",
  deployment: "デプロイ",
  performance: "パフォーマンス",
  bugfix: "バグ修正",
  monitoring: "モニタリング",
  workflow: "ワークフロー",
};

const EN_TAG_MAP = Object.fromEntries(TAXONOMY.map((tag) => [tag, tag]));
const JA_ALLOWED_TAGS = new Set(Object.values(JA_TAG_MAP));

const EN_REPLACERS = [
  ["작업일지", "Worklog"],
  ["관리자", "Admin"],
  ["문의", "Contact"],
  ["블로그", "Blog"],
  ["프로젝트", "Project"],
  ["리팩토링", "Refactoring"],
  ["페이지네이션", "Pagination"],
  ["다국어", "Localization"],
  ["테마", "Theme"],
  ["성능", "Performance"],
  ["배포", "Deployment"],
  ["검색", "Search"],
  ["오류", "Error"],
  ["해결", "Fix"],
  ["소개", "About"],
  ["하이라이트", "Highlight"],
  ["스토리지", "Storage"],
  ["스키마", "Schema"],
  ["검증", "Validation"],
  ["적용", "Apply"],
  ["구현", "Implement"],
  ["계획", "Plan"],
  ["기술 스택", "Tech Stack"],
  ["반응형", "Responsive"],
  ["로그인", "Login"],
  ["권한", "Authorization"],
  ["상태", "Status"],
  ["공개", "Published"],
  ["비공개", "Private"],
  ["기본값", "Default"],
  ["수정", "Update"],
  ["추가", "Add"],
  ["삭제", "Delete"],
  ["연동", "Integration"],
  ["개선", "Improvement"],
  ["정리", "Cleanup"],
];

const JA_REPLACERS = [
  ["작업일지", "作業ログ"],
  ["관리자", "管理者"],
  ["문의", "お問い合わせ"],
  ["블로그", "ブログ"],
  ["프로젝트", "プロジェクト"],
  ["리팩토링", "リファクタリング"],
  ["페이지네이션", "ページネーション"],
  ["다국어", "多言語"],
  ["테마", "テーマ"],
  ["성능", "パフォーマンス"],
  ["배포", "デプロイ"],
  ["검색", "検索"],
  ["오류", "エラー"],
  ["해결", "解決"],
  ["소개", "紹介"],
  ["하이라이트", "ハイライト"],
  ["스토리지", "ストレージ"],
  ["스키마", "スキーマ"],
  ["검증", "検証"],
  ["적용", "適用"],
  ["구현", "実装"],
  ["계획", "計画"],
  ["기술 스택", "技術スタック"],
  ["반응형", "レスポンシブ"],
  ["로그인", "ログイン"],
  ["권한", "権限"],
  ["상태", "状態"],
  ["공개", "公開"],
  ["비공개", "非公開"],
  ["기본값", "デフォルト"],
  ["수정", "修正"],
  ["추가", "追加"],
  ["삭제", "削除"],
  ["연동", "連携"],
  ["개선", "改善"],
  ["정리", "整理"],
];

const TAG_RULES = [
  { tag: "i18n", patterns: [/\bi18n\b/i, /locale/i, /다국어/, /국제화/, /번역/] },
  { tag: "seo", patterns: [/seo/i, /sitemap/i, /robots/i, /metadata/i, /hreflang/i, /canonical/i] },
  { tag: "supabase", patterns: [/supabase/i, /postgres/i, /rls/i, /storage/i, /수파베이스/] },
  { tag: "vercel", patterns: [/vercel/i, /vercel\.app/i, /alias/i, /domain/i] },
  { tag: "admin", patterns: [/관리자/, /admin/i, /dashboard/i, /문의함/] },
  { tag: "ui-ux", patterns: [/ui/i, /ux/i, /레이아웃/, /디자인/, /컴포넌트/, /responsive/i, /반응형/] },
  { tag: "animation", patterns: [/animation/i, /motion/i, /transition/i, /애니메이션/, /모션/] },
  { tag: "refactor", patterns: [/refactor/i, /리팩토링/, /구조\s*개편/, /정리/] },
  { tag: "database", patterns: [/\bdb\b/i, /database/i, /schema/i, /migration/i, /sql/i, /테이블/] },
  { tag: "auth", patterns: [/auth/i, /oauth/i, /login/i, /로그인/, /권한/] },
  { tag: "deployment", patterns: [/deploy/i, /배포/, /pipeline/i, /production/i, /운영/] },
  { tag: "performance", patterns: [/cache/i, /hydration/i, /성능/, /최적화/, /속도/] },
  { tag: "bugfix", patterns: [/error/i, /bug/i, /fix/i, /오류/, /에러/, /해결/] },
  { tag: "monitoring", patterns: [/monitor/i, /로그/, /log/i, /추적/, /장애/] },
  { tag: "workflow", patterns: [/worklog/i, /작업일지/, /plan/i, /계획/, /절차/] },
];

// SQL 리터럴 내 작은따옴표를 안전하게 이스케이프한다.
function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

// 긴 markdown/개행은 달러쿼트로 감싸 SQL Editor 붙여넣기 안정성을 확보한다.
function sqlDollarQuoted(value, tagPrefix = "txt") {
  const normalized = String(value ?? "");
  let suffix = 0;
  let tag = tagPrefix;

  while (normalized.includes(`$${tag}$`)) {
    suffix += 1;
    tag = `${tagPrefix}${suffix}`;
  }

  return `$${tag}$${normalized}$${tag}$`;
}

// text[] 리터럴 출력 전에 trim/중복/빈값을 정리한다.
function sqlTextArray(values) {
  const unique = [...new Set(values.map((item) => item.trim()).filter(Boolean))];

  if (unique.length === 0) {
    return "ARRAY[]::text[]";
  }

  return `ARRAY[${unique.map(sqlLiteral).join(", ")}]::text[]`;
}

function isMarkdownFile(filePath) {
  const lower = filePath.toLowerCase();
  return lower.endsWith(".md") || lower.endsWith(".markdown");
}

async function collectMarkdownFiles(baseDir) {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && isMarkdownFile(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

// 앱의 normalizeSlug 정책(공백/구분자 -> _, 한글/영문/숫자/_ 허용)과 동일한 규칙을 사용한다.
function normalizeSlugValue(value) {
  const normalized = value.normalize("NFKC").trim();

  if (!normalized) {
    return "";
  }

  return normalized
    .replace(/[\s\-–—/\\|.,:;+=]+/g, "_")
    .replace(/[^A-Za-z0-9\p{Script=Hangul}_]/gu, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function extractDateFromPath(filePath) {
  const match = filePath.match(/\/(\d{4}-\d{2}-\d{2})\//);
  return match ? match[1] : "2026-01-01";
}

// 작업일지 접두(날짜 포함)를 제거해 공개 제목을 자연스럽게 정리한다.
function stripWorklogPrefix(rawTitle) {
  const title = rawTitle.trim();

  // 예: 작업일지 - 2026-04-06 (주제)
  const withParens = title.match(
    /^작업\s*일지\s*[-:]\s*\d{4}[./_-]\d{2}[./_-]\d{2}\s*\((.+)\)\s*$/i,
  );

  if (withParens?.[1]?.trim()) {
    return withParens[1].trim();
  }

  // 예: 작업일지 - 2026-04-06 주제
  const withDate = title.match(/^작업\s*일지\s*[-:]\s*\d{4}[./_-]\d{2}[./_-]\d{2}\s*(.+)?$/i);

  if (withDate) {
    return (withDate[1] ?? "").trim();
  }

  // 예: 작업일지 (2026-04-07) 주제
  const withDateInParens = title.match(
    /^작업\s*일지\s*\(\s*\d{4}[./_-]\d{2}[./_-]\d{2}\s*\)\s*[-:：]?\s*(.+)?$/i,
  );

  if (withDateInParens) {
    return (withDateInParens[1] ?? "").trim();
  }

  // 예: 작업일지 - 주제
  const genericPrefix = title.match(/^작업\s*일지\s*[-:]\s*(.+)$/i);

  if (genericPrefix?.[1]?.trim()) {
    return genericPrefix[1].trim();
  }

  return title;
}

function prettifyFileNameTitle(fileName) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/^작업일지[-_\s]*/i, "")
    .replace(/^\d{4}[-_.]\d{2}[-_.]\d{2}[-_\s]*/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(markdown, fileName) {
  const heading = markdown.match(/^#\s+(.+)$/m);

  if (heading?.[1]?.trim()) {
    const stripped = stripWorklogPrefix(heading[1]);

    if (stripped) {
      return stripped;
    }
  }

  const fallback = prettifyFileNameTitle(fileName);
  return fallback || fileName.replace(/\.[^.]+$/, "").replace(/-/g, " ").trim();
}

function extractDescription(markdown, title) {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line.startsWith("#")) {
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("```")) {
      continue;
    }

    const compact = line.replace(/\s+/g, " ").trim();

    if (!compact) {
      continue;
    }

    return compact.length > 160 ? `${compact.slice(0, 157)}...` : compact;
  }

  return `${title} 작업 내용을 정리한 기록입니다.`;
}

function hasHangul(text) {
  return /[\u3131-\uD79D]/.test(text);
}

function applyReplacers(text, replacers) {
  let out = text;

  for (const [from, to] of replacers) {
    out = out.replace(new RegExp(from, "g"), to);
  }

  return out;
}

function toEnglishText(text) {
  const replaced = applyReplacers(text, EN_REPLACERS);

  if (!hasHangul(replaced)) {
    return replaced;
  }

  return replaced
    .replace(/변경 사항/g, "Changes")
    .replace(/검증/g, "Validation")
    .replace(/목표/g, "Goal")
    .replace(/요약/g, "Summary")
    .replace(/작업 내용/g, "work details")
    .replace(/기준/g, "criteria")
    .replace(/추가/g, "add")
    .replace(/수정/g, "update");
}

function toJapaneseText(text) {
  const replaced = applyReplacers(text, JA_REPLACERS);

  if (!hasHangul(replaced)) {
    return replaced;
  }

  return replaced
    .replace(/변경 사항/g, "変更内容")
    .replace(/검증/g, "検証")
    .replace(/목표/g, "目標")
    .replace(/요약/g, "要約")
    .replace(/작업 내용/g, "作業内容")
    .replace(/기준/g, "基準")
    .replace(/추가/g, "追加")
    .replace(/수정/g, "修正");
}

function extractKeyBulletLines(markdown, max = 8) {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ") || line.startsWith("* "))
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);

  return lines.slice(0, max);
}

function buildBootstrapTranslation(locale, source) {
  const localize = locale === "en" ? toEnglishText : toJapaneseText;
  const sectionOverview = locale === "en" ? "Overview" : "概要";
  const sectionUpdates = locale === "en" ? "Key Updates" : "主な更新";
  const sectionNotes = locale === "en" ? "Notes" : "補足";
  const sectionOriginal = locale === "en" ? "Original Korean Source" : "韓国語の原文";
  const noteLine =
    locale === "en"
      ? "This localized post preserves the original technical intent and structure."
      : "このローカライズ版は、元の技術的意図と構成を維持しています。";

  const bullets = extractKeyBulletLines(source.bodyMarkdown)
    .map((line) => `- ${localize(line)}`)
    .join("\n");

  return {
    title: localize(source.title),
    description: localize(source.description),
    bodyMarkdown: `# ${localize(source.title)}\n\n## ${sectionOverview}\n${localize(
      source.description,
    )}\n\n## ${sectionUpdates}\n${bullets || (locale === "en" ? "- Details are organized in this update." : "- 更新内容を整理して記録しました。")}\n\n## ${sectionNotes}\n${noteLine}\n\n---\n\n## ${sectionOriginal}\n\n${source.bodyMarkdown}`,
  };
}

function mapLocaleTags(locale, baseTags) {
  if (locale === "en") {
    return baseTags.map((tag) => EN_TAG_MAP[tag]);
  }

  return baseTags.map((tag) => JA_TAG_MAP[tag]);
}

async function readJsonFile(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function ensureRange(value, min, max, field, slug) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`[${slug}] ${field} length must be ${min}..${max}`);
  }
}

function inferTaxonomyTags({ groupKey, title, markdown, filePath }) {
  const haystack = `${title}\n${markdown}\n${filePath}`.toLowerCase();
  const selected = new Set();

  if (groupKey === "refactor") {
    selected.add("refactor");
  } else {
    selected.add("workflow");
  }

  for (const rule of TAG_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      selected.add(rule.tag);
    }
  }

  const preferredOrder = [
    "workflow",
    "refactor",
    "admin",
    "supabase",
    "database",
    "auth",
    "ui-ux",
    "animation",
    "seo",
    "deployment",
    "vercel",
    "performance",
    "bugfix",
    "monitoring",
    "i18n",
  ];

  const ordered = preferredOrder.filter((tag) => selected.has(tag));

  while (ordered.length < 3) {
    const filler = preferredOrder.find((tag) => !ordered.includes(tag));
    if (!filler) {
      break;
    }
    ordered.push(filler);
  }

  return ordered.slice(0, 6);
}

function applyTagOverrides(baseTags, override, slug) {
  if (!override) {
    return baseTags;
  }

  if (override.replace) {
    if (!Array.isArray(override.replace)) {
      throw new Error(`[${slug}] tag override.replace must be string[]`);
    }
    return [...new Set(override.replace.map((tag) => String(tag).trim()).filter(Boolean))];
  }

  const merged = [...baseTags];

  if (override.add) {
    if (!Array.isArray(override.add)) {
      throw new Error(`[${slug}] tag override.add must be string[]`);
    }

    for (const tag of override.add) {
      const normalized = String(tag).trim();
      if (normalized && !merged.includes(normalized)) {
        merged.push(normalized);
      }
    }
  }

  return merged.slice(0, 6);
}

function validateTaxonomyTags(tags, slug) {
  ensureRange(tags.length, 3, 6, "KO tags", slug);

  for (const tag of tags) {
    if (!TAXONOMY_SET.has(tag)) {
      throw new Error(`[${slug}] KO tag is outside fixed taxonomy: ${tag}`);
    }
  }
}

function validateLocalizedTags(tags, slug, locale) {
  ensureRange(tags.length, 3, 6, `${locale} tags`, slug);

  const allowed = locale === "en" ? new Set(TAXONOMY) : JA_ALLOWED_TAGS;

  for (const tag of tags) {
    if (!allowed.has(tag)) {
      throw new Error(`[${slug}] ${locale} tag is outside allowed taxonomy: ${tag}`);
    }
  }
}

function buildUniqueSlug(title, fileName, usedSlugs) {
  const base =
    normalizeSlugValue(title) || normalizeSlugValue(fileName.replace(/\.[^.]+$/, "")) || "post";

  let slug = base;
  let suffix = 1;

  while (usedSlugs.has(slug)) {
    suffix += 1;
    slug = `${base}_${suffix}`;
  }

  usedSlugs.add(slug);
  return slug;
}

async function buildBaseRows() {
  const rows = [];
  const usedSlugs = new Set();
  const overrides = await readJsonFile(TAG_OVERRIDES_PATH, {});

  for (const group of DOC_GROUPS) {
    const files = (await collectMarkdownFiles(group.dir)).sort();

    for (const filePath of files) {
      const markdown = (await fs.readFile(filePath, "utf8")).trim();
      const fileName = path.basename(filePath);
      const date = extractDateFromPath(filePath);
      const title = extractTitle(markdown, fileName);
      const description = extractDescription(markdown, title);
      const slug = buildUniqueSlug(title, fileName, usedSlugs);
      const inferred = inferTaxonomyTags({
        groupKey: group.key,
        title,
        markdown,
        filePath,
      });
      const tags = applyTagOverrides(inferred, overrides[slug], slug);

      validateTaxonomyTags(tags, slug);

      rows.push({
        groupKey: group.key,
        date,
        filePath,
        fileName,
        slug,
        title,
        description,
        bodyMarkdown: markdown,
        tags,
        thumbnail: DEFAULT_THUMBNAIL,
        publishedAt: `${date}${FIXED_TIME_UTC}`,
      });
    }
  }

  return rows;
}

function buildBootstrapMap(rows, locale) {
  const map = {};

  for (const row of rows) {
    const translated = buildBootstrapTranslation(locale, row);
    map[row.slug] = {
      ...translated,
      tags: mapLocaleTags(locale, row.tags),
    };
  }

  return map;
}

async function bootstrapTranslationFiles(rows) {
  const enMap = buildBootstrapMap(rows, "en");
  const jaMap = buildBootstrapMap(rows, "ja");

  await writeJsonFile(TRANSLATION_EN_PATH, enMap);
  await writeJsonFile(TRANSLATION_JA_PATH, jaMap);

  console.log(`[generate-docs-blog-reseed-sql] bootstrap translations written (${rows.length} rows)`);
}

async function readTranslationFile(filePath, locale) {
  const raw = await fs.readFile(filePath, "utf8");
  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`[${locale}] translation JSON parse error: ${error}`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`[${locale}] translation file must be an object keyed by slug`);
  }

  return parsed;
}

function resolveTranslation(row, locale, map) {
  const item = map[row.slug];

  if (!item || typeof item !== "object") {
    throw new Error(`[${locale}] missing translation for slug: ${row.slug}`);
  }

  const title = String(item.title ?? "").trim();
  const description = String(item.description ?? "").trim();
  const bodyMarkdown = String(item.bodyMarkdown ?? "").trim();
  const tags = Array.isArray(item.tags)
    ? [...new Set(item.tags.map((tag) => String(tag).trim()).filter(Boolean))]
    : [];

  if (!title || !description || !bodyMarkdown) {
    throw new Error(`[${locale}] translation fields(title/description/bodyMarkdown) are required: ${row.slug}`);
  }

  if (bodyMarkdown === row.bodyMarkdown) {
    throw new Error(`[${locale}] bodyMarkdown must be localized (same as KO): ${row.slug}`);
  }

  const minBodyLength = Math.max(120, Math.floor(row.bodyMarkdown.length * 0.35));

  if (bodyMarkdown.length < minBodyLength) {
    throw new Error(`[${locale}] bodyMarkdown is too short: ${row.slug}`);
  }

  validateLocalizedTags(tags, row.slug, locale);

  return {
    title,
    description,
    bodyMarkdown,
    tags,
  };
}

function toSqlValuesRows(rows, pickColumns) {
  return rows.map((row) => `  (${pickColumns(row).join(", ")})`).join(",\n");
}

function buildSql(rows) {
  const postValues = toSqlValuesRows(rows, (row) => [
    sqlLiteral(row.slug),
    sqlDollarQuoted(row.title, "title"),
    sqlDollarQuoted(row.description, "desc"),
    sqlLiteral(row.thumbnail),
    sqlDollarQuoted(row.bodyMarkdown, "body"),
    "'published'",
    sqlLiteral(row.publishedAt),
    "false",
    "true",
    "false",
  ]);

  const tagValues = [...new Set(rows.flatMap((row) => row.tags))]
    .map((tag) => `  (${sqlLiteral(tag)})`)
    .join(",\n");

  const mappingValues = toSqlValuesRows(rows, (row) => [sqlLiteral(row.slug), sqlTextArray(row.tags)]);

  const enValues = toSqlValuesRows(rows, (row) => [
    sqlLiteral(row.slug),
    sqlDollarQuoted(row.en.title, "en_title"),
    sqlDollarQuoted(row.en.description, "en_desc"),
    sqlDollarQuoted(row.en.bodyMarkdown, "en_body"),
    sqlTextArray(row.en.tags),
  ]);

  const jaValues = toSqlValuesRows(rows, (row) => [
    sqlLiteral(row.slug),
    sqlDollarQuoted(row.ja.title, "ja_title"),
    sqlDollarQuoted(row.ja.description, "ja_desc"),
    sqlDollarQuoted(row.ja.bodyMarkdown, "ja_body"),
    sqlTextArray(row.ja.tags),
  ]);

  return `-- Schema Version: v2.1.3
-- Created At: 2026-04-17
-- Purpose:
--   - docs/worklogs + docs/refector 기반 블로그 실데이터 전면 교체
--   - slug: 제목 기반 _ 포맷, tags: 고정 택소노미, EN/JA 완전 번역 반영

begin;

-- 기존 블로그 데이터 전체 교체
delete from public.post_tag_map;
delete from public.posts_en;
delete from public.posts_ja;
delete from public.posts;
delete from public.post_tags;

with seeded_posts as (
  insert into public.posts (
    slug,
    title,
    description,
    thumbnail,
    body_markdown,
    status,
    published_at,
    featured,
    use_markdown_editor,
    sync_slug_with_title
  )
  values
${postValues}
  returning id, slug
)
insert into public.post_tags (name)
values
${tagValues}
on conflict (name) do nothing;

with seeded_posts as (
  select id, slug
  from public.posts
)
insert into public.post_tag_map (post_id, tag_id)
select
  p.id as post_id,
  t.id as tag_id
from seeded_posts p
join (
  values
${mappingValues}
) as src(slug, tags) on src.slug = p.slug
join lateral unnest(src.tags) as tag_name(name) on true
join public.post_tags t on t.name = tag_name.name
on conflict (post_id, tag_id) do nothing;

with seeded_posts as (
  select id, slug
  from public.posts
)
insert into public.posts_en (
  post_id,
  title,
  description,
  body_markdown,
  tags
)
select
  p.id,
  src.title,
  src.description,
  src.body_markdown,
  src.tags
from seeded_posts p
join (
  values
${enValues}
) as src(slug, title, description, body_markdown, tags)
  on src.slug = p.slug
on conflict (post_id) do update
set
  title = excluded.title,
  description = excluded.description,
  body_markdown = excluded.body_markdown,
  tags = excluded.tags,
  updated_at = timezone('utc', now());

with seeded_posts as (
  select id, slug
  from public.posts
)
insert into public.posts_ja (
  post_id,
  title,
  description,
  body_markdown,
  tags
)
select
  p.id,
  src.title,
  src.description,
  src.body_markdown,
  src.tags
from seeded_posts p
join (
  values
${jaValues}
) as src(slug, title, description, body_markdown, tags)
  on src.slug = p.slug
on conflict (post_id) do update
set
  title = excluded.title,
  description = excluded.description,
  body_markdown = excluded.body_markdown,
  tags = excluded.tags,
  updated_at = timezone('utc', now());

insert into public.schema_migrations (version, description)
values ('v2.1.3', 'docs 기반 블로그 품질 재시드(slug/tag/EN/JA full translation)')
on conflict (version) do update
set description = excluded.description;

commit;
`;
}

async function run() {
  const rows = await buildBaseRows();

  if (rows.length === 0) {
    throw new Error("No markdown docs found for reseed.");
  }

  const bootstrapMode = process.argv.includes("--bootstrap-translations");

  if (bootstrapMode) {
    await bootstrapTranslationFiles(rows);
    return;
  }

  const enMap = await readTranslationFile(TRANSLATION_EN_PATH, "en");
  const jaMap = await readTranslationFile(TRANSLATION_JA_PATH, "ja");

  const resolvedRows = rows.map((row) => ({
    ...row,
    en: resolveTranslation(row, "en", enMap),
    ja: resolveTranslation(row, "ja", jaMap),
  }));

  const sql = buildSql(resolvedRows);
  await fs.writeFile(OUTPUT_PATH, sql, "utf8");

  console.log(`[generate-docs-blog-reseed-sql] wrote ${resolvedRows.length} posts -> ${OUTPUT_PATH}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
