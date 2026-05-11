import type { ApiErrorResponse } from "@/types/api";

export function getErrorMessage(error: unknown): string {
  // 1. Already JS Error
  if (error instanceof Error) {
    return error.message;
  }

  // 2. API Error Object
  if (typeof error === "object" && error !== null) {
    const err = error as ApiErrorResponse;

    if (Array.isArray(err.message)) {
      return err.message.join(", ");
    }

    if (typeof err.message === "string") {
      return err.message;
    }
  }

  // 3. Fallback
  return "Something went wrong";
}
