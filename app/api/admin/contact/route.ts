import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { getAdminContactMessagesPaginated } from "@/lib/contact/repository";
import { normalizePagination } from "@/lib/utils/pagination";
import { normalizeContactListFilter } from "@/lib/utils/search-params";

// 문의 목록 응답을 페이지 단위로 표준화한다.
export async function GET(request: Request) {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const url = new URL(request.url);
  const { page, pageSize } = normalizePagination(
    url.searchParams.get("page"),
    url.searchParams.get("pageSize"),
  );
  const statusFilter = normalizeContactListFilter(url.searchParams.get("status"));
  const result = await getAdminContactMessagesPaginated(page, pageSize, statusFilter);

  return NextResponse.json(result);
}
