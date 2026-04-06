import Link from "next/link";
import { redirect } from "next/navigation";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { getAdminState } from "@/lib/auth/admin";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const reasonMessage: Record<string, string> = {
  not_allowed: "허용된 관리자 이메일이 아닙니다.",
  email_not_verified: "소셜 계정의 이메일 검증이 필요합니다.",
  oauth_failed: "소셜 로그인 처리 중 오류가 발생했습니다.",
  missing_code: "로그인 콜백 파라미터가 누락되었습니다.",
  supabase_not_configured: "Supabase 환경변수가 설정되지 않았습니다.",
};

function readSearchParam(
  value: string | string[] | undefined,
  fallback = "",
): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return fallback;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const state = await getAdminState();

  if (state.isAdmin) {
    redirect("/admin");
  }

  const resolvedSearchParams = await searchParams;
  const nextPath = readSearchParam(resolvedSearchParams.next, "/admin");
  const reason = readSearchParam(resolvedSearchParams.reason, state.reason);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl items-center px-4 py-10">
      <section className="w-full rounded-2xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
        <p className="mt-2 text-sm text-muted">
          Google, GitHub, Kakao 로그인 후 허용된 이메일 계정만 관리자 접근이 가능합니다.
        </p>

        {reason && reasonMessage[reason] ? (
          <p className="mt-3 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
            {reasonMessage[reason]}
          </p>
        ) : null}

        {state.user && !state.isAdmin ? (
          <p className="mt-3 text-sm text-muted">현재 로그인 계정: {state.email ?? "unknown"}</p>
        ) : null}

        <div className="mt-5">
          <SocialLoginButtons nextPath={nextPath} variant="admin" />
        </div>

        <Link href="/" className="mt-5 inline-flex text-sm text-muted underline">
          공개 사이트로 돌아가기
        </Link>
      </section>
    </main>
  );
}
