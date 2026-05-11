import { AppSidebar } from "@/components/admin/layout/app-sidebar";
import { AdminAccessGate } from "@/components/admin/layout/admin-access-gate";
import Navbar from "@/components/admin/layout/navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/access-control";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

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
        <SidebarProvider>
          <AppSidebar variant="inset" />
          <SidebarInset className="bg-transparent">
            <Navbar />
            <main className="flex flex-1 flex-col gap-4 bg-transparent p-3 sm:p-4 lg:p-5">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AdminAccessGate>
    </div>
  );
}
