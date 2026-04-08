import type { ContactMessageStatus } from "@/types/db";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  adminNote: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
};

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};
