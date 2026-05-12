"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Download, Loader } from "lucide-react";
import { toast } from "sonner";

import { CourseQaSection } from "@/components/course/sections/course-qa-section";
import { CourseRatingReviews } from "@/components/course/sections/course-rating-reviews";
import { getCourseMeta } from "@/helpers/course-meta";
import { getCourseProgress } from "@/helpers/course-progress";
import { downloadRemoteFile } from "@/lib/download-file";
import { cn } from "@/lib/utils";
import { certificateClientService } from "@/services/certificates/certificate.client";
import { Certificate } from "@/types/certificate";
import { Course } from "@/types/course";
import { slugify } from "@/utils/slugify";

interface CourseTabsProps {
  course: Course;
}

type TabId = "overview" | "exam" | "qa" | "reviews";

export const CourseTabs = ({ course }: CourseTabsProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const [meta, setMeta] = useState({
    totalLectures: 0,
    totalDuration: "0m",
  });

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { completed, total, percent } = getCourseProgress(course);

  const isCourseCompleted = total > 0 && completed >= total;

  const tabs: { id: TabId; label: string; visible?: boolean }[] = [
    { id: "overview", label: "Overview" },
    { id: "qa", label: "Q&A" },
    { id: "reviews", label: "Reviews" },
    { id: "exam", label: "Final Exams" },
  ];

  useEffect(() => {
    const loadMeta = async () => {
      const data = await getCourseMeta(course);
      setMeta(data);
    };

    loadMeta();
  }, [course]);

  useEffect(() => {
    let mounted = true;

    const loadCertificate = async () => {
      try {
        const response = await certificateClientService.getForCourse(course.id);

        if (mounted) {
          setCertificate(response.data);
        }
      } catch {
        if (mounted) {
          setCertificate(null);
        }
      }
    };

    loadCertificate();

    return () => {
      mounted = false;
    };
  }, [course.id]);

  const downloadCertificate = async (nextCertificate: Certificate) => {
    const fileUrl = nextCertificate.file?.path;

    if (!fileUrl) return;

    const name = slugify(
      `${nextCertificate.user?.firstName || ""} ${
        nextCertificate.user?.lastName || ""
      }`.trim() || "learner",
    );

    const courseName = slugify(nextCertificate.course?.title || "course");
    const fileName = `${name}-${courseName}.pdf`;

    await downloadRemoteFile(fileUrl, fileName);
  };

  const handleCertificateClick = async () => {
    if (certificate) {
      console.log("Certificate", certificate);
      downloadCertificate(certificate);
      return;
    }

    if (!isCourseCompleted) {
      toast.info("Complete all lectures to unlock your certificate");
      return;
    }

    try {
      setIsGenerating(true);

      const response = await certificateClientService.generateForCourse(
        course.id,
      );

      setCertificate(response.data);
      toast.success("Certificate generated and emailed successfully");
      downloadCertificate(response.data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Certificate could not be generated",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="border-t border-border bg-background">
      <div className="flex flex-wrap items-center gap-5 border-b border-border px-6 pt-4">
        {tabs
          .filter((tab) => tab.visible !== false)
          .map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === "exam") {
                    router.push(`/course/${course.slug}/exams`);
                    return;
                  }
                  setActiveTab(tab.id);
                }}
                className={cn(
                  "cursor-pointer border-b-2 pb-2 text-sm font-bold transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-primary",
                )}
              >
                {tab.label}
              </button>
            );
          })}
      </div>

      {activeTab === "qa" ? (
        <div className="px-6 py-6">
          <CourseQaSection course={{ ...course, isEnrolled: true }} />
        </div>
      ) : activeTab === "reviews" ? (
        <div className="px-6 py-6">
          <CourseRatingReviews course={{ ...course, isEnrolled: true }} />
        </div>
      ) : (
        <div className="space-y-4 px-6 py-6 text-sm text-muted-foreground">
          <h1 className="text-2xl font-semibold text-card-foreground">
            {course.title}
          </h1>

          {course.shortDescription ? (
            <div>
              <p className="text-base leading-relaxed text-foreground">
                {course.shortDescription}
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-6 border-t border-border pt-6 md:grid-cols-4">
            <CourseStat label="Lectures" value={meta.totalLectures} />
            <CourseStat label="Total Duration" value={meta.totalDuration} />
            <CourseStat label="Language" value={course.language || "English"} />
            <CourseStat label="Level" value="All Level" />
          </div>

          <div className="border-t border-border pt-6">
            <div className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/5 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 sm:flex">
                    <Award className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                      Certificate
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-card-foreground">
                      {certificate
                        ? "Your certificate is ready"
                        : "Unlock your completion certificate"}
                    </h3>

                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {certificate
                        ? `Certificate ID ${certificate.certificateNumber}. You can download it anytime from here or your profile.`
                        : course.exam?.isPublished
                          ? `Complete all ${
                              total || meta.totalLectures
                            } lectures and clear the final exam to generate your official CodeWithKasa certificate. Current lecture progress: ${percent}%.`
                          : `Complete all ${
                              total || meta.totalLectures
                            } lectures to generate your official CodeWithKasa certificate. Current progress: ${percent}%.`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    (!isCourseCompleted && !certificate) || isGenerating
                  }
                  onClick={handleCertificateClick}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_22%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : certificate ? (
                    <>
                      <Download className="h-4 w-4" />
                      Download Certificate
                    </>
                  ) : (
                    "Get Certificate"
                  )}
                </button>
              </div>
            </div>
          </div>

          {course.description ? (
            <div className="border-t border-border pt-6">
              <h3 className="mb-3 text-base font-semibold text-card-foreground">
                Description
              </h3>

              <div
                className="prose prose-sm max-w-none
                  prose-headings:font-semibold prose-headings:text-card-foreground
                  prose-p:leading-relaxed prose-p:text-muted-foreground
                  prose-li:text-muted-foreground prose-li:marker:text-primary
                  prose-strong:text-card-foreground
                  prose-a:text-primary
                  prose-ul:ml-4 prose-ul:list-disc
                  prose-ol:ml-4 prose-ol:list-decimal"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

function CourseStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-card-foreground">{value}</p>
    </div>
  );
}
