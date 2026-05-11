import { cn } from "@/lib/utils";

export function SettingsShell({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <section className="overflow-hidden rounded-[30px] border border-[var(--brand-100)] bg-[radial-gradient(circle_at_top_left,rgba(201,79,63,0.14),transparent_32%),linear-gradient(135deg,#ffffff_0%,#f8fbff_48%,#eef4ff_100%)] p-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))] md:p-8">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex rounded-full border border-[var(--brand-200)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-700)] dark:border-white/10 dark:bg-white/8 dark:text-[var(--brand-200)]">
            Settings
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">
              {description}
            </p>
          </div>
        </div>
      </section>
      {children}
    </div>
  );
}
