"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface AddButtonProps {
  title?: string;
  redirectPath?: string; // optional redirect base
  FormComponent: React.ComponentType<{
    onSuccess?: (id?: number | string) => void;
  }>;
}

export default function AddButton({
  title,
  redirectPath,
  FormComponent,
}: AddButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* 🔥 BUTTON */}
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <IconPlus className="size-4" />
          <span className="hidden lg:inline">{title || "Add"}</span>
        </Button>
      </PopoverTrigger>

      {/* 🔥 CONTENT */}
      <PopoverContent align="end" className="w-80 p-4">
        <FormComponent
          onSuccess={(id) => {
            setOpen(false);

            if (redirectPath && id) {
              router.push(`${redirectPath}/${id}`);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
