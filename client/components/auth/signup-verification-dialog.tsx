"use client";

import { useEffect, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type SignupVerificationDialogProps = {
  open: boolean;
  maskedEmail: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
};

export function SignupVerificationDialog({
  open,
  maskedEmail,
  isSubmitting,
  onOpenChange,
  onVerify,
  onResend,
}: SignupVerificationDialogProps) {
  const [code, setCode] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!open) {
      setCode("");
      setIsResending(false);
    }
  }, [open]);

  const handleVerify = async () => {
    if (code.trim().length !== 6) return;
    await onVerify(code.trim());
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      await onResend();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-3xl border border-border bg-card p-0 shadow-[var(--shadow-soft)] sm:max-w-md">
        <div className="p-5 md:p-6">
          <DialogHeader>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <MailCheck className="h-7 w-7" />
            </div>

            <DialogTitle className="text-xl font-semibold text-foreground">
              Verify your email to activate your account
            </DialogTitle>

            <DialogDescription className="pt-2 text-sm leading-6 text-muted-foreground">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-foreground">
                {maskedEmail}
              </span>
              . Enter it here to verify your email and complete sign up.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-3">
            <Input
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              className="h-14 rounded-2xl border-border bg-muted text-center text-xl font-bold tracking-[0.42em] text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary"
            />

            <p className="rounded-2xl border border-border bg-muted p-3 text-xs leading-5 text-muted-foreground">
              Once verified, your account will be activated and you will be
              signed in automatically.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-border bg-muted/60 p-5 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={isSubmitting || isResending}
            className="h-11 rounded-full border-border bg-background px-5 font-semibold text-foreground hover:bg-accent"
          >
            {isResending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Resend code
          </Button>

          <Button
            type="button"
            onClick={handleVerify}
            disabled={isSubmitting || code.trim().length !== 6}
            className="academy-btn-primary h-11 px-5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Verify account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
