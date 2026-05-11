import { FacultyAccessGate } from "@/components/faculty/layout/faculty-access-gate";
import { FacultyNavbar } from "@/components/faculty/layout/faculty-navbar";
import { FacultySidebar } from "@/components/faculty/layout/faculty-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { canAccessFaculty } from "@/lib/access-control";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function FacultyLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (session && !canAccessFaculty(session)) {
    redirect("/");
  }

  return (
    <div className="font-sans">
      <FacultyAccessGate>
        <SidebarProvider>
          <FacultySidebar variant="inset" />
          <SidebarInset className="bg-transparent">
            <FacultyNavbar />
            <main className="flex flex-1 flex-col gap-4 bg-transparent p-3 sm:p-4 lg:p-5">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </FacultyAccessGate>
    </div>
  );
}
