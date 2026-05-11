"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function VerifiedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const isVerified = searchParams.get("verified");
    if (isVerified) {
      toast.success("Your account has been verified 🎉");
      router.replace("/admin/dashboard");
    }
  }, [searchParams]);

  return null;
}
