import { NextResponse } from "next/server";
import { getAdminGuardForApi } from "@/lib/auth/admin";
import { deleteProjectCommentByIdForAdmin } from "@/lib/comments/repository";

type RouteContext = {
  params: Promise<{ commentId: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  const guard = await getAdminGuardForApi();

  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { commentId } = await context.params;

  if (!commentId) {
    return NextResponse.json({ error: "Invalid comment id." }, { status: 400 });
  }

  const result = await deleteProjectCommentByIdForAdmin(commentId);

  if (result.error || !result.data) {
    return NextResponse.json(
      { error: result.error ?? "Failed to delete comment." },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true, id: result.data.id });
}
