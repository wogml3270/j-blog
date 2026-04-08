import type { PublishStatus } from "@/types/db";

export type ProfileContent = {
  id: number;
  name: string;
  title: string;
  summary: string;
  techStack: string[];
  aboutIntroDescriptionKo: string;
  aboutExperience: string;
  strengths: string[];
  workStyle: string;
  status: PublishStatus;
  updatedAt: string;
};
