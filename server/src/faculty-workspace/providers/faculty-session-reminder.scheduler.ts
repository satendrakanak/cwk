import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { Between, Repository } from 'typeorm';
import { ClassSession } from '../class-session.entity';
import { ClassSessionStatus } from '../enums/class-session-status.enum';
import { FacultySessionEmailProvider } from './faculty-session-email.provider';

@Injectable()
export class FacultySessionReminderScheduler
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(FacultySessionReminderScheduler.name);
  private readonly jobName = 'faculty-class-reminders';
  private isRunning = false;

  constructor(
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    private readonly facultySessionEmailProvider: FacultySessionEmailProvider,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onApplicationBootstrap() {
    this.start();
  }

  start() {
    if (this.schedulerRegistry.doesExist('cron', this.jobName)) {
      return;
    }

    const job = new CronJob('* * * * *', () => {
      void this.sendDueClassReminders();
    });

    this.schedulerRegistry.addCronJob(this.jobName, job);
    job.start();
    setTimeout(() => {
      this.logger.log('Faculty class reminder scheduler started');
    }, 0);
  }

  onApplicationShutdown() {
    if (!this.schedulerRegistry.doesExist('cron', this.jobName)) {
      return;
    }

    this.schedulerRegistry.deleteCronJob(this.jobName);
  }

  async sendDueClassReminders() {
    if (this.isRunning) return;

    this.isRunning = true;
    try {
      const now = new Date();
      await this.markPastSessionsCompleted(now);

      const sessions = await this.classSessionRepository.find({
        where: {
          status: ClassSessionStatus.Scheduled,
          startsAt: Between(now, this.addDays(now, 14)),
        },
        relations: [
          'batch',
          'batch.students',
          'batch.students.student',
          'course',
          'faculty',
        ],
      });

      for (const session of sessions) {
        await this.processSession(session, now);
      }
    } catch (error) {
      this.logger.error('Failed to process class reminders', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async processSession(session: ClassSession, now: Date) {
    const offsets = this.getReminderOffsets(session);
    const sentOffsets = new Set(session.sentReminderOffsetsMinutes ?? []);
    let changed = false;

    for (const offset of offsets) {
      if (sentOffsets.has(offset)) continue;

      const reminderAt = new Date(
        session.startsAt.getTime() - offset * 60 * 1000,
      );

      if (reminderAt > now) continue;

      await this.facultySessionEmailProvider.sendSessionReminder(session, offset);
      sentOffsets.add(offset);
      changed = true;
    }

    if (!changed) return;

    session.sentReminderOffsetsMinutes = [...sentOffsets].sort((a, b) => b - a);
    session.reminderSentAt = now;
    await this.classSessionRepository.save(session);
  }

  private async markPastSessionsCompleted(now: Date) {
    await this.classSessionRepository
      .createQueryBuilder()
      .update(ClassSession)
      .set({ status: ClassSessionStatus.Completed })
      .where('status = :status', { status: ClassSessionStatus.Scheduled })
      .andWhere('"endsAt" <= :now', { now })
      .execute();
  }

  private getReminderOffsets(session: ClassSession) {
    return (session.reminderOffsetsMinutes?.length
      ? session.reminderOffsetsMinutes
      : [session.reminderBeforeMinutes ?? 60]
    )
      .map(Number)
      .filter((value) => Number.isFinite(value) && value > 0);
  }

  private addDays(value: Date, days: number) {
    return new Date(value.getTime() + days * 24 * 60 * 60 * 1000);
  }
}
