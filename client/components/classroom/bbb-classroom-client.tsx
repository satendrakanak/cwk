"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  Loader2,
  Mic,
  RefreshCw,
  Video,
} from "lucide-react";

import { WebsiteNavUser } from "@/components/auth/website-nav-user";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-handler";
import { facultyWorkspaceClient } from "@/services/faculty/faculty-workspace.client";

type ClassroomRole = "faculty" | "learner";
type DeviceSetupStatus = "idle" | "checking" | "ready" | "blocked";

export function BbbClassroomClient() {
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const iframeLoadedRef = useRef(false);
  const [joinUrl, setJoinUrl] = useState("");
  const [error, setError] = useState("");
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [classEnded, setClassEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deviceSetup, setDeviceSetup] = useState<DeviceSetupStatus>("idle");
  const [deviceMessage, setDeviceMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const sessionId = Number(params.sessionId);
  const role = useMemo<ClassroomRole>(() => {
    return searchParams.get("role") === "faculty" ? "faculty" : "learner";
  }, [searchParams]);
  const backHref = role === "faculty" ? "/faculty/classes" : "/classes";

  useEffect(() => {
    let isMounted = true;

    async function openClassroom() {
      if (!Number.isFinite(sessionId)) {
        setError("Invalid class session.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response =
          role === "faculty"
            ? await facultyWorkspaceClient.startBbbSession(sessionId)
            : await facultyWorkspaceClient.joinBbbSession(sessionId);

        if (isMounted) {
          setJoinUrl(response.data.joinUrl);
          iframeLoadedRef.current = false;
          setIframeBlocked(false);
          setIframeLoaded(false);
          setIframeReady(false);
          setClassEnded(false);
          setDeviceSetup("idle");
          setDeviceMessage("");
        }
      } catch (caught: unknown) {
        if (isMounted) {
          setError(getErrorMessage(caught));
          setJoinUrl("");
          setIframeReady(false);
          setClassEnded(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void openClassroom();

    return () => {
      isMounted = false;
    };
  }, [retryCount, role, sessionId]);

  const shouldAutoRetry =
    role === "learner" &&
    !joinUrl &&
    Boolean(error) &&
    error.toLowerCase().includes("faculty has not started");

  useEffect(() => {
    if (!shouldAutoRetry) return;

    const interval = window.setInterval(() => {
      setRetryCount((count) => count + 1);
    }, 10_000);

    return () => window.clearInterval(interval);
  }, [shouldAutoRetry]);

  useEffect(() => {
    if (!joinUrl || deviceSetup !== "ready") return;

    iframeLoadedRef.current = false;
    setIframeBlocked(false);
    setIframeLoaded(false);
    setIframeReady(false);

    const readyTimeout = window.setTimeout(() => {
      setIframeReady(true);
    }, role === "faculty" ? 5000 : 500);

    const timeout = window.setTimeout(() => {
      if (!iframeLoadedRef.current) {
        setIframeBlocked(true);
      }
    }, role === "faculty" ? 14_000 : 9000);

    return () => {
      window.clearTimeout(readyTimeout);
      window.clearTimeout(timeout);
    };
  }, [deviceSetup, joinUrl, role]);

  const handleIframeLoad = () => {
    iframeLoadedRef.current = true;
    setIframeLoaded(true);
  };

  useEffect(() => {
    if (!joinUrl || deviceSetup !== "ready" || classEnded) return;

    let isActive = true;

    async function checkStatus() {
      try {
        const response =
          role === "faculty"
            ? await facultyWorkspaceClient.getFacultyBbbSessionStatus(sessionId)
            : await facultyWorkspaceClient.getLearnerBbbSessionStatus(sessionId);

        if (
          isActive &&
          response.data.isEnded &&
          !response.data.isRunning
        ) {
          setClassEnded(true);
          setIframeBlocked(false);
          setIframeReady(false);
        }
      } catch {
        // Keep the classroom open if a transient status check fails.
      }
    }

    const firstCheck = window.setTimeout(() => {
      void checkStatus();
    }, 12_000);
    const interval = window.setInterval(() => {
      void checkStatus();
    }, 8_000);

    return () => {
      isActive = false;
      window.clearTimeout(firstCheck);
      window.clearInterval(interval);
    };
  }, [classEnded, deviceSetup, joinUrl, role, sessionId]);

  const handleDeviceSetup = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setDeviceSetup("ready");
      return;
    }

    try {
      setDeviceSetup("checking");
      setDeviceMessage("");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      setDeviceSetup("ready");
    } catch {
      setDeviceSetup("blocked");
      setDeviceMessage(
        "Camera or microphone permission was blocked. You can still enter the classroom and allow permissions again when the live class asks.",
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="z-20 border-b bg-card/95 px-4 py-3 shadow-sm backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Logo />
            <div className="hidden h-7 w-px bg-border sm:block" />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Live Classroom
              </p>
              <h1 className="truncate text-sm font-semibold md:text-base">
                {role === "faculty" ? "Faculty session" : "Student session"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={backHref}>
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Link>
            </Button>
            <WebsiteNavUser />
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 bg-muted/35 p-3 md:p-4">
        <div className="relative min-h-[calc(100vh-96px)] flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
          {loading ? (
            <ClassroomState
              icon={<Loader2 className="size-7 animate-spin" />}
              title="Preparing your classroom"
              message="We are checking class timing and opening the live session."
            />
          ) : classEnded ? (
            <ClassroomState
              backHref={backHref}
              icon={<CheckCircle2 className="size-7" />}
              title="Class ended"
              message={
                role === "faculty"
                  ? "Your live class has ended. The class dashboard will update the session status and recordings can be synced once BBB finishes processing them."
                  : "This live class has ended. You can return to your schedule and review available recordings when the faculty allows access."
              }
            />
          ) : error ? (
            <ClassroomState
              backHref={backHref}
              icon={<Clock3 className="size-7" />}
              onRetry={
                shouldAutoRetry ? () => setRetryCount((count) => count + 1) : undefined
              }
              title={
                role === "faculty"
                  ? "This class cannot be started yet"
                  : "Please wait for your faculty"
              }
              message={
                role === "faculty"
                  ? error
                  : `${error} Keep this page for class time, or return to your schedule and join again once faculty starts the session.`
              }
            />
          ) : joinUrl ? (
            deviceSetup === "ready" ? (
              <EmbeddedClassroom
                iframeBlocked={iframeBlocked}
                iframeLoaded={iframeLoaded}
                iframeReady={iframeReady}
                joinUrl={joinUrl}
                onLoad={handleIframeLoad}
                role={role}
              />
            ) : (
              <DeviceSetupState
                message={deviceMessage}
                onContinue={() => setDeviceSetup("ready")}
                onStart={handleDeviceSetup}
                role={role}
                status={deviceSetup}
              />
            )
          ) : null}
        </div>
      </main>
    </div>
  );
}

function DeviceSetupState({
  message,
  onContinue,
  onStart,
  role,
  status,
}: {
  message: string;
  onContinue: () => void;
  onStart: () => void;
  role: ClassroomRole;
  status: DeviceSetupStatus;
}) {
  const isChecking = status === "checking";
  const isBlocked = status === "blocked";

  return (
    <div className="flex h-full min-h-[calc(100vh-96px)] items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl border bg-background p-6 shadow-sm md:p-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {isChecking ? (
            <Loader2 className="size-7 animate-spin" />
          ) : (
            <Video className="size-7" />
          )}
        </div>
        <div className="mx-auto mt-5 max-w-xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Classroom setup
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Allow camera and microphone
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {role === "faculty"
              ? "Check your devices before starting the live class. This helps screen sharing, audio, and camera permissions work smoothly."
              : "Check your devices before joining. You will stay inside this classroom page and the live class will open after setup."}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mic className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">Microphone</h3>
                <p className="text-sm text-muted-foreground">
                  Needed for speaking in class.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Camera className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">Camera</h3>
                <p className="text-sm text-muted-foreground">
                  Optional, but checked for live interaction.
                </p>
              </div>
            </div>
          </div>
        </div>

        {isBlocked ? (
          <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            {message}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={onStart} disabled={isChecking}>
            {isChecking ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 size-4" />
            )}
            {isChecking ? "Checking devices" : "Allow and continue"}
          </Button>
          {isBlocked ? (
            <Button type="button" variant="outline" onClick={onContinue}>
              Continue without device check
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EmbeddedClassroom({
  iframeBlocked,
  iframeLoaded,
  iframeReady,
  joinUrl,
  onLoad,
  role,
}: {
  iframeBlocked: boolean;
  iframeLoaded: boolean;
  iframeReady: boolean;
  joinUrl: string;
  onLoad: () => void;
  role: ClassroomRole;
}) {
  return (
    <div className="relative h-full min-h-[calc(100vh-96px)] bg-background">
      {(!iframeReady || !iframeLoaded) && !iframeBlocked ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <div className="max-w-md rounded-3xl border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Loader2 className="size-7 animate-spin" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold">Opening classroom</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We are loading the live class inside this workspace. Please allow
              camera and microphone when the classroom asks.
            </p>
          </div>
        </div>
      ) : null}

      {iframeBlocked ? (
        <ClassroomState
          icon={<Video className="size-7" />}
          message="The BBB server is not allowing this website to embed the live classroom. Ask your BBB server admin to allow this domain in frame-ancestors or remove X-Frame-Options for the HTML5 client. After that, the class will open here without showing the BBB URL."
          title="Classroom embed is blocked"
        />
      ) : (
        iframeReady ? (
          <iframe
            allow="camera *; microphone *; display-capture *; fullscreen *; autoplay *; clipboard-write *"
            allowFullScreen
            className="h-full min-h-[calc(100vh-96px)] w-full border-0 bg-background"
            onLoad={onLoad}
            referrerPolicy="no-referrer-when-downgrade"
            src={joinUrl}
            title={
              role === "faculty"
                ? "Faculty live classroom"
                : "Student live classroom"
            }
          />
        ) : null
      )}
    </div>
  );
}

function ClassroomState({
  backHref,
  icon,
  message,
  onRetry,
  title,
}: {
  backHref?: string;
  icon: ReactNode;
  message: string;
  onRetry?: () => void;
  title: string;
}) {
  return (
    <div className="flex h-full min-h-[calc(100vh-96px)] items-center justify-center p-6 text-center">
      <div className="max-w-lg rounded-3xl border bg-background p-8 shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {onRetry ? (
            <Button type="button" variant="outline" onClick={onRetry}>
              <RefreshCw className="mr-2 size-4" />
              Check again
            </Button>
          ) : null}
          {backHref ? (
            <Button asChild>
              <Link href={backHref}>
                <ArrowLeft className="mr-2 size-4" />
                Back to schedule
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
