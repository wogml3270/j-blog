import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { getAdminContactMessages } from "@/lib/contact/repository";

export async function GET() {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const contacts = await getAdminContactMessages();
  return NextResponse.json({ contacts });
}
