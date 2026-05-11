"use client";

import { User } from "@/types/user";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { userClientService } from "@/services/users/user.client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { Field, FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";

interface FacultyProfileFormProps {
  user: User;
}

const userFacultySchema = z.object({
  expertise: z.string().optional(),
  experience: z.string().optional(),
  designation: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
});

export function FacultyProfileForm({ user }: FacultyProfileFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof userFacultySchema>>({
    resolver: zodResolver(userFacultySchema),
    mode: "onChange",
    defaultValues: {
      expertise: user.facultyProfile?.expertise ?? "",
      designation: user.facultyProfile?.designation ?? "",
      experience: user.facultyProfile?.experience ?? "",
      linkedin: user.facultyProfile?.linkedin ?? "",
      instagram: user.facultyProfile?.instagram ?? "",
      twitter: user.facultyProfile?.twitter ?? "",
      youtube: user.facultyProfile?.youtube ?? "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof userFacultySchema>) => {
    try {
      await userClientService.updateFacultyProfile(user.id, data);
      router.refresh();
      toast.success("User faculty profile updated successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card className="rounded-2xl border bg-white shadow-sm">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">Faculty Profile</h3>
          <p className="text-sm text-muted-foreground">
            Manage faculty-specific details
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Form Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="expertise"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} placeholder="Expertise" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="designation"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} placeholder="Designation" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="experience"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} placeholder="Experience" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="linkedin"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} placeholder="LinkedIn" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="instagram"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} placeholder="Instagram" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="twitter"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} placeholder="Twitter / X" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="youtube"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} placeholder="YouTube" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <SubmitButton
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
              loadingText="Updating..."
              className="px-6"
            >
              Update Faculty Profile
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
