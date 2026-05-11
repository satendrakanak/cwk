"use client";

import { GraduationCap } from "lucide-react";
import Link from "next/link";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSiteSettings } from "@/context/site-settings-context";

export function FacultyLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { site } = useSiteSettings();
  const iconSrc = site.adminPanelIconUrl || "";
  const name = site.adminPanelName || "CWK";

  return (
    <SidebarMenu className="bg-transparent">
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          size="lg"
          className={`transition-all duration-200 ${
            isCollapsed ? "justify-center px-2" : ""
          }`}
        >
          <Link href="/faculty/dashboard" className="flex w-full items-center gap-2">
            <div
              className={`flex items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm ${
                isCollapsed ? "mx-auto size-10" : "size-10"
              }`}
            >
              {iconSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconSrc}
                  alt={name}
                  width={40}
                  height={40}
                  className="size-8 rounded-lg object-contain"
                />
              ) : (
                <GraduationCap className="size-5" />
              )}
            </div>

            {!isCollapsed && (
              <div className="flex flex-col text-left leading-tight">
                <span className="max-w-[150px] truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {name}
                </span>
                <span className="text-xs text-muted-foreground">
                  Faculty Panel
                </span>
              </div>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
