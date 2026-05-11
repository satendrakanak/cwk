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

const defaultAdminIconSources = new Set([
  "/assets/pwa-icon-192.png",
  "/assets/cwk-mark-light.png",
  "/assets/cwk-mark-dark.png",
]);

export function FacultyLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { site } = useSiteSettings();
  const iconSrc = site.adminPanelIconUrl || "";
  const name = site.adminPanelName || "CWK";
  const useDefaultThemeIcon = defaultAdminIconSources.has(iconSrc);

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
              className={`flex items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-white/15 ${
                isCollapsed ? "mx-auto size-10" : "size-10"
              }`}
            >
              {useDefaultThemeIcon ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/cwk-mark-light.png"
                    alt={name}
                    width={40}
                    height={40}
                    className="size-8 object-contain dark:hidden"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/cwk-mark-dark.png"
                    alt={name}
                    width={40}
                    height={40}
                    className="hidden size-8 object-contain dark:block"
                  />
                </>
              ) : iconSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconSrc}
                  alt={name}
                  width={40}
                  height={40}
                  className="size-8 object-contain"
                />
              ) : (
                <GraduationCap className="size-5 text-sidebar-primary" />
              )}
            </div>

            {!isCollapsed && (
              <div className="flex flex-col text-left leading-tight">
                <span className="max-w-[150px] truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {name === "CWK" ? "CodeWithKasa" : name}
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
