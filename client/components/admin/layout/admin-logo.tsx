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

export function AdminLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { site } = useSiteSettings();
  const adminIconSrc = site.adminPanelIconUrl || "";
  const adminName = site.adminPanelName || "U";

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
              className={`flex items-center justify-center rounded-xl shadow-sm ${
                isCollapsed ? "size-10 mx-auto" : "size-10"
              } bg-sidebar-primary text-sidebar-primary-foreground`}
            >
              {adminIconSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={adminIconSrc}
                  alt={adminName || "Admin"}
                  width={40}
                  height={40}
                  className="size-8 rounded-lg object-contain"
                />
              ) : (
                <GraduationCap className="size-5" />
              )}
            </div>

            {/* Text */}
            {!isCollapsed && (
              <div className="flex flex-col text-left leading-tight">
                <span className="max-w-[150px] truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {adminName}
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
