"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogoutIcon } from "@/components/ui/icons/logout-icon";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils/cn";

type SignOutButtonProps = {
  className?: string;
  onBeforeSignOut?: () => boolean;
};

export function SignOutButton({ className, onBeforeSignOut }: SignOutButtonProps) {
  const [pending, setPending] = useState(false);

  const onSignOut = async () => {
    if (onBeforeSignOut && !onBeforeSignOut()) {
      return;
    }

    try {
      setPending(true);
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/admin/login";
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(className)}
      onClick={onSignOut}
      disabled={pending}
      aria-label={pending ? "로그아웃 중" : "로그아웃"}
      title={pending ? "로그아웃 중" : "로그아웃"}
    >
      <span>{pending ? "로그아웃 중..." : "로그아웃"}</span>
      <LogoutIcon className={pending ? "animate-pulse" : undefined} />
    </Button>
  );
}
