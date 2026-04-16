import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog/card";
import { ContentListLayout } from "@/components/ui/content-list-layout";
import { ContentSearchToolbar } from "@/components/ui/content-search-toolbar";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getAllPublishedPosts } from "@/lib/blog/repository";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { matchesContentSearchQuery, normalizeContentSearchQuery } from "@/lib/utils/content-search";
import { pickSingleQueryValue } from "@/lib/utils/search-params";

type BlogListPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

export default async function BlogListPage({ params, searchParams }: BlogListPageProps) {
  const { lang } = await params;
  const query = await searchParams;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);
  const posts = await getAllPublishedPosts(lang);
  const searchQuery = normalizeContentSearchQuery(pickSingleQueryValue(query.q));
  const filteredPosts = posts.filter((post) =>
    matchesContentSearchQuery([post.title, post.description, post.tags], searchQuery),
  );

  return (
    <ContentListLayout
      title={dictionary.blog.listTitle}
      description={dictionary.blog.listDescription}
      toolbar={
        <ContentSearchToolbar
          placeholder={dictionary.blog.searchPlaceholder}
          submitLabel={dictionary.blog.searchButton}
          resetLabel={dictionary.blog.searchReset}
        />
      }
      listClassName="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {filteredPosts.map((post, index) => (
        <BlogCard key={post.slug} post={post} locale={lang} animationDelay={index * 70} />
      ))}
      {filteredPosts.length === 0 ? (
        <SurfaceCard className="col-span-full p-6 text-sm text-muted">
          {dictionary.blog.searchNoResult}
        </SurfaceCard>
      ) : null}
    </ContentListLayout>
  );
}
