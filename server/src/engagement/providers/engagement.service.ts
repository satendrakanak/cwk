import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';
import { EmailTemplatesService } from 'src/email-templates/providers/email-templates.service';
import { Enrollment } from 'src/enrollments/enrollment.entity';
import { MailService } from 'src/mail/providers/mail.service';
import { parseTemplate } from 'src/mail/utils/template-parser';
import { NotificationChannel } from 'src/notifications/enums/notification-channel.enum';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';
import { Notification } from 'src/notifications/notification.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { User } from 'src/users/user.entity';
import { In, Repository } from 'typeorm';
import { AutomationJob } from '../automation-job.entity';
import { AutomationRunLog } from '../automation-run-log.entity';
import { CreateAutomationJobDto } from '../dtos/create-automation-job.dto';
import { CreateNotificationBroadcastDto } from '../dtos/create-notification-broadcast.dto';
import { UpdateAutomationJobDto } from '../dtos/update-automation-job.dto';
import { UpdateNotificationBroadcastDto } from '../dtos/update-notification-broadcast.dto';
import { UpsertNotificationRuleDto } from '../dtos/upsert-notification-rule.dto';
import { NotificationBroadcast } from '../notification-broadcast.entity';
import { NotificationRule } from '../notification-rule.entity';
import { AutomationJobStatus } from '../enums/automation-job-status.enum';
import { AutomationRunStatus } from '../enums/automation-run-status.enum';
import { AutomationTriggerType } from '../enums/automation-trigger-type.enum';
import { BroadcastStatus } from '../enums/broadcast-status.enum';
import { EngagementAudience } from '../enums/engagement-audience.enum';

const DEFAULT_RULES: UpsertNotificationRuleDto[] = [
  {
    eventKey: 'course.created',
    label: 'New course published',
    description: 'Send a notification when a new course is available.',
    isEnabled: false,
    audience: EngagementAudience.AllUsers,
    channels: [NotificationChannel.InApp, NotificationChannel.Push],
    type: NotificationType.Course,
    titleTemplate: 'New course is available',
    messageTemplate: '{{courseTitle}} has been added to the academy.',
    hrefTemplate: '/courses/{{courseSlug}}',
  },
  {
    eventKey: 'class.scheduled',
    label: 'Live class scheduled',
    description: 'Notify enrolled students when a live class is scheduled.',
    isEnabled: true,
    audience: EngagementAudience.CourseEnrolled,
    channels: [NotificationChannel.InApp, NotificationChannel.Push],
    type: NotificationType.Class,
    titleTemplate: 'Live class scheduled',
    messageTemplate: '{{classTitle}} is scheduled for {{startsAt}}.',
    hrefTemplate: '/profile/classes',
  },
  {
    eventKey: 'exam.passed',
    label: 'Exam passed',
    description: 'Congratulate learners when they clear an exam.',
    isEnabled: true,
    audience: EngagementAudience.SelectedUsers,
    channels: [NotificationChannel.InApp, NotificationChannel.Push],
    type: NotificationType.Exam,
    titleTemplate: 'Exam cleared',
    messageTemplate: 'Congratulations, you passed {{examTitle}}.',
    hrefTemplate: '/profile/exams',
  },
];

@Injectable()
export class EngagementService implements OnModuleInit {
  private readonly logger = new Logger(EngagementService.name);

  constructor(
    @InjectRepository(NotificationRule)
    private readonly ruleRepository: Repository<NotificationRule>,

    @InjectRepository(NotificationBroadcast)
    private readonly broadcastRepository: Repository<NotificationBroadcast>,

    @InjectRepository(AutomationJob)
    private readonly jobRepository: Repository<AutomationJob>,

    @InjectRepository(AutomationRunLog)
    private readonly runLogRepository: Repository<AutomationRunLog>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    private readonly notificationsService: NotificationsService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly mailService: MailService,
    private readonly emailTemplatesService: EmailTemplatesService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultRules();
    await this.reloadActiveJobs();
  }

  async getDashboard() {
    const [jobs, rules, broadcasts] = await Promise.all([
      this.jobRepository.find({
        order: { updatedAt: 'DESC' },
        relations: ['createdBy'],
      }),
      this.ruleRepository.find({
        order: { eventKey: 'ASC' },
        relations: ['createdBy'],
      }),
      this.broadcastRepository.find({
        order: { createdAt: 'DESC' },
        relations: ['createdBy'],
        take: 50,
      }),
    ]);

    const broadcastsWithStats = await this.attachBroadcastStats(broadcasts);

    return {
      summary: {
        activeSchedulers: jobs.filter(
          (job) => job.status === AutomationJobStatus.Active,
        ).length,
        enabledRules: rules.filter((rule) => rule.isEnabled).length,
        broadcastsSent: broadcasts.filter(
          (broadcast) => broadcast.status === BroadcastStatus.Sent,
        ).length,
        scheduledBroadcasts: broadcasts.filter(
          (broadcast) => broadcast.status === BroadcastStatus.Scheduled,
        ).length,
      },
      jobs,
      rules,
      broadcasts: broadcastsWithStats,
    };
  }

  findJobs() {
    return this.jobRepository.find({
      order: { updatedAt: 'DESC' },
      relations: ['createdBy'],
    });
  }

  async createJob(dto: CreateAutomationJobDto, actorId?: number) {
    const job = this.jobRepository.create({
      ...dto,
      slug: await this.makeUniqueSlug(dto.slug || dto.name),
      status: dto.status ?? AutomationJobStatus.Paused,
      triggerType: dto.triggerType ?? AutomationTriggerType.Cron,
      timezone: dto.timezone || 'Asia/Kolkata',
      actionType: dto.actionType || 'notification_broadcast',
      createdBy: actorId ? ({ id: actorId } as User) : null,
    });

    this.assertJobConfig(job);
    const saved = await this.jobRepository.save(job);
    await this.registerJob(saved);
    return saved;
  }

  async updateJob(id: number, dto: UpdateAutomationJobDto) {
    const job = await this.getJob(id);
    Object.assign(job, dto);
    this.assertJobConfig(job);
    const saved = await this.jobRepository.save(job);
    await this.unregisterJob(saved.id);
    await this.registerJob(saved);
    return saved;
  }

  async deleteJob(id: number) {
    await this.getJob(id);
    await this.unregisterJob(id);
    await this.jobRepository.delete(id);
    return { message: 'Scheduler deleted' };
  }

  async runJobNow(id: number) {
    const job = await this.getJob(id);
    return this.executeJob(job);
  }

  findRules() {
    return this.ruleRepository.find({
      order: { eventKey: 'ASC' },
      relations: ['createdBy'],
    });
  }

  async upsertRule(dto: UpsertNotificationRuleDto, actorId?: number) {
    const existing = await this.ruleRepository.findOne({
      where: { eventKey: dto.eventKey },
    });

    const rule = existing ?? this.ruleRepository.create({ eventKey: dto.eventKey });
    Object.assign(rule, {
      ...dto,
      channels: dto.channels?.length
        ? dto.channels
        : [NotificationChannel.InApp, NotificationChannel.Push],
      type: dto.type ?? NotificationType.Info,
      createdBy: actorId ? ({ id: actorId } as User) : rule.createdBy,
    });

    return this.ruleRepository.save(rule);
  }

  async updateRule(id: number, dto: Partial<UpsertNotificationRuleDto>) {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('Notification rule not found');
    Object.assign(rule, dto);
    return this.ruleRepository.save(rule);
  }

  async deleteRule(id: number) {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('Notification rule not found');
    await this.ruleRepository.delete(id);
    return { message: 'Notification rule deleted' };
  }

  async findBroadcasts() {
    const broadcasts = await this.broadcastRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return this.attachBroadcastStats(broadcasts);
  }

  async createBroadcast(
    dto: CreateNotificationBroadcastDto,
    actorId?: number,
  ) {
    const filters = this.buildAudienceFilters(dto);
    const broadcast = this.broadcastRepository.create({
      title: dto.title,
      message: dto.message,
      href: dto.href ?? null,
      imageUrl: dto.imageUrl ?? null,
      type: dto.type ?? NotificationType.Info,
      audience: dto.audience,
      channels: dto.channels?.length
        ? dto.channels
        : [NotificationChannel.InApp, NotificationChannel.Push],
      audienceFilters: filters,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      status: dto.sendNow
        ? BroadcastStatus.Draft
        : dto.scheduledAt
          ? BroadcastStatus.Scheduled
          : BroadcastStatus.Draft,
      createdBy: actorId ? ({ id: actorId } as User) : null,
    });

    const saved = await this.broadcastRepository.save(broadcast);
    return dto.sendNow ? this.sendBroadcast(saved.id) : saved;
  }

  async updateBroadcast(id: number, dto: UpdateNotificationBroadcastDto) {
    const broadcast = await this.getBroadcast(id);
    if (broadcast.status === BroadcastStatus.Sent) {
      throw new BadRequestException('Sent broadcasts cannot be edited');
    }

    if (dto.title !== undefined) broadcast.title = dto.title;
    if (dto.message !== undefined) broadcast.message = dto.message;
    if (dto.href !== undefined) broadcast.href = dto.href ?? null;
    if (dto.imageUrl !== undefined) broadcast.imageUrl = dto.imageUrl ?? null;
    if (dto.type !== undefined) broadcast.type = dto.type;
    if (dto.audience !== undefined) broadcast.audience = dto.audience;
    if (dto.channels !== undefined) broadcast.channels = dto.channels;
    if (dto.scheduledAt !== undefined) {
      broadcast.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    }
    Object.assign(broadcast, {
      audienceFilters:
        dto.audience || dto.selectedUserIds || dto.audienceFilters
          ? this.buildAudienceFilters({
              audience: dto.audience ?? broadcast.audience,
              audienceFilters: dto.audienceFilters ?? broadcast.audienceFilters,
              selectedUserIds: dto.selectedUserIds,
            })
          : broadcast.audienceFilters,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : broadcast.scheduledAt,
    });

    return this.broadcastRepository.save(broadcast);
  }

  async sendBroadcast(id: number) {
    const broadcast = await this.getBroadcast(id);
    const recipients = await this.resolveAudience(
      broadcast.audience,
      broadcast.audienceFilters,
    );

    if (!recipients.length) {
      broadcast.status = BroadcastStatus.Failed;
      broadcast.failureReason = 'No recipients matched this audience';
      broadcast.recipientCount = 0;
      await this.broadcastRepository.save(broadcast);
      throw new BadRequestException(broadcast.failureReason);
    }

    const shouldCreateNotification =
      broadcast.channels.includes(NotificationChannel.InApp) ||
      broadcast.channels.includes(NotificationChannel.Push);
    const shouldSendEmail = broadcast.channels.includes(NotificationChannel.Email);

    let deliveredCount = 0;
    let failureCount = 0;

    if (shouldCreateNotification) {
      await this.notificationsService.createMany(
        recipients.map((recipient) => ({
          recipientId: recipient.id,
          actorId: broadcast.createdBy?.id ?? null,
          title: broadcast.title,
          message: broadcast.message,
          href: broadcast.href,
          imageUrl: broadcast.imageUrl,
          type: broadcast.type,
          channel: broadcast.channels.includes(NotificationChannel.Push)
            ? NotificationChannel.Push
            : NotificationChannel.InApp,
          skipPush: !broadcast.channels.includes(NotificationChannel.Push),
          metadata: {
            broadcastId: broadcast.id,
            channels: broadcast.channels,
            imageUrl: broadcast.imageUrl,
          },
        })),
      );
      deliveredCount = recipients.length;
    }

    if (shouldSendEmail) {
      const emailResults = await Promise.allSettled(
        recipients.map((recipient) => this.sendBroadcastEmail(broadcast, recipient)),
      );
      const queuedEmails = emailResults.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const failedEmails = emailResults.length - queuedEmails;
      deliveredCount = Math.max(deliveredCount, queuedEmails);
      failureCount = Math.max(failureCount, failedEmails);
    }

    broadcast.status = BroadcastStatus.Sent;
    broadcast.sentAt = new Date();
    broadcast.recipientCount = recipients.length;
    broadcast.deliveredCount = deliveredCount;
    broadcast.failureReason = failureCount
      ? `${failureCount} recipient(s) could not be queued`
      : null;
    const saved = await this.broadcastRepository.save(broadcast);
    return this.attachSingleBroadcastStats(saved);
  }

  async duplicateBroadcast(id: number) {
    const broadcast = await this.getBroadcast(id);
    return this.broadcastRepository.save(
      this.broadcastRepository.create({
        title: `${broadcast.title} Copy`,
        message: broadcast.message,
        href: broadcast.href,
        imageUrl: broadcast.imageUrl,
        type: broadcast.type,
        audience: broadcast.audience,
        channels: broadcast.channels,
        audienceFilters: broadcast.audienceFilters,
        status: BroadcastStatus.Draft,
        createdBy: broadcast.createdBy ?? null,
      }),
    );
  }

  async deleteBroadcast(id: number) {
    await this.getBroadcast(id);
    await this.broadcastRepository.delete(id);
    return { message: 'Broadcast deleted' };
  }

  async getBroadcastStats(id: number) {
    const broadcast = await this.getBroadcast(id);
    return this.getStatsForBroadcast(broadcast);
  }

  async dispatchEvent(
    eventKey: string,
    context: Record<string, unknown> = {},
  ) {
    const rules = await this.ruleRepository.find({
      where: { eventKey, isEnabled: true },
    });

    const results: NotificationBroadcast[] = [];
    for (const rule of rules) {
      const broadcast = await this.broadcastRepository.save(
        this.broadcastRepository.create({
          title: this.renderTemplate(rule.titleTemplate, context),
          message: this.renderTemplate(rule.messageTemplate, context),
          href: rule.hrefTemplate
            ? this.renderTemplate(rule.hrefTemplate, context)
            : null,
          imageUrl: rule.imageUrl ?? null,
          type: rule.type,
          audience: rule.audience,
          channels: rule.channels,
          audienceFilters: {
            ...(rule.filters ?? {}),
            selectedUserIds: this.getNumberArray(context.selectedUserIds),
            courseId: this.getNumber(context.courseId),
          },
          status: BroadcastStatus.Draft,
        }),
      );
      results.push(await this.sendBroadcast(broadcast.id));
    }

    return results;
  }

  private async getJob(id: number) {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Scheduler not found');
    return job;
  }

  private async getBroadcast(id: number) {
    const broadcast = await this.broadcastRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!broadcast) throw new NotFoundException('Broadcast not found');
    return broadcast;
  }

  private async attachBroadcastStats(broadcasts: NotificationBroadcast[]) {
    return Promise.all(
      broadcasts.map((broadcast) => this.attachSingleBroadcastStats(broadcast)),
    );
  }

  private async attachSingleBroadcastStats(broadcast: NotificationBroadcast) {
    const stats = await this.getStatsForBroadcast(broadcast);
    return { ...broadcast, stats };
  }

  private async getStatsForBroadcast(broadcast: NotificationBroadcast) {
    const baseQuery = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.metadata LIKE :broadcastIdNeedle', {
        broadcastIdNeedle: `%"broadcastId":${broadcast.id}%`,
      });

    const [created, read, clicked] = await Promise.all([
      baseQuery.clone().getCount(),
      baseQuery.clone().andWhere('notification.readAt IS NOT NULL').getCount(),
      baseQuery.clone().andWhere('notification.clickedAt IS NOT NULL').getCount(),
    ]);

    const recipients = Math.max(broadcast.recipientCount, created);
    const delivered = Math.max(broadcast.deliveredCount, created);
    const failed = Math.max(0, recipients - delivered);

    return {
      totalRecipients: recipients,
      notificationsCreated: created,
      delivered,
      failed,
      read,
      clicked,
      readRate: recipients ? Math.round((read / recipients) * 100) : 0,
      clickRate: recipients ? Math.round((clicked / recipients) * 100) : 0,
    };
  }

  private async sendBroadcastEmail(
    broadcast: NotificationBroadcast,
    recipient: User,
  ) {
    const name = this.getUserDisplayName(recipient);
    const actionUrl = this.getAbsoluteUrl(broadcast.href || '/notifications');
    const variables = {
      name,
      title: broadcast.title,
      message: broadcast.message,
      actionUrl,
      imageUrl: broadcast.imageUrl || '',
      imageHtml: broadcast.imageUrl
        ? `<img src="${broadcast.imageUrl}" alt="" style="max-width:100%;border-radius:14px;margin:0 0 16px" />`
        : '',
      year: new Date().getFullYear().toString(),
    };

    const template = await this.getBroadcastEmailTemplate();

    await this.mailService.sendMail({
      to: recipient.email,
      subject: parseTemplate(template.subject, variables),
      html: parseTemplate(template.body, variables),
    });
  }

  private async getBroadcastEmailTemplate() {
    try {
      return await this.emailTemplatesService.getByName(
        'notification_broadcast',
      );
    } catch {
      return {
        subject: '{{title}}',
        body: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
            <p>Hi {{name}},</p>
            {{imageHtml}}
            <h2 style="margin:0 0 12px">{{title}}</h2>
            <p>{{message}}</p>
            <p><a href="{{actionUrl}}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none">Open update</a></p>
          </div>
        `,
      };
    }
  }

  private getAbsoluteUrl(path: string) {
    const baseUrl = (
      this.configService.get<string>('appConfig.fronEndUrl') ||
      this.configService.get<string>('appConfig.appUrl') ||
      ''
    ).replace(/\/$/, '');

    if (/^https?:\/\//i.test(path)) return path;
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private getUserDisplayName(user: User) {
    return (
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.email
    );
  }

  private async resolveAudience(
    audience: EngagementAudience,
    filters?: Record<string, unknown> | null,
  ) {
    if (audience === EngagementAudience.AllUsers) {
      return this.userRepository.find({ order: { createdAt: 'DESC' } });
    }

    if (audience === EngagementAudience.SelectedUsers) {
      const ids = this.getNumberArray(filters?.selectedUserIds);
      return ids.length ? this.userRepository.findBy({ id: In(ids) }) : [];
    }

    if (audience === EngagementAudience.EnrolledUsers) {
      const enrollments = await this.enrollmentRepository.find({
        where: { isActive: true },
        relations: ['user'],
      });
      return this.uniqueUsers(enrollments.map((enrollment) => enrollment.user));
    }

    if (audience === EngagementAudience.CourseEnrolled) {
      const courseId = this.getNumber(filters?.courseId);
      if (!courseId) return [];
      const enrollments = await this.enrollmentRepository.find({
        where: { isActive: true, course: { id: courseId } },
        relations: ['user', 'course'],
      });
      return this.uniqueUsers(enrollments.map((enrollment) => enrollment.user));
    }

    if (audience === EngagementAudience.Role) {
      const roleNames = this.getStringArray(filters?.roles);
      if (!roleNames.length) return [];
      return this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.roles', 'role')
        .where('role.name IN (:...roleNames)', { roleNames })
        .getMany();
    }

    return [];
  }

  private buildAudienceFilters(dto: {
    audience: EngagementAudience;
    audienceFilters?: Record<string, unknown> | null;
    selectedUserIds?: number[];
  }) {
    return {
      ...(dto.audienceFilters ?? {}),
      selectedUserIds:
        dto.audience === EngagementAudience.SelectedUsers
          ? dto.selectedUserIds ?? this.getNumberArray(dto.audienceFilters?.selectedUserIds)
          : this.getNumberArray(dto.audienceFilters?.selectedUserIds),
    };
  }

  private uniqueUsers(users: User[]) {
    const map = new Map<number, User>();
    users.forEach((user) => {
      if (user?.id) map.set(user.id, user);
    });
    return [...map.values()];
  }

  private async ensureDefaultRules() {
    for (const rule of DEFAULT_RULES) {
      const exists = await this.ruleRepository.findOne({
        where: { eventKey: rule.eventKey },
      });
      if (!exists) {
        await this.upsertRule(rule);
      }
    }
  }

  private async reloadActiveJobs() {
    const jobs = await this.jobRepository.find({
      where: { status: AutomationJobStatus.Active },
    });
    for (const job of jobs) {
      await this.registerJob(job);
    }
  }

  private async registerJob(job: AutomationJob) {
    if (
      job.status !== AutomationJobStatus.Active ||
      job.triggerType !== AutomationTriggerType.Cron
    ) {
      return;
    }

    if (!job.cronExpression) return;

    try {
      const cronJob = new CronJob(
        job.cronExpression,
        () => void this.executeJob(job),
        null,
        false,
        job.timezone || 'Asia/Kolkata',
      );
      this.schedulerRegistry.addCronJob(this.getSchedulerName(job.id), cronJob);
      cronJob.start();
    } catch (error) {
      this.logger.warn(
        `Could not register scheduler ${job.id}: ${this.getErrorMessage(error)}`,
      );
    }
  }

  private async unregisterJob(id: number) {
    const name = this.getSchedulerName(id);
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      job.stop();
      this.schedulerRegistry.deleteCronJob(name);
    } catch {
      return;
    }
  }

  private async executeJob(job: AutomationJob) {
    const startedAt = new Date();
    try {
      const result = await this.executeJobAction(job);
      job.lastRunAt = new Date();
      job.runCount += 1;
      await this.jobRepository.save(job);
      return this.runLogRepository.save(
        this.runLogRepository.create({
          job,
          status: AutomationRunStatus.Success,
          startedAt,
          finishedAt: new Date(),
          summary: result,
        }),
      );
    } catch (error) {
      job.lastRunAt = new Date();
      job.failureCount += 1;
      await this.jobRepository.save(job);
      return this.runLogRepository.save(
        this.runLogRepository.create({
          job,
          status: AutomationRunStatus.Failed,
          startedAt,
          finishedAt: new Date(),
          error: this.getErrorMessage(error),
        }),
      );
    }
  }

  private async executeJobAction(job: AutomationJob) {
    if (job.actionType !== 'notification_broadcast') {
      throw new BadRequestException(`Unsupported action: ${job.actionType}`);
    }

    const broadcastId = this.getNumber(job.actionPayload?.broadcastId);
    if (broadcastId) {
      await this.sendBroadcast(broadcastId);
      return `Broadcast ${broadcastId} sent`;
    }

    const payload = job.actionPayload ?? {};
    const title = String(payload.title ?? '').trim();
    const message = String(payload.message ?? '').trim();
    if (!title || !message) {
      throw new BadRequestException('Scheduler action needs title and message');
    }

    const created = await this.createBroadcast({
      title,
      message,
      href: typeof payload.href === 'string' ? payload.href : null,
      imageUrl: typeof payload.imageUrl === 'string' ? payload.imageUrl : null,
      audience:
        typeof payload.audience === 'string'
          ? (payload.audience as EngagementAudience)
          : EngagementAudience.AllUsers,
      audienceFilters:
        typeof payload.audienceFilters === 'object' && payload.audienceFilters
          ? (payload.audienceFilters as Record<string, unknown>)
          : null,
      channels: [NotificationChannel.InApp, NotificationChannel.Push],
      type: NotificationType.System,
      sendNow: true,
    });

    return `Broadcast ${created.id} sent`;
  }

  private assertJobConfig(job: AutomationJob) {
    if (job.triggerType === AutomationTriggerType.Cron && !job.cronExpression) {
      throw new BadRequestException('Cron schedulers need a cron expression');
    }

    if (job.triggerType === AutomationTriggerType.Event && !job.eventKey) {
      throw new BadRequestException('Event schedulers need an event key');
    }
  }

  private renderTemplate(template: string, context: Record<string, unknown>) {
    return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key) =>
      String(context[key] ?? ''),
    );
  }

  private async makeUniqueSlug(value: string) {
    const base =
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `scheduler-${Date.now()}`;
    let slug = base;
    let index = 2;
    while (await this.jobRepository.findOne({ where: { slug } })) {
      slug = `${base}-${index}`;
      index += 1;
    }
    return slug;
  }

  private getSchedulerName(id: number) {
    return `dynamic-engagement-${id}`;
  }

  private getNumber(value: unknown) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
  }

  private getNumberArray(value: unknown) {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item) && item > 0);
  }

  private getStringArray(value: unknown) {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return String(error);
  }
}
