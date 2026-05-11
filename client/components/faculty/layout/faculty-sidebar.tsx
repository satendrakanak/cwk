"use client";

import { NavMain } from "@/components/admin/layout/nav-main";
import { NavUser } from "@/components/admin/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { facultySidebarData } from "@/data/faculty-sidebar";
import { FacultyLogo } from "./faculty-logo";

export function FacultySidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <FacultyLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={facultySidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
