import { cn } from "@/lib/utils";

interface SummaryRowProps {
  label: string;
  value: string;
  muted?: boolean;
  strike?: boolean;
  strong?: boolean;
  accent?: "primary" | "success";
  noPadding?: boolean;
}

export function SummaryRow({
  label,
  value,
  muted = false,
  strike = false,
  strong = false,
  accent,
  noPadding = false,
}: SummaryRowProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4",
        !noPadding && "text-sm",
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
          accent === "primary" && "text-primary",
          accent === "success" && "text-primary",
          !accent && "text-card-foreground",
          strike && "line-through",
        )}
      >
        {value}
      </span>
    </div>
  );
}
