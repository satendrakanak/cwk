import { cn } from "@/lib/utils";

export function SwitchRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked?: boolean;
  onChange: (val: boolean) => void;
}) {
  const isChecked = Boolean(checked);

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-2xl border px-4 py-4 transition-colors",
        isChecked
          ? "border-primary/20 bg-primary/10"
          : "border-border bg-muted/50",
      )}
    >
      <div className="min-w-0">
        <span className="text-sm font-semibold text-card-foreground">
          {label}
        </span>

        {description ? (
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        onClick={() => onChange(!isChecked)}
        className={cn(
          "mt-1 flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors",
          isChecked ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-background shadow transition-transform",
            isChecked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}
