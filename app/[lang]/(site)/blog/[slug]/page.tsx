import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentsSection } from "@/components/blog/comments-section";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { Tag } from "@/components/ui/tag";
import { getPublishedPostBySlug } from "@/lib/blog/repository";
import { getApprovedCommentsByPostSlug } from "@/lib/comments/repository";
import { isLocale, withLocalePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils/format-date";
import { decodeSlugSegment, encodeSlugSegment } from "@/lib/utils/slug";

type BlogDetailPageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const normalizedSlug = decodeSlugSegment(slug);

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);
  let post = null;

  try {
    post = await getPublishedPostBySlug(normalizedSlug, lang);
  } catch {
    return buildPageMetadata({
      locale: lang,
      pathname: `/blog/${encodeSlugSegment(normalizedSlug)}`,
      title: dictionary.blog.title,
      description: dictionary.blog.description,
      shareCard: {
        mode: "dynamicShareCard",
        imagePath: "/blog/default-thumbnail.svg",
      },
    });
  }

  if (!post) {
    return buildPageMetadata({
      locale: lang,
      pathname: `/blog/${encodeSlugSegment(normalizedSlug)}`,
      title: dictionary.blog.postNotFound,
      description: dictionary.blog.description,
      shareCard: {
        mode: "dynamicShareCard",
        imagePath: "/blog/default-thumbnail.svg",
      },
    });
  }

  return buildPageMetadata({
    locale: lang,
    pathname: `/blog/${encodeSlugSegment(normalizedSlug)}`,
    title: post.title,
    description: post.description,
    shareCard: {
      mode: "dynamicShareCard",
      imagePath: post.thumbnail || "/blog/default-thumbnail.svg",
    },
  });
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { lang, slug } = await params;
  const normalizedSlug = decodeSlugSegment(slug);

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);
  const post = await getPublishedPostBySlug(normalizedSlug, lang);
  const comments = await getApprovedCommentsByPostSlug(normalizedSlug);

  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-8">
      <Link
        href={withLocalePath(lang, "/blog")}
        className="inline-flex text-sm text-muted underline"
      >
        {dictionary.blog.backToList}
      </Link>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{post.title}</h1>
        <p className="text-base text-muted">{post.description}</p>
      </header>

      <div className="grid gap-8 xl:gap-9 xl:grid-cols-[minmax(0,1fr)_220px]">
        <MarkdownContent markdown={post.bodyMarkdown ?? ""} />
        <div className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
          <TableOfContents items={post.toc} title={dictionary.blog.tableOfContents} />
        </div>
      </div>

      <section className="space-y-3 border-t border-border/70 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {dictionary.blog.tags}
        </h2>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Tag key={`${post.slug}-${tag}`}>{tag}</Tag>
          ))}
        </div>
      </section>

      <CommentsSection
        postSlug={post.slug}
        labels={dictionary.blog.comments}
        initialComments={comments}
      />
    </article>
  );
}
