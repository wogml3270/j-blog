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

type BlogDetailPageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { lang, slug } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return {
      title: dictionary.blog.postNotFound,
    };
  }

  return buildPageMetadata({
    locale: lang,
    pathname: `/blog/${slug}`,
    title: post.title,
    description: post.description,
  });
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { lang, slug } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);
  const post = await getPublishedPostBySlug(slug);
  const comments = await getApprovedCommentsByPostSlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-8">
      <Link href={withLocalePath(lang, "/blog")} className="inline-flex text-sm text-muted underline">
        {dictionary.blog.backToList}
      </Link>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{post.title}</h1>
        <p className="text-base text-muted">{post.description}</p>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Tag key={`${post.slug}-${tag}`}>{tag}</Tag>
          ))}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        {post.source === "supabase" ? (
          <MarkdownContent markdown={post.bodyMarkdown ?? ""} />
        ) : (
          <div className="prose">{post.Component ? <post.Component /> : null}</div>
        )}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <TableOfContents items={post.toc} title={dictionary.blog.tableOfContents} />
        </div>
      </div>

      <CommentsSection
        postSlug={post.slug}
        labels={dictionary.blog.comments}
        initialComments={comments}
      />
    </article>
  );
}
