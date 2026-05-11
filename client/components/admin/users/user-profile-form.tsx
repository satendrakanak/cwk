"use client";

import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { userClientService } from "@/services/users/user.client";
import { getErrorMessage } from "@/lib/error-handler";
import { User } from "@/types/user";

const schema = z.object({
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  headline: z.string().optional(),
  company: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  youtube: z.string().optional(),
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
});

interface UserProfileFormProps {
  user: User;
}

export function UserProfileForm({ user }: UserProfileFormProps) {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: user.profile?.bio || "",
      location: user.profile?.location || "",
      website: user.profile?.website || "",
      headline: user.profile?.headline || "",
      company: user.profile?.company || "",
      facebook: user.profile?.facebook || "",
      instagram: user.profile?.instagram || "",
      twitter: user.profile?.twitter || "",
      linkedin: user.profile?.linkedin || "",
      youtube: user.profile?.youtube || "",
      whatsapp: user.profile?.whatsapp || "",
      telegram: user.profile?.telegram || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      console.log(data);
      await userClientService.updateProfile(user.id, data);
      toast.success("User profile updated successfully");
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold">Profile Details</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="headline"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} placeholder="Professional headline" />
                )}
              />

              <Controller
                name="company"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} placeholder="Company or organization" />
                )}
              />
            </div>

            <Controller
              name="bio"
              control={form.control}
              render={({ field }) => (
                <Textarea {...field} placeholder="Bio..." rows={5} />
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Controller
                name="location"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} placeholder="Location" />
                )}
              />

              <Controller
                name="website"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} placeholder="Website" />
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="facebook"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} placeholder="Facebook URL" />
                )}
              />
              <Controller
                name="instagram"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} placeholder="Instagram URL" />
                )}
              />
              <Controller
                name="twitter"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} placeholder="Twitter / X URL" />
                )}
              />
              <Controller
                name="linkedin"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} placeholder="LinkedIn URL" />
                )}
              />
              <Controller
                name="youtube"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} placeholder="YouTube URL" />
                )}
              />
              <Controller
                name="telegram"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} placeholder="Telegram handle or link" />
                )}
              />
              <Controller
                name="whatsapp"
                control={form.control}
                render={({ field }) => (
                  <Input {...field} placeholder="WhatsApp number" />
                )}
              />
            </div>
            {/* 🔥 SUBMIT */}
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
      </form>
    </div>
  );
}
