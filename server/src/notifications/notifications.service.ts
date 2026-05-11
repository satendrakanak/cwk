import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { SettingsService } from 'src/settings/providers/settings.service';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import webPush from 'web-push';
import { UpsertPushSubscriptionDto } from './dtos/upsert-push-subscription.dto';
import { NotificationChannel } from './enums/notification-channel.enum';
import { NotificationType } from './enums/notification-type.enum';
import { Notification } from './notification.entity';
import { PushSubscription } from './push-subscription.entity';

type CreateNotificationInput = {
  recipientId: number;
  actorId?: number | null;
  title: string;
  message: string;
  href?: string | null;
  imageUrl?: string | null;
  type?: NotificationType;
  channel?: NotificationChannel;
  metadata?: Record<string, unknown> | null;
  skipPush?: boolean;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(PushSubscription)
    private readonly pushSubscriptionRepository: Repository<PushSubscription>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly settingsService: SettingsService,
  ) {}

  async create(input: CreateNotificationInput) {
    const recipient = await this.userRepository.findOne({
      where: { id: input.recipientId },
    });

    if (!recipient) {
      throw new NotFoundException('Notification recipient not found');
    }

    const actor = input.actorId
      ? await this.userRepository.findOne({ where: { id: input.actorId } })
      : null;

    const notification = await this.notificationRepository.save(
      this.notificationRepository.create({
        recipient,
        actor,
        title: input.title,
        message: input.message,
        href: input.href ?? null,
        imageUrl: input.imageUrl ?? null,
        type: input.type ?? NotificationType.Info,
        channel: input.channel ?? NotificationChannel.InApp,
        metadata: input.metadata ?? null,
      }),
    );

    if (!input.skipPush) {
      this.sendPushForNotificationSafely(notification);
    }

    return notification;
  }

  async createMany(inputs: CreateNotificationInput[]) {
    const notifications: Notification[] = [];

    for (const input of inputs) {
      notifications.push(await this.create(input));
    }

    return notifications;
  }

  async getMine(user: ActiveUserData, limit = 20) {
    const take = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const notifications = await this.notificationRepository.find({
      where: { recipient: { id: user.sub } },
      relations: ['actor'],
      order: { createdAt: 'DESC' },
      take,
    });

    return notifications.map((notification) => this.toResponse(notification));
  }

  async getUnreadCount(user: ActiveUserData) {
    const count = await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.recipientId = :userId', { userId: user.sub })
      .andWhere('notification.readAt IS NULL')
      .getCount();

    return { count };
  }

  async markRead(id: number, user: ActiveUserData) {
    const notification = await this.getNotificationForUser(id, user);
    notification.readAt = notification.readAt ?? new Date();
    const saved = await this.notificationRepository.save(notification);

    return this.toResponse(saved);
  }

  async markClicked(id: number, user: ActiveUserData) {
    const notification = await this.getNotificationForUser(id, user);
    const now = new Date();
    notification.readAt = notification.readAt ?? now;
    notification.clickedAt = notification.clickedAt ?? now;
    const saved = await this.notificationRepository.save(notification);

    return this.toResponse(saved);
  }

  async markAllRead(user: ActiveUserData) {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ readAt: new Date() })
      .where('"recipientId" = :userId', { userId: user.sub })
      .andWhere('"readAt" IS NULL')
      .execute();

    return { message: 'Notifications marked as read' };
  }

  async delete(id: number, user: ActiveUserData) {
    await this.getNotificationForUser(id, user);
    await this.notificationRepository.delete(id);

    return { message: 'Notification deleted' };
  }

  async upsertPushSubscription(
    user: ActiveUserData,
    dto: UpsertPushSubscriptionDto,
  ) {
    const owner = await this.userRepository.findOne({
      where: { id: user.sub },
    });

    if (!owner) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.pushSubscriptionRepository.findOne({
      where: { endpoint: dto.endpoint },
      relations: ['user'],
    });

    if (existing && existing.user.id !== user.sub) {
      throw new ForbiddenException('Push subscription belongs to another user');
    }

    const subscription =
      existing ??
      this.pushSubscriptionRepository.create({
        user: owner,
        endpoint: dto.endpoint,
      });

    subscription.p256dh = dto.p256dh;
    subscription.auth = dto.auth;
    subscription.userAgent = dto.userAgent ?? null;
    subscription.isActive = true;

    await this.pushSubscriptionRepository.save(subscription);

    return { message: 'Push subscription saved' };
  }

  async deletePushSubscription(user: ActiveUserData, endpoint: string) {
    await this.pushSubscriptionRepository.update(
      {
        endpoint,
        user: { id: user.sub },
      },
      { isActive: false },
    );

    return { message: 'Push subscription removed' };
  }

  async getPushPublicKey() {
    const settings =
      await this.settingsService.getPushNotificationSettingsForRuntime();

    return {
      isEnabled: Boolean(settings.isEnabled && settings.publicKey),
      publicKey: settings.isEnabled ? settings.publicKey : '',
    };
  }

  async sendTestPush(user: ActiveUserData) {
    const recipient = await this.userRepository.findOne({
      where: { id: user.sub },
    });

    if (!recipient) {
      throw new NotFoundException('User not found');
    }

    const notification = await this.notificationRepository.save(
      this.notificationRepository.create({
        recipient,
        title: 'Test push notification',
        message: 'Push notifications are working on this device.',
        href: '/notifications',
        type: NotificationType.System,
        channel: NotificationChannel.Push,
        metadata: { source: 'manual_test' },
      }),
    );

    let result = {
      sent: 0,
      failed: 0,
      inactiveRemoved: 0,
      subscriptionCount: 0,
      error: null as string | null,
    };

    try {
      result = {
        ...(await this.sendPushForNotification(notification)),
        error: null,
      };
    } catch (error: unknown) {
      const message = this.getPushErrorMessage(error);
      this.logger.warn(
        `Test push dispatch failed for user ${user.sub}: ${message}`,
      );
      result = {
        ...result,
        failed: 1,
        error: message,
      };
    }

    return {
      message: this.getPushResultMessage(result),
      ...result,
    };
  }

  private async getNotificationForUser(id: number, user: ActiveUserData) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['recipient', 'actor'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipient.id !== user.sub) {
      throw new ForbiddenException('You can only access your notifications');
    }

    return notification;
  }

  private toResponse(notification: Notification) {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      href: notification.href,
      imageUrl: notification.imageUrl,
      type: notification.type,
      channel: notification.channel,
      metadata: notification.metadata,
      readAt: notification.readAt,
      clickedAt: notification.clickedAt,
      createdAt: notification.createdAt,
      actor: notification.actor
        ? {
            id: notification.actor.id,
            firstName: notification.actor.firstName,
            lastName: notification.actor.lastName,
            email: notification.actor.email,
          }
        : null,
    };
  }

  private sendPushForNotificationSafely(notification: Notification) {
    void this.sendPushForNotification(notification).catch((error: unknown) => {
      this.logger.warn(
        `Push dispatch failed for notification ${notification.id}: ${this.getPushErrorMessage(error)}`,
      );
    });
  }

  private async sendPushForNotification(notification: Notification) {
    const settings =
      await this.settingsService.getPushNotificationSettingsForRuntime();

    if (
      !settings.isEnabled ||
      !settings.publicKey ||
      !settings.privateKey ||
      !settings.subject
    ) {
      this.logger.warn(
        'Push dispatch skipped because VAPID settings are incomplete',
      );
      return { sent: 0, failed: 0, inactiveRemoved: 0, subscriptionCount: 0 };
    }

    webPush.setVapidDetails(
      settings.subject,
      settings.publicKey,
      settings.privateKey,
    );

    const subscriptions = await this.pushSubscriptionRepository.find({
      where: {
        user: { id: notification.recipient.id },
        isActive: true,
      },
      relations: ['user'],
    });

    if (!subscriptions.length) {
      return { sent: 0, failed: 0, inactiveRemoved: 0, subscriptionCount: 0 };
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      url: notification.href || '/notifications',
      imageUrl: notification.imageUrl,
      notificationId: notification.id,
      type: notification.type,
    });

    let sent = 0;
    let failed = 0;
    let inactiveRemoved = 0;

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload,
          );
          sent += 1;
        } catch (error: unknown) {
          failed += 1;
          const statusCode =
            typeof error === 'object' && error !== null && 'statusCode' in error
              ? Number(error.statusCode)
              : 0;

          if (statusCode === 404 || statusCode === 410) {
            subscription.isActive = false;
            await this.pushSubscriptionRepository.save(subscription);
            inactiveRemoved += 1;
          }

          this.logger.warn(
            `Push send failed for subscription ${subscription.id} (${statusCode || 'unknown'}): ${this.getPushErrorMessage(error)}`,
          );
        }
      }),
    );

    return {
      sent,
      failed,
      inactiveRemoved,
      subscriptionCount: subscriptions.length,
    };
  }

  private getPushErrorMessage(error: unknown) {
    if (typeof error === 'object' && error !== null && 'body' in error) {
      const statusCode =
        'statusCode' in error ? `status ${String(error.statusCode)}` : '';
      return [statusCode, String(error.body)].filter(Boolean).join(': ');
    }

    if (error instanceof Error) return error.message;

    return String(error);
  }

  private getPushResultMessage(result: {
    sent: number;
    failed: number;
    subscriptionCount: number;
    error?: string | null;
  }) {
    if (result.sent > 0) return 'Test push sent';
    if (result.error) return result.error;
    if (result.subscriptionCount > 0) {
      return 'Push provider rejected the saved subscription';
    }

    return 'No active push subscription found for this user';
  }
}
