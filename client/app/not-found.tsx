import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f8fafc_0%,#eef4ff_45%,#fff7ed_100%)] px-4">
      <section className="w-full max-w-2xl rounded-[32px] border border-white/80 bg-white/90 p-8 text-center shadow-[0_30px_90px_-50px_rgba(15,23,42,0.55)]">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[var(--brand-50)] text-[var(--brand-700)]">
          <SearchX className="size-10" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-[var(--brand-700)]">
          404 Not Found
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          This page is not available
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">
          The page may have moved, the link may be outdated, or the content is
          not published yet. Let’s get you back to a useful place.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-[var(--brand-600)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)]"
          >
            Go Home
          </Link>
          <Link
            href="/courses"
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]"
          >
            Explore Courses
          </Link>
        </div>
      </section>
    </main>
  );
}
