import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/config";

type Method = "GET" | "POST" | "PATCH" | "DELETE";
type ServerRequestInit = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

const DEFAULT_TIMEOUT_MS = Number(
  process.env.API_SERVER_REQUEST_TIMEOUT_MS || 10000,
);

const hasOwn = (value: object, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

async function request<T>(
  url: string,
  method: Method,
  body?: unknown,
  options: ServerRequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, DEFAULT_TIMEOUT_MS);

  const forwardAbort = () => controller.abort();
  options.signal?.addEventListener("abort", forwardAbort, { once: true });

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      ...(!hasOwn(options, "cache") && !hasOwn(options, "next")
        ? { cache: "no-store" as RequestCache }
        : {}),
      credentials: "include",
      headers: {
        ...(body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        cookie: cookieStore.toString(),
        ...(options.headers || {}),
      },
      ...(body
        ? body instanceof FormData
          ? { body }
          : { body: JSON.stringify(body) }
        : {}),
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("Server request timed out. Please try again.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", forwardAbort);
  }
  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const error = await response.json();

      if (Array.isArray(error.message)) {
        message = error.message.join(", ");
      } else if (typeof error.message === "string") {
        message = error.message;
      }
    } catch {}
    if (response.status === 401) {
      throw new Error("AUTH_EXPIRED");
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const apiServer = {
  get: <T>(url: string, options?: ServerRequestInit) =>
    request<T>(url, "GET", undefined, options),

  post: <T>(url: string, body?: unknown, options?: ServerRequestInit) =>
    request<T>(url, "POST", body, options),

  patch: <T>(url: string, body?: unknown, options?: ServerRequestInit) =>
    request<T>(url, "PATCH", body, options),

  delete: <T>(url: string, options?: ServerRequestInit) =>
    request<T>(url, "DELETE", undefined, options),
};
