import { Card, CardContent } from "@/components/ui/card";
import { BookOpenCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: typeof BookOpenCheck;
  title: string;
  value: string | number;
  description: string;
  highlight?: boolean;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  description,
  highlight = false,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-3xl border border-border bg-card shadow-(--shadow-card)",
        highlight && "border-primary/20 bg-primary/5",
      )}
    >
      <CardContent className="p-4 md:p-5">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="h-5 w-5" />
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </p>

        <p className="mt-2 text-3xl font-semibold tracking-tight text-card-foreground">
          {value}
        </p>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
