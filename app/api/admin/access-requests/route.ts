import { NextResponse } from "next/server";
import {
  createAdminAccessRequest,
  getLatestAdminAccessRequestByEmail,
} from "@/lib/auth/admin-settings-repository";
import { getAdminState, isUserEmailVerified } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AccessRequestPayload = {
  message: string;
};

function parseBody(body: unknown): AccessRequestPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const source = body as Record<string, unknown>;
  const message = typeof source.message === "string" ? source.message.trim() : "";

  if (message.length > 1000) {
    return null;
  }

  return {
    message,
  };
}

function getNotifyTargets(): string[] {
  const raw = process.env.ADMIN_REQUEST_NOTIFY_TO_EMAILS?.trim();

  if (raw) {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return ["wogml3270@gmail.com", "wogml3270@naver.com"];
}

async function sendAccessRequestEmail(payload: {
  email: string;
  message: string;
  requestId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return;
  }

  const fromEmail = process.env.SITE_CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
  const recipients = getNotifyTargets();

  if (recipients.length === 0) {
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipients,
      subject: `[Admin Access Request] ${payload.email}`,
      text: `요청 계정: ${payload.email}\n요청 ID: ${payload.requestId}\n\n메시지:\n${payload.message || "(없음)"}`,
    }),
  });
}

export async function GET() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const request = await getLatestAdminAccessRequestByEmail(user.email);
  return NextResponse.json({ request });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  if (!isUserEmailVerified(user)) {
    return NextResponse.json(
      { error: "Your email is not verified by the provider." },
      { status: 403 },
    );
  }

  const state = await getAdminState();

  if (state.isAdmin) {
    return NextResponse.json({ error: "Admin account does not need access request." }, { status: 409 });
  }

  const payload = parseBody(await request.json().catch(() => null));

  if (!payload) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const result = await createAdminAccessRequest({
    userId: user.id,
    email: user.email,
    message: payload.message,
  });

  if (result.error || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to create request." }, { status: 400 });
  }

  try {
    await sendAccessRequestEmail({
      email: user.email,
      message: payload.message,
      requestId: result.data.id,
    });
  } catch {
    // 이메일 발송 실패가 요청 생성 실패로 이어지지 않도록 분리한다.
  }

  return NextResponse.json({ request: result.data }, { status: 201 });
}
