"use client";

import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface SubmitButtonProps {
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  type?: "submit" | "reset" | "button";
  className?: string;
}

export function SubmitButton({
  children,
  disabled,
  loading,
  loadingText,
  type,
  className,
}: SubmitButtonProps) {
  return (
    <Button type={type} disabled={disabled} size="sm" className={className}>
      {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? loadingText || children : children}
    </Button>
  );
}
