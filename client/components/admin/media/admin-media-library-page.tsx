"use client";

import axios from "axios";
import NextImage from "next/image";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  File,
  FileArchive,
  Image as ImageIcon,
  Images,
  Loader2,
  Search,
  Trash2,
  UploadCloud,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { renderMediaPreview } from "@/components/media/render-media-preview";
import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadClientService } from "@/services/uploads/upload.client";
import type { ApiResponse } from "@/types/api";
import type { FileType, InitUploadResponse, UploadingFile } from "@/types/file";
import { formatDateTime } from "@/utils/formate-date";

type MediaKind = "all" | "image" | "video" | "file";

type MediaStat = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

const mediaFilters: Array<{ value: MediaKind; label: string }> = [
  { value: "all", label: "All media" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "file", label: "Documents" },
];

const acceptedMediaTypes = [
  "image/*",
  "video/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
].join(",");

export function AdminMediaLibraryPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [media, setMedia] = useState<FileType[]>([]);
  const [selected, setSelected] = useState<FileType | null>(null);
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<MediaKind>("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void fetchMedia();
  }, []);

  useEffect(() => {
    if (selected && !media.some((item) => item.id === selected.id)) {
      setSelected(null);
    }
  }, [media, selected]);

  useEffect(() => {
    return () => {
      if (uploadingFile?.preview) {
        URL.revokeObjectURL(uploadingFile.preview);
      }
    };
  }, [uploadingFile?.preview]);

  const filteredMedia = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return media.filter((item) => {
      const matchesType = activeType === "all" || item.type === activeType;
      const matchesSearch =
        !needle ||
        [item.name, item.type, item.mime, item.path]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(needle));

      return matchesType && matchesSearch;
    });
  }, [activeType, media, search]);

  const stats = useMemo<MediaStat[]>(
    () => [
      {
        label: "Total files",
        value: media.length,
        icon: Images,
      },
      {
        label: "Images",
        value: media.filter((item) => item.type === "image").length,
        icon: ImageIcon,
      },
      {
        label: "Videos",
        value: media.filter((item) => item.type === "video").length,
        icon: Video,
      },
      {
        label: "Documents",
        value: media.filter((item) => item.type === "file").length,
        icon: FileArchive,
      },
    ],
    [media],
  );

  async function fetchMedia() {
    try {
      setLoading(true);
      const response = await uploadClientService.getAll();
      const data = Array.isArray(response?.data) ? response.data : [];
      setMedia(data);
      setSelected((current) => {
        if (current && data.some((item) => item.id === current.id)) {
          return current;
        }

        return data[0] ?? null;
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load media library");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      prepareUpload(file);
    }
  }

  function prepareUpload(file: File) {
    if (uploadingFile?.preview) {
      URL.revokeObjectURL(uploadingFile.preview);
    }

    setUploadingFile({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      uploading: false,
    });
  }

  async function startUpload() {
    if (!uploadingFile) return;

    try {
      setUploadingFile((current) =>
        current ? { ...current, uploading: true, progress: 0 } : current,
      );

      const file = uploadingFile.file;
      const initRes = await fetch("/api/uploads/init", {
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

      if (!initRes.ok) {
        throw new Error("Upload could not be initialized");
      }

      const json: ApiResponse<InitUploadResponse> = await initRes.json();
      const { uploadId, url } = json.data;

      await axios.put(url, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );

          setUploadingFile((current) =>
            current ? { ...current, progress: percent } : current,
          );
        },
      });

      const confirmRes = await fetch(`/api/uploads/confirm/${uploadId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!confirmRes.ok) {
        throw new Error("Upload confirmation failed");
      }

      const confirmJson: ApiResponse<FileType> = await confirmRes.json();
      const newMedia = confirmJson.data;

      setMedia((current) => [newMedia, ...current]);
      setSelected(newMedia);
      setUploadingFile(null);
      toast.success("Media uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
      setUploadingFile((current) =>
        current ? { ...current, uploading: false } : current,
      );
    }
  }

  async function handleCopyUrl() {
    if (!selected) return;

    await navigator.clipboard.writeText(selected.path);
    setCopied(true);
    toast.success("Media URL copied");
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function handleDelete() {
    if (!selected) return;

    try {
      setDeleting(true);
      await uploadClientService.deleteFile(selected.id);
      setMedia((current) => current.filter((item) => item.id !== selected.id));
      setConfirmOpen(false);
      toast.success("Media deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to delete media");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-(--brand-100) bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_55%,#eef4ff_100%)] p-6 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))] dark:shadow-[0_32px_80px_-42px_rgba(0,0,0,0.64)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex rounded-full border border-(--brand-200) bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-(--brand-700) dark:border-white/10 dark:bg-white/8 dark:text-[var(--brand-200)]">
              Media
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Media library
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Upload, review, copy, and clean up reusable images, videos, and
                documents from one admin workspace.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedMediaTypes}
              hidden
              onChange={handleFileChange}
            />
            <Button
              type="button"
              className="rounded-2xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="size-4" />
              Upload media
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-white/80 bg-white px-5 py-4 shadow-sm dark:border-white/10 dark:bg-white/6"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
                  {stat.label}
                </p>
                <stat.icon className="size-5 text-(--brand-600)" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))] dark:shadow-[0_32px_80px_-42px_rgba(0,0,0,0.64)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-3.5 size-4 text-slate-400 dark:text-slate-500" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search file name, URL, MIME type, or media kind"
              className="h-11 rounded-2xl pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {mediaFilters.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                variant={activeType === filter.value ? "default" : "outline"}
                className="rounded-2xl"
                onClick={() => setActiveType(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {uploadingFile ? (
          <UploadPreviewCard
            uploadingFile={uploadingFile}
            onUpload={startUpload}
            onCancel={() => setUploadingFile(null)}
          />
        ) : null}

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-h-[520px] rounded-[24px] border border-slate-100 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-slate-950/30">
            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMedia.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                {filteredMedia.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(item)}
                    className={`group overflow-hidden rounded-2xl border bg-background text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      selected?.id === item.id
                        ? "border-(--brand-500) ring-2 ring-(--brand-200) dark:ring-[var(--brand-700)]"
                        : "border-slate-100 dark:border-white/10"
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {renderMediaPreview(item)}
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-2 text-white opacity-0 transition group-hover:opacity-100">
                        <span className="truncate text-xs font-medium">
                          {item.type}
                        </span>
                        <Download className="size-4" />
                      </div>
                    </div>
                    <div className="space-y-1 p-3">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.size} · {item.mime}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center">
                <div className="max-w-sm rounded-3xl border border-dashed border-slate-200 bg-background p-8 text-center dark:border-white/10">
                  <Images className="mx-auto size-10 text-muted-foreground" />
                  <p className="mt-4 text-base font-semibold text-foreground">
                    No media found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload a file or adjust filters to see library items here.
                  </p>
                  <Button
                    type="button"
                    className="mt-5 rounded-2xl"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="size-4" />
                    Upload media
                  </Button>
                </div>
              </div>
            )}
          </div>

          <MediaDetailsCard
            media={selected}
            copied={copied}
            onCopy={handleCopyUrl}
            onDelete={() => setConfirmOpen(true)}
          />
        </div>
      </section>

      <ConfirmDeleteDialog
        deleteText="Media"
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function UploadPreviewCard({
  uploadingFile,
  onUpload,
  onCancel,
}: {
  uploadingFile: UploadingFile;
  onUpload: () => void;
  onCancel: () => void;
}) {
  const isImage = uploadingFile.file.type.startsWith("image/");
  const isVideo = uploadingFile.file.type.startsWith("video/");

  return (
    <div className="mt-5 rounded-[24px] border border-(--brand-100) bg-[var(--brand-50)] p-4 dark:border-white/10 dark:bg-white/6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-white/70 bg-background dark:border-white/10">
            {isImage ? (
              <NextImage
                src={uploadingFile.preview}
                alt={uploadingFile.file.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : isVideo ? (
              <video
                src={uploadingFile.preview}
                muted
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <File className="size-7 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {uploadingFile.file.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ready to upload · {Math.ceil(uploadingFile.file.size / 1024)} KB
            </p>
            {uploadingFile.uploading ? (
              <div className="mt-3 h-2 w-full max-w-sm overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[var(--brand-500)] transition-all"
                  style={{ width: `${uploadingFile.progress}%` }}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={onCancel}
            disabled={uploadingFile.uploading}
          >
            <X className="size-4" />
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-2xl"
            onClick={onUpload}
            disabled={uploadingFile.uploading}
          >
            {uploadingFile.uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-4" />
            )}
            {uploadingFile.uploading
              ? `Uploading ${uploadingFile.progress}%`
              : "Start upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MediaDetailsCard({
  media,
  copied,
  onCopy,
  onDelete,
}: {
  media: FileType | null;
  copied: boolean;
  onCopy: () => void;
  onDelete: () => void;
}) {
  if (!media) {
    return (
      <aside className="rounded-[24px] border border-dashed border-slate-200 bg-background p-6 text-center dark:border-white/10">
        <Images className="mx-auto size-9 text-muted-foreground" />
        <p className="mt-4 text-sm font-semibold text-foreground">
          Select a media file
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          File details, preview, URL, and actions will appear here.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-[24px] border border-slate-100 bg-background p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="space-y-5">
        <div className="relative h-64 overflow-hidden rounded-2xl border border-slate-100 bg-muted dark:border-white/10">
          {media.type === "image" ? (
            <NextImage
              src={media.path}
              alt={media.name}
              fill
              sizes="360px"
              className="object-cover"
            />
          ) : media.type === "video" ? (
            <video src={media.path} controls className="size-full object-cover" />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-3">
              <File className="size-10 text-muted-foreground" />
              <span className="max-w-56 truncate text-sm text-muted-foreground">
                {media.name}
              </span>
            </div>
          )}
        </div>

        <div>
          <p className="break-words text-base font-semibold text-foreground">
            {media.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Uploaded {formatDateTime(media.createdAt)}
          </p>
        </div>

        <div className="grid gap-3 text-sm">
          <DetailRow label="Kind" value={media.type} />
          <DetailRow label="MIME" value={media.mime} />
          <DetailRow label="Size" value={media.size} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Media URL
          </label>
          <div className="flex gap-2">
            <Input value={media.path} readOnly className="h-11 rounded-2xl" />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0 rounded-2xl"
              onClick={onCopy}
              aria-label="Copy media URL"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-2xl"
            asChild
          >
            <a href={media.path} target="_blank" rel="noreferrer">
              <Download className="size-4" />
              Open file
            </a>
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1 rounded-2xl"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>
    </aside>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
