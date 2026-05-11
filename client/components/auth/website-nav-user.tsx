"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Loader,
  LogOut,
  ReceiptText,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/context/session-context";
import { apiClient } from "@/lib/api/client";
import { canAccessAdmin, canAccessFaculty } from "@/lib/access-control";
import { getErrorMessage } from "@/lib/error-handler";
import { getUserAvatarUrl } from "@/lib/user-avatar";

export const WebsiteNavUser = () => {
  const { user } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <Button
        asChild
        variant="ghost"
        aria-label="Sign in"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 p-0 text-foreground shadow-sm backdrop-blur transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <Link href="/auth/sign-in">
          <User className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    "U";

  const avatarUrl = getUserAvatarUrl(user);
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Open user menu"
          className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card p-0 shadow-sm backdrop-blur transition-colors hover:border-primary/25 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <span className="absolute -inset-0.5 rounded-full bg-primary opacity-0 blur transition-opacity group-hover:opacity-20" />

          <Avatar className="relative h-9 w-9 border border-border">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={fullName || user.firstName} />
            ) : null}

            <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-72 rounded-3xl border border-border bg-popover p-2 text-popover-foreground shadow-[0_24px_80px_color-mix(in_oklab,var(--foreground)_16%,transparent)]"
      >
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border border-border shadow-sm">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={fullName || user.firstName} />
              ) : null}

              <AvatarFallback className="bg-background text-sm font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-card-foreground">
                {fullName || "User"}
              </p>

              <p
                title={user.email}
                className="mt-0.5 truncate text-xs font-medium text-muted-foreground"
              >
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="my-2 bg-border" />

        <DropdownMenuGroup className="space-y-1">
          <NavMenuItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
          />
          {canAccessAdmin(user) ? (
            <NavMenuItem
              href="/admin/dashboard"
              icon={LayoutDashboard}
              label="Admin Dashboard"
            />
          ) : null}
          {canAccessFaculty(user) ? (
            <NavMenuItem
              href="/faculty/dashboard"
              icon={GraduationCap}
              label="Faculty Dashboard"
            />
          ) : null}
          <NavMenuItem href="/profile" icon={User} label="Profile" />
          <NavMenuItem href="/my-courses" icon={BookOpen} label="My Courses" />
          <NavMenuItem href="/exams" icon={ClipboardCheck} label="Exams" />
          <NavMenuItem href="/orders" icon={ReceiptText} label="Orders" />
          <NavMenuItem href="/certificates" icon={Award} label="Certificates" />
          <NavMenuItem href="/settings" icon={Settings} label="Settings" />
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2 bg-border" />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loading}
          className="flex h-11 cursor-pointer items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-destructive transition-colors focus:bg-destructive/10 focus:text-destructive disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </span>

          {loading ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function NavMenuItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <DropdownMenuItem asChild>
      <Link
        href={href}
        className="flex h-11 cursor-pointer items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-muted-foreground transition-colors focus:bg-primary/10 focus:text-primary"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-primary ring-1 ring-border">
          <Icon className="h-4 w-4" />
        </span>

        <span>{label}</span>
      </Link>
    </DropdownMenuItem>
  );
}
