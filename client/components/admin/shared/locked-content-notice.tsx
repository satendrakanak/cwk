import { LockKeyhole } from "lucide-react";

type LockedContentNoticeProps = {
  title?: string;
  description?: string;
};

export function LockedContentNotice({
  title = "You do not have access",
  description = "Your account does not have permission to view this section.",
}: LockedContentNoticeProps) {
  return (
    <div className="rounded-3xl border border-amber-300/30 bg-amber-50 p-6 text-amber-950 shadow-sm dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-200">
          <LockKeyhole className="size-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 opacity-80">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
