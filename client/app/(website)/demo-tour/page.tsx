import { DemoTourForm } from "@/components/demo-tour/demo-tour-form";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  path: "/demo-tour",
  title: "Take a KASA Tour",
  description: "Create a limited demo admin account and explore KASA for 1 hour.",
});

export default function DemoTourPage() {
  return <DemoTourForm />;
}
