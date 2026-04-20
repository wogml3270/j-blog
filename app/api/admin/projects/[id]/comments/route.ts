import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { getCommentsByProjectIdForAdmin } from "@/lib/comments/repository";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Invalid project id." }, { status: 400 });
  }

  const comments = await getCommentsByProjectIdForAdmin(id);
  return NextResponse.json({ comments });
}
