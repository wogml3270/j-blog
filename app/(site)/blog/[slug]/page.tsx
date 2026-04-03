import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { Tag } from "@/components/ui/tag";
import { getAllPosts, getPostBySlug } from "@/lib/blog/registry";
import { formatDate } from "@/lib/utils/format-date";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.meta.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.meta.title,
    description: post.meta.description,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { Component, meta } = post;

  return (
    <article className="space-y-8">
      <Link href="/blog" className="inline-flex text-sm text-muted underline">
        ← 블로그 목록
      </Link>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <time dateTime={meta.date}>{formatDate(meta.date)}</time>
          <span aria-hidden="true">•</span>
          <span>{meta.readingTime}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{meta.title}</h1>
        <p className="text-base text-muted">{meta.description}</p>
        <div className="flex flex-wrap gap-2">
          {meta.tags.map((tag) => (
            <Tag key={`${meta.slug}-${tag}`}>{tag}</Tag>
          ))}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="prose">
          <Component />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <TableOfContents items={meta.toc} />
        </div>
      </div>
    </article>
  );
}
