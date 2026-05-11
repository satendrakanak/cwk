"use client";

import Logo from "@/components/logo";

interface AuthHeaderProps {
  label: string;
}

export default function AuthHeader({ label }: AuthHeaderProps) {
  return (
    <div className="mb-2 flex flex-col items-center text-center">
      <div className="mb-4 inline-flex rounded-2xl border border-border bg-muted px-4 py-3 shadow-sm">
        <Logo />
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
        CodeWithKasa
      </p>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {label}
      </h1>

      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Continue securely to access your learning dashboard.
      </p>
    </div>
  );
}
