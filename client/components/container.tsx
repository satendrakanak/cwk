"use client";

import { cn } from "@/lib/utils";

interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
}
const Container = ({ children, className }: ContainerProps) => {
  return (
    <div
      className={cn(
        "max-w-630 mx-auto xl:px-20 md:px-10 sm:px-2 px-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Container;
