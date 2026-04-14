import type { ContactStatus } from "@/types/db";

export type Contact = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  adminNote: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
};

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};
