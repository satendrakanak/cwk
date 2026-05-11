"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Testimonial } from "@/types/testimonial";
import { CreateTestimonialForm } from "./create-testimonial-form";

interface TestimonialDrawerProps {
  open: boolean;
  onClose: () => void;
  testimonial?: Testimonial | null;
}

export function TestimonialDrawer({
  open,
  onClose,
  testimonial,
}: TestimonialDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onClose} direction="right">
      <DrawerContent className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-[var(--brand-100)] bg-white dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)] sm:max-w-xl">
        <DrawerHeader className="shrink-0 border-b border-slate-100 dark:border-white/10">
          <DrawerTitle className="text-slate-950 dark:text-white">
            {testimonial ? "Edit Testimonial" : "Create Testimonial"}
          </DrawerTitle>
          <DrawerDescription className="text-slate-500 dark:text-slate-300">
            Manage testimonial details
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <CreateTestimonialForm
            key={testimonial?.id ?? "create"}
            testimonial={testimonial || undefined}
            onSuccess={onClose}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
