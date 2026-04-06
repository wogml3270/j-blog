"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  const onSignOut = async () => {
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
      className="w-full"
      onClick={onSignOut}
      disabled={pending}
    >
      {pending ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}
