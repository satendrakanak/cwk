"use client";

import Link from "next/link";
import { Fragment } from "react";
import { Home } from "lucide-react";

import Container from "@/components/container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export type BreadcrumbItemData = {
  label: string;
  href?: string;
};

type WebsiteBreadcrumbsProps = {
  items: BreadcrumbItemData[];
  className?: string;
  contained?: boolean;
  variant?: "surface" | "hero";
};

export function WebsiteBreadcrumbs({
  items,
  className,
  contained = true,
  variant = "surface",
}: WebsiteBreadcrumbsProps) {
  if (!items.length) return null;
  const isHero = variant === "hero";

  const trail = (
    <Breadcrumb className="no-scrollbar overflow-x-auto">
      <BreadcrumbList
        className={cn(
          "w-fit flex-nowrap rounded-full border px-2.5 py-1.5 text-[11px] font-semibold backdrop-blur-xl sm:px-3 sm:py-2 sm:text-xs",
          isHero
            ? "border-white/12 bg-white/8 text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_10px_28px_rgba(2,6,23,0.18)]"
            : "border-border/70 bg-background/82 text-muted-foreground shadow-[0_18px_45px_-34px_rgba(15,23,42,0.6)]",
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem className="shrink-0">
                {isLast || !item.href ? (
                  <BreadcrumbPage
                    className={cn(
                      "inline-block max-w-[10rem] truncate sm:max-w-[15rem]",
                      isHero ? "text-white" : "text-foreground",
                    )}
                  >
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        isHero
                          ? "text-white/68 hover:text-white"
                          : "text-muted-foreground hover:text-primary",
                      )}
                    >
                      {index === 0 ? <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : null}
                      <span>{item.label}</span>
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast ? (
                <BreadcrumbSeparator
                  className={cn(
                    "shrink-0",
                    isHero ? "text-white/38" : "text-muted-foreground/60",
                  )}
                />
              ) : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );

  if (!contained) {
    return <div className={cn("relative z-20 pt-5", className)}>{trail}</div>;
  }

  return (
    <Container className={cn("relative z-20 pt-5", className)}>
      {trail}
    </Container>
  );
}
