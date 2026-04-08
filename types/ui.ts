import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { AdminListFilter } from "@/types/admin";
import type { AdminPost } from "@/types/blog";
import type { ContactMessage } from "@/types/contact";
import type { PublishStatus } from "@/types/db";
import type { AdminProject } from "@/types/projects";

export type HeaderProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export type LanguageSwitcherProps = {
  locale: Locale;
  currentPath: string;
  dictionary: Dictionary;
  onNavigate?: () => void;
};

export type ContactLabels = {
  fabLabel: string;
  openAriaLabel: string;
  closeAriaLabel: string;
  title: string;
  description: string;
  nameLabel: string;
  emailLabel: string;
  subjectLabel: string;
  messageLabel: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  subjectPlaceholder: string;
  messagePlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  errorMessage: string;
};

export type ContactFormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactFabProps = {
  labels: ContactLabels;
};

export type AdminSidebarProps = {
  email: string | null;
};

export type BlogManagerProps = {
  initialPage: import("@/types/admin").PaginatedResult<AdminPost>;
  initialSelectedId?: string | null;
  initialFilter?: AdminListFilter;
};

export type ContactManagerProps = {
  initialPage: import("@/types/admin").PaginatedResult<ContactMessage>;
  initialSelectedId?: string | null;
};

export type ProjectsManagerProps = {
  initialPage: import("@/types/admin").PaginatedResult<AdminProject>;
  initialSelectedId?: string | null;
  initialFilter?: AdminListFilter;
};

export type StatusOption<TValue extends string = string> = {
  value: TValue;
  label: string;
};

export type ManagerShellProps = {
  children: React.ReactNode;
  summary: string;
  detail?: string;
  action?: React.ReactNode;
  message?: string | null;
  className?: string;
  motion?: boolean;
};

export type ManagerListProps = {
  children: React.ReactNode;
  hasItems: boolean;
  emptyLabel: string;
};

export type ManagerListRowProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

export type EditorDrawerProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export type StatusRadioGroupProps = {
  legend: string;
  name: string;
  value: string;
  options: StatusOption[];
  onChange: (value: string) => void;
  className?: string;
};

export type AdminPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  pageSizeOptions?: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export type PostFormState = {
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  status: PublishStatus;
  featured: boolean;
  publishedAt: string;
  tags: string[];
  tagInput: string;
  bodyMarkdown: string;
};

export type ThumbnailInputMode = "url" | "upload";

export type SortableTextItem = {
  id: string;
  value: string;
};

export type SortableLinkItem = {
  id: string;
  label: string;
  url: string;
};

export type ProjectFormState = {
  slug: string;
  title: string;
  summary: string;
  thumbnail: string;
  role: string;
  startDate: string;
  endDate: string;
  status: PublishStatus;
  featured: boolean;
  techStack: string[];
  techStackInput: string;
  achievements: SortableTextItem[];
  achievementInput: string;
  contributions: SortableTextItem[];
  contributionInput: string;
  links: SortableLinkItem[];
  linkLabelInput: string;
  linkUrlInput: string;
};

export type SortableRowProps = {
  id: string;
  children: React.ReactNode;
  onRemove: () => void;
};

export type ProjectCardProps = {
  project: import("@/types/projects").Project;
  locale: Locale;
  roleLabel?: string;
  periodLabel?: string;
  animationDelay?: number;
};

export type FeaturedProjectsProps = {
  locale: Locale;
  projects: import("@/types/projects").Project[];
  title: string;
  description: string;
  allProjectsLabel: string;
};
