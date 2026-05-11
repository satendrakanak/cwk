"use client";

import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme/theme-toggle";

export function FloatingThemeToggle() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/faculty")) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-4 z-[70] hidden md:block md:bottom-6 md:left-6">
      <ThemeToggle
        compact
        className="h-12 w-12 rounded-full border-border/70 bg-background/92 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl"
      />
    </div>
  );
}
