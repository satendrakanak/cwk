"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Lock, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { userClientService } from "@/services/users/user.client";

interface EditableFieldProps {
  userId: number;
  label: string;
  value: string;
  field: string;
  onUpdated: (val: string) => void;
  editable?: boolean;
}

export function EditableField({
  label,
  value,
  field,
  onUpdated,
  editable = true,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [temp, setTemp] = useState(value);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isEditable = editable !== false;

  useEffect(() => {
    setTemp(value);
  }, [value]);

  useEffect(() => {
    if (!isEditing) return;

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing]);

  const handleSave = async () => {
    try {
      setLoading(true);

      await userClientService.updateUser({
        [field]: temp,
      });

      onUpdated(temp);
      toast.success("Updated successfully");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTemp(value);
    setIsEditing(false);
  };

  return (
    <div className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>

        {!isEditing ? (
          <p className="mt-1 wrap-break-word text-sm font-semibold text-card-foreground">
            {value || "—"}
          </p>
        ) : (
          <div className="relative mt-2">
            <input
              ref={inputRef}
              id={field}
              value={temp}
              disabled={loading}
              onChange={(event) => setTemp(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSave();
                }

                if (event.key === "Escape") {
                  handleCancel();
                }
              }}
              className="h-10 w-full rounded-2xl border border-border bg-muted px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />

            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/70 backdrop-blur-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-5 flex shrink-0 items-center gap-2">
        {!isEditable ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
            <Lock className="h-4 w-4" />
          </span>
        ) : null}

        {isEditable && !isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            aria-label={`Edit ${label}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        ) : null}

        {isEditable && isEditing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Save ${label}`}
            >
              <Check className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Cancel ${label}`}
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
