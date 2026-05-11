import { ContactLeadsDashboard } from "@/components/admin/contact-leads/contact-leads-dashboard";
import { contactLeadServerService } from "@/services/contact-leads/contact-lead.server";
import { ContactLead } from "@/types/contact-lead";

export default async function ContactLeadsPage() {
  let leads: ContactLead[] = [];

  try {
    const response = await contactLeadServerService.list();
    leads = response.data;
  } catch {
    console.error("Failed to load contact leads");
  }

  return <ContactLeadsDashboard leads={leads} />;
}
