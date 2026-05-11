import { cn } from "@/lib/utils";

interface SummaryRowProps {
  label: string;
  value: string;
  muted?: boolean;
  strike?: boolean;
  strong?: boolean;
  accent?: boolean;
  noTextSize?: boolean;
}

export function SummaryRow({
  label,
  value,
  muted = false,
  strike = false,
  strong = false,
  accent = false,
  noTextSize = false,
}: SummaryRowProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4",
        !noTextSize && "text-sm",
      )}
    >
      <span
        className={cn(
          "leading-6",
          muted && "text-muted-foreground/70",
          strong && "font-semibold text-card-foreground",
          !muted && !strong && "text-muted-foreground",
        )}
      >
        {label}
      </span>

      <span
        className={cn(
          "shrink-0 text-right font-semibold",
          accent ? "text-primary" : "text-card-foreground",
          strike && "line-through",
        )}
      >
        {value}
      </span>
    </div>
  );
}
