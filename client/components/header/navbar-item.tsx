"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { CoursesMegaMenu } from "@/components/header/courses-mega-menu";

interface NavbarItemProps {
  item: {
    label: string;
    href: string;
    hasMegaMenu?: boolean;
  };
}

const NavbarItem = ({ item }: NavbarItemProps) => {
  const pathname = usePathname();

  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const link = (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors xl:px-4",
        "text-foreground/75 hover:bg-primary/10 hover:text-primary",
        isActive &&
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      )}
    >
      {item.label}
      {item.hasMegaMenu ? <ChevronDown className="size-3.5" /> : null}
    </Link>
  );

  if (!item.hasMegaMenu) return link;

  return (
    <div className="group relative">
      {link}
      <CoursesMegaMenu />
    </div>
  );
};

export default NavbarItem;
