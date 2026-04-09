"use client";

import Link from "next/link";
import { Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ProjectCard } from "@/components/project/card";
import { SectionTitle } from "@/components/ui/section-title";
import { withLocalePath } from "@/lib/i18n/config";
import type { FeaturedProjectsProps } from "@/types/ui";

export function FeaturedProjects({
  locale,
  projects,
  title,
  description,
  allProjectsLabel,
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
        className="home-card-swiper pb-10!"
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
          <SwiperSlide key={project.slug} className="h-full">
            <ProjectCard project={project} locale={locale} animationDelay={80 + index * 60} />
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
