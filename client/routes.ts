/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
  "/",
  "/articles",
  "/article",
  "/courses",
  "/course",
  "/client-testimonials",
  "/our-faculty",
  "/contact",
  "/cart",
  "/checkout",
  "/install",
  "/auth/verify-email",
];

/**
 * Routes that must always require a logged-in user.
 * Everything outside admin/auth/protected routes is treated as public website.
 */
export const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/my-courses",
  "/certificates",
  "/settings",
  "/learn",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/social/complete",
  "/auth/error",
  "/auth/reset-password",
  "/auth/forgot-password",
];

/**
 * The prefix for Admin Dashboard routes
 * Routes that start with this prefix are used for Admin Dashboard purposes
 * @type {string}
 */
export const adminRoutePrefix = "/admin";

/**
 * The prefix for Faculty Dashboard routes.
 * Faculty routes are private and then role-gated in the app shell.
 * @type {string}
 */
export const facultyRoutePrefix = "/faculty";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
