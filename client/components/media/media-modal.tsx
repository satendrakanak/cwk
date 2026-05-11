"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { uploadClientService } from "@/services/uploads/upload.client";
import {
  FileType,
  InitUploadResponse,
  PreviewType,
  UploadingFile,
} from "@/types/file";
import { useEffect, useState } from "react";
import { UploadBox } from "./upload-box";
import { MediaGrid } from "./media-grid";
import { MediaDetailsPanel } from "./media-details-panel";
import axios from "axios";
import { ApiResponse } from "@/types/api";

interface MediaModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  onSelect: (file: FileType, alt: string) => void;
  previewType?: PreviewType;
}

export const MediaModal = ({
  open,
  onClose,
  onSelect,
  previewType = "image",
}: MediaModalProps) => {
  const [media, setMedia] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FileType | null>(null);
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(
    null,
  );

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await uploadClientService.getAll();
      const data = Array.isArray(response?.data) ? response.data : [];
      setMedia(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchMedia();
  }, [open]);

  const onDelete = async (id: number) => {
    try {
      await uploadClientService.deleteFile(id);

      // 🔥 remove from UI
      setMedia((prev) => prev.filter((item) => item.id !== id));

      // optional: selected reset
      setSelected((prev) => (prev?.id === id ? null : prev));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const startUpload = async () => {
    if (!uploadingFile) return;

    try {
      setUploadingFile((prev) => prev && { ...prev, uploading: true });

      const file = uploadingFile.file;

      // 🔥 STEP 1: init upload
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

      const json: ApiResponse<InitUploadResponse> = await initRes.json();

      const { uploadId, url } = json.data;

      // 🔥 STEP 2: upload to S3 (REAL progress)
      await axios.put(url, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );

          setUploadingFile((prev) =>
            prev ? { ...prev, progress: percent } : prev,
          );
        },
      });

      // 🔥 STEP 3: confirm upload
      const confirmRes = await fetch(`/api/uploads/confirm/${uploadId}`, {
        method: "POST",
        credentials: "include",
      });

      const confirmJson: ApiResponse<FileType> = await confirmRes.json();

      const newMedia = confirmJson.data;

      // 🔥 UI update
      setMedia((prev) => [newMedia, ...prev]);
      setSelected(newMedia);
      setUploadingFile(null);
    } catch (err) {
      console.error("Upload failed", err);
      setUploadingFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl! h-162.5 p-0 overflow-hidden">
        <DialogTitle className="sr-only">Media Library</DialogTitle>

        <div className="grid grid-cols-[2fr_1fr] h-full min-h-0">
          {/* LEFT */}
          <div className="border-r flex flex-col min-h-0">
            <div className="p-4 pb-0 shrink-0">
              <UploadBox
                onUpload={(file) => {
                  const preview = URL.createObjectURL(file);

                  setUploadingFile({
                    file,
                    preview,
                    progress: 0,
                    uploading: false,
                  });
                }}
                previewType={previewType}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4 pt-2 min-h-0">
              <MediaGrid
                media={media}
                selected={selected}
                onSelect={setSelected}
                uploadingFile={uploadingFile}
                startUpload={startUpload}
                loading={loading}
                previewType={previewType}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="p-4 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0">
              <MediaDetailsPanel
                selected={selected}
                onSelect={onSelect}
                onDelete={onDelete}
                previewType={previewType}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
