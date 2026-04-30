export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminRole = "super_admin" | "admin" | "test_admin";
export type AdminPermission = "read" | "write" | "manage_admin";
export type AdminAccessRequestStatus = "pending" | "approved" | "rejected";

export type AdminAuthSession = {
  userId: string | null;
  role: AdminRole | null;
  canReadAdmin: boolean;
  canWriteAdmin: boolean;
  canManageAdmin: boolean;
};

export type AdminAccessRequest = {
  id: string;
  userId: string;
  email: string;
  message: string;
  status: AdminAccessRequestStatus;
  requestedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  testAdminExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminMember = {
  id: string;
  email: string;
  isSuperAdmin: boolean;
  role: AdminRole;
  isActive: boolean;
  expiresAt: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminEntityScope = "blog" | "projects" | "contact";
export type AdminListSort = "name" | "created" | "updated";
export type ContactListFilter = "all" | "new" | "replied";
export type AdminUploadScope = "about" | "blog" | "projects" | "home" | "misc";

export type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>;
