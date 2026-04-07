"use client";

import Link from "next/link";
import { Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ProjectCard } from "@/components/project/card";
import { SectionTitle } from "@/components/ui/section-title";
import type { Locale } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/config";
import type { Project } from "@/types/content";

type FeaturedProjectsProps = {
  locale: Locale;
  projects: Project[];
  title: string;
  description: string;
  allProjectsLabel: string;
  detailLabel: string;
};

export function FeaturedProjects({
  locale,
  projects,
  title,
  description,
  allProjectsLabel,
  detailLabel,
}: FeaturedProjectsProps) {
  return (
    <section aria-labelledby="featured-projects-title" className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <SectionTitle title={title} description={description} />
        <Link
          href={withLocalePath(locale, "/projects")}
          className="hidden text-sm font-medium text-foreground underline sm:inline-flex"
        >
          {allProjectsLabel}
        </Link>
      </div>

      <Swiper
        modules={[Pagination, Keyboard]}
        className="pb-10"
        spaceBetween={18}
        slidesPerView={1}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1280: { slidesPerView: 3 },
        }}
      >
        {projects.map((project, index) => (
          <SwiperSlide key={project.slug} className="h-auto">
            <ProjectCard
              project={project}
              locale={locale}
              detailLabel={detailLabel}
              animationDelay={80 + index * 60}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <Link
        href={withLocalePath(locale, "/projects")}
        className="inline-flex text-sm font-medium text-foreground underline sm:hidden"
      >
        {allProjectsLabel}
      </Link>
    </section>
  );
}
