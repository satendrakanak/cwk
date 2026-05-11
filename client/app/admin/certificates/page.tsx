import { CertificatesDashboard } from "@/components/admin/certificates/certificates-dashboard";
import { getErrorMessage } from "@/lib/error-handler";
import { certificateServerService } from "@/services/certificates/certificate.server";
import type { AdminCertificateDashboard } from "@/types/certificate";
import { notFound } from "next/navigation";

export default async function AdminCertificatesPage() {
  let data: AdminCertificateDashboard = {
    summary: {
      enrolledLearners: 0,
      issuedCertificates: 0,
      readyToGenerate: 0,
      examPending: 0,
      courseIncomplete: 0,
    },
    rows: [],
  };

  try {
    const response = await certificateServerService.getAdminDashboard();
    data = response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("Certificates dashboard fetch error:", message);
    notFound();
  }

  return <CertificatesDashboard data={data} />;
}
