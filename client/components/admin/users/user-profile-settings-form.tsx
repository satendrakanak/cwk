"use client";

import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "@/components/submit-button";
import { Field, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { userClientService } from "@/services/users/user.client";
import { getErrorMessage } from "@/lib/error-handler";
import { User } from "@/types/user";

const schema = z.object({
  isPublic: z.boolean(),
  showCourses: z.boolean(),
  showCertificates: z.boolean(),
});

interface UserProfileSettingsFormProps {
  user: User;
}

export function UserProfileSettingsForm({
  user,
}: UserProfileSettingsFormProps) {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      isPublic: user.profile?.isPublic ?? true,
      showCourses: user.profile?.showCourses ?? true,
      showCertificates: user.profile?.showCertificates ?? true,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: any) => {
    try {
      await userClientService.updateProfile(user.id, data);
      toast.success("User updated successfully");
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Profile Settings</h3>

            <div className="flex items-center justify-between">
              <span>Public Profile</span>
              <Controller
                name="isPublic"
                control={form.control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="cursor-pointer"
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-between">
              <span>Show Courses</span>
              <Controller
                name="showCourses"
                control={form.control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="cursor-pointer"
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-between">
              <span>Show Certificates</span>
              <Controller
                name="showCertificates"
                control={form.control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="cursor-pointer"
                  />
                )}
              />
            </div>
            <div className="flex justify-end">
              <SubmitButton
                type="submit"
                disabled={!isValid}
                loading={isSubmitting}
                loadingText="Updating..."
                className="px-6"
              >
                Update
              </SubmitButton>
            </div>
          </CardContent>
        </Card>

        {/* 🔥 SUBMIT */}
      </form>
    </div>
  );
}
