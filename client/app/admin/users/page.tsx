import { UsersDashboard } from "@/components/admin/users/users-dashboard";
import { accessControlServerService } from "@/services/access-control/access-control.server";
import { getErrorMessage } from "@/lib/error-handler";
import { userServerService } from "@/services/users/user.server";
import { Paginated } from "@/types/api";
import { Role, User } from "@/types/user";

const UsersPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const filters = {
    page: Number(params.page ?? 1),
    limit: Number(params.limit ?? 10),
    search: typeof params.search === "string" ? params.search : undefined,
    roleId:
      typeof params.roleId === "string" && params.roleId
        ? Number(params.roleId)
        : undefined,
  };

  let users: Paginated<User> = {
    data: [],
    meta: {
      itemsPerPage: 10,
      totalItems: 0,
      currentPage: 1,
      totalPages: 0,
    },
    links: {
      first: "",
      last: "",
      current: "",
      next: "",
      previous: "",
    },
  };
  let roles: Role[] = [];
  try {
    const [usersResponse, rolesResponse] = await Promise.all([
      userServerService.getAll(filters),
      accessControlServerService.getRoles(),
    ]);
    users = usersResponse.data;
    roles = rolesResponse.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  return <UsersDashboard paginatedUsers={users} roles={roles} filters={filters} />;
};

export default UsersPage;
