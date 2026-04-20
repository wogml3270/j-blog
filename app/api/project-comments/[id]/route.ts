import { NextResponse } from "next/server";
import { deleteProjectCommentByAuthor, updateProjectCommentByAuthor } from "@/lib/comments/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { content?: unknown } | null;
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!id || !content) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (content.length > 1000) {
    return NextResponse.json(
      { error: "Comment must be 1000 characters or fewer." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Login is required." }, { status: 401 });
  }

  const result = await updateProjectCommentByAuthor({
    commentId: id,
    authorUserId: user.id,
    content,
  });

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to update comment." }, { status: 400 });
  }

  return NextResponse.json({ success: true, comment: result.data });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Login is required." }, { status: 401 });
  }

  const result = await deleteProjectCommentByAuthor({
    commentId: id,
    authorUserId: user.id,
  });

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to delete comment." }, { status: 400 });
  }

  return NextResponse.json({ success: true, id: result.data.id });
}
