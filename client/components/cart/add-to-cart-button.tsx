"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getCourseMeta } from "@/helpers/course-meta";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Course } from "@/types/course";

interface AddToCartButtonProps {
  course: Course;
  className?: string;
}

const getInstructorLabel = (course: Course) => {
  const facultyNames =
    course.faculties
      ?.map((faculty) =>
        [faculty.firstName, faculty.lastName].filter(Boolean).join(" ").trim(),
      )
      .filter(Boolean) || [];

  if (facultyNames.length) return facultyNames.join(", ");

  return [course.createdBy?.firstName, course.createdBy?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
};

export const AddToCartButton = ({
  course,
  className,
}: AddToCartButtonProps) => {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);

  const alreadyAdded = useCartStore((state) =>
    state.cartItems.some((item) => item.id === course.id),
  );

  const [loading, setLoading] = useState(false);

  const [meta, setMeta] = useState({
    totalLectures: 0,
    totalDuration: "0m",
  });

  useEffect(() => {
    let isMounted = true;

    const loadMeta = async () => {
      const data = await getCourseMeta(course);

      if (isMounted) {
        setMeta(data);
      }
    };

    loadMeta();

    return () => {
      isMounted = false;
    };
  }, [course]);

  const handleAddToCart = async () => {
    if (alreadyAdded) {
      router.push("/cart");
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    addToCart({
      id: course.id,
      title: course.title,
      price: Number(course.priceInr),
      image: course.image?.path,
      instructor: getInstructorLabel(course),
      totalDuration: meta.totalDuration,
      totalLectures: meta.totalLectures,
      slug: course.slug,
    });

    setLoading(false);

    toast.success("Added to cart", {
      description: course.title,
      action: {
        label: "View Cart",
        onClick: () => router.push("/cart"),
      },
    });
  };

  return (
    <Button
      type="button"
      onClick={handleAddToCart}
      disabled={loading}
      className={cn(
        "group relative h-12 w-full overflow-hidden rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-[0_16px_40px_color-mix(in_oklab,var(--primary)_24%,transparent)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90",
        alreadyAdded && "bg-foreground text-background hover:bg-foreground/90",
        loading && "cursor-not-allowed opacity-80 hover:translate-y-0",
        className,
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            Adding...
          </>
        ) : alreadyAdded ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Go to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </>
        )}
      </span>
    </Button>
  );
};
