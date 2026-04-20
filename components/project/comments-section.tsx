"use client";

import {
  SharedCommentsSection,
  type CommentSectionLabels,
} from "@/components/comments/shared-comments-section";
import type { ProjectComment } from "@/types/projects";

interface ProjectCommentsSectionProps {
  projectSlug: string;
  labels: CommentSectionLabels;
  initialComments: ProjectComment[];
}

export function ProjectCommentsSection({
  projectSlug,
  labels,
  initialComments,
}: ProjectCommentsSectionProps) {
  return (
    <SharedCommentsSection<ProjectComment>
      resourceSlug={projectSlug}
      slugFieldName="projectSlug"
      createEndpoint="/api/project-comments"
      itemEndpointBase="/api/project-comments"
      labels={labels}
      initialComments={initialComments}
    />
  );
}
