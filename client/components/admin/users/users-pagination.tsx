"use client";

import { Paginated } from "@/types/api";
import { User, UsersQueryParams } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function buildParams(current: URLSearchParams, next: UsersQueryParams) {
  const params = new URLSearchParams(current.toString());

  if (next.page) params.set("page", String(next.page));
  if (next.limit) params.set("limit", String(next.limit));
  if (next.search !== undefined) {
    if (next.search) {
      params.set("search", next.search);
    } else {
      params.delete("search");
    }
  }
  if (next.roleId !== undefined) {
    if (next.roleId) {
      params.set("roleId", String(next.roleId));
    } else {
      params.delete("roleId");
    }
  }
  if (next.includeDeleted !== undefined) {
    if (next.includeDeleted) {
      params.set("includeDeleted", "true");
    } else {
      params.delete("includeDeleted");
    }
  }

  return params.toString();
}

export function UsersPagination({
  paginatedUsers,
}: {
  paginatedUsers: Paginated<User>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { meta } = paginatedUsers;

  const pushParams = (next: UsersQueryParams) => {
    const query = buildParams(searchParams, next);
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Showing page {meta.currentPage} of {meta.totalPages || 1} with{" "}
        {meta.totalItems} total users.
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="users-rows-per-page" className="text-sm font-medium dark:text-slate-200">
            Rows per page
          </Label>
          <Select
            value={String(meta.itemsPerPage)}
            onValueChange={(value) =>
              pushParams({ page: 1, limit: Number(value) })
            }
          >
            <SelectTrigger id="users-rows-per-page" size="sm" className="w-20">
              <SelectValue placeholder={meta.itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={String(pageSize)}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => pushParams({ page: 1 })}
            disabled={meta.currentPage <= 1}
          >
            <IconChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => pushParams({ page: meta.currentPage - 1 })}
            disabled={meta.currentPage <= 1}
          >
            <IconChevronLeft />
          </Button>
          <span className="min-w-24 text-center text-sm font-medium text-slate-700 dark:text-slate-200">
            {meta.currentPage} / {meta.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => pushParams({ page: meta.currentPage + 1 })}
            disabled={meta.currentPage >= meta.totalPages}
          >
            <IconChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => pushParams({ page: meta.totalPages })}
            disabled={meta.currentPage >= meta.totalPages}
          >
            <IconChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
