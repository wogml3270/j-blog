import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { resolveAdminAccessRequest } from "@/lib/auth/admin-settings-repository";
import type { AdminRole } from "@/types/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseRole(value: unknown): AdminRole {
  if (value === "admin" || value === "test_admin") {
    return value;
  }

  return "test_admin";
}

function parseStatus(value: unknown): "approved" | "rejected" | null {
  if (value === "approved" || value === "rejected") {
    return value;
  }

  return null;
}

function parseExpiresAt(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await getAdminGuardForApi("manage_admin");

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const status = parseStatus(body?.status);

  if (!status) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { id } = await context.params;
  const role = parseRole(body?.role);
  const result = await resolveAdminAccessRequest({
    id,
    status,
    resolvedBy: guard.user.id,
    role,
    testAdminExpiresAt: parseExpiresAt(body?.testAdminExpiresAt),
  });

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to resolve request." }, { status: 400 });
  }

  return NextResponse.json({ request: result.data });
}
