import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog/card";
import { ContentListLayout } from "@/components/ui/content-list-layout";
import { ContentPagination } from "@/components/ui/content-pagination";
import { ContentSearchToolbar } from "@/components/ui/content-search-toolbar";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getAllPublishedPosts } from "@/lib/blog/repository";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { matchesContentSearchQuery, normalizeContentSearchQuery } from "@/lib/utils/content-search";
import { PUBLIC_CONTENT_PAGE_SIZE, normalizePublicPage } from "@/lib/utils/pagination";
import { normalizePublicSort, pickSingleQueryValue } from "@/lib/utils/search-params";

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
  let shareImagePath = "/blog/Gemini_Generated_Image_eqdpqseqdpqseqdp.png";

  try {
    const posts = await getAllPublishedPosts(lang);
    shareImagePath = posts[0]?.thumbnail || shareImagePath;
  } catch {
    // DB 장애 시에도 목록 페이지 메타는 기본 썸네일로 안정적으로 반환한다.
  }

  return buildPageMetadata({
    locale: lang,
    pathname: "/blog",
    title: dictionary.blog.title,
    description: dictionary.blog.description,
    shareCard: {
      mode: "dynamicShareCard",
      imagePath: shareImagePath,
    },
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
  const sort = normalizePublicSort(pickSingleQueryValue(query.sort));
  const filteredPosts = posts.filter((post) =>
    matchesContentSearchQuery([post.title, post.description, post.tags], searchQuery),
  );
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sort === "name") {
      return a.title.localeCompare(b.title, lang);
    }

    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  const requestedPage = normalizePublicPage(pickSingleQueryValue(query.page));
  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / PUBLIC_CONTENT_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * PUBLIC_CONTENT_PAGE_SIZE;
  const paginatedPosts = sortedPosts.slice(pageStart, pageStart + PUBLIC_CONTENT_PAGE_SIZE);

  return (
    <ContentListLayout
      title={dictionary.blog.title}
      description={dictionary.blog.description}
      toolbar={
        <ContentSearchToolbar
          placeholder={dictionary.blog.searchPlaceholder}
          submitLabel={dictionary.blog.searchButton}
          resetLabel={dictionary.blog.searchReset}
          defaultSortValue="date"
          sortOptions={[
            { value: "date", label: dictionary.blog.sortDate },
            { value: "name", label: dictionary.blog.sortName },
          ]}
        />
      }
      listClassName="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {paginatedPosts.map((post, index) => (
        <BlogCard key={post.slug} post={post} locale={lang} animationDelay={index * 70} />
      ))}
      {sortedPosts.length === 0 ? (
        <SurfaceCard className="col-span-full p-6 text-sm text-muted">
          {dictionary.blog.searchNoResult}
        </SurfaceCard>
      ) : null}
      {sortedPosts.length > 0 ? (
        <div className="col-span-full pt-2">
          <ContentPagination
            page={currentPage}
            totalPages={totalPages}
            total={sortedPosts.length}
            previousLabel={dictionary.blog.paginationPrevious}
            nextLabel={dictionary.blog.paginationNext}
            summaryLabel={dictionary.blog.paginationSummary}
          />
        </div>
      ) : null}
    </ContentListLayout>
  );
}
