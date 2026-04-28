import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { getAdminAccessRequests } from "@/lib/auth/admin-settings-repository";
import type { AdminAccessRequestStatus } from "@/types/admin";

function parseStatus(value: string | null): AdminAccessRequestStatus | undefined {
  if (value === "pending" || value === "approved" || value === "rejected") {
    return value;
  }

  return undefined;
}

export async function GET(request: Request) {
  const guard = await getAdminGuardForApi("manage_admin");

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const url = new URL(request.url);
  const status = parseStatus(url.searchParams.get("status"));
  const requests = await getAdminAccessRequests(status);
  return NextResponse.json({ requests });
}
