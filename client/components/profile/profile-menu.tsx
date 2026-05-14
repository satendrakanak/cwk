"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { isLicenseFeatureEnabled } from "@/lib/license/feature-access";
import type { LicenseSummary, LicenseFeatureKey } from "@/types/license";

interface ProfileMenuProps {
  isOwner?: boolean;
  licenseSummary?: LicenseSummary | null;
}

export function ProfileMenu({ isOwner, licenseSummary }: ProfileMenuProps) {
  const pathname = usePathname();

  const baseMenu = [
    { label: "Dashboard", key: "dashboard" },
    { label: "My Courses", key: "my-courses" },
    { label: "Live Classes", key: "classes", feature: "liveClasses" },
    { label: "Exams", key: "exams", feature: "exams" },
    { label: "Assignments", key: "assignments", feature: "assignments" },
    { label: "Orders", key: "orders" },
    { label: "Certificates", key: "certificates", feature: "certificates" },
    { label: "Notifications", key: "notifications" },
    { label: "Profile", key: "profile" },
    ...(isOwner ? [{ label: "Settings", key: "settings" }] : []),
  ] satisfies Array<{
    label: string;
    key: string;
    feature?: LicenseFeatureKey;
  }>;
  const menu = baseMenu.filter((item) =>
    item.feature ? isLicenseFeatureEnabled(licenseSummary, item.feature) : true,
  );

  return (
    <div className="mt-8">
      <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-3xl border border-border bg-card p-2 shadow-(--shadow-card)">
        {menu.map((item) => {
          const href = `/${item.key}`;

          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-[0_12px_30px_color-mix(in_oklab,var(--primary)_24%,transparent)]"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
