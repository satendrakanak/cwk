"use client";

export async function downloadRemoteFile(
  fileUrl: string,
  fileName: string,
) {
  const response = await fetch(fileUrl);
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(blobUrl);
}
