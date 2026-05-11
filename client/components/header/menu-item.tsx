"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { IoIosArrowForward } from "react-icons/io";

import { cn } from "@/lib/utils";
import { SheetClose } from "../ui/sheet";

interface SubMenuItemProps {
  label: string;
  href: string;
}

interface MenuItemProps {
  label: string;
  href: string;
  subItems?: SubMenuItemProps[];
}

const MenuItem = ({ label, href, subItems }: MenuItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive =
    (pathname === "/" && href === "/") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  const handleSubMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {subItems && subItems.length > 0 ? (
        <div>
          <div
            className={cn(
              "flex items-center gap-x-2 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] dark:text-slate-200 dark:hover:bg-white/6 dark:hover:text-white",
              isActive &&
                "bg-[var(--brand-600)] text-white shadow-[0_16px_30px_-20px_rgba(37,99,235,0.7)] hover:bg-[var(--brand-600)] hover:text-white"
            )}
            onClick={subItems ? handleSubMenuToggle : undefined}
          >
            <span>{label}</span>
            {subItems && (
              <IoIosArrowForward
                className={`ml-auto transform transition-transform ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
            )}
          </div>
          {subItems && isOpen && (
            <ul className="pl-6">
              {subItems.map((item, index) => (
                <li key={index} className="text-sm text-gray-700">
                  <SheetClose asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "mt-1 flex items-center gap-x-2 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] dark:text-slate-200 dark:hover:bg-white/6 dark:hover:text-white",
                        isActive &&
                          "bg-[var(--brand-600)] text-white shadow-[0_16px_30px_-20px_rgba(37,99,235,0.7)] hover:bg-[var(--brand-600)] hover:text-white"
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <SheetClose asChild>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-x-2 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] dark:text-slate-200 dark:hover:bg-white/6 dark:hover:text-white",
                isActive &&
                  "bg-[var(--brand-600)] text-white shadow-[0_16px_30px_-20px_rgba(37,99,235,0.7)] hover:bg-[var(--brand-600)] hover:text-white"
              )}
            >
              {label}
            </Link>
          </SheetClose>
        </div>
      )}
    </div>
  );
};

export default MenuItem;
