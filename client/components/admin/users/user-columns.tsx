"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconDotsVertical } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Role, User } from "@/types/user";
import { formatDate } from "@/utils/formate-date";

export const getUserColumns = (
  onDelete: (user: User) => void,
): ColumnDef<User>[] => [
  // ✅ Select
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
      />
    ),
  },

  // ✅ Name + Image
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;

      const avatarSrc = user.avatar?.path || user.avatarUrl;

      const initials =
        `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Link href={`/admin/users/${user.id}`}>
            <Avatar className="h-10 w-10">
              {avatarSrc && (
                <AvatarImage src={avatarSrc} alt={user.firstName || "User"} />
              )}

              <AvatarFallback>{initials || "U"}</AvatarFallback>
            </Avatar>
          </Link>

          <Link href={`/admin/users/${user.id}`}>
            <span className="font-medium hover:underline dark:text-slate-100">
              {user.firstName} {user.lastName}
            </span>
          </Link>
        </div>
      );
    },
  },

  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <span className="font-medium text-slate-700 dark:text-slate-300">
        {row.original.username || "Auto-generated"}
      </span>
    ),
  },

  // ✅ Email
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 flex-wrap">
          <span className="font-medium dark:text-slate-100">
            {row.original.email}
          </span>
        </div>
      );
    },
  },

  // ✅ Phone Number
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 flex-wrap">
          <span className="font-medium dark:text-slate-100">
            {row.original.phoneNumber}
          </span>
        </div>
      );
    },
  },

  // ✅ Roles
  {
    accessorKey: "roles",
    header: "Role",
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 flex-wrap">
          {row.original.roles?.map((role: Role) => (
            <Badge key={role.id} variant="outline">
              {role.name.toUpperCase()}
            </Badge>
          ))}
        </div>
      );
    },
  },

  {
    id: "status",
    header: "Profile",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <Badge variant="outline">
          {row.original.profile?.isPublic ? "Public" : "Private"}
        </Badge>
        {row.original.roles?.some((role) => role.name === "faculty") && (
          <Badge variant="outline">
            {row.original.facultyProfile?.isApproved
              ? "Faculty Approved"
              : "Faculty Pending"}
          </Badge>
        )}
      </div>
    ),
  },

  // ✅ Created Date
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },

  // ✅ Actions
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              asChild
              className="cursor-pointer flex items-center gap-2"
            >
              <Link href={`/admin/users/${user.id}`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(user)}
              className="cursor-pointer flex items-center gap-2"
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
