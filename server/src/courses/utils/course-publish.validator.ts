import { Course } from '../course.entity';
import {
  hasLiveClasses,
  hasRecordedLearning,
} from '../constants/course-delivery-mode';

// utils
const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, '').trim();
};
export const getCoursePublishErrors = (course: Course): string[] => {
  const errors: string[] = [];

  const needsRecordedContent = hasRecordedLearning(course.mode);
  const needsFacultySetup = hasLiveClasses(course.mode);
  const hasPublishedCurriculumChapter = (course.chapters ?? []).some(
    (chapter) =>
      chapter.isPublished &&
      Boolean(chapter.title?.trim() && chapter.description?.trim()),
  );
  const hasValidContent = (course.chapters ?? []).some(
    (chapter) =>
      chapter.isPublished &&
      (chapter.lectures ?? []).some((lecture) => lecture.isPublished),
  );

  if (needsRecordedContent && !hasValidContent) {
    errors.push(
      'Course must have at least one published chapter with published lectures',
    );
  }

  if (!needsRecordedContent && !hasPublishedCurriculumChapter) {
    errors.push(
      'Course must have at least one published curriculum chapter with description',
    );
  }

  if (needsFacultySetup && !course.faculties?.length) {
    errors.push('Faculty-led courses must have at least one assigned faculty');
  }

  if (!course.title?.trim()) errors.push('Title is required');
  if (!course.shortDescription?.trim())
    errors.push('Short description is required');
  const plainText = stripHtml(course.description || '');

  if (!plainText) {
    errors.push('Full description is required');
  }
  if (!course.image) errors.push('Course image is required');
  if (!course.categories?.length)
    errors.push('At least one category is required');
  if (!course.tags?.length) errors.push('At least one tag is required');
  if (!course.additionalBook) errors.push('Please add additional book');
  if (!course.certificate) errors.push('Please add certificate');
  if (!course.duration) errors.push('Please add duration');
  if (!course.eligibilityRequirements)
    errors.push('Please add eligibility requirements');
  if (!course.technologyRequirements)
    errors.push('Please add technology requirements');
  if (!course.language) errors.push('Please add language');
  if (!course.exams) errors.push('Please add exams');
  if (!course.experienceLevel) errors.push('Please add experience level');
  if (!course.mode) errors.push('Please add mode');
  if (needsRecordedContent && !course.studyMaterial)
    errors.push('Please add study material');

  const price = Number(course.priceInr);
  if (isNaN(price) || price < 0) {
    errors.push('Valid price is required');
  }

  return errors;
};
