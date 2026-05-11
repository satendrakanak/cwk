import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="academy-surface relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-4 md:p-10">
      <div className="academy-grid-mask pointer-events-none absolute inset-0" />

      <div className="relative z-10 w-full max-w-sm md:max-w-4xl">
        {children}
      </div>
    </div>
  );
}
