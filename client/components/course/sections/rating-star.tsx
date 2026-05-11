import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function RatingStars({
  rating,
  small = false,
}: {
  rating: number;
  small?: boolean;
}) {
  const roundedRating = Math.round(rating);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            small ? "h-4 w-4" : "h-5 w-5",
            value <= roundedRating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/35",
          )}
        />
      ))}
    </div>
  );
}
