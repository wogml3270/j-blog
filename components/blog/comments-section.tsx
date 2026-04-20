"use client";

import { SharedCommentsSection, type CommentSectionLabels } from "@/components/comments/shared-comments-section";
import type { BlogComment } from "@/types/blog";

interface CommentsSectionProps {
  postSlug: string;
  labels: CommentSectionLabels;
  initialComments: BlogComment[];
}

export function CommentsSection({ postSlug, labels, initialComments }: CommentsSectionProps) {
  return (
    <SharedCommentsSection<BlogComment>
      resourceSlug={postSlug}
      slugFieldName="postSlug"
      createEndpoint="/api/comments"
      itemEndpointBase="/api/comments"
      labels={labels}
      initialComments={initialComments}
    />
  );
}

