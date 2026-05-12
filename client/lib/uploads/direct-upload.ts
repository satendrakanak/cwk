import axios, { type AxiosProgressEvent } from "axios";

import type { ApiResponse } from "@/types/api";
import type { FileType, InitUploadResponse } from "@/types/file";

type UploadProgressHandler = (progressEvent: AxiosProgressEvent) => void;

export async function initDirectUpload(file: File) {
  const response = await fetch("/api/uploads/init", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = await readUploadJson<ApiResponse<InitUploadResponse>>(response);

  if (!json.data?.uploadId || !json.data?.url) {
    throw new Error("Upload could not be initialized");
  }

  return json.data;
}

export async function uploadToSignedUrl(
  url: string,
  file: File,
  onUploadProgress?: UploadProgressHandler,
) {
  await axios.put(url, file, {
    headers: {
      "Content-Type": file.type,
    },
    onUploadProgress,
  });
}

export async function confirmDirectUpload(uploadId: number) {
  const response = await fetch(`/api/uploads/confirm/${uploadId}`, {
    method: "POST",
    credentials: "include",
  });

  const json = await readUploadJson<ApiResponse<FileType>>(response);

  if (!json.data?.id) {
    throw new Error("Upload confirmation failed");
  }

  return json.data;
}

export function getDirectUploadErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && !error.response) {
    return "Upload blocked by browser/S3 CORS. Add your local and production app URLs to the S3 bucket CORS allowed origins, then retry.";
  }

  return error instanceof Error ? error.message : "Upload failed";
}

async function readUploadJson<T>(response: Response): Promise<T> {
  let body: unknown = null;

  try {
    body = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(response.statusText || `Upload request failed (${response.status})`);
    }
    throw new Error("Invalid upload response");
  }

  if (!response.ok) {
    throw new Error(extractMessage(body) || `Upload request failed (${response.status})`);
  }

  return body as T;
}

function extractMessage(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const message = "message" in body ? body.message : null;
  if (Array.isArray(message)) return message.join(", ");
  return typeof message === "string" ? message : null;
}
