import Container from "@/components/container";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactInfo } from "@/components/contact/contact-info";
import { PageHero } from "@/components/sliders/page-hero";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact CodeWithKasa for course guidance, support, and academy enquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />
      </div>

      <div className="relative z-10">
        <PageHero
          pageTitle="Contact Us"
          pageHeadline="Talk to the academy team with context, not confusion."
          pageDescription="Ask about admissions, course fit, faculty, support, or next steps and we will guide you clearly."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Contact" },
          ]}
        />

        <section className="py-12 pb-20">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
              <ContactForm />
              <ContactInfo />
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
