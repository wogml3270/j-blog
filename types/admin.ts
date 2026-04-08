export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminEntityScope = "blog" | "projects" | "contact";
export type AdminListFilter = "all" | "main" | "general" | "published" | "draft";

export type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;
