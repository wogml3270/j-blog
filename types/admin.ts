export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminEntityScope = "blog" | "projects" | "contact";
export type AdminListFilter = "all" | "main" | "general" | "published" | "draft";
export type ContactListFilter = "all" | "new" | "replied";

export type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;
