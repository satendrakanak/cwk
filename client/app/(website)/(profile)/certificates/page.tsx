import { getSession } from "@/lib/auth";
import { certificateServerService } from "@/services/certificates/certificate.server";
import { Certificate } from "@/types/certificate";
import { CertificatesView } from "@/components/profile/certificates-view";

export default async function CertificatesPage() {
  const session = await getSession();
  if (!session) return null;

  let certificates: Certificate[] = [];

  try {
    const response = await certificateServerService.getMine();
    certificates = response.data;
  } catch (error) {
    console.error(error);
  }

  return (
    <div className=" min-h-[60vh]">
      <CertificatesView certificates={certificates} />
    </div>
  );
}
