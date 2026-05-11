"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  ChevronsUpDown,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  Loader,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "@/context/session-context";
import { apiClient } from "@/lib/api/client";
import { canAccessAdmin, canAccessFaculty } from "@/lib/access-control";
import { getErrorMessage } from "@/lib/error-handler";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/user-avatar";

type NavUserProps = {
  variant?: "sidebar" | "navbar";
};

export function NavUser({ variant = "sidebar" }: NavUserProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useSession();
  const { isMobile } = useSidebar();

  if (!user) return null;

  const displayName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const menuItems = [
    ...(canAccessAdmin(user)
      ? [
          { href: "/admin", label: "Admin dashboard", icon: LayoutDashboard },
          { href: "/admin/users", label: "Manage users", icon: UserRound },
          {
            href: "/admin/settings/access-control",
            label: "Roles & permissions",
            icon: ShieldCheck,
          },
          { href: "/admin/settings/site", label: "Site settings", icon: Settings },
        ]
      : []),
    ...(canAccessFaculty(user)
      ? [
          {
            href: "/faculty/dashboard",
            label: "Faculty dashboard",
            icon: GraduationCap,
          },
          { href: "/faculty/courses", label: "Faculty courses", icon: BookOpen },
          { href: "/faculty/exams", label: "Faculty exams", icon: ClipboardCheck },
        ]
      : []),
    { href: "/", label: "View website", icon: ExternalLink },
  ];

  const handleLogout = async () => {
    try {
      setLoading(true);
      await apiClient.post("/api/auth/sign-out");
      router.refresh();
      router.push("/auth/sign-in");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const trigger =
    variant === "navbar" ? (
      <Button
        variant="ghost"
        className="h-10 gap-2 rounded-full border border-border/70 bg-background/90 px-2 pr-3 shadow-sm backdrop-blur-sm hover:bg-muted/80"
      >
        <UserAvatar avatarUrl={avatarUrl} initials={initials} name={displayName} />
        <span className="hidden max-w-32 truncate text-sm font-semibold text-slate-800 dark:text-slate-100 sm:block">
          {displayName}
        </span>
        <ChevronsUpDown className="size-4 text-slate-400 dark:text-slate-500" />
      </Button>
    ) : (
      <SidebarMenuButton
        size="lg"
        className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <UserAvatar avatarUrl={avatarUrl} initials={initials} name={displayName} />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{displayName}</span>
          <span className="truncate text-xs">{user.email}</span>
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </SidebarMenuButton>
    );

  const dropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-64 rounded-2xl border-border/70 p-2 shadow-xl"
        side={variant === "navbar" || isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 text-left dark:bg-white/6">
            <UserAvatar avatarUrl={avatarUrl} initials={initials} name={displayName} />
            <div className="min-w-0 flex-1 text-sm leading-tight">
              <span className="block truncate font-semibold text-slate-900 dark:text-white">
                {displayName}
              </span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-300">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="cursor-pointer gap-2 rounded-lg">
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loading}
          className="cursor-pointer gap-2 rounded-lg text-red-600 focus:text-red-600"
        >
          {loading ? <Loader className="size-4 animate-spin" /> : <LogOut className="size-4" />}
          {loading ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (variant === "navbar") {
    return dropdown;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>{dropdown}</SidebarMenuItem>
    </SidebarMenu>
  );
}

function UserAvatar({
  avatarUrl,
  initials,
  name,
}: {
  avatarUrl?: string;
  initials: string;
  name: string;
}) {
  return (
    <Avatar className="h-8 w-8 rounded-xl ring-2 ring-white dark:ring-white/10">
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
      <AvatarFallback className="rounded-xl bg-red-50 text-sm font-semibold text-red-700 dark:bg-red-500/20 dark:text-red-100">
        {initials || "U"}
      </AvatarFallback>
    </Avatar>
  );
}
