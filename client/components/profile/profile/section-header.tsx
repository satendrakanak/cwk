import { UserRound } from "lucide-react";

export function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  compact = false,
}: {
  icon: typeof UserRound;
  eyebrow: string;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 border-b border-border ${
        compact ? "pb-4" : "pb-5"
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>

        <h2
          className={`mt-2 font-semibold text-card-foreground ${
            compact ? "text-xl" : "text-2xl"
          }`}
        >
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
