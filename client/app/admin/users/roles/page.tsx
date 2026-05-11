import { redirect } from "next/navigation";

const LegacyRolesPage = () => {
  redirect("/admin/settings/access-control");
};

export default LegacyRolesPage;
