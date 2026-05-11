"use client";

import * as React from "react";
import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  compact?: boolean;
};

export function ThemeToggle({
  className,
  compact = false,
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "icon-sm" : "sm"}
      className={cn(
        "rounded-full border-border/70 bg-background/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-muted/80",
        compact ? "h-10 w-10" : "h-10 gap-2 px-3.5",
        className,
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted ? (
        isDark ? (
          <Moon className="size-4" />
        ) : (
          <SunMedium className="size-4" />
        )
      ) : (
        <SunMedium className="size-4" />
      )}
      {compact ? null : (
        <span className="text-xs font-semibold tracking-[0.18em] uppercase">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </Button>
  );
}
