"use client";

import { useSession } from "@/context/session-context";
import { hasAnyPermission, hasRole } from "@/lib/access-control";
import { ChevronRight, LockKeyhole } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarNavItem } from "@/data/sidebar";
import {
  getLicenseInvalidReason,
  isLicenseRecoveryPath,
} from "@/lib/license/module-access";
import { isDemoUser as getIsDemoUser } from "@/lib/demo-access";
import { useAdminLicense } from "./admin-license-provider";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: SidebarNavItem[];
}) {
  const pathname = usePathname();
  const { user } = useSession();
  const { summary, isLoading } = useAdminLicense();
  const licenseInvalid = !isLoading && Boolean(getLicenseInvalidReason(summary));
  const isSuperAdmin = hasRole(user, "super_admin") || hasRole(user, "admin");
  const isDemoUser = getIsDemoUser(user);

  const isLocked = (item: SidebarNavItem) => {
    if (isDemoUser) {
      return false;
    }

    if (isLoading || isLicenseRecoveryPath(item.url)) {
      return false;
    }

    if (licenseInvalid) {
      return true;
    }

    return Boolean(
      item.licenseFeature &&
        summary?.plan &&
        !summary.plan.features[item.licenseFeature],
    );
  };

  const visibleItems = items
    .map((item) => {
      const visibleChildren = item.items?.filter((subItem) => {
        if (isSuperAdmin) {
          return true;
        }

        return hasAnyPermission(user, subItem.requiredPermissions);
      });

      const canSeeParent =
        isSuperAdmin ||
        hasAnyPermission(user, item.requiredPermissions);

      if (item.items?.length) {
        if ((visibleChildren?.length ?? 0) === 0 && !canSeeParent) {
          return null;
        }

        return {
          ...item,
          items: visibleChildren,
        };
      }

      return canSeeParent ? item : null;
    })
    .filter(Boolean) as SidebarNavItem[];

  return (
    <SidebarGroup className="bg-transparent">
      <SidebarMenu>
        {visibleItems.map((item) => {
          const hasChildren = !!item.items?.length;

          const isParentActive =
            pathname === item.url ||
            item.items?.some((sub) => sub.url === pathname);

          // 🔥 CASE 1: NO SUBMENU
          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  data-active={pathname === item.url}
                  isActive={isParentActive}
                  variant="primary"
                  size="md"
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-2 w-full"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {isLocked(item) && (
                      <LockKeyhole className="ml-auto size-3.5 opacity-70" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // 🔥 CASE 2: WITH SUBMENU
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isParentActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  data-active={pathname === item.url}
                  isActive={isParentActive}
                  variant="primary"
                  size="md"
                >
                  <Link
                    href={item.url}
                    className="flex w-full items-center gap-2"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {isLocked(item) && (
                      <LockKeyhole className="ml-auto size-3.5 opacity-70" />
                    )}
                  </Link>
                </SidebarMenuButton>

                <CollapsibleTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  >
                    <ChevronRight />
                    <span className="sr-only">Toggle {item.title}</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>

                {/* Submenu */}
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items!.map((subItem) => {
                      const isActive = pathname === subItem.url;

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            data-active={isActive}
                            isActive={isActive}
                            size="md"
                          >
                            <Link
                              href={subItem.url}
                              className="flex w-full items-center gap-2"
                            >
                              <span>{subItem.title}</span>
                              {isLocked(subItem) && (
                                <LockKeyhole className="ml-auto size-3.5 opacity-70" />
                              )}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
