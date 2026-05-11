import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const TestimonialRating = ({ rating }: { rating: number }) => {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating || 0)));

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${normalizedRating} out of 5 rating`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const isFilled = index < normalizedRating;

        return (
          <Star
            key={index}
            className={cn(
              "h-4 w-4 transition",
              isFilled
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-slate-300 dark:text-slate-600",
            )}
          />
        );
      })}
    </div>
  );
};
