import FirstPost, { metadata as firstPostMeta } from "@/content/blog/first-post.mdx";
import SecondPost, { metadata as secondPostMeta } from "@/content/blog/second-post.mdx";
import ThirdPost, { metadata as thirdPostMeta } from "@/content/blog/third-post.mdx";
import type { BlogPostMeta, BlogRegistryItem } from "@/types/blog";

const posts: BlogRegistryItem[] = [
  { meta: firstPostMeta as BlogPostMeta, Component: FirstPost },
  { meta: secondPostMeta as BlogPostMeta, Component: SecondPost },
  { meta: thirdPostMeta as BlogPostMeta, Component: ThirdPost },
];

function sortByDateDesc(items: BlogRegistryItem[]): BlogRegistryItem[] {
  return [...items].sort(
    (a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime(),
  );
}

export function getAllPosts(): BlogRegistryItem[] {
  return sortByDateDesc(posts);
}

export function getRecentPosts(limit = 3): BlogPostMeta[] {
  return getAllPosts()
    .slice(0, limit)
    .map((post) => post.meta);
}

export function getPostBySlug(slug: string): BlogRegistryItem | undefined {
  return posts.find((post) => post.meta.slug === slug);
}

export function getPostMetadataList(): BlogPostMeta[] {
  return getAllPosts().map((post) => post.meta);
}
