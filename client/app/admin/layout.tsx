import { AppSidebar } from "@/components/admin/layout/app-sidebar";
import { AdminAccessGate } from "@/components/admin/layout/admin-access-gate";
import { AdminLicenseGate } from "@/components/admin/layout/admin-license-gate";
import { AdminLicenseProvider } from "@/components/admin/layout/admin-license-provider";
import Navbar from "@/components/admin/layout/navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/access-control";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (session && !canAccessAdmin(session)) {
    redirect("/");
  }

  return (
    <div className="font-sans">
      <AdminAccessGate>
        <AdminLicenseProvider>
          <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset className="bg-transparent">
              <Navbar />
              <main className="flex flex-1 flex-col gap-4 bg-transparent p-3 sm:p-4 lg:p-5">
                <AdminLicenseGate>{children}</AdminLicenseGate>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </AdminLicenseProvider>
      </AdminAccessGate>
    </div>
  );
}
