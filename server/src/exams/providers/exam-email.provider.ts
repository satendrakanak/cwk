import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailTemplatesService } from 'src/email-templates/providers/email-templates.service';
import { MailService } from 'src/mail/providers/mail.service';
import { parseTemplate } from 'src/mail/utils/template-parser';
import { ExamAttempt } from '../exam-attempt.entity';

@Injectable()
export class ExamEmailProvider {
  private readonly logger = new Logger(ExamEmailProvider.name);

  constructor(
    private readonly mailService: MailService,
    private readonly emailTemplatesService: EmailTemplatesService,
    private readonly configService: ConfigService,
  ) {}

  async sendAttemptSubmitted(attempt: ExamAttempt) {
    const user = attempt.user;

    if (!user?.email || !attempt.course) {
      return;
    }

    const templateName = attempt.passed
      ? 'advanced_exam_passed'
      : attempt.needsManualGrading
        ? 'advanced_exam_submitted'
        : 'advanced_exam_failed';
    const template = await this.emailTemplatesService.getByName(templateName);
    const variables = {
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
      examTitle: attempt.exam.title,
      courseTitle: attempt.course.title,
      percentage: String(Math.round(Number(attempt.percentage || 0))),
      examLink: `${this.getFrontendUrl()}/course/${attempt.course.slug}/exams`,
      year: new Date().getFullYear().toString(),
    };

    await this.mailService.sendMail({
      to: user.email,
      subject: parseTemplate(template.subject, variables),
      html: parseTemplate(template.body, variables),
    });
  }

  sendAttemptSubmittedSafely(attempt: ExamAttempt) {
    void this.sendAttemptSubmitted(attempt).catch((error) =>
      this.logger.error(
        `Failed to queue exam email for attempt ${attempt.id}`,
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
