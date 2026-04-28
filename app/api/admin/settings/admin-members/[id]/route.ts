import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { updateAdminMember } from "@/lib/auth/admin-settings-repository";
import type { AdminRole } from "@/types/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseRole(value: unknown): AdminRole | null {
  if (value === "admin" || value === "test_admin") {
    return value;
  }

  return null;
}

function parseIsActive(value: unknown): boolean | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    return null;
  }

  return value;
}

function parseExpiresAt(value: unknown): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);

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
  const role = parseRole(body?.role);
  const isActive = parseIsActive(body?.isActive);

  if (!role || (body && "isActive" in body && isActive === null)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { id } = await context.params;
  const result = await updateAdminMember({
    id,
    role,
    isActive: typeof isActive === "boolean" ? isActive : undefined,
    expiresAt: parseExpiresAt(body?.expiresAt),
  });

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to update admin member." }, { status: 400 });
  }

  return NextResponse.json({ member: result.data });
}
