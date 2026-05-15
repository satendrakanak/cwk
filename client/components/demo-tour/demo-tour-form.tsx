"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { demoTourClientService } from "@/services/demo-tours/demo-tour.client";

const progressSteps = [
  "Creating your demo account",
  "Preparing KASA controls",
  "Adding limited admin access",
  "Opening your 1 hour tour",
];

export function DemoTourForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);

  useEffect(() => {
    if (!isPreparing) return;

    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(current + 12, 92));
      setActiveStep((current) =>
        current >= progressSteps.length - 1 ? current : current + 1,
      );
    }, 650);

    return () => window.clearInterval(interval);
  }, [isPreparing]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsPreparing(true);
    setProgress(14);
    setActiveStep(0);

    startTransition(async () => {
      try {
        const response = await demoTourClientService.start({
          firstName: String(formData.get("firstName") || ""),
          lastName: String(formData.get("lastName") || ""),
          email: String(formData.get("email") || ""),
          phoneNumber: String(formData.get("phoneNumber") || ""),
          businessName: String(formData.get("businessName") || ""),
          useCase: String(formData.get("useCase") || ""),
        });

        setProgress(100);
        setActiveStep(progressSteps.length - 1);

        window.setTimeout(() => {
          router.push(response.data.defaultRedirect);
          router.refresh();
        }, 900);
      } catch (error) {
        setIsPreparing(false);
        setProgress(0);
        toast.error(
          error instanceof Error ? error.message : "Unable to start demo",
        );
      }
    });
  };

  return (
    <div className="grid min-h-[calc(100vh-90px)] gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-12 lg:py-12">
      <section className="flex flex-col justify-center">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-primary">
            KASA product tour
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Explore KASA with a ready demo admin account.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            We will create a limited demo admin for you, prepare the workspace,
            and keep the tour open for 1 hour.
          </p>
          {searchParams.get("expired") ? (
            <div className="mt-6 inline-flex max-w-xl items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-left text-sm text-amber-700 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Your previous demo session has expired and its temporary data is
                being cleaned. You can start a fresh tour from here.
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <Card className="self-center rounded-lg">
        <CardContent className="p-5 sm:p-6">
          {isPreparing ? (
            <div className="space-y-5">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  {progress >= 100 ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  )}
                  We are readying KASA for you
                </div>
                <Progress value={progress} />
              </div>
              <div className="rounded-md border bg-muted/40 p-4">
                <p className="text-sm font-medium">
                  {progressSteps[activeStep]}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please take a complete demo within 1 hour. Demo data will be
                  cleaned automatically after expiry.
                </p>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" name="lastName" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" name="email" required type="email" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone</Label>
                  <Input id="phoneNumber" name="phoneNumber" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business name</Label>
                  <Input id="businessName" name="businessName" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="useCase">What do you want to test?</Label>
                <Textarea id="useCase" name="useCase" rows={4} />
              </div>
              <Button className="w-full gap-2" disabled={isPending}>
                Start demo tour
                <ArrowRight className="size-4" />
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
