import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { SITE_CONFIG } from "@/lib/site/profile";
import type { ContactPayload } from "@/types/contacts";

function parseBody(body: unknown): ContactPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const source = body as Record<string, unknown>;

  if (
    typeof source.name !== "string" ||
    typeof source.email !== "string" ||
    typeof source.subject !== "string" ||
    typeof source.message !== "string"
  ) {
    return null;
  }

  return {
    name: source.name.trim(),
    email: source.email.trim(),
    subject: source.subject.trim(),
    message: source.message.trim(),
  };
}

async function sendContactNotification(payload: ContactPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.SITE_CONTACT_TO_EMAIL ?? SITE_CONFIG.email;

  if (!apiKey || !toEmail) {
    return;
  }

  const fromEmail = process.env.SITE_CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: `[Contact] ${payload.subject}`,
      text: `${payload.name} (${payload.email})\\n\\n${payload.message}`,
    }),
  });
}

export async function POST(request: Request) {
  const payload = parseBody(await request.json());

  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const service = createSupabaseServiceClient();

  if (!service) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { error } = await service.from("contacts").insert({
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    message: payload.message,
    status: "new",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    await sendContactNotification(payload);
  } catch {
    // 이메일 발송 실패가 문의 저장 실패로 이어지지 않도록 분리 처리.
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
