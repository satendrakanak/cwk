"use client";

import * as z from "zod";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { testimonialSchema } from "@/schemas/testimonial";
import { testimonialClientService } from "@/services/testimonials/testimonial.client";
import { courseClientService } from "@/services/courses/course.client";
import { Course } from "@/types/course";
import { Testimonial } from "@/types/testimonial";
import { FileType } from "@/types/file";
import { getErrorMessage } from "@/lib/error-handler";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/media/file-upload";
import { SubmitButton } from "@/components/submit-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateTestimonialFormProps {
  testimonial?: Testimonial;
  onSuccess?: () => void;
}

type TestimonialFormInput = z.input<typeof testimonialSchema>;
type TestimonialFormOutput = z.output<typeof testimonialSchema>;

export const CreateTestimonialForm = ({
  testimonial,
  onSuccess,
}: CreateTestimonialFormProps) => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>(
    testimonial?.courses?.map((course) => course.id) || [],
  );
  const [selectedAvatar, setSelectedAvatar] = useState<FileType | null>(
    testimonial?.avatar || null,
  );
  const [avatarAlt, setAvatarAlt] = useState(testimonial?.avatarAlt || "");
  const [selectedVideo, setSelectedVideo] = useState<FileType | null>(
    testimonial?.video || null,
  );

  const form = useForm<TestimonialFormInput, unknown, TestimonialFormOutput>({
    resolver: zodResolver(testimonialSchema),
    mode: "onChange",
    defaultValues: {
      type: testimonial?.type || "TEXT",
      name: testimonial?.name || "",
      designation: testimonial?.designation || "",
      company: testimonial?.company || "",
      message: testimonial?.message || "",
      rating: testimonial?.rating || 5,
      isActive: testimonial?.isActive ?? true,
      isFeatured: testimonial?.isFeatured ?? false,
      status: testimonial?.status || "pending",
      priority: testimonial?.priority ?? 0,
      courseIds: testimonial?.courses?.map((course) => course.id) || [],
    },
  });

  const { isValid, isSubmitting } = form.formState;
  const testimonialType = useWatch({
    control: form.control,
    name: "type",
  });

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await courseClientService.getAll();
        setCourses(response.data.data);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error));
      }
    };

    loadCourses();
  }, []);

  const onSubmit = async (data: TestimonialFormOutput) => {
    try {
      if (data.type === "VIDEO" && !selectedVideo?.id) {
        toast.error("Please upload a video testimonial");
        return;
      }

      const payload = {
        type: data.type,
        name: data.name,
        designation: data.designation?.trim() || undefined,
        company: data.company?.trim() || undefined,
        message: data.type === "TEXT" ? data.message?.trim() : undefined,
        rating: data.rating,
        avatarId: selectedAvatar?.id,
        avatarAlt: avatarAlt.trim() || data.name,
        videoId: data.type === "VIDEO" ? selectedVideo?.id : undefined,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        status: data.status,
        priority: data.priority,
        courseIds: selectedCourseIds,
      };

      if (testimonial?.id) {
        await testimonialClientService.update(testimonial.id, payload);
        toast.success("Testimonial updated successfully");
      } else {
        await testimonialClientService.create(payload);
        toast.success("Testimonial created successfully");
        form.reset({
          type: "TEXT",
          name: "",
          designation: "",
          company: "",
          message: "",
          rating: 5,
          isActive: true,
          isFeatured: false,
          status: "pending",
          priority: 0,
          courseIds: [],
        });
        setSelectedCourseIds([]);
        setSelectedAvatar(null);
        setAvatarAlt("");
        setSelectedVideo(null);
      }

      router.refresh();
      onSuccess?.();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  const handleAvatarUpload = async (file: FileType, alt: string) => {
    setSelectedAvatar(file);
    setAvatarAlt(alt);
  };

  const handleVideoUpload = async (file: FileType) => {
    setSelectedVideo(file);
  };

  const toggleCourse = (courseId: number) => {
    setSelectedCourseIds((prev) => {
      const updated = prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId];

      form.setValue("courseIds", updated, {
        shouldDirty: true,
        shouldValidate: true,
      });

      return updated;
    });
  };

  return (
    <div className="w-full max-w-none">
      <div>
        <h4 className="text-sm font-semibold text-slate-950 dark:text-white">
          {testimonial?.id ? "Edit Testimonial" : "Create Testimonial"}
        </h4>
        <p className="text-xs text-muted-foreground dark:text-slate-300">
          Add student or customer feedback for the website.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-5">
        <FieldGroup>
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Testimonial Type</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select testimonial type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT">Text Testimonial</SelectItem>
                    <SelectItem value="VIDEO">Video Testimonial</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Name</FieldLabel>
                <Input
                  {...field}
                  placeholder="e.g. Priya Sharma"
                  className="h-11"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="designation"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Designation</FieldLabel>
                  <Input
                    {...field}
                    placeholder="e.g. Nutrition Student"
                    className="h-11"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="company"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Company / Institute</FieldLabel>
                  <Input
                    {...field}
                    placeholder="e.g. CodeWithKasa"
                    className="h-11"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="rating"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Rating</FieldLabel>
                <Input
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  type="number"
                  min={1}
                  max={5}
                  placeholder="5"
                  className="h-11"
                  value={
                    typeof field.value === "number" ||
                    typeof field.value === "string"
                      ? field.value
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/6">
            <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                Assign Courses
              </h3>
            </div>

            <div className="max-h-52 space-y-2 overflow-y-auto p-4">
              {courses.map((course) => {
                const isChecked = selectedCourseIds.includes(course.id);

                return (
                  <label
                    key={course.id}
                    className="flex cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCourse(course.id)}
                      className="h-4 w-4 cursor-pointer accent-primary"
                    />
                    <span>{course.title}</span>
                  </label>
                );
              })}

              {!courses.length && (
                <p className="text-sm text-muted-foreground dark:text-slate-300">
                  No courses found yet.
                </p>
              )}
            </div>
          </div>

          <FileUpload
            label="Avatar"
            previewType="image"
            value={selectedAvatar}
            onUpload={handleAvatarUpload}
            className="h-40"
          />

          {testimonialType === "TEXT" ? (
            <Controller
              name="message"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Testimonial Text</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Write the testimonial content here..."
                    className="min-h-36"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          ) : (
            <FileUpload
              label="Testimonial Video"
              previewType="video"
              value={selectedVideo}
              onUpload={handleVideoUpload}
              className="h-40"
            />
          )}

          <Controller
            name="isActive"
            control={form.control}
            render={({ field }) => (
              <Field
                orientation="horizontal"
                className="items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <FieldLabel>Active status</FieldLabel>
                  <p className="text-sm text-muted-foreground">
                    Only active testimonials should be shown on the website.
                  </p>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />

          <Controller
            name="isFeatured"
            control={form.control}
            render={({ field }) => (
              <Field
                orientation="horizontal"
                className="items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <FieldLabel>Featured on website</FieldLabel>
                  <p className="text-sm text-muted-foreground">
                    Show this testimonial in the featured website section.
                  </p>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-11! w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="priority"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Priority</FieldLabel>
                  <Input
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    type="number"
                    min={0}
                    placeholder="0"
                    className="h-11"
                    value={
                      typeof field.value === "number" ||
                      typeof field.value === "string"
                        ? field.value
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </FieldGroup>

        <div className="flex justify-end">
          <SubmitButton
            type="submit"
            disabled={!isValid}
            loading={isSubmitting}
            className="w-auto bg-[var(--brand-600)] px-6 text-white hover:bg-[var(--brand-700)] dark:bg-[var(--brand-500)] dark:hover:bg-[var(--brand-400)]"
          >
            {testimonial?.id ? "Update" : "Create"}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};
