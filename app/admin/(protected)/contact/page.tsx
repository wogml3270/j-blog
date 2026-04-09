import { ContactManager } from "@/components/admin/contact/contact-manager";
import { getAdminContactMessagesPaginated } from "@/lib/contact/repository";
import { normalizePagination } from "@/lib/utils/pagination";
import { pickSingleQueryValue } from "@/lib/utils/search-params";
import type { AdminSearchParams } from "@/types/admin";

export default async function AdminContactPage({
  searchParams,
}: {
  searchParams: AdminSearchParams;
}) {
  const query = await searchParams;
  const { page, pageSize } = normalizePagination(
    pickSingleQueryValue(query.page),
    pickSingleQueryValue(query.pageSize),
  );
  const initialPage = await getAdminContactMessagesPaginated(page, pageSize);
  const initialSelectedId = pickSingleQueryValue(query.id);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">문의 관리</h1>
      <ContactManager initialPage={initialPage} initialSelectedId={initialSelectedId} />
    </main>
  );
}
