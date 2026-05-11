"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface ProfileMenuProps {
  isOwner?: boolean;
}

export function ProfileMenu({ isOwner }: ProfileMenuProps) {
  const pathname = usePathname();

  const menu = [
    { label: "Dashboard", key: "dashboard" },
    { label: "My Courses", key: "my-courses" },
    { label: "Live Classes", key: "classes" },
    { label: "Exams", key: "exams" },
    { label: "Orders", key: "orders" },
    { label: "Certificates", key: "certificates" },
    { label: "Notifications", key: "notifications" },
    { label: "Profile", key: "profile" },
    ...(isOwner ? [{ label: "Settings", key: "settings" }] : []),
  ];

  return (
    <div className="mt-8">
      <div className="flex gap-2 overflow-x-auto rounded-3xl border border-border bg-card p-2 shadow-(--shadow-card)">
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
