import { Injectable, NotFoundException } from '@nestjs/common';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { CreateCourseProvider } from './create-course.provider';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { GetCoursesDto } from '../dtos/get-courses.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { Course } from '../course.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PatchCourseDto } from '../dtos/patch-course.dto';
import { UpdateCourseProvider } from './update-course.provider';
import { MediaFileMappingService } from 'src/common/media-file-mapping/providers/media-file-mapping.service';
import { FindOneBySlugProvider } from './find-one-by-slug.provider';
import { EnrollmentsService } from 'src/enrollments/providers/enrollments.service';
import { UserProgressService } from 'src/user-progress/providers/user-progress.service';
import { GetFeaturedCoursesProvider } from './get-featured-courses.provider';
import { GetRelatedCoursesProvider } from './get-related-courses.provider';
import { GetEnrolledCoursesProvider } from './get-enrolled-courses.provider';
import { SlugProvider } from 'src/common/slug/providers/slug.provider';
import { generateSlug } from 'src/common/utils/slug.util';
import { Chapter } from 'src/chapters/chapter.entity';
import { Lecture } from 'src/lectures/lecture.entity';
import { Attachment } from 'src/attachments/attachment.entity';

@Injectable()
export class CoursesService {
  constructor(
    /**
     * Inject courseRepository
     */
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    /**
     * Inject createCourseProvider
     */
    private readonly createCourseProvider: CreateCourseProvider,

    /**
     * Inject updateCourseProvider
     */

    private readonly updateCourseProvider: UpdateCourseProvider,

    /**
     * Inject findOneBySlugProvider
     */

    private readonly findOneBySlugProvider: FindOneBySlugProvider,

    /**
     * Inject paginatedProvider
     */

    private readonly paginationProvider: PaginationProvider,

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

    /**
     * Inject getFeaturedCoursesProvider
     */

    private readonly getFeaturedCoursesProvider: GetFeaturedCoursesProvider,

    /**
     * Inject getRelatedCoursesProvider
     */

    private readonly getRelatedCoursesProvider: GetRelatedCoursesProvider,

    /**
     * Inject getEnrolledCoursesProvider
     */

    private readonly getEnrolledCoursesProvider: GetEnrolledCoursesProvider,

    private readonly slugProvider: SlugProvider,
  ) {}

  public async findAll(
    getCoursesDto: GetCoursesDto,
    user?: ActiveUserData,
  ): Promise<Paginated<Course> | Course[]> {
    /**
     * 🔥 NO PAGINATION (website case)
     */
    if (getCoursesDto.isPublished) {
      const courseQuery = this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.createdBy', 'createdBy')
        .leftJoinAndSelect('course.updatedBy', 'updatedBy')
        .leftJoinAndSelect('course.image', 'image')
        .leftJoinAndSelect('course.video', 'video')
        .leftJoinAndSelect('course.categories', 'categories')
        .leftJoinAndSelect('course.faculties', 'faculties')
        .leftJoinAndSelect('course.tags', 'tags')
        .leftJoinAndSelect('course.chapters', 'chapters')
        .leftJoinAndSelect('chapters.lectures', 'lectures')
        .leftJoinAndSelect('lectures.video', 'lectureVideo')
        .leftJoinAndSelect('lectures.attachments', 'attachments')
        .leftJoinAndSelect('attachments.file', 'attachmentFile')
        .where('course.isPublished = :isPublished', { isPublished: true })
        .orderBy('course.createdAt', 'DESC');

      if (getCoursesDto.startDate) {
        courseQuery.andWhere('course.createdAt >= :startDate', {
          startDate: getCoursesDto.startDate,
        });
      }

      if (getCoursesDto.endDate) {
        courseQuery.andWhere('course.createdAt <= :endDate', {
          endDate: getCoursesDto.endDate,
        });
      }

      const courses = await courseQuery.getMany();

      const mapped = this.mediaFileMappingService.mapCourses(courses);
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

    /**
     * 🔥 PAGINATION (admin case)
     */
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.image', 'image')
      .leftJoinAndSelect('course.categories', 'categories')
      .leftJoinAndSelect('course.tags', 'tags')
      .leftJoinAndSelect('course.faculties', 'faculties')
      .orderBy('course.createdAt', 'DESC');

    if (getCoursesDto.startDate) {
      queryBuilder.andWhere('course.createdAt >= :startDate', {
        startDate: getCoursesDto.startDate,
      });
    }

    if (getCoursesDto.endDate) {
      queryBuilder.andWhere('course.createdAt <= :endDate', {
        endDate: getCoursesDto.endDate,
      });
    }

    const result = await this.paginationProvider.paginateQueryBuilder(
      {
        limit: getCoursesDto.limit ?? 10,
        page: getCoursesDto.page ?? 1,
      },
      queryBuilder,
    );

    result.data = this.mediaFileMappingService.mapCourses(result.data);

    return result;
  }
  public async findOneById(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: [
        'createdBy',
        'updatedBy',
        'image',
        'video',
        'categories',
        'tags',
        'faculties',
        'chapters',
        'chapters.lectures',
        'chapters.lectures.video',
        'chapters.lectures.attachments',
        'chapters.lectures.attachments.file',
      ],
      order: {
        chapters: {
          position: 'ASC',
          lectures: {
            position: 'ASC',
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.mediaFileMappingService.mapCourse(course);
  }

  async findManyByIds(ids: number[]) {
    return this.courseRepository.findBy({
      id: In(ids),
    });
  }

  async findOneBySlug(slug: string, user?: ActiveUserData): Promise<Course> {
    return await this.findOneBySlugProvider.findOneBySlug(slug, user);
  }

  async findCourseForLearning(slug: string, user: ActiveUserData) {
    return await this.findOneBySlugProvider.getCourseForLearning(slug, user);
  }

  async getFeaturedCourses(user?: ActiveUserData) {
    return await this.getFeaturedCoursesProvider.getFeaturedCourses(user);
  }

  async getRelatedCourses(courseId: number, user?: ActiveUserData) {
    return await this.getRelatedCoursesProvider.getRelatedCourses(
      courseId,
      user,
    );
  }

  async getEnrolledCourses(userId: number, user?: ActiveUserData) {
    return await this.getEnrolledCoursesProvider.getEnrolledCourses(
      userId,
      user,
    );
  }

  public async create(createCouseDto: CreateCourseDto, user: ActiveUserData) {
    return await this.createCourseProvider.create(createCouseDto, user);
  }
  public async update(
    id: number,
    patchCourseDto: PatchCourseDto,
    user: ActiveUserData,
  ) {
    return await this.updateCourseProvider.update(id, patchCourseDto, user);
  }
  public async delete(id: number) {
    const result = await this.courseRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Course not found');
    }
    return {
      message: 'Course deleted successfully',
    };
  }
  public async duplicate(id: number, user: ActiveUserData): Promise<Course> {
    const sourceCourse = await this.courseRepository.findOne({
      where: { id },
      relations: [
        'image',
        'video',
        'categories',
        'tags',
        'faculties',
        'chapters',
        'chapters.lectures',
        'chapters.lectures.video',
        'chapters.lectures.attachments',
        'chapters.lectures.attachments.file',
      ],
      order: {
        chapters: {
          position: 'ASC',
          lectures: {
            position: 'ASC',
          },
        },
      },
    });

    if (!sourceCourse) {
      throw new NotFoundException('Course not found');
    }

    const duplicatedCourse = await this.courseRepository.manager.transaction(
      async (manager) => {
        const courseRepository = manager.getRepository(Course);
        const chapterRepository = manager.getRepository(Chapter);
        const lectureRepository = manager.getRepository(Lecture);
        const attachmentRepository = manager.getRepository(Attachment);

        const title = `${sourceCourse.title} Copy`;
        const slug = await this.slugProvider.ensureUniqueSlug(
          courseRepository,
          generateSlug(title),
        );

        const course = courseRepository.create({
          title,
          slug,
          shortDescription: sourceCourse.shortDescription,
          description: sourceCourse.description,
          metaTitle: sourceCourse.metaTitle,
          metaSlug: sourceCourse.metaSlug
            ? `${sourceCourse.metaSlug}-copy`
            : undefined,
          metaDescription: sourceCourse.metaDescription,
          image: sourceCourse.image ?? null,
          imageAlt: sourceCourse.imageAlt,
          video: sourceCourse.video ?? null,
          isFree: sourceCourse.isFree,
          isFeatured: false,
          isPublished: false,
          priceInr: sourceCourse.priceInr,
          priceUsd: sourceCourse.priceUsd,
          duration: sourceCourse.duration,
          mode: sourceCourse.mode,
          certificate: sourceCourse.certificate,
          exams: sourceCourse.exams,
          experienceLevel: sourceCourse.experienceLevel,
          studyMaterial: sourceCourse.studyMaterial,
          additionalBook: sourceCourse.additionalBook,
          language: sourceCourse.language,
          technologyRequirements: sourceCourse.technologyRequirements,
          eligibilityRequirements: sourceCourse.eligibilityRequirements,
          disclaimer: sourceCourse.disclaimer,
          faqs: sourceCourse.faqs ?? [],
          exam: sourceCourse.exam ?? null,
          categories: sourceCourse.categories ?? [],
          tags: sourceCourse.tags ?? [],
          faculties: sourceCourse.faculties ?? [],
          createdBy: { id: user.sub },
          updatedBy: { id: user.sub },
        });

        const savedCourse = await courseRepository.save(course);

        for (const sourceChapter of sourceCourse.chapters ?? []) {
          const chapter = chapterRepository.create({
            title: sourceChapter.title,
            description: sourceChapter.description,
            position: sourceChapter.position,
            isPublished: false,
            isFree: sourceChapter.isFree,
            course: savedCourse,
          });
          const savedChapter = await chapterRepository.save(chapter);

          for (const sourceLecture of sourceChapter.lectures ?? []) {
            const lecture = lectureRepository.create({
              title: sourceLecture.title,
              description: sourceLecture.description,
              position: sourceLecture.position,
              isPublished: false,
              isFree: sourceLecture.isFree,
              video: sourceLecture.video ?? null,
              chapter: savedChapter,
            });
            const savedLecture = await lectureRepository.save(lecture);

            const attachments = (sourceLecture.attachments ?? []).map(
              (sourceAttachment) =>
                attachmentRepository.create({
                  name: sourceAttachment.name,
                  file: sourceAttachment.file ?? null,
                  lecture: savedLecture,
                }),
            );

            if (attachments.length) {
              await attachmentRepository.save(attachments);
            }
          }
        }

        return savedCourse;
      },
    );

    return this.findOneById(duplicatedCourse.id);
  }
  public async softDelete() {}
  public async restore() {}
}
