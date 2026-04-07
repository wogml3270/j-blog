import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { updateAdminContactMessageStatus } from "@/lib/contact/repository";
import type { ContactMessageStatus } from "@/types/content";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseStatus(value: unknown): ContactMessageStatus | null {
  if (value === "new" || value === "read" || value === "replied") {
    return value;
  }

  return null;
}

export async function PUT(request: Request, context: RouteContext) {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const status = parseStatus(body?.status);

  if (!status) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { id } = await context.params;
  const result = await updateAdminContactMessageStatus(id, status);

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to update contact status." }, { status: 400 });
  }

  return NextResponse.json({ contact: result.data });
}
