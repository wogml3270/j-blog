import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { getAdminMembers } from "@/lib/auth/admin-settings-repository";

export async function GET() {
  const guard = await getAdminGuardForApi("manage_admin");

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const members = await getAdminMembers();
  return NextResponse.json({ members });
}
