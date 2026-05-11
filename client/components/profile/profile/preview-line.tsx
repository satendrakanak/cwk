import { Briefcase } from "lucide-react";

export function PreviewLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/50 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 wrap-break-word text-sm font-semibold text-card-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
