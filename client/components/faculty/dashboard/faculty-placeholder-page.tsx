import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type FacultyPlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export function FacultyPlaceholderPage({
  eyebrow,
  title,
  description,
  icon: Icon,
}: FacultyPlaceholderPageProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-4xl items-center justify-center">
      <section className="w-full rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/faculty/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
