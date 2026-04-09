"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  SocialProviderIcon,
  type SocialProviderKey,
} from "@/components/ui/icons/social-provider-icon";
import { cn } from "@/lib/utils/cn";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type SocialProvider = SocialProviderKey;

type SocialLoginButtonsProps = {
  nextPath?: string;
  variant?: "admin" | "public";
  className?: string;
};

const providerItems: Array<{ key: SocialProvider; label: string }> = [
  { key: "google", label: "Google" },
  { key: "github", label: "GitHub" },
  { key: "kakao", label: "Kakao" },
];

export function SocialLoginButtons({
  nextPath = "/admin/dashboard",
  variant = "admin",
  className,
}: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onLogin = async (provider: SocialProvider) => {
    try {
      setLoadingProvider(provider);
      setErrorMessage(null);

      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "로그인 요청 중 오류가 발생했습니다.",
      );
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {providerItems.map((provider) => (
        <Button
          key={provider.key}
          type="button"
          variant="outline"
          className="h-12 w-full justify-start rounded-xl border-border/80 bg-background/35 px-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-foreground/5"
          disabled={loadingProvider !== null}
          onClick={() => onLogin(provider.key)}
        >
          <span className="flex w-full items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface/80">
              <SocialProviderIcon provider={provider.key} />
            </span>
            <span className="text-base font-semibold tracking-tight text-foreground">
              {loadingProvider === provider.key
                ? "이동 중..."
                : variant === "admin"
                  ? `${provider.label}로 로그인`
                  : `${provider.label} 로그인`}
            </span>
          </span>
        </Button>
      ))}

      {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
    </div>
  );
}
