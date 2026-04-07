"use client";

import Link from "next/link";
import { Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { BlogCard } from "@/components/blog/card";
import { SectionTitle } from "@/components/ui/section-title";
import type { Locale } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/config";
import type { BlogPostSummary } from "@/types/content";

type RecentPostsProps = {
  locale: Locale;
  posts: BlogPostSummary[];
  title: string;
  description: string;
  allPostsLabel: string;
};

export function RecentPosts({
  locale,
  posts,
  title,
  description,
  allPostsLabel,
}: RecentPostsProps) {
  return (
    <section aria-labelledby="recent-posts-title" className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <SectionTitle title={title} description={description} />
        <Link
          href={withLocalePath(locale, "/blog")}
          className="hidden text-sm font-medium text-foreground underline sm:inline-flex"
        >
          {allPostsLabel}
        </Link>
      </div>

      <Swiper
        modules={[Pagination, Keyboard]}
        className="!pb-10"
        spaceBetween={16}
        slidesPerView={1}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1280: { slidesPerView: 3 },
        }}
      >
        {posts.map((post, index) => (
          <SwiperSlide key={post.slug} className="h-auto">
            <BlogCard post={post} locale={locale} animationDelay={80 + index * 60} />
          </SwiperSlide>
        ))}
      </Swiper>

      <Link href={withLocalePath(locale, "/blog")} className="inline-flex text-sm font-medium text-foreground underline sm:hidden">
        {allPostsLabel}
      </Link>
    </section>
  );
}
