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

type GuestCheckoutVerificationDialogProps = {
  open: boolean;
  maskedEmail: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
};

export function GuestCheckoutVerificationDialog({
  open,
  maskedEmail,
  isSubmitting,
  onOpenChange,
  onVerify,
  onResend,
}: GuestCheckoutVerificationDialogProps) {
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
      <DialogContent className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-[0_35px_120px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-[#07111f] dark:shadow-[0_35px_120px_rgba(0,0,0,0.55)] sm:max-w-md">
        <div className="p-5 md:p-6">
          <DialogHeader>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-white/10 dark:text-rose-200 dark:ring-white/10">
              <MailCheck className="h-7 w-7" />
            </div>

            <DialogTitle className="text-xl font-semibold text-slate-950 dark:text-white">
              Verify your email to continue
            </DialogTitle>

            <DialogDescription className="pt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {maskedEmail}
              </span>
              . Enter it here and we will create your account, verify it, and
              continue checkout.
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
              className="h-14 rounded-2xl border-slate-200 bg-slate-50 text-center text-xl font-bold tracking-[0.42em] text-slate-950 shadow-none placeholder:text-slate-300 focus-visible:border-blue-600 focus-visible:ring-blue-600 dark:border-white/10 dark:bg-[#0b1628] dark:text-white dark:placeholder:text-slate-600 dark:focus-visible:border-rose-200 dark:focus-visible:ring-rose-200"
            />

            <p className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3 text-xs leading-5 text-slate-600 dark:border-white/10 dark:bg-[#0b1628] dark:text-slate-300">
              If you already have a verified account on this email, sign in
              first and then continue checkout.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-slate-100 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-[#0b1628] sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={isSubmitting || isResending}
            className="h-11 rounded-full border-slate-200 bg-white px-5 font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
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
            className="h-11 rounded-full bg-blue-600 px-5 font-semibold text-white shadow-[0_14px_35px_rgba(37,99,235,0.24)] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-rose-200 dark:text-black dark:hover:bg-rose-300"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Verify and continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
