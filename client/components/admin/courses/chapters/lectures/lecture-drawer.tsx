"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "sonner";
import { FileUpload } from "@/components/media/file-upload";
import { FileType } from "@/types/file";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { lectureSchema } from "@/schemas/courses";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { CheckCircle, Download, Loader, RotateCcw, Trash2 } from "lucide-react";
import { Lecture } from "@/types/lecture";
import { lectureClientService } from "@/services/lectures/lecture.client";
import { Textarea } from "@/components/ui/textarea";
import { attachmentClientService } from "@/services/attachments/attachment.client";
import { Attachment } from "@/types/attachment";
import Link from "next/link";
import { canPublishLecture } from "@/helpers/publish-rules";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-handler";

interface LectureDrawerProps {
  lecture: Lecture;
  index: number;
  activeId: number | null;
  chapterId: number;
  setActiveId: (id: number) => void;
  onTooglePublish: (id: number, isPublished: boolean) => void;
  onDelete: (id: number) => void;
  dragHandle?: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap;
  };
  isFacultyLed?: boolean;
}

export default function LectureDrawer({
  lecture,
  activeId,
  setActiveId,
  chapterId,
  index,
  onTooglePublish,
  onDelete,
  dragHandle,
  isFacultyLed = false,
}: LectureDrawerProps) {
  const [selectedVideo, setSelectedVideo] = useState<FileType | null>();
  const [selectedFiles, setSelectedFiles] = useState<Attachment[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const router = useRouter();

  const form = useForm<z.input<typeof lectureSchema>>({
    resolver: zodResolver(lectureSchema),
    mode: "onChange",
    defaultValues: {
      title: lecture.title || "",
      description: lecture.description || "",
      isFree: lecture.isFree || false,
    },
  });
  useEffect(() => {
    form.reset({
      title: lecture.title || "",
      description: lecture.description || "",
      isFree: lecture.isFree || false,
    });

    setSelectedVideo(lecture.video || null);
    if (lecture?.attachments) {
      setSelectedFiles(lecture.attachments);
    }
  }, [lecture, form]);
  const handleVideoFileUpload = async (file: FileType) => {
    try {
      setSelectedVideo(file);
      toast.success("Video uploaded");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  const handleAttachmentFileUpload = async (file: FileType) => {
    try {
      const isPersisted = !lecture?.isTemp;

      // ✅ Only if lecture DB me hai
      if (isPersisted) {
        await attachmentClientService.create({
          lectureId: lecture.id,
          fileId: file.id,
          name: file.name,
        });
      }

      // 🔥 UI always update
      setSelectedFiles((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: file.name,
          file,
          isTemp: !isPersisted,
        } as Attachment,
      ]);

      if (isPersisted) {
        router.refresh();
      }

      toast.success("Attachment added");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };
  const handleRemoveAttachment = async (id: number) => {
    try {
      setLoadingId(id);

      // 🔥 UI se turant hata (optimistic)
      setSelectedFiles((prev) => prev.filter((f) => f.id !== id));

      // 🔥 check karo ye existing attachment hai ya new
      const existingAttachment = lecture.attachments?.find((a) => a.id === id);

      if (existingAttachment) {
        await attachmentClientService.delete(id);
      }

      toast.success("Attachment removed");
      router.refresh();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  const isTemp = lecture.isTemp;

  const { isValid, isSubmitting } = form.formState;
  const onSubmit = async (data: z.input<typeof lectureSchema>) => {
    try {
      const { ...rest } = data;
      const payload = {
        ...rest,
        chapterId,
        videoId: selectedVideo?.id,
      };

      let response;

      if (!isTemp) {
        // UPDATE
        response = await lectureClientService.update(lecture.id, payload);
        toast.success("Chapter updated");
      } else {
        // CREATE
        response = await lectureClientService.create(payload);
        toast.success("Chapter created");
      }

      const existingAttachments = lecture.attachments || [];
      const selected = selectedFiles || [];

      // ✅ Separate temp & persisted
      const tempFiles = selected.filter((f) => f.isTemp);
      const persistedSelected = selected.filter((f) => !f.isTemp);

      // ✅ Compare ONLY persisted ones
      const existingFileIds = existingAttachments.map((a) => a.id);
      const persistedFileIds = persistedSelected.map((f) => f.file.id);

      const newFiles = [
        ...tempFiles,
        ...persistedSelected.filter(
          (f) => !existingFileIds.includes(f.file.id),
        ),
      ];

      const removedFiles = existingAttachments.filter(
        (a) => !persistedFileIds.includes(a.id),
      );

      // ✅ CREATE (only if needed)
      if (newFiles.length > 0) {
        await Promise.all(
          newFiles.map((file) =>
            attachmentClientService.create({
              lectureId: response.data.id || lecture.id,
              fileId: file.file.id,
              name: file.file.name,
            }),
          ),
        );
      }

      // ✅ DELETE (only if needed)
      if (removedFiles.length > 0) {
        await Promise.all(
          removedFiles.map((file) => attachmentClientService.delete(file.id)),
        );
      }
      router.refresh();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };
  const disabled = isFacultyLed ? false : !canPublishLecture(lecture);
  return (
    <Drawer key={lecture.id} direction="right">
      <div
        className={`flex items-center justify-between rounded-lg border p-2 text-xs transition-colors ${
          lecture.isPublished
            ? activeId === lecture.id
              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/12"
              : "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/8"
            : activeId === lecture.id
              ? "border-[var(--brand-300)] bg-[var(--brand-50)] dark:border-[var(--brand-500)]/35 dark:bg-[var(--brand-500)]/10"
              : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)] dark:hover:bg-white/6"
        }`}
      >
        {/* 🔥 DRAG HANDLE */}
        {dragHandle && (
          <div className="flex items-center justify-start gap-2 mr-1">
            <span
              {...dragHandle.attributes}
              {...dragHandle.listeners}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center text-sm leading-none text-muted-foreground dark:text-slate-400"
            >
              ☰
            </span>
          </div>
        )}
        {/* LEFT → Title (click = open drawer) */}
        <DrawerTrigger asChild>
          <div
            onClick={() => setActiveId(lecture.id)}
            className="flex h-full flex-1 cursor-pointer items-center truncate text-xs font-medium text-foreground dark:text-slate-100"
          >
            {lecture.title || `Untitled ${index + 1}`}
          </div>
        </DrawerTrigger>

        {/* RIGHT → Actions */}
        <div className="flex items-center shrink-0">
          {/* 🟢 Published LIST → only Unpublish */}
          {lecture.isPublished && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTooglePublish(lecture.id, false);
              }}
              className="cursor-pointer rounded p-1 text-red-600 transition hover:bg-red-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
              title="Unpublish"
            >
              <RotateCcw className="size-3" />
            </button>
          )}

          {/* ⚪ Normal LIST */}
          {!lecture.isPublished && (
            <>
              {/* Publish */}
              {!lecture.isPublished && !isTemp && (
                <button
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (disabled) return;

                    onTooglePublish(lecture.id, true);
                  }}
                  className={cn(
                    "p-1.5 rounded-md transition flex items-center justify-center",
                    "focus:outline-none focus:ring-2 focus:ring-green-400/40 cursor-pointer",
                    disabled
                      ? "cursor-not-allowed bg-gray-100 text-gray-400 opacity-40 dark:bg-white/6 dark:text-slate-500"
                      : "text-green-600 hover:bg-green-50 active:scale-95 dark:text-emerald-300 dark:hover:bg-emerald-500/10",
                  )}
                  title={
                    disabled
                      ? "Add video or attachment to publish"
                      : `Publish ${isFacultyLed ? "topic" : "lecture"}`
                  }
                >
                  <CheckCircle className="size-3" />
                </button>
              )}

              {/* Delete */}
              {!lecture.isPublished && !isTemp && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(lecture.id);
                  }}
                  className="cursor-pointer rounded p-1 text-red-500 transition hover:bg-red-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                  title="Delete"
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <DrawerContent className="ml-auto flex h-full w-[min(720px,100vw)] max-w-2xl! flex-col border-l border-slate-200 bg-white dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)]">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <DrawerHeader className="border-b border-slate-200 pb-4 dark:border-white/10">
            <div className="flex items-center justify-between w-full gap-4">
              {/* LEFT */}
              <div className="min-w-0">
                <DrawerTitle className="font-semibold text-slate-950 dark:text-white">
                  {isTemp ? "Add New" : "Edit"} {isFacultyLed ? "Topic" : "Lecture"}
                </DrawerTitle>
                <DrawerDescription className="dark:text-slate-300">
                  {isFacultyLed
                    ? "Manage curriculum topic details. Videos are not used for faculty-led courses."
                    : "Manage chapters lecture details"}
                </DrawerDescription>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3 shrink-0">
                <Controller
                  name="isFree"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-700 dark:text-slate-200">
                        {isFacultyLed
                          ? "Mark this topic as preview?"
                          : "You want to make this lecture free?"}
                      </span>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="cursor-pointer"
                      />
                    </div>
                  )}
                />

                <SubmitButton
                  type="submit"
                  disabled={!isValid}
                  loading={isSubmitting}
                  className="w-auto shrink-0 px-4"
                >
                  {!isTemp ? "Update" : "Create"}
                </SubmitButton>
              </div>
            </div>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <FieldGroup>
              {/* Title */}
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Input
                      {...field}
                      placeholder="e.g. Introduction of the course"
                      className="h-11"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="e.g. What you will learn in this chapter"
                    className="h-24"
                  />
                )}
              />
              {!isFacultyLed ? (
                <div className="grid grid-cols-2 gap-4">
                  <FileUpload
                    label="Lecture Video"
                    previewType="video"
                    value={selectedVideo || lecture.video}
                    onUpload={handleVideoFileUpload}
                    className="aspect-video w-full"
                  />
                  <div className="space-y-3">
                  <FileUpload
                    label="Lecture Attachments"
                    previewType="file"
                    onUpload={(file) => handleAttachmentFileUpload(file)}
                    className="w-full"
                  />

                  {/* 🔥 Attachment List */}
                  {selectedFiles.length > 0 ? (
                    <div className="space-y-2">
                      {selectedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 rounded-md border border-slate-200 bg-muted/30 p-2 transition hover:bg-muted/50 dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/10"
                        >
                          {/* ICON */}
                          <div className="text-sm">
                            {file.file?.mime?.startsWith("image") && "🖼️"}
                            {file.file?.mime?.startsWith("video") && "🎥"}
                            {file.file?.mime?.includes("pdf") && "📄"}
                            {!file.file?.mime && "📎"}
                          </div>

                          {/* NAME */}
                          <div className="flex-1 truncate text-xs font-medium text-slate-900 dark:text-slate-100">
                            {file.name}
                          </div>

                          {/* ACTIONS */}
                          <div className="flex items-center gap-2">
                            {/* DOWNLOAD */}
                            {file.file?.path && (
                              <Link
                                href={file.file.path}
                                target="_blank"
                                className="rounded p-1 text-[var(--brand-600)] transition hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] dark:text-[var(--brand-300)] dark:hover:bg-[var(--brand-500)]/10 dark:hover:text-[var(--brand-200)]"
                                title="Download"
                              >
                                <Download className="size-3" />
                              </Link>
                            )}

                            {/* REMOVE */}
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(file.id)}
                              className="rounded p-1 text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:text-rose-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
                              title="Remove"
                            >
                              {loadingId === file.id ? (
                                <Loader className="size-3 animate-spin" />
                              ) : (
                                <Trash2 className="size-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // 🔥 EMPTY STATE
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-muted/20 p-6 text-center dark:border-white/10 dark:bg-white/4">
                      <div className="text-3xl mb-2">📎</div>
                      <p className="text-sm font-medium text-muted-foreground dark:text-slate-300">
                        No attachments added yet
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/70 dark:text-slate-400">
                        Upload files to support your lecture
                      </p>
                    </div>
                  )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                  This topic will appear in the public course syllabus. Live
                  sessions, links, recordings, and reminders are managed from
                  Faculty Workspace.
                </div>
              )}
            </FieldGroup>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
