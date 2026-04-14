import { ContactManager } from "@/components/admin/contact/contact-manager";
import { getAdminContactsPaginated } from "@/lib/contact/repository";
import { normalizePagination } from "@/lib/utils/pagination";
import { normalizeContactListFilter, pickSingleQueryValue } from "@/lib/utils/search-params";
import type { AdminSearchParams } from "@/types/admin";

export default async function AdminContactPage({
  searchParams,
}: {
  searchParams: AdminSearchParams;
}) {
  const query = await searchParams;
  const { pageSize } = normalizePagination(
    null,
    pickSingleQueryValue(query.pageSize),
  );
  const newPage = normalizePagination(
    pickSingleQueryValue(query.newPage) ?? pickSingleQueryValue(query.page),
    pickSingleQueryValue(query.pageSize),
  ).page;
  const repliedPage = normalizePagination(
    pickSingleQueryValue(query.repliedPage),
    pickSingleQueryValue(query.pageSize),
  ).page;
  const initialStatusFilter = normalizeContactListFilter(pickSingleQueryValue(query.status));
  const [initialNewPage, initialRepliedPage] = await Promise.all([
    getAdminContactsPaginated(newPage, pageSize, "new"),
    getAdminContactsPaginated(repliedPage, pageSize, "replied"),
  ]);
  const initialSelectedId = pickSingleQueryValue(query.id);

  return (
    <ContactManager
      initialNewPage={initialNewPage}
      initialRepliedPage={initialRepliedPage}
      initialStatusFilter={initialStatusFilter}
      initialSelectedId={initialSelectedId}
    />
  );
}
