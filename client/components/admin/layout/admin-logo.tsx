"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSiteSettings } from "@/context/site-settings-context";

const defaultAdminIconSources = new Set([
  "/assets/pwa-icon-192.png",
  "/assets/cwk-mark-light.png",
  "/assets/cwk-mark-dark.png",
]);

export function AdminLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { site } = useSiteSettings();
  const adminIconSrc = site.adminPanelIconUrl || "";
  const adminName = site.adminPanelName || "U";
  const useDefaultThemeIcon = defaultAdminIconSources.has(adminIconSrc);

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
          <Link
            href="/admin/dashboard"
            className="flex items-center w-full gap-2"
          >
            {/* Icon */}
            <div
              className={`flex items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-white/15 ${
                isCollapsed ? "size-10 mx-auto" : "size-10"
              }`}
            >
              {useDefaultThemeIcon ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/cwk-mark-light.png"
                    alt={adminName || "Admin"}
                    width={40}
                    height={40}
                    className="size-8 object-contain dark:hidden"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/cwk-mark-dark.png"
                    alt={adminName || "Admin"}
                    width={40}
                    height={40}
                    className="hidden size-8 object-contain dark:block"
                  />
                </>
              ) : adminIconSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={adminIconSrc}
                  alt={adminName || "Admin"}
                  width={40}
                  height={40}
                  className="size-8 object-contain"
                />
              ) : (
                <GraduationCap className="size-5 text-sidebar-primary" />
              )}
            </div>

            {/* Text */}
            {!isCollapsed && (
              <div className="flex flex-col text-left leading-tight">
                <span className="max-w-[150px] truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {adminName === "CWK" ? "CodeWithKasa" : adminName}
                </span>
                <span className="text-xs text-muted-foreground">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
