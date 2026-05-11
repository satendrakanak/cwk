"use client";

import { useState } from "react";
import type { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Video } from "lucide-react";

import { Button } from "@/components/ui/button";

type OpenClassroomButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "onClick" | "type"
> & {
  sessionId: number;
  role?: "faculty" | "learner";
  label?: string;
  disabledLabel?: string;
};

export function OpenClassroomButton({
  sessionId,
  role,
  label = "Open classroom",
  disabledLabel,
  disabled,
  ...buttonProps
}: OpenClassroomButtonProps) {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const isDisabled = disabled || opening;
  const href =
    role === "faculty"
      ? `/classroom/${sessionId}?role=faculty`
      : `/classroom/${sessionId}`;

  return (
    <Button
      {...buttonProps}
      type="button"
      disabled={isDisabled}
      onClick={() => {
        setOpening(true);
        router.push(href);
      }}
    >
      {opening ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Video className="size-4" />
      )}
      {opening ? "Opening..." : disabled && disabledLabel ? disabledLabel : label}
    </Button>
  );
}
