"use client";

import { FileType, PreviewType } from "@/types/file";
import { Copy, Trash2, Check, File } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "../modals/confirm-dialog";
import Image from "next/image";
import { getAltFromFileName, getFileType } from "@/utils/get-file-type";

interface MediaDetailsPanelProps {
  selected: FileType | null;
  onSelect: (file: FileType, alt: string) => void;
  onDelete: (id: number) => void;
  previewType?: PreviewType;
}

export const MediaDetailsPanel = ({
  selected,
  onSelect,
  onDelete,
  previewType = "image",
}: MediaDetailsPanelProps) => {
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alt, setAlt] = useState("");

  useEffect(() => {
    if (selected?.name) {
      setAlt(getAltFromFileName(selected.name));
    }
  }, [selected]);

  if (!selected) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3 p-6 border border-dashed rounded-xl bg-muted/30">
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              📁
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">No media selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Select a media from the grid to preview details
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isValidType = getFileType(selected.mime) === previewType;
  const handleCopy = async () => {
    await navigator.clipboard.writeText(selected.url);
    setCopied(true);
    toast.success("Media URL Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;

    try {
      setDeleting(true);
      await onDelete(selected.id);
      toast.success("File deleted successfully");
      setConfirmOpen(false);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        toast.error(err?.message || "Failed to delete file");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* 🔥 Scrollable */}
        <div className="space-y-4 pr-1">
          {/* 🔥 Preview Dynamic */}
          {selected.type === "image" && (
            <div className="relative w-full h-56">
              <Image
                src={selected.path}
                alt={selected.name}
                fill
                sizes="100vw"
                loading="eager"
                className="object-cover rounded-lg"
              />
            </div>
          )}

          {selected.type === "video" && (
            <video
              src={selected.path}
              className="w-full h-56 object-cover rounded-lg"
              controls
            />
          )}

          {selected.type === "file" && (
            <div className="flex items-center justify-center h-56 border rounded-lg bg-muted">
              <File className="h-10 w-10 text-muted-foreground" />
            </div>
          )}

          <div className="text-xs space-y-1">
            <p>
              <strong>File Name:</strong> {selected.name}
            </p>
            <p>
              <strong>Type:</strong> {selected.type}
            </p>
            <p>
              <strong>Mime:</strong> {selected.mime}
            </p>
            <p>
              <strong>Size:</strong> {selected.size}
            </p>
          </div>
          <button
            onClick={handleDeleteClick}
            className="w-full flex  gap-1 text-red-500 text-xs hover:underline cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            Delete permanently
          </button>
          {/* URL copy */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium">Media URL</label>
            <div className="flex items-center gap-2">
              <input
                value={selected.path}
                readOnly
                className="w-full border p-2 text-xs rounded"
              />
              <button
                onClick={handleCopy}
                className="p-2 border rounded hover:bg-muted cursor-pointer transition"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Alt */}
          {selected.type === "image" && (
            <div className="space-y-1">
              <label className="text-[11px] font-medium">Alt Text</label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="w-full border p-2 text-xs rounded"
              />
            </div>
          )}
        </div>

        {/* 🔥 Bottom actions */}
        <div className="pt-3 mt-auto space-y-2">
          {/* Select */}
          <button
            disabled={!isValidType}
            onClick={() => onSelect(selected, alt || selected.name)}
            className={`w-full text-xs py-2 rounded ${
              isValidType
                ? "bg-sidebar-primary text-white cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isValidType ? `Select ${previewType}` : `Invalid file type`}
          </button>

          {/* 🔥 Delete link style */}
        </div>
      </div>
      <ConfirmDeleteDialog
        deleteText="Media"
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </>
  );
};
