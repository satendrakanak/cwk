import { NextRequest, NextResponse } from "next/server";
import {
  adminRoutePrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  facultyRoutePrefix,
  protectedRoutes,
  publicRoutes,
} from "./routes";

// 🔥 helper → prefix match
const matchRoute = (routes: string[], pathname: string) => {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
};

export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const hasSession = Boolean(accessToken || refreshToken);
  const response = NextResponse.next();

  response.headers.set("x-has-session", hasSession ? "true" : "false");

  // ✅ Route checks (improved)
  const isPublicRoute = matchRoute(publicRoutes, pathname);
  const isAuthRoute = matchRoute(authRoutes, pathname);
  const isAdminRoute = pathname.startsWith(adminRoutePrefix);
  const isFacultyRoute = pathname.startsWith(facultyRoutePrefix);
  const isProtectedRoute = matchRoute(protectedRoutes, pathname);
  const isLearningRoute =
    pathname.startsWith("/course/") &&
    (pathname.endsWith("/learn") || pathname.endsWith("/exams"));

  // =========================
  // 🔐 2. Auth routes (login/signup)
  // =========================
  if (isAuthRoute) {
    if (hasSession) {
      const callbackUrl = nextUrl.searchParams.get("callbackUrl");
      const safeRedirect =
        callbackUrl &&
        callbackUrl.startsWith("/") &&
        !callbackUrl.startsWith("//")
          ? callbackUrl
          : DEFAULT_LOGIN_REDIRECT;

      return NextResponse.redirect(
        new URL(safeRedirect, request.url),
      );
    }
    return response;
  }

  // =========================
  // 🚫 3. Admin + known private routes → no token
  // =========================
  if (
    (isAdminRoute || isFacultyRoute || isProtectedRoute || isLearningRoute) &&
    !hasSession
  ) {
    const loginUrl = new URL("/auth/sign-in", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${pathname}${nextUrl.search || ""}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  // =========================
  // 🟢 4. Public website routes → allow
  // =========================
  if (isPublicRoute && !isAdminRoute && !isFacultyRoute && !isLearningRoute) {
    return response;
  }

  // =========================
  // ✅ 5. Default website routes are public
  // =========================
  return response;
}
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
