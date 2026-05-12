"use client";

import MenuItem from "@/components/header/menu-item";
import { navbarItems } from "@/data/menu";
import Logo from "@/components/logo";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Moon, Palette, SunMedium } from "lucide-react";
import { PwaInstallMenuButton } from "@/components/pwa/pwa-install-menu-button";

export const MobileMenuItems = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <nav className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-border/70 px-5 pb-5 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Logo />
        </div>

        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="mt-5 flex w-full cursor-pointer items-center justify-between rounded-2xl border border-border/70 bg-background px-3 py-2.5 text-left shadow-sm transition hover:border-primary/30 hover:bg-primary/5"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Palette className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Theme</p>
              <p className="text-xs text-muted-foreground">
                Switch light or dark mode
              </p>
            </div>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/85 text-foreground shadow-sm">
            {isDark ? (
              <Moon className="size-4" />
            ) : (
              <SunMedium className="size-4" />
            )}
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-1 px-3 py-4">
        {navbarItems.map((item) => (
          <MenuItem key={item.label} label={item.label} href={item.href} />
        ))}
      </div>

      <div className="mt-auto space-y-3 border-t border-border/70 p-5">
        <PwaInstallMenuButton />
        <Button
          asChild
          className="h-11 w-full rounded-full bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)]"
        >
          <Link href="/courses">Explore Courses</Link>
        </Button>
      </div>
    </nav>
  );
};
