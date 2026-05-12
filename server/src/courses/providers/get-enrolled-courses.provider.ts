import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '../course.entity';
import { Repository } from 'typeorm';
import { MediaFileMappingService } from 'src/common/media-file-mapping/providers/media-file-mapping.service';
import { EnrollmentsService } from 'src/enrollments/providers/enrollments.service';
import { UserProgressService } from 'src/user-progress/providers/user-progress.service';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { CourseReview } from 'src/course-reviews/course-review.entity';

@Injectable()
export class GetEnrolledCoursesProvider {
  constructor(
    /**
     * Inject courseRepository
     */

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(CourseReview)
    private readonly courseReviewRepository: Repository<CourseReview>,

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

  async getEnrolledCourses(userId: number, user?: ActiveUserData) {
    const courses = await this.courseRepository.find({
      where: {
        isPublished: true,
        enrollments: { user: { id: userId }, isActive: true },
      },
      relations: [
        'createdBy',
        'updatedBy',
        'image',
        'video',
        'categories',
        'tags',
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    const coursesWithStats = await this.attachCourseStats(courses);
    const mapped = this.mediaFileMappingService.mapCourses(coursesWithStats);
    if (!user) {
      return mapped.map((c) => ({
        ...c,
        isEnrolled: false,
        progress: null,
      }));
    }
    const courseIds = mapped.map((c) => c.id);

    const [enrollmentMap, progressMap] = await Promise.all([
      this.enrollmentsService.checkMultipleEnrollments(user.sub, courseIds),
      this.userProgressService.getMultipleCourseProgressSummary(
        user,
        courseIds,
      ),
    ]);
    return mapped.map((course) => ({
      ...course,
      isEnrolled: enrollmentMap[course.id] ?? false,
      progress: progressMap[course.id] ?? {
        isCompleted: false,
        progress: 0,
        lastTime: 0,
      },
    }));
  }

  private async attachCourseStats(courses: Course[]) {
    if (!courses.length) return courses;

    const courseIds = courses.map((course) => course.id);
    const reviewRows = await this.courseReviewRepository
      .createQueryBuilder('review')
      .select('review.courseId', 'id')
      .addSelect('COUNT(review.id)', 'total')
      .addSelect('AVG(review.rating)', 'average')
      .where('review.courseId IN (:...courseIds)', { courseIds })
      .andWhere('review.isPublished = true')
      .groupBy('review.courseId')
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

    return courses.map((course) =>
      Object.assign(course, {
        totalReviews: reviewMap.get(course.id)?.totalReviews || 0,
        averageRating: reviewMap.get(course.id)?.averageRating || 0,
      }),
    );
  }
}
