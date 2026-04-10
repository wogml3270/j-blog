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
  aboutPhotoUrl: string;
  aboutTechItems: AboutTechItem[];
  status: PublishStatus;
  updatedAt: string;
};
