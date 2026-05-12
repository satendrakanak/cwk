import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Course } from '../course.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from 'src/chapters/chapter.entity';
import { FacultyReview } from 'src/faculty-reviews/faculty-review.entity';
import { MediaFileMappingService } from 'src/common/media-file-mapping/providers/media-file-mapping.service';
import { EnrollmentsService } from 'src/enrollments/providers/enrollments.service';
import { UserProgressService } from 'src/user-progress/providers/user-progress.service';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import {
  CourseProgress,
  CourseWithAccess,
} from '../types/course-with-access.type';

@Injectable()
export class FindOneBySlugProvider {
  constructor(
    /**
     * Inject courseRepository
     */

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,

    @InjectRepository(FacultyReview)
    private readonly facultyReviewRepository: Repository<FacultyReview>,

    /**
     * Inject mediaFileMappingService
     */
    private readonly mediaFileMappingService: MediaFileMappingService,

    /**
     * Inject enrollmentsService
     */

    private readonly enrollmentsService: EnrollmentsService,

    /**
     * Inject userProgressService
     */
    private readonly userProgressService: UserProgressService,
  ) {}

  async findOneBySlug(
    slug: string,
    user?: ActiveUserData,
  ): Promise<CourseWithAccess> {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.createdBy', 'createdBy')
      .leftJoinAndSelect('createdBy.avatar', 'createdByAvatar')
      .leftJoinAndSelect('course.updatedBy', 'updatedBy')
      .leftJoinAndSelect('updatedBy.avatar', 'updatedByAvatar')
      .leftJoinAndSelect('updatedBy.roles', 'updatedByRoles')
      .leftJoinAndSelect('course.image', 'image')
      .leftJoinAndSelect('course.video', 'video')
      .leftJoinAndSelect('course.categories', 'categories')
      .leftJoinAndSelect('course.tags', 'tags')
      .leftJoinAndSelect('course.faculties', 'faculties')
      .leftJoinAndSelect('faculties.avatar', 'facultyAvatar')
      .leftJoinAndSelect('faculties.facultyProfile', 'facultyProfile')
      .leftJoinAndSelect('faculties.profile', 'profile')
      .loadRelationCountAndMap(
        'faculties.taughtCoursesCount',
        'faculties.taughtCourses',
        'facultyCourses',
        (qb) =>
          qb.andWhere('facultyCourses.isPublished = :facultyCoursePublished', {
            facultyCoursePublished: true,
          }),
      )
      .loadRelationCountAndMap(
        'course.enrollmentCount',
        'course.enrollments',
        'enrollment',
        (qb) =>
          qb.andWhere('enrollment.isActive = :enrollmentActive', {
            enrollmentActive: true,
          }),
      )
      .where('course.slug = :slug', { slug })
      .andWhere('course.isPublished = :coursePublished', {
        coursePublished: true,
      })
      .getOne();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    course.chapters = await this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoinAndSelect(
        'chapter.lectures',
        'lectures',
        'lectures.isPublished = :lecturePublished',
        { lecturePublished: true },
      )
      .leftJoinAndSelect('lectures.video', 'lectureVideo')
      .leftJoinAndSelect('lectures.attachments', 'attachments')
      .leftJoinAndSelect('attachments.file', 'file')
      .where('chapter.courseId = :courseId', { courseId: course.id })
      .andWhere('chapter.isPublished = :chapterPublished', {
        chapterPublished: true,
      })
      .orderBy('chapter.position', 'ASC')
      .addOrderBy('lectures.position', 'ASC')
      .getMany();

    if (course.faculties?.length) {
      const facultyIds = course.faculties.map((faculty) => faculty.id);
      const reviewRows = await this.facultyReviewRepository
        .createQueryBuilder('review')
        .select('review.facultyId', 'id')
        .addSelect('COUNT(review.id)', 'total')
        .addSelect('AVG(review.rating)', 'average')
        .where('review.facultyId IN (:...facultyIds)', { facultyIds })
        .andWhere('review.isPublished = true')
        .groupBy('review.facultyId')
        .getRawMany<{ id: string; total: string; average: string }>();
      const reviewMap = new Map(
        reviewRows.map((row) => [
          Number(row.id),
          {
            totalReviews: Number(row.total || 0),
            averageRating: Number(Number(row.average || 0).toFixed(1)),
          },
        ]),
      );

      course.faculties = course.faculties.map((faculty) =>
        Object.assign(faculty, {
          totalReviews: reviewMap.get(faculty.id)?.totalReviews || 0,
          averageRating: reviewMap.get(faculty.id)?.averageRating || 0,
        }),
      );
    }

    const mappedCourse = this.mediaFileMappingService.mapCourse(course);
    let isEnrolled = false;
    let progress: CourseProgress = {
      isCompleted: false,
      progress: 0,
      lastTime: 0,
    };

    if (user) {
      const enrollment = await this.enrollmentsService.checkEnrollment(
        user.sub,
        course.id,
      );

      isEnrolled = !!enrollment;

      if (isEnrolled) {
        const progressData =
          await this.userProgressService.getCourseProgressSummary(
            user,
            course.id,
          );

        progress = progressData;
      }
    }

    return {
      ...mappedCourse,
      isEnrolled,
      progress,
    };
  }

  async getCourseForLearning(slug: string, user: ActiveUserData) {
    const course = await this.findOneBySlug(slug, user);

    if (!course.isEnrolled) {
      throw new ForbiddenException("You don't have access to this course");
    }

    return course;
  }
}
