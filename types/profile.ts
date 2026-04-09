import type { PublishStatus } from "@/types/db";

export type AboutTechItem = {
  name: string;
  description: string;
  logoUrl: string;
};

export type ProfileContent = {
  id: number;
  name: string;
  title: string;
  summary: string;
  techStack: string[];
  aboutPhotoUrl: string;
  aboutTechItems: AboutTechItem[];
  aboutIntroDescriptionKo: string;
  aboutExperience: string;
  strengths: string[];
  workStyle: string;
  status: PublishStatus;
  updatedAt: string;
};
