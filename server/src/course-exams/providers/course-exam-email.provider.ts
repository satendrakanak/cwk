import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Course } from 'src/courses/course.entity';
import { EmailTemplatesService } from 'src/email-templates/providers/email-templates.service';
import { MailService } from 'src/mail/providers/mail.service';
import { parseTemplate } from 'src/mail/utils/template-parser';
import { User } from 'src/users/user.entity';
import { CourseExamAttempt } from '../course-exam-attempt.entity';

@Injectable()
export class CourseExamEmailProvider {
  private readonly logger = new Logger(CourseExamEmailProvider.name);

  constructor(
    private readonly mailService: MailService,
    private readonly emailTemplatesService: EmailTemplatesService,
    private readonly configService: ConfigService,
  ) {}

  async sendAttemptsExtended(user: User, course: Course, extraAttempts: number) {
    if (!user.email) {
      return;
    }

    const template =
      await this.emailTemplatesService.getByName('exam_attempts_extended');
    const variables = {
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
      courseTitle: course.title,
      extraAttempts: String(extraAttempts),
      examLink: `${this.getFrontendUrl()}/course/${course.slug}/exams`,
      year: new Date().getFullYear().toString(),
    };

    await this.mailService.sendMail({
      to: user.email,
      subject: parseTemplate(template.subject, variables),
      html: parseTemplate(template.body, variables),
    });
  }

  async sendLegacyAttemptSubmitted(attempt: CourseExamAttempt) {
    const user = attempt.user;
    const course = attempt.course;

    if (!user?.email || !course) {
      return;
    }

    const templateName = attempt.passed
      ? 'course_exam_passed'
      : 'course_exam_failed';
    const template = await this.emailTemplatesService.getByName(templateName);
    const variables = {
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
      courseTitle: course.title,
      percentage: String(Math.round(Number(attempt.percentage || 0))),
      examLink: `${this.getFrontendUrl()}/course/${course.slug}/exams`,
      year: new Date().getFullYear().toString(),
    };

    await this.mailService.sendMail({
      to: user.email,
      subject: parseTemplate(template.subject, variables),
      html: parseTemplate(template.body, variables),
    });
  }

  sendLegacyAttemptSubmittedSafely(attempt: CourseExamAttempt) {
    void this.sendLegacyAttemptSubmitted(attempt).catch((error) =>
      this.logger.error(
        `Failed to queue course exam email for attempt ${attempt.id}`,
        error,
      ),
    );
  }

  sendAttemptsExtendedSafely(
    user: User,
    course: Course,
    extraAttempts: number,
  ) {
    void this.sendAttemptsExtended(user, course, extraAttempts).catch((error) =>
      this.logger.error(
        `Failed to queue attempt override email for user ${user.id}`,
        error,
      ),
    );
  }

  private getFrontendUrl() {
    return (
      this.configService.get<string>('appConfig.fronEndUrl') ||
      this.configService.get<string>('appConfig.appUrl') ||
      ''
    ).replace(/\/$/, '');
  }
}
