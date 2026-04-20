import { NextResponse } from "next/server";
import { createCommentForProject, getApprovedCommentsByProjectSlug } from "@/lib/comments/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProjectCommentPayload = {
  projectSlug: string;
  email: string;
  nickname: string;
  avatarUrl?: string;
  content: string;
};

function parseBody(body: unknown): ProjectCommentPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const source = body as Record<string, unknown>;

  if (
    typeof source.projectSlug !== "string" ||
    typeof source.content !== "string" ||
    typeof source.email !== "string" ||
    typeof source.nickname !== "string"
  ) {
    return null;
  }

  return {
    projectSlug: source.projectSlug.trim(),
    email: source.email.trim(),
    nickname: source.nickname.trim(),
    avatarUrl: typeof source.avatarUrl === "string" ? source.avatarUrl.trim() : undefined,
    content: source.content.trim(),
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const projectSlug = requestUrl.searchParams.get("projectSlug")?.trim();

  if (!projectSlug) {
    return NextResponse.json({ error: "projectSlug is required." }, { status: 400 });
  }

  const comments = await getApprovedCommentsByProjectSlug(projectSlug);
  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const payload = parseBody(await request.json().catch(() => null));

  if (!payload || !payload.projectSlug || !payload.content || !payload.email || !payload.nickname) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
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

  if (!isValidEmail(payload.email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (payload.nickname.length > 30) {
    return NextResponse.json({ error: "Nickname must be 30 characters or fewer." }, { status: 400 });
  }

  if (payload.content.length > 1000) {
    return NextResponse.json(
      { error: "Comment must be 1000 characters or fewer." },
      { status: 400 },
    );
  }

  if (payload.avatarUrl && !isValidHttpUrl(payload.avatarUrl)) {
    return NextResponse.json(
      { error: "Profile image URL must be http or https." },
      { status: 400 },
    );
  }

  const userEmail = user.email?.trim().toLowerCase();
  const payloadEmail = payload.email.trim().toLowerCase();

  if (!userEmail || userEmail !== payloadEmail) {
    return NextResponse.json(
      { error: "Email must match your signed-in account." },
      { status: 400 },
    );
  }

  const result = await createCommentForProject({
    projectSlug: payload.projectSlug,
    authorUserId: user.id,
    authorEmail: payloadEmail,
    authorNickname: payload.nickname,
    authorAvatarUrl: payload.avatarUrl || null,
    content: payload.content,
    status: "approved",
  });

  if (result.error || !result.data) {
    return NextResponse.json(
      { error: result.error ?? "Failed to create comment." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { success: true, status: result.data.status, comment: result.data },
    { status: 201 },
  );
}
