"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function ResetToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;

    const reset = searchParams.get("reset");

    if (!reset) return;

    if (reset === "true") {
      toast.success("You're all set! 🔐", {
        description: "Your password has been updated successfully.",
      });
    }

    if (reset === "false") {
      toast.error("Reset link expired ❌", {
        description: "Please request a new password reset link.",
      });
    }

    hasShown.current = true;

    router.replace("/auth/sign-in");
  }, []);

  return null;
}
