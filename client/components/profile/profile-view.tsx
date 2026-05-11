"use client";

import { useEffect, useMemo, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Briefcase,
  Globe,
  Loader2,
  MapPin,
  Save,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/error-handler";
import { userClientService } from "@/services/users/user.client";
import { UpdateFacultyProfilePayload, User } from "@/types/user";
import { PreviewLine } from "./profile/preview-line";
import { SectionHeader } from "./profile/section-header";
import { SocialPill } from "./profile/social-pill";

interface ProfileViewProps {
  user: User;
}

const profileSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().optional(),
  phoneNumber: z.string().trim().min(8, "Phone number is required"),
  headline: z.string().trim().max(120, "Headline is too long").optional(),
  company: z.string().trim().max(120, "Company is too long").optional(),
  location: z.string().trim().max(100, "Location is too long").optional(),
  website: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "Enter a valid website URL",
    ),
  bio: z.string().trim().max(500, "Bio is too long").optional(),
  facebook: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "Enter a valid Facebook URL",
    ),
  instagram: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "Enter a valid Instagram URL",
    ),
  twitter: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "Enter a valid X/Twitter URL",
    ),
  linkedin: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "Enter a valid LinkedIn URL",
    ),
  youtube: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "Enter a valid YouTube URL",
    ),
  whatsapp: z.string().trim().max(40, "WhatsApp is too long").optional(),
  telegram: z.string().trim().max(80, "Telegram is too long").optional(),
});

const facultySchema = z.object({
  designation: z.string().trim().optional(),
  expertise: z.string().trim().optional(),
  experience: z.string().trim().optional(),
  linkedin: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "Enter a valid LinkedIn URL",
    ),
  instagram: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "Enter a valid Instagram URL",
    ),
  twitter: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "Enter a valid X/Twitter URL",
    ),
  youtube: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "Enter a valid YouTube URL",
    ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type FacultyFormValues = z.infer<typeof facultySchema>;

export default function ProfileView({ user }: ProfileViewProps) {
  const [isSavingProfile, startSavingProfile] = useTransition();
  const [isSavingFaculty, startSavingFaculty] = useTransition();

  const isFaculty = useMemo(
    () => user.roles?.some((role) => role.name === "faculty") ?? false,
    [user.roles],
  );

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: getProfileDefaults(user),
  });

  const facultyForm = useForm<FacultyFormValues>({
    resolver: zodResolver(facultySchema),
    mode: "onChange",
    defaultValues: getFacultyDefaults(user),
  });

  useEffect(() => {
    profileForm.reset(getProfileDefaults(user));
    facultyForm.reset(getFacultyDefaults(user));
  }, [facultyForm, profileForm, user]);

  const watchedHeadline = useWatch({
    control: profileForm.control,
    name: "headline",
  });

  const watchedCompany = useWatch({
    control: profileForm.control,
    name: "company",
  });

  const watchedLocation = useWatch({
    control: profileForm.control,
    name: "location",
  });

  const watchedLinkedin = useWatch({
    control: profileForm.control,
    name: "linkedin",
  });

  const watchedInstagram = useWatch({
    control: profileForm.control,
    name: "instagram",
  });

  const watchedWebsite = useWatch({
    control: profileForm.control,
    name: "website",
  });

  const fullName = `${profileForm.watch("firstName") || ""} ${
    profileForm.watch("lastName") || ""
  }`.trim();

  const handleProfileSave = profileForm.handleSubmit((values) => {
    startSavingProfile(async () => {
      try {
        await userClientService.updateUser({
          firstName: values.firstName,
          lastName: values.lastName || "",
          phoneNumber: values.phoneNumber,
        });

        await userClientService.updateProfile(user.id, {
          headline: values.headline || "",
          company: values.company || "",
          location: values.location || "",
          website: values.website || "",
          bio: values.bio || "",
          facebook: values.facebook || "",
          instagram: values.instagram || "",
          twitter: values.twitter || "",
          linkedin: values.linkedin || "",
          youtube: values.youtube || "",
          whatsapp: values.whatsapp || "",
          telegram: values.telegram || "",
        });

        toast.success("Profile updated");
      } catch (error: unknown) {
        toast.error(getErrorMessage(error));
      }
    });
  });

  const handleFacultySave = facultyForm.handleSubmit((values) => {
    startSavingFaculty(async () => {
      try {
        const payload: UpdateFacultyProfilePayload = {
          designation: values.designation || "",
          expertise: values.expertise || "",
          experience: values.experience || "",
          linkedin: values.linkedin || "",
          instagram: values.instagram || "",
          twitter: values.twitter || "",
          youtube: values.youtube || "",
        };

        await userClientService.updateFacultyProfile(user.id, payload);

        toast.success("Faculty profile updated");
      } catch (error: unknown) {
        toast.error(getErrorMessage(error));
      }
    });
  });

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <div className="space-y-8">
        <form onSubmit={handleProfileSave} className="academy-card p-5 md:p-6">
          <SectionHeader
            icon={UserRound}
            eyebrow="Personal Profile"
            title="Update your public profile"
            description="Keep your basic details, profile summary, and contact links up to date."
          />

          <FieldGroup className="mt-6 gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FieldControl
                name="firstName"
                label="First name"
                placeholder="First name"
                control={profileForm.control}
                error={profileForm.formState.errors.firstName}
              />

              <FieldControl
                name="lastName"
                label="Last name"
                placeholder="Last name"
                control={profileForm.control}
                error={profileForm.formState.errors.lastName}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FieldControl
                name="phoneNumber"
                label="Phone number"
                placeholder="Phone number"
                control={profileForm.control}
                error={profileForm.formState.errors.phoneNumber}
              />

              <FieldControl
                name="headline"
                label="Headline"
                placeholder="Example: Wellness learner, nutrition enthusiast"
                control={profileForm.control}
                error={profileForm.formState.errors.headline}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FieldControl
                name="company"
                label="Company"
                placeholder="Company or organization"
                control={profileForm.control}
                error={profileForm.formState.errors.company}
              />

              <FieldControl
                name="location"
                label="Location"
                placeholder="City, country"
                control={profileForm.control}
                error={profileForm.formState.errors.location}
              />
            </div>

            <FieldControl
              name="website"
              label="Website"
              placeholder="https://example.com"
              control={profileForm.control}
              error={profileForm.formState.errors.website}
            />

            <Field>
              <FieldLabel className="text-sm font-semibold text-card-foreground">
                Bio
              </FieldLabel>

              <Controller
                name="bio"
                control={profileForm.control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Write a short profile bio..."
                    rows={6}
                    className="min-h-36 resize-none rounded-2xl border-border bg-muted px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:border-primary focus-visible:ring-primary"
                  />
                )}
              />

              <FieldError errors={[profileForm.formState.errors.bio]} />
            </Field>
          </FieldGroup>

          <div className="mt-6 flex justify-end border-t border-border pt-5">
            <Button
              type="submit"
              disabled={isSavingProfile}
              className="h-11 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>

        <form onSubmit={handleProfileSave} className="academy-card p-5 md:p-6">
          <SectionHeader
            icon={Globe}
            eyebrow="Social Links"
            title="Connect your online presence"
            description="Add public profile links so people can discover your work and updates."
          />

          <FieldGroup className="mt-6 gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FieldControl
                name="linkedin"
                label="LinkedIn"
                placeholder="https://linkedin.com/in/username"
                control={profileForm.control}
                error={profileForm.formState.errors.linkedin}
              />

              <FieldControl
                name="instagram"
                label="Instagram"
                placeholder="https://instagram.com/username"
                control={profileForm.control}
                error={profileForm.formState.errors.instagram}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FieldControl
                name="facebook"
                label="Facebook"
                placeholder="https://facebook.com/username"
                control={profileForm.control}
                error={profileForm.formState.errors.facebook}
              />

              <FieldControl
                name="twitter"
                label="X / Twitter"
                placeholder="https://x.com/username"
                control={profileForm.control}
                error={profileForm.formState.errors.twitter}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FieldControl
                name="youtube"
                label="YouTube"
                placeholder="https://youtube.com/@username"
                control={profileForm.control}
                error={profileForm.formState.errors.youtube}
              />

              <FieldControl
                name="whatsapp"
                label="WhatsApp"
                placeholder="+91..."
                control={profileForm.control}
                error={profileForm.formState.errors.whatsapp}
              />
            </div>

            <FieldControl
              name="telegram"
              label="Telegram"
              placeholder="@username or https://t.me/username"
              control={profileForm.control}
              error={profileForm.formState.errors.telegram}
            />
          </FieldGroup>

          <div className="mt-6 flex justify-end border-t border-border pt-5">
            <Button
              type="submit"
              disabled={isSavingProfile}
              className="h-11 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Links
                </>
              )}
            </Button>
          </div>
        </form>

        {isFaculty ? (
          <form
            onSubmit={handleFacultySave}
            className="academy-card p-5 md:p-6"
          >
            <SectionHeader
              icon={Briefcase}
              eyebrow="Faculty Profile"
              title="Update faculty details"
              description="These details appear on your faculty profile and course instructor sections."
            />

            <FieldGroup className="mt-6 gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <FacultyFieldControl
                  name="designation"
                  label="Designation"
                  placeholder="Faculty Mentor"
                  control={facultyForm.control}
                  error={facultyForm.formState.errors.designation}
                />

                <FacultyFieldControl
                  name="experience"
                  label="Experience"
                  placeholder="Example: 8"
                  control={facultyForm.control}
                  error={facultyForm.formState.errors.experience}
                />
              </div>

              <Field>
                <FieldLabel className="text-sm font-semibold text-card-foreground">
                  Expertise
                </FieldLabel>

                <Controller
                  name="expertise"
                  control={facultyForm.control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Mention your areas of expertise..."
                      rows={5}
                      className="min-h-32 resize-none rounded-2xl border-border bg-muted px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:border-primary focus-visible:ring-primary"
                    />
                  )}
                />

                <FieldError errors={[facultyForm.formState.errors.expertise]} />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <FacultyFieldControl
                  name="linkedin"
                  label="Faculty LinkedIn"
                  placeholder="https://linkedin.com/in/username"
                  control={facultyForm.control}
                  error={facultyForm.formState.errors.linkedin}
                />

                <FacultyFieldControl
                  name="instagram"
                  label="Faculty Instagram"
                  placeholder="https://instagram.com/username"
                  control={facultyForm.control}
                  error={facultyForm.formState.errors.instagram}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FacultyFieldControl
                  name="twitter"
                  label="Faculty X / Twitter"
                  placeholder="https://x.com/username"
                  control={facultyForm.control}
                  error={facultyForm.formState.errors.twitter}
                />

                <FacultyFieldControl
                  name="youtube"
                  label="Faculty YouTube"
                  placeholder="https://youtube.com/@username"
                  control={facultyForm.control}
                  error={facultyForm.formState.errors.youtube}
                />
              </div>
            </FieldGroup>

            <div className="mt-6 flex justify-end border-t border-border pt-5">
              <Button
                type="submit"
                disabled={isSavingFaculty}
                className="h-11 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingFaculty ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Faculty Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : null}
      </div>

      <aside className="space-y-5 xl:sticky xl:top-24">
        <div className="academy-card overflow-hidden p-5">
          <div className="rounded-3xl border border-primary/15 bg-primary/5 p-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Sparkles className="h-6 w-6" />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Live Preview
            </p>

            <h3 className="mt-2 text-xl font-semibold text-card-foreground">
              {fullName || "Learner"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {watchedHeadline ||
                "Your headline will appear here as you update your profile."}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <PreviewLine
              icon={Briefcase}
              label="Company"
              value={watchedCompany || "Not added"}
            />

            <PreviewLine
              icon={MapPin}
              label="Location"
              value={watchedLocation || "Not added"}
            />

            <PreviewLine
              icon={Globe}
              label="Website"
              value={watchedWebsite || "Not added"}
            />
          </div>
        </div>

        <div className="academy-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Social Preview
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {watchedLinkedin ? (
              <SocialPill
                icon={FaLinkedin}
                label="LinkedIn"
                href={watchedLinkedin}
              />
            ) : null}

            {watchedInstagram ? (
              <SocialPill
                icon={FaInstagram}
                label="Instagram"
                href={watchedInstagram}
              />
            ) : null}

            {!watchedLinkedin && !watchedInstagram ? (
              <p className="rounded-2xl border border-dashed border-border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
                Add your social links to preview them here.
              </p>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}

function FieldControl({
  name,
  label,
  placeholder,
  control,
  error,
}: {
  name: keyof ProfileFormValues;
  label: string;
  placeholder: string;
  control: ReturnType<typeof useForm<ProfileFormValues>>["control"];
  error?: { message?: string };
}) {
  return (
    <Field>
      <FieldLabel className="text-sm font-semibold text-card-foreground">
        {label}
      </FieldLabel>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            placeholder={placeholder}
            className="h-12 rounded-2xl border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:border-primary focus-visible:ring-primary"
          />
        )}
      />

      <FieldError errors={[error]} />
    </Field>
  );
}

function FacultyFieldControl({
  name,
  label,
  placeholder,
  control,
  error,
}: {
  name: keyof FacultyFormValues;
  label: string;
  placeholder: string;
  control: ReturnType<typeof useForm<FacultyFormValues>>["control"];
  error?: { message?: string };
}) {
  return (
    <Field>
      <FieldLabel className="text-sm font-semibold text-card-foreground">
        {label}
      </FieldLabel>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            placeholder={placeholder}
            className="h-12 rounded-2xl border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:border-primary focus-visible:ring-primary"
          />
        )}
      />

      <FieldError errors={[error]} />
    </Field>
  );
}

function getProfileDefaults(user: User): ProfileFormValues {
  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phoneNumber: user.phoneNumber || "",
    headline: user.profile?.headline || "",
    company: user.profile?.company || "",
    location: user.profile?.location || "",
    website: user.profile?.website || "",
    bio: user.profile?.bio || "",
    facebook: user.profile?.facebook || "",
    instagram: user.profile?.instagram || "",
    twitter: user.profile?.twitter || "",
    linkedin: user.profile?.linkedin || "",
    youtube: user.profile?.youtube || "",
    whatsapp: user.profile?.whatsapp || "",
    telegram: user.profile?.telegram || "",
  };
}

function getFacultyDefaults(user: User): FacultyFormValues {
  return {
    designation: user.facultyProfile?.designation || "",
    expertise: user.facultyProfile?.expertise || "",
    experience: user.facultyProfile?.experience || "",
    linkedin: user.facultyProfile?.linkedin || "",
    instagram: user.facultyProfile?.instagram || "",
    twitter: user.facultyProfile?.twitter || "",
    youtube: user.facultyProfile?.youtube || "",
  };
}
