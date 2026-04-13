import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog/card";
import { ContentListLayout } from "@/components/ui/content-list-layout";
import { getAllPublishedPosts } from "@/lib/blog/repository";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

type BlogListPageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: BlogListPageProps): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);

  return buildPageMetadata({
    locale: lang,
    pathname: "/blog",
    title: dictionary.blog.title,
    description: dictionary.blog.description,
  });
}

export default async function BlogListPage({ params }: BlogListPageProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);
  const posts = await getAllPublishedPosts();

  return (
    <ContentListLayout
      title={dictionary.blog.listTitle}
      description={dictionary.blog.listDescription}
      listClassName="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {posts.map((post, index) => (
        <BlogCard key={post.slug} post={post} locale={lang} animationDelay={index * 70} />
      ))}
    </ContentListLayout>
  );
}
