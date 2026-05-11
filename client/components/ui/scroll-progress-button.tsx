"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScrollProgressButton() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollHeight <= 0 ? 0 : Math.min(scrollTop / scrollHeight, 1);

      setProgress(nextProgress);
      setVisible(scrollTop > 200);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const dashOffset = useMemo(
    () => CIRCUMFERENCE - progress * CIRCUMFERENCE,
    [progress],
  );

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-5 right-4 z-[70] hidden h-12 w-12 items-center justify-center rounded-full bg-background/92 text-foreground shadow-[0_18px_40px_-22px_rgba(15,23,42,0.45)] backdrop-blur-xl transition duration-300 md:bottom-6 md:right-6 md:flex",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <svg
        className="-rotate-90 absolute inset-0"
        viewBox="0 0 52 52"
        aria-hidden="true"
      >
        <circle
          cx="26"
          cy="26"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="3"
        />
        <circle
          cx="26"
          cy="26"
          r={RADIUS}
          fill="none"
          stroke="var(--brand-600)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          className="scroll-progress-ring"
        />
      </svg>
      <ArrowUp className="size-4" />
    </button>
  );
}
