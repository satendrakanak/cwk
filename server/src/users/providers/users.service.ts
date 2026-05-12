import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { CreateUserProvider } from './create-user.provider';
import { FindOneByEmailProvider } from './find-one-by-email.provider';
import { FindOneByIdProvider } from './find-one-by-id.provider';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { GetUsersDto } from '../dtos/get-users.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { CreateBulkUsersDto } from '../dtos/create-bulk-users.dto';
import { CreateBulkUsersProvider } from './create-bulk-users.provider';
import { PatchUserDto } from '../dtos/patch-user.dto';
import { UpdateUserProvider } from './update-user.provider';
import { DeleteRecord } from 'src/common/interfaces/delete-record.interface';
import { DeleteBulkUsersDto } from '../dtos/delete-bulk-users.dto';
import { RestoreUserProvider } from './restore-user.provider';
import { DeleteUserProvider } from './delete-user.provider';
import { MarkEmailVerifiedProvider } from './mark-email-verified.provider';
import { UpdatePasswordProvider } from './update-password.provider';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { ChangePasswordProvider } from './change-password.provider';
import { GetDashboardStatsProvider } from './get-dashboard-stats.provider';
import { WeeklyProgress } from 'src/user-progress/interfaces/weekly-progress.interface';
import { AdminUpdateUserDto } from '../dtos/admin-update-user.dto';
import { UpdateProfileDto } from 'src/profiles/dtos/update-profile.dto';
import { ProfilesService } from 'src/profiles/providers/profiles.service';
import { MediaFileMappingService } from 'src/common/media-file-mapping/providers/media-file-mapping.service';
import { UpdateFacultyProfileDto } from 'src/profiles/dtos/update.faculty-profile.dto';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { Brackets } from 'typeorm';
import { CreateUserOptions } from '../interfaces/create-user-options.interface';
import { Enrollment } from 'src/enrollments/enrollment.entity';
import { Certificate } from 'src/certificates/certificate.entity';
import { CourseExamAttempt } from 'src/course-exams/course-exam-attempt.entity';
import { FacultyReview } from 'src/faculty-reviews/faculty-review.entity';
import { CourseReview } from 'src/course-reviews/course-review.entity';
import { Course } from 'src/courses/course.entity';

@Injectable()
export class UsersService {
  constructor(
    /**
     * Inject userRepository
     */

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,

    @InjectRepository(CourseExamAttempt)
    private readonly courseExamAttemptRepository: Repository<CourseExamAttempt>,

    @InjectRepository(FacultyReview)
    private readonly facultyReviewRepository: Repository<FacultyReview>,

    @InjectRepository(CourseReview)
    private readonly courseReviewRepository: Repository<CourseReview>,

    /**
     * Inject createUserProvider
     */
    private readonly createUserprovider: CreateUserProvider,

    /**
     * Inject createBulkUsersProvider
     */

    private readonly createBulkUsersProvider: CreateBulkUsersProvider,

    /**
     * Inject updateUserProvider
     */
    private readonly updateUserProvider: UpdateUserProvider,

    /**
     * Inject findOneByEmailProvider
     */
    private readonly findOneByEmailProvider: FindOneByEmailProvider,

    /**
     * Inject findOneByIdProvider
     */
    private readonly findOneByIdProvider: FindOneByIdProvider,

    /**
     * Inject paginatedProvider
     */

    private readonly paginationProvider: PaginationProvider,

    /**
     * Inject deleteUserProvider
     */

    private readonly deleteUserProvider: DeleteUserProvider,

    /**
     * Inject restoreUserProvider
     */
    private readonly restoreUserProvider: RestoreUserProvider,

    /**
     * Inject markEmailVerifiedProvider
     */

    private readonly markEmailVerifiedProvider: MarkEmailVerifiedProvider,

    /**
     * Inject updatePasswordProvider
     */

    private readonly updatePasswordProvider: UpdatePasswordProvider,
    /**
     * Inject changePasswordProvider
     */
    private readonly changePasswordProvider: ChangePasswordProvider,

    /***
     * Inject getDashboardStatsProvider
     */

    private readonly getDashboardStatsProvider: GetDashboardStatsProvider,

    /**
     * Inject mediaFileMappingService
     */
    private readonly mediaFileMappingService: MediaFileMappingService,

    /**
     * Inject usersService
     */
    @Inject(forwardRef(() => ProfilesService))
    private readonly profilesService: ProfilesService,
  ) {}

  private slugifyFacultyName(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private getFacultyProfileQuery() {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.facultyProfile', 'facultyProfile')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .leftJoinAndSelect('user.coverImage', 'coverImage')
      .leftJoinAndSelect(
        'user.taughtCourses',
        'taughtCourses',
        'taughtCourses.isPublished = :isPublished',
        { isPublished: true },
      )
      .leftJoinAndSelect('taughtCourses.image', 'taughtCoursesImage')
      .leftJoinAndSelect('taughtCourses.faculties', 'taughtCoursesFaculties')
      .leftJoinAndSelect(
        'taughtCoursesFaculties.avatar',
        'taughtCoursesFacultiesAvatar',
      )
      .leftJoinAndSelect('taughtCourses.createdBy', 'taughtCoursesCreatedBy')
      .leftJoinAndSelect('taughtCourses.categories', 'taughtCoursesCategories')
      .leftJoinAndSelect('taughtCourses.tags', 'taughtCoursesTags');
  }

  private mapFacultyProfile(user: User) {
    const mappedUser = this.mediaFileMappingService.mapUser(user);

    mappedUser.taughtCourses =
      mappedUser.taughtCourses?.map((course) =>
        this.mediaFileMappingService.mapCourse(course),
      ) || [];

    return mappedUser;
  }

  private async attachCourseReviewStats(courses: Course[]) {
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

  private async attachFacultyStats(users: User[]) {
    if (!users.length) return users;
    const ids = users.map((user) => user.id);

    const [courseRows, reviewRows] = await Promise.all([
      this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.taughtCourses', 'course', 'course.isPublished = true')
        .select('user.id', 'id')
        .addSelect('COUNT(course.id)', 'count')
        .where('user.id IN (:...ids)', { ids })
        .groupBy('user.id')
        .getRawMany<{ id: string; count: string }>(),
      this.facultyReviewRepository
        .createQueryBuilder('review')
        .select('review.facultyId', 'id')
        .addSelect('COUNT(review.id)', 'total')
        .addSelect('AVG(review.rating)', 'average')
        .where('review.facultyId IN (:...ids)', { ids })
        .andWhere('review.isPublished = true')
        .groupBy('review.facultyId')
        .getRawMany<{ id: string; total: string; average: string }>(),
    ]);

    const courseMap = new Map(
      courseRows.map((row) => [Number(row.id), Number(row.count || 0)]),
    );
    const reviewMap = new Map(
      reviewRows.map((row) => [
        Number(row.id),
        {
          totalReviews: Number(row.total || 0),
          averageRating: Number(Number(row.average || 0).toFixed(1)),
        },
      ]),
    );

    return users.map((user) =>
      Object.assign(user, {
        taughtCoursesCount: courseMap.get(user.id) || 0,
        averageRating: reviewMap.get(user.id)?.averageRating || 0,
        totalReviews: reviewMap.get(user.id)?.totalReviews || 0,
      }),
    );
  }

  public async findAll(getUsersDto: GetUsersDto): Promise<Paginated<User>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.facultyProfile', 'facultyProfile')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .leftJoinAndSelect('user.coverImage', 'coverImage')
      .orderBy('user.createdAt', 'DESC');

    if (getUsersDto.includeDeleted) {
      queryBuilder.withDeleted();
    }

    if (getUsersDto.roleId) {
      queryBuilder.andWhere('roles.id = :roleId', {
        roleId: getUsersDto.roleId,
      });
    }

    if (getUsersDto.search?.trim()) {
      const search = `%${getUsersDto.search.trim().toLowerCase()}%`;

      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(user.firstName) LIKE :search', { search })
            .orWhere('LOWER(user.lastName) LIKE :search', { search })
            .orWhere('LOWER(user.email) LIKE :search', { search })
            .orWhere('LOWER(user.username) LIKE :search', { search })
            .orWhere('LOWER(user.phoneNumber) LIKE :search', { search });
        }),
      );
    }

    if (getUsersDto.startDate) {
      queryBuilder.andWhere('user.createdAt >= :startDate', {
        startDate: getUsersDto.startDate,
      });
    }

    if (getUsersDto.endDate) {
      queryBuilder.andWhere('user.createdAt <= :endDate', {
        endDate: getUsersDto.endDate,
      });
    }

    const result = await this.paginationProvider.paginateQueryBuilder(
      {
        limit: getUsersDto.limit,
        page: getUsersDto.page,
      },
      queryBuilder,
    );

    result.data = this.mediaFileMappingService.mapUsers(result.data);

    return result;
  }

  public async findOneById(id: number): Promise<User> {
    return await this.findOneByIdProvider.findOneById(id);
  }

  public async findOneByEmail(email: string): Promise<User> {
    return await this.findOneByEmailProvider.findOneByEmail(email);
  }

  async getFacultyProfile(id: number): Promise<User> {
    const user = await this.getFacultyProfileQuery()
      .where('user.id = :id', { id })
      .getOne();

    if (!user || !user.roles.some((role) => role.name === 'faculty')) {
      throw new NotFoundException('Faculty not found');
    }

    const [withStats] = await this.attachFacultyStats([user]);
    withStats.taughtCourses = await this.attachCourseReviewStats(
      withStats.taughtCourses || [],
    );
    return this.mapFacultyProfile(withStats);
  }

  async getFacultyProfileBySlug(slug: string): Promise<User> {
    const normalizedSlug = this.slugifyFacultyName(slug);
    const users = await this.getFacultyProfileQuery()
      .where('roles.name = :roleName', { roleName: 'faculty' })
      .andWhere(
        `(user.username = :slug OR LOWER(CONCAT(user.firstName, ' ', COALESCE(user.lastName, ''))) = :name)`,
        { slug, name: normalizedSlug.replace(/-/g, ' ') },
      )
      .getMany();

    const user = users.find((faculty) => {
      const nameSlug = this.slugifyFacultyName(
        [faculty.firstName, faculty.lastName].filter(Boolean).join(' '),
      );

      return nameSlug === normalizedSlug || faculty.username === slug;
    });

    if (!user) {
      throw new NotFoundException('Faculty not found');
    }

    const [withStats] = await this.attachFacultyStats([user]);
    withStats.taughtCourses = await this.attachCourseReviewStats(
      withStats.taughtCourses || [],
    );
    return this.mapFacultyProfile(withStats);
  }

  async getUserWithProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'roles', 'avatar', 'coverImage', 'facultyProfile'],
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async getUserByUsername(username: string) {
    return this.userRepository.findOne({
      where: { username },
      relations: ['profile'],
    });
  }

  async getPublicProfileBundle(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: [
        'profile',
        'roles',
        'avatar',
        'coverImage',
        'facultyProfile',
        'taughtCourses',
        'taughtCourses.image',
        'taughtCourses.faculties',
        'taughtCourses.faculties.avatar',
      ],
    });

    if (!user?.profile?.isPublic) {
      return null;
    }

    user.taughtCourses = await this.attachCourseReviewStats(
      user.taughtCourses || [],
    );
    const mappedUser = this.mediaFileMappingService.mapUser(user);
    mappedUser.taughtCourses =
      mappedUser.taughtCourses?.map((course) =>
        this.mediaFileMappingService.mapCourse(course),
      ) || [];

    const [stats, weeklyProgress, certificates, examAttempts, enrollments] =
      await Promise.all([
        this.getDashboardStatsProvider.getDashboardStats(user.id),
        this.getDashboardStatsProvider.getWeeklyProgress(user.id),
        user.profile.showCertificates
          ? this.certificateRepository.find({
              where: { user: { id: user.id } },
              relations: ['course'],
              order: { issuedAt: 'DESC' },
            })
          : Promise.resolve([]),
        this.courseExamAttemptRepository.find({
          where: { user: { id: user.id } },
          relations: ['course'],
          order: { submittedAt: 'DESC', createdAt: 'DESC' },
        }),
        user.profile.showCourses
          ? this.enrollmentRepository.find({
              where: { user: { id: user.id }, isActive: true },
              relations: [
                'course',
                'course.image',
                'course.faculties',
                'course.faculties.avatar',
              ],
              order: { enrolledAt: 'DESC' },
            })
          : Promise.resolve([]),
      ]);

    const examMap = new Map<
      number,
      {
        courseId: number;
        courseTitle: string;
        courseSlug: string;
        attempts: number;
        bestPercentage: number;
        latestPercentage: number;
        passed: boolean;
      }
    >();

    for (const attempt of examAttempts) {
      const existing = examMap.get(attempt.course.id);
      const percentage = Number(attempt.percentage || 0);

      if (!existing) {
        examMap.set(attempt.course.id, {
          courseId: attempt.course.id,
          courseTitle: attempt.course.title,
          courseSlug: attempt.course.slug,
          attempts: 1,
          bestPercentage: percentage,
          latestPercentage: percentage,
          passed: attempt.passed,
        });
        continue;
      }

      existing.attempts += 1;
      existing.bestPercentage = Math.max(existing.bestPercentage, percentage);
      existing.passed = existing.passed || attempt.passed;
    }

    const enrolledCoursesWithStats = await this.attachCourseReviewStats(
      enrollments.map((enrollment) => enrollment.course),
    );
    const enrolledCourseStatsMap = new Map(
      enrolledCoursesWithStats.map((course) => [course.id, course]),
    );

    return {
      user: mappedUser,
      stats,
      weeklyProgress,
      courses: enrollments.map((enrollment) => {
        const courseWithStats =
          enrolledCourseStatsMap.get(enrollment.course.id) || enrollment.course;

        return this.mediaFileMappingService.mapCourse({
          ...courseWithStats,
          isEnrolled: true,
          progress: {
            isCompleted: enrollment.progress >= 100,
            progress: Math.round(enrollment.progress || 0),
            lastTime: 0,
          },
        } as any);
      }),
      certificates: certificates.map((certificate) => ({
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        issuedAt: certificate.issuedAt,
        course: {
          id: certificate.course.id,
          title: certificate.course.title,
          slug: certificate.course.slug,
        },
      })),
      examHistory: Array.from(examMap.values()),
    };
  }

  public async create(
    createUserDto: CreateUserDto,
    currentUser?: ActiveUserData,
    options?: CreateUserOptions,
  ): Promise<User> {
    return await this.createUserprovider.create(
      createUserDto,
      currentUser,
      options,
    );
  }

  public async createMany(
    createBulkUsersDto: CreateBulkUsersDto,
  ): Promise<User[]> {
    return await this.createBulkUsersProvider.createMany(createBulkUsersDto);
  }

  public async update(id: number, patchUserDto: PatchUserDto): Promise<User> {
    return await this.updateUserProvider.update(id, patchUserDto);
  }

  async updateUserByAdmin(
    userId: number,
    adminUpdateUserDto: AdminUpdateUserDto,
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, adminUpdateUserDto);

    return this.userRepository.save(user);
  }

  async updateUserProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new NotFoundException('User not found');
    const profile = await this.profilesService.updateProfile(
      userId,
      updateProfileDto,
    );

    return profile;
  }

  async updateFacultyProfile(
    userId: number,
    updateFacultyProfileDto: UpdateFacultyProfileDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) throw new NotFoundException('User not found');
    const isFaculty = user.roles.some((r) => r.name === 'faculty');

    if (!isFaculty) {
      throw new BadRequestException('User is not a faculty');
    }
    const profile = await this.profilesService.updateFacultyProfile(
      userId,
      updateFacultyProfileDto,
    );

    return profile;
  }

  public async delete(id: number): Promise<DeleteRecord> {
    return await this.deleteUserProvider.delete(id);
  }

  public async softDelete(id: number): Promise<DeleteRecord> {
    return await this.deleteUserProvider.softDelete(id);
  }

  public async deleteMany(
    deleteBulkUsersDto: DeleteBulkUsersDto,
  ): Promise<DeleteRecord> {
    return await this.deleteUserProvider.deleteMany(deleteBulkUsersDto);
  }

  public async restore(id: number): Promise<User> {
    return await this.restoreUserProvider.restore(id);
  }

  async markEmailVerified(userId: number): Promise<User> {
    return await this.markEmailVerifiedProvider.markEmailVerified(userId);
  }
  async updatePassword(
    userId: number,
    password: string,
    confirmPassword: string,
  ): Promise<User> {
    return await this.updatePasswordProvider.updatePassword(
      userId,
      password,
      confirmPassword,
    );
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    return await this.changePasswordProvider.changePassword(
      userId,
      changePasswordDto,
    );
  }

  async getDashboardStats(userId: number) {
    return await this.getDashboardStatsProvider.getDashboardStats(userId);
  }

  async getWeeklyProgress(userId: number): Promise<WeeklyProgress[]> {
    return this.getDashboardStatsProvider.getWeeklyProgress(userId);
  }

  async getAllFaculty() {
    const faculties = await this.userRepository.find({
      relations: ['roles', 'facultyProfile', 'profile', 'avatar'],
      where: {
        roles: {
          name: 'faculty',
        },
      },
    });

    const mapped = this.mediaFileMappingService.mapUsers(faculties);

    return mapped;
  }
  async getFacultyPage(getUsersDto: GetUsersDto): Promise<Paginated<User>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.facultyProfile', 'facultyProfile')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .where('role.name = :roleName', { roleName: 'faculty' })
      .orderBy('user.createdAt', 'DESC');

    const result = await this.paginationProvider.paginateQueryBuilder(
      {
        limit: getUsersDto.limit ?? 8,
        page: getUsersDto.page ?? 1,
      },
      queryBuilder,
    );

    result.data = this.mediaFileMappingService.mapUsers(
      await this.attachFacultyStats(result.data),
    );

    return result;
  }
  async getFacultiesByIds(ids: number[]) {
    const users = await this.userRepository.find({
      where: { id: In(ids) },
      relations: ['roles'],
    });

    return users.filter((u) => u.roles.some((r) => r.name === 'faculty'));
  }
}
