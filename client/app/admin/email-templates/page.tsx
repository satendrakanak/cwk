import { EmailTemplatesDashboardLoader } from "@/components/admin/email-templates/email-templates-dashboard-loader";
import { emailTemplateServerService } from "@/services/email-templates/email-template.server";
import { EmailTemplate } from "@/types/email-template";

export default async function EmailTemplatesPage() {
  let templates: EmailTemplate[] = [];

  try {
    const response = await emailTemplateServerService.getAll({ limit: 100 });
    templates = response.data.data;
  } catch (error) {
    console.error(error);
  }

  return <EmailTemplatesDashboardLoader templates={templates} />;
}
