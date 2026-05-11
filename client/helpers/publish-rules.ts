import { Lecture } from "@/types/lecture";
import { Chapter } from "@/types/chapter";
import { Course, PublishCheckResult } from "@/types/course";
import { Article } from "@/types/article";
import { hasLiveClasses, hasRecordedLearning } from "@/lib/course-delivery";

/**
 * 🎥 Lecture publish check
 */
export const canPublishLecture = (lecture: Lecture): boolean => {
  const hasVideo = !!lecture.video?.path;
  const hasAttachments = (lecture.attachments?.length ?? 0) > 0;

  return hasVideo || hasAttachments;
};

/**
 * 📚 Chapter publish check
 */
export const canPublishChapter = (chapter: Chapter): boolean => {
  return (chapter.lectures ?? []).some((l) => l.isPublished);
};

export const canPublishCurriculumChapter = (chapter: Chapter): boolean => {
  return Boolean(chapter.title?.trim() && chapter.description?.trim());
};

const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, "").trim();
};
export const checkCoursePublish = (course: Course): PublishCheckResult => {
  const reasons: string[] = [];
  const needsRecordedContent = hasRecordedLearning(course);
  const needsFacultySetup = hasLiveClasses(course);

  // 🔥 content rule
  const hasPublishedLecture = (course.chapters ?? []).some(
    (chapter) =>
      chapter.isPublished &&
      (chapter.lectures ?? []).some((lecture) => lecture.isPublished),
  );
  const hasPublishedCurriculumModule = (course.chapters ?? []).some(
    (chapter) => chapter.isPublished && canPublishCurriculumChapter(chapter),
  );

  if (needsRecordedContent && !hasPublishedLecture) {
    reasons.push(
      "At least one published chapter with a published lecture is required",
    );
  }

  if (!needsRecordedContent && !hasPublishedCurriculumModule) {
    reasons.push(
      "At least one published curriculum module with description is required",
    );
  }

  if (needsFacultySetup && !course.faculties?.length) {
    reasons.push("At least one faculty must be assigned");
  }

  // 🔥 required fields
  if (!course.title?.trim()) {
    reasons.push("Title is required");
  }

  if (!course.shortDescription?.trim()) {
    reasons.push("Short description is required");
  }
  const plainText = stripHtml(course.description || "");
  if (!plainText?.trim()) {
    reasons.push("Full description is required");
  }

  if (!course.duration?.trim()) {
    reasons.push("Course duration is required");
  }
  if (!course.mode?.trim()) {
    reasons.push("Course mode is required");
  }
  if (!course.certificate?.trim()) {
    reasons.push("Course certificate is required");
  }
  if (!course.exams?.trim()) {
    reasons.push("Course exams is required");
  }
  if (needsRecordedContent && !course.studyMaterial?.trim()) {
    reasons.push("Course study material is required");
  }
  if (!course.experienceLevel?.trim()) {
    reasons.push("Course experience level is required");
  }

  if (!course.additionalBook?.trim()) {
    reasons.push("Course additional book is required");
  }
  if (!course.language?.trim()) {
    reasons.push("Course language is required");
  }
  if (!course.technologyRequirements?.trim()) {
    reasons.push("Course technology requirements is required");
  }
  if (!course.eligibilityRequirements?.trim()) {
    reasons.push("Course eligibility requirements is required");
  }

  if (!course.image?.path) {
    reasons.push("Course image is required");
  }

  if (!course.categories || course.categories.length === 0) {
    reasons.push("At least one category is required");
  }

  // price rule (adjust as per your product)
  const price = Number(course.priceInr);

  if (isNaN(price) || price < 0) {
    reasons.push("Valid price is required");
  }

  // optional strict rule
  if (!course.tags || course.tags.length === 0) {
    reasons.push("At least one tag is recommended");
  }

  return {
    canPublish: reasons.length === 0,
    reasons,
  };
};

export const checkArticlePublish = (article: Article): PublishCheckResult => {
  const reasons: string[] = [];

  // 🔥 required fields
  if (!article.title?.trim()) {
    reasons.push("Title is required");
  }

  const plainText = stripHtml(article.content || "");
  if (!plainText?.trim()) {
    reasons.push("Article content is required");
  }

  if (!article.featuredImage?.path) {
    reasons.push("Article image is required");
  }

  if (!article.categories || article.categories.length === 0) {
    reasons.push("At least one category is required");
  }

  // optional strict rule
  if (!article.tags || article.tags.length === 0) {
    reasons.push("At least one tag is recommended");
  }

  return {
    canPublish: reasons.length === 0,
    reasons,
  };
};
