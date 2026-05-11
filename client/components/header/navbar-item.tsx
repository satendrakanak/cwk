"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface NavbarItemProps {
  item: {
    label: string;
    href: string;
  };
}

const NavbarItem = ({ item }: NavbarItemProps) => {
  const pathname = usePathname();

  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors xl:px-5",
        "text-foreground/75 hover:bg-primary/10 hover:text-primary",
        isActive &&
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      )}
    >
      {item.label}
    </Link>
  );
};

export default NavbarItem;
