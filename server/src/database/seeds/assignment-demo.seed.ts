import { AssignmentSubmission } from 'src/assignments/assignment-submission.entity';
import { Assignment } from 'src/assignments/assignment.entity';
import { AssignmentStatus } from 'src/assignments/enums/assignment-status.enum';
import { AssignmentSubmissionStatus } from 'src/assignments/enums/assignment-submission-status.enum';
import { AssignmentSubmissionType } from 'src/assignments/enums/assignment-submission-type.enum';
import { Course } from 'src/courses/course.entity';
import { CourseBatch } from 'src/faculty-workspace/course-batch.entity';
import { User } from 'src/users/user.entity';
import { DataSource } from 'typeorm';

const dayOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(18, 0, 0, 0);
  return date;
};

const assignmentTemplates = [
  {
    title: 'Foundation practice brief',
    description:
      'A compact practice task to validate the learner can apply the first course concepts.',
    instructions:
      'Write a short implementation note. Include what you built, what you found confusing, and one screenshot/link if available.',
    submissionType: AssignmentSubmissionType.Mixed,
    dueInDays: 5,
    points: 50,
  },
  {
    title: 'Capstone project checkpoint',
    description:
      'A deeper project checkpoint for faculty or admin review before final certification work.',
    instructions:
      'Submit your project link and explain the choices you made. Mention the parts where you want reviewer feedback.',
    submissionType: AssignmentSubmissionType.Link,
    dueInDays: 10,
    points: 100,
  },
  {
    title: 'Reflection and improvement plan',
    description:
      'A text-based reflection assignment for learners to turn feedback into next actions.',
    instructions:
      'Write 5-7 bullet points covering what you learned, what needs revision, and your next practice plan.',
    submissionType: AssignmentSubmissionType.Text,
    dueInDays: 14,
    points: 30,
  },
];

export async function seedAssignmentDemo(dataSource: DataSource) {
  const assignmentRepository = dataSource.getRepository(Assignment);
  const submissionRepository = dataSource.getRepository(AssignmentSubmission);
  const courseRepository = dataSource.getRepository(Course);
  const batchRepository = dataSource.getRepository(CourseBatch);
  const userRepository = dataSource.getRepository(User);

  const courses = await courseRepository.find({
    relations: ['chapters', 'chapters.lectures', 'faculties'],
    order: { id: 'ASC' },
    take: 4,
  });

  if (!courses.length) {
    console.log('⚠️ No courses found for assignment demo seeding');
    return;
  }

  const learnerUsers = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.roles', 'role')
    .where('role.name = :roleName', { roleName: 'student' })
    .take(4)
    .getMany();

  let createdCount = 0;
  let submissionCount = 0;

  for (const [courseIndex, course] of courses.entries()) {
    const template = assignmentTemplates[courseIndex % assignmentTemplates.length];
    const firstChapter = course.chapters?.sort((a, b) => a.position - b.position)[0];
    const firstLecture = firstChapter?.lectures?.sort(
      (a, b) => a.position - b.position,
    )[0];
    const batch = await batchRepository.findOne({
      where: { course: { id: course.id } },
      relations: ['course', 'faculty'],
    });

    let assignment = await assignmentRepository.findOne({
      where: {
        title: `${course.title}: ${template.title}`,
        course: { id: course.id },
      },
      relations: ['course', 'faculties'],
    });

    if (!assignment) {
      assignment = assignmentRepository.create({
        title: `${course.title}: ${template.title}`,
      });
      createdCount += 1;
    }

    assignment.description = template.description;
    assignment.instructions = template.instructions;
    assignment.course = course;
    assignment.chapter = firstChapter ?? null;
    assignment.lecture = firstLecture ?? null;
    assignment.batch = batch ?? null;
    assignment.faculties = course.faculties ?? (batch?.faculty ? [batch.faculty] : []);
    assignment.status = AssignmentStatus.Published;
    assignment.submissionType = template.submissionType;
    assignment.dueAt = dayOffset(template.dueInDays + courseIndex);
    assignment.points = template.points;
    assignment.allowResubmission = true;
    assignment.resourceIds = [];

    const savedAssignment = await assignmentRepository.save(assignment);
    const learner = learnerUsers[courseIndex % learnerUsers.length];
    if (!learner) continue;

    const existingSubmission = await submissionRepository.findOne({
      where: {
        assignment: { id: savedAssignment.id },
        learner: { id: learner.id },
      },
      relations: ['assignment', 'learner'],
    });

    const submission =
      existingSubmission ??
      submissionRepository.create({
        assignment: savedAssignment,
        learner,
        submittedAt: dayOffset(-1 - courseIndex),
      });

    submission.text = `Demo submission for ${savedAssignment.title}. I completed the practice task and documented the decisions I made.`;
    submission.link = 'https://example.com/demo-assignment-submission';
    submission.attachmentIds = [];
    submission.status =
      courseIndex % 2 === 0
        ? AssignmentSubmissionStatus.Graded
        : AssignmentSubmissionStatus.Submitted;
    submission.score =
      submission.status === AssignmentSubmissionStatus.Graded
        ? Math.min(template.points, template.points - 5)
        : null;
    submission.feedback =
      submission.status === AssignmentSubmissionStatus.Graded
        ? 'Good structure and clear explanation. Add one more real example in the next revision.'
        : null;
    submission.reviewedAt =
      submission.status === AssignmentSubmissionStatus.Graded ? new Date() : null;
    submission.reviewedBy =
      submission.status === AssignmentSubmissionStatus.Graded
        ? savedAssignment.faculties?.[0] ?? null
        : null;

    await submissionRepository.save(submission);
    submissionCount += existingSubmission ? 0 : 1;
  }

  console.log(
    `✅ Assignment demo seeded (${createdCount} assignment(s), ${submissionCount} submission(s))`,
  );
}
