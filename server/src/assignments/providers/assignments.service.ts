import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from 'src/chapters/chapter.entity';
import { Course } from 'src/courses/course.entity';
import { Enrollment } from 'src/enrollments/enrollment.entity';
import { CourseBatch } from 'src/faculty-workspace/course-batch.entity';
import { Lecture } from 'src/lectures/lecture.entity';
import { User } from 'src/users/user.entity';
import { In, Repository } from 'typeorm';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { AssignmentSubmission } from '../assignment-submission.entity';
import { Assignment } from '../assignment.entity';
import { CreateAssignmentDto } from '../dtos/create-assignment.dto';
import { GetAssignmentsDto } from '../dtos/get-assignments.dto';
import { ReviewAssignmentSubmissionDto } from '../dtos/review-assignment-submission.dto';
import { SubmitAssignmentDto } from '../dtos/submit-assignment.dto';
import { UpdateAssignmentDto } from '../dtos/update-assignment.dto';
import { AssignmentStatus } from '../enums/assignment-status.enum';
import { AssignmentSubmissionStatus } from '../enums/assignment-submission-status.enum';
import { AssignmentSubmissionType } from '../enums/assignment-submission-type.enum';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(AssignmentSubmission)
    private readonly submissionRepository: Repository<AssignmentSubmission>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,
    @InjectRepository(CourseBatch)
    private readonly batchRepository: Repository<CourseBatch>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async findAll(query: GetAssignmentsDto, user: ActiveUserData) {
    const builder = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.course', 'course')
      .leftJoinAndSelect('assignment.chapter', 'chapter')
      .leftJoinAndSelect('assignment.lecture', 'lecture')
      .leftJoinAndSelect('assignment.batch', 'batch')
      .leftJoinAndSelect('assignment.faculties', 'faculty')
      .leftJoin('course.faculties', 'courseFaculty')
      .leftJoinAndSelect('assignment.submissions', 'submission')
      .leftJoinAndSelect('submission.learner', 'learner')
      .orderBy('assignment.createdAt', 'DESC');

    if (query.search) {
      builder.andWhere(
        '(assignment.title ILIKE :search OR assignment.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      builder.andWhere('assignment.status = :status', { status: query.status });
    }

    if (query.courseId) {
      builder.andWhere('course.id = :courseId', { courseId: query.courseId });
    }

    if (query.facultyId) {
      builder.andWhere('faculty.id = :facultyId', { facultyId: query.facultyId });
    }

    if (!this.isAdmin(user)) {
      builder.andWhere('(faculty.id = :userId OR courseFaculty.id = :userId)', {
        userId: user.sub,
      });
    }

    return builder.getMany();
  }

  async findLearnerAssignments(user: ActiveUserData) {
    return this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.course', 'course')
      .leftJoinAndSelect('assignment.chapter', 'chapter')
      .leftJoinAndSelect('assignment.lecture', 'lecture')
      .leftJoinAndSelect('assignment.batch', 'batch')
      .leftJoinAndSelect('assignment.submissions', 'submission', 'submission.learner.id = :userId', {
        userId: user.sub,
      })
      .innerJoin(Enrollment, 'enrollment', 'enrollment.courseId = course.id')
      .where('enrollment.userId = :userId', { userId: user.sub })
      .andWhere('enrollment.isActive = :isActive', { isActive: true })
      .andWhere('assignment.status = :status', {
        status: AssignmentStatus.Published,
      })
      .orderBy('assignment.dueAt', 'ASC', 'NULLS LAST')
      .addOrderBy('assignment.createdAt', 'DESC')
      .getMany();
  }

  async findById(id: number, user: ActiveUserData) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: [
        'course',
        'course.faculties',
        'chapter',
        'lecture',
        'batch',
        'faculties',
        'submissions',
        'submissions.learner',
        'submissions.reviewedBy',
      ],
    });

    if (!assignment) throw new NotFoundException('Assignment not found');
    await this.assertCanViewAssignment(assignment, user);

    return assignment;
  }

  async create(dto: CreateAssignmentDto, user: ActiveUserData) {
    const assignment = this.assignmentRepository.create();
    await this.applyAssignmentPayload(assignment, dto, user);
    assignment.createdBy = { id: user.sub } as User;
    assignment.updatedBy = { id: user.sub } as User;

    return this.assignmentRepository.save(assignment);
  }

  async update(id: number, dto: UpdateAssignmentDto, user: ActiveUserData) {
    const assignment = await this.findById(id, user);
    await this.assertCanManageAssignment(assignment, user);
    await this.applyAssignmentPayload(assignment, dto, user);
    assignment.updatedBy = { id: user.sub } as User;

    return this.assignmentRepository.save(assignment);
  }

  async delete(id: number, user: ActiveUserData) {
    const assignment = await this.findById(id, user);
    await this.assertCanManageAssignment(assignment, user);
    await this.assignmentRepository.softRemove(assignment);

    return { message: 'Assignment deleted successfully' };
  }

  async submit(id: number, dto: SubmitAssignmentDto, user: ActiveUserData) {
    const assignment = await this.findById(id, user);
    if (assignment.status !== AssignmentStatus.Published) {
      throw new ForbiddenException('Assignment is not open for submissions');
    }

    await this.assertLearnerCanAccessAssignment(assignment, user.sub);
    this.validateSubmissionPayload(assignment, dto);

    const existing = await this.submissionRepository.findOne({
      where: {
        assignment: { id: assignment.id },
        learner: { id: user.sub },
      },
      relations: ['assignment', 'learner'],
    });

    if (existing && !assignment.allowResubmission) {
      throw new BadRequestException('Resubmission is not allowed');
    }

    const submission =
      existing ??
      this.submissionRepository.create({
        assignment,
        learner: { id: user.sub } as User,
      });

    submission.text = dto.text?.trim() || null;
    submission.link = dto.link?.trim() || null;
    submission.attachmentIds = dto.attachmentIds ?? [];
    submission.status = AssignmentSubmissionStatus.Submitted;
    submission.submittedAt = new Date();
    submission.reviewedAt = null;
    submission.reviewedBy = null;

    return this.submissionRepository.save(submission);
  }

  async findSubmissions(user: ActiveUserData) {
    const builder = this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.assignment', 'assignment')
      .leftJoinAndSelect('assignment.course', 'course')
      .leftJoinAndSelect('assignment.faculties', 'faculty')
      .leftJoinAndSelect('course.faculties', 'courseFaculty')
      .leftJoinAndSelect('submission.learner', 'learner')
      .leftJoinAndSelect('submission.reviewedBy', 'reviewedBy')
      .orderBy('submission.submittedAt', 'DESC');

    if (!this.isAdmin(user)) {
      builder.where('(faculty.id = :userId OR courseFaculty.id = :userId)', {
        userId: user.sub,
      });
    }

    return builder.getMany();
  }

  async reviewSubmission(
    id: number,
    dto: ReviewAssignmentSubmissionDto,
    user: ActiveUserData,
  ) {
    const submission = await this.submissionRepository.findOne({
      where: { id },
      relations: [
        'assignment',
        'assignment.course',
        'assignment.course.faculties',
        'assignment.faculties',
        'learner',
        'reviewedBy',
      ],
    });

    if (!submission) throw new NotFoundException('Submission not found');
    await this.assertCanManageAssignment(submission.assignment, user);

    submission.status = dto.status;
    submission.score = dto.score ?? null;
    submission.feedback = dto.feedback?.trim() || null;
    submission.reviewedAt = new Date();
    submission.reviewedBy = { id: user.sub } as User;

    return this.submissionRepository.save(submission);
  }

  private async applyAssignmentPayload(
    assignment: Assignment,
    dto: CreateAssignmentDto | UpdateAssignmentDto,
    user: ActiveUserData,
  ) {
    if (dto.title !== undefined) assignment.title = dto.title.trim();
    if (dto.description !== undefined) {
      assignment.description = dto.description?.trim() || null;
    }
    if (dto.instructions !== undefined) {
      assignment.instructions = dto.instructions?.trim() || null;
    }
    if (dto.status !== undefined) assignment.status = dto.status;
    if (dto.submissionType !== undefined) {
      assignment.submissionType = dto.submissionType;
    }
    if (dto.dueAt !== undefined) {
      assignment.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
    }
    if (dto.points !== undefined) assignment.points = dto.points ?? null;
    if (dto.allowResubmission !== undefined) {
      assignment.allowResubmission = dto.allowResubmission;
    }
    if (dto.resourceIds !== undefined) assignment.resourceIds = dto.resourceIds;

    if (dto.courseId !== undefined) {
      const course = await this.courseRepository.findOne({
        where: { id: dto.courseId },
        relations: ['faculties'],
      });
      if (!course) throw new NotFoundException('Course not found');
      if (!this.isAdmin(user) && !this.isCourseFaculty(course, user.sub)) {
        throw new ForbiddenException('You cannot manage this course');
      }
      assignment.course = course;
    }

    if (dto.chapterId !== undefined) {
      assignment.chapter = dto.chapterId
        ? await this.getRequired(this.chapterRepository, dto.chapterId, 'Chapter')
        : null;
    }

    if (dto.lectureId !== undefined) {
      assignment.lecture = dto.lectureId
        ? await this.getRequired(this.lectureRepository, dto.lectureId, 'Lecture')
        : null;
    }

    if (dto.batchId !== undefined) {
      assignment.batch = dto.batchId
        ? await this.getRequired(this.batchRepository, dto.batchId, 'Batch')
        : null;
    }

    if (dto.facultyIds !== undefined) {
      const ids = this.isAdmin(user) ? dto.facultyIds : [user.sub];
      assignment.faculties = ids.length
        ? await this.userRepository.find({ where: { id: In(ids) } })
        : [];
    } else if (!assignment.id && !this.isAdmin(user)) {
      assignment.faculties = [{ id: user.sub } as User];
    }
  }

  private async getRequired<T extends { id: number }>(
    repository: Repository<T>,
    id: number,
    label: string,
  ) {
    const entity = await repository.findOne({ where: { id } as any });
    if (!entity) throw new NotFoundException(`${label} not found`);
    return entity;
  }

  private validateSubmissionPayload(
    assignment: Assignment,
    dto: SubmitAssignmentDto,
  ) {
    const hasText = Boolean(dto.text?.trim());
    const hasLink = Boolean(dto.link?.trim());
    const hasFiles = Boolean(dto.attachmentIds?.length);

    if (!hasText && !hasLink && !hasFiles) {
      throw new BadRequestException('Add text, a link, or at least one file');
    }

    if (assignment.submissionType === AssignmentSubmissionType.Text && !hasText) {
      throw new BadRequestException('This assignment requires a text answer');
    }
    if (assignment.submissionType === AssignmentSubmissionType.Link && !hasLink) {
      throw new BadRequestException('This assignment requires a link');
    }
    if (assignment.submissionType === AssignmentSubmissionType.File && !hasFiles) {
      throw new BadRequestException('This assignment requires a file upload');
    }
  }

  private async assertCanViewAssignment(
    assignment: Assignment,
    user: ActiveUserData,
  ) {
    if (this.isAdmin(user) || this.canFacultyManage(assignment, user.sub)) return;
    if (assignment.status === AssignmentStatus.Published) {
      await this.assertLearnerCanAccessAssignment(assignment, user.sub);
      return;
    }

    throw new ForbiddenException('You cannot view this assignment');
  }

  private async assertCanManageAssignment(
    assignment: Assignment,
    user: ActiveUserData,
  ) {
    if (this.isAdmin(user) || this.canFacultyManage(assignment, user.sub)) return;
    throw new ForbiddenException('You cannot manage this assignment');
  }

  private async assertLearnerCanAccessAssignment(
    assignment: Assignment,
    userId: number,
  ) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        course: { id: assignment.course.id },
        user: { id: userId },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }
  }

  private canFacultyManage(assignment: Assignment, userId: number) {
    return (
      assignment.faculties?.some((faculty) => faculty.id === userId) ||
      this.isCourseFaculty(assignment.course, userId)
    );
  }

  private isCourseFaculty(course: Course, userId: number) {
    return course.faculties?.some((faculty) => faculty.id === userId) ?? false;
  }

  private isAdmin(user?: ActiveUserData) {
    return Boolean(user?.roles?.includes('admin'));
  }
}
