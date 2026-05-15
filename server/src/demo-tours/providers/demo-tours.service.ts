import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { GenerateTokensProvider } from 'src/auth/providers/generate-tokens.provider';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { Article } from 'src/articles/article.entity';
import { Category } from 'src/categories/category.entity';
import { Course } from 'src/courses/course.entity';
import { assignDefaultRole } from 'src/database/seeds/assign-default-role.seed';
import { seedEmailTemplates } from 'src/database/seeds/email-template.seed';
import { seedLocation } from 'src/database/seeds/location.seed';
import { seedPermissions } from 'src/database/seeds/permission.seed';
import { seedProductionDemoContent } from 'src/database/seeds/production-demo-content.seed';
import { seedRoles } from 'src/database/seeds/role.seed';
import { UserProfile } from 'src/profiles/user-profile.entity';
import { Permission } from 'src/roles-permissions/permission.entity';
import { Role } from 'src/roles-permissions/role.entity';
import { AppSetting } from 'src/settings/app-setting.entity';
import { Tag } from 'src/tags/tag.entity';
import { User } from 'src/users/user.entity';
import { DataSource, FindOptionsWhere, LessThan, Repository } from 'typeorm';
import { StartDemoTourDto } from '../dtos/start-demo-tour.dto';

const DEMO_DURATION_MINUTES = 60;
const DEMO_ROLE_NAME = 'demo_admin';
const DEMO_OPERATIONS_KEY = 'demo_operations';
const DEMO_SETTINGS_PATH = '/api/v1/demo-settings';
const DEMO_PERMISSIONS = [
  'view_dashboard',
  'view_course',
  'create_course',
  'update_course',
  'view_user',
  'create_user',
  'update_user',
  'view_order',
  'update_order',
  'view_coupon',
  'create_coupon',
  'update_coupon',
  'view_article',
  'create_article',
  'update_article',
  'view_testimonial',
  'create_testimonial',
  'update_testimonial',
  'view_email_template',
  'create_email_template',
  'update_email_template',
  'view_settings',
  'view_role',
  'view_permission',
  'view_license',
  'view_contact_lead',
  'view_comment',
  'view_review',
  'view_question',
  'view_category',
  'create_category',
  'update_category',
  'view_tag',
  'create_tag',
  'update_tag',
  'view_exam',
  'create_exam',
  'update_exam',
  'manage_exam_rules',
  'grade_exam_attempt',
  'assign_exam_faculty',
  'view_question_bank',
  'create_question',
  'update_question',
  'create_question_category',
  'update_question_category',
  'view_faculty_workspace',
  'manage_faculty_batches',
  'manage_faculty_calendar',
  'view_certificate',
  'manage_certificate',
  'manage_engagement',
  'manage_schedulers',
  'manage_notification_rules',
  'send_broadcast_notification',
];

@Injectable()
export class DemoToursService {
  private isRestoringDemoBaseline = false;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,

    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,

    @InjectRepository(AppSetting)
    private readonly appSettingRepository: Repository<AppSetting>,

    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  async start(dto: StartDemoTourDto) {
    await this.assertDemoToursEnabled();

    const existingUsers = await this.findExistingDemoIdentities(dto);

    if (existingUsers.length) {
      const realUser = existingUsers.find((user) => !user.isDemo);

      if (realUser) {
        throw new ConflictException(
          'A user already exists with these details. Please sign in or use another email or phone for demo.',
        );
      }

      await this.cleanupDemoUsers(existingUsers);
    }

    const role = await this.ensureDemoRole();
    const password = this.generateDemoPassword();
    const expiresAt = new Date(Date.now() + DEMO_DURATION_MINUTES * 60 * 1000);
    const username = await this.generateDemoUsername(dto.email);

    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      username,
      password: await this.hashingProvider.hashPassword(password),
      roles: [role],
      emailVerified: new Date(),
      isDemo: true,
      demoExpiresAt: expiresAt,
    });

    const savedUser = await this.userRepository.save(user);
    await this.userProfileRepository.save({
      user: { id: savedUser.id },
      company: dto.businessName,
      headline: dto.useCase,
    });

    const reloadedUser = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!reloadedUser) {
      throw new InternalServerErrorException('Demo user could not be loaded');
    }

    const tokens = await this.generateTokensProvider.generateTokens(reloadedUser);

    return {
      ...tokens,
      user: {
        id: reloadedUser.id,
        email: reloadedUser.email,
        firstName: reloadedUser.firstName,
        lastName: reloadedUser.lastName,
        roles: reloadedUser.roles.map((userRole) => ({
          id: userRole.id,
          name: userRole.name,
        })),
      },
      defaultRedirect: '/admin/dashboard',
      expiresAt,
      password,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredDemos() {
    if (!(await this.areDemoToursEnabled())) return;

    await this.expireDemoData();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async expireDemoData() {
    if (!(await this.areDemoToursEnabled())) return { cleanedUsers: 0 };

    const expiredUsers = await this.userRepository.find({
      where: {
        isDemo: true,
        demoExpiresAt: LessThan(new Date()),
      },
    });

    if (!expiredUsers.length) return { cleanedUsers: 0 };

    await this.cleanupDemoUsers(expiredUsers);

    const shouldRestoreDemoBaseline = await this.shouldRestoreDemoBaselineOnExpiry();

    if (shouldRestoreDemoBaseline) {
      await this.restoreDemoBaseline();
    }

    return {
      cleanedUsers: expiredUsers.length,
      databaseRestored: shouldRestoreDemoBaseline,
    };
  }

  private async cleanupDemoUsers(users: User[]) {
    const expiredUserIds = users.map((user) => user.id);

    if (!expiredUserIds.length) return;

    await this.dataSource.transaction(async (manager) => {
      const orderRows: Array<{ id: number }> = await manager.query(
        'SELECT id FROM "order" WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      const orderIds = orderRows.map((row) => row.id);

      if (orderIds.length) {
        await manager.query(
          'DELETE FROM coupon_usage WHERE "orderId" = ANY($1::int[])',
          [orderIds],
        );
        await manager.query(
          'DELETE FROM enrollment WHERE "orderId" = ANY($1::int[])',
          [orderIds],
        );
      }

      await manager.query(
        'DELETE FROM coupon_usage WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM enrollment WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM refund_request WHERE "requesterId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM "order" WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM cart WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM notification WHERE "recipientId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM push_subscription WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM auth_accounts WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM user_profile WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM faculty_profile WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM user_progres WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM certificate WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM class_attendance WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM batch_student WHERE "studentId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM assignment_submission WHERE "learnerId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'UPDATE assignment_submission SET "reviewedById" = NULL WHERE "reviewedById" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM course_exam_attempt WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM course_exam_access_override WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM exam_attempt WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'UPDATE exam_attempt SET "manualGradedById" = NULL WHERE "manualGradedById" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM course_question WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM course_answer WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM course_review WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM faculty_review WHERE "userId" = ANY($1::int[]) OR "facultyId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'DELETE FROM article_comment WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'UPDATE refund_log SET "actorId" = NULL WHERE "actorId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'UPDATE refund_request SET "reviewedById" = NULL WHERE "reviewedById" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'UPDATE notification SET "actorId" = NULL WHERE "actorId" = ANY($1::int[])',
        [expiredUserIds],
      );
      await manager.query(
        'UPDATE contact_lead SET "userId" = NULL WHERE "userId" = ANY($1::int[])',
        [expiredUserIds],
      );

      await manager
        .getRepository(Course)
        .createQueryBuilder()
        .softDelete()
        .where('createdById IN (:...expiredUserIds)', { expiredUserIds })
        .execute();
      await manager
        .getRepository(Article)
        .createQueryBuilder()
        .softDelete()
        .where('createdById IN (:...expiredUserIds)', { expiredUserIds })
        .execute();
      await manager
        .getRepository(Category)
        .createQueryBuilder()
        .softDelete()
        .where('createdById IN (:...expiredUserIds)', { expiredUserIds })
        .execute();
      await manager
        .getRepository(Tag)
        .createQueryBuilder()
        .softDelete()
        .where('createdById IN (:...expiredUserIds)', { expiredUserIds })
        .execute();

      for (const user of users) {
        const suffix = `${user.id}-${Date.now()}`;

        await manager.getRepository(User).update(user.id, {
          email: `expired-demo-${suffix}@codewithkasa.demo`,
          username: `expired-demo-${suffix}`,
          phoneNumber: null,
          password: null,
          demoExpiresAt: null,
        });
      }

      await manager.getRepository(User).softDelete(expiredUserIds);
    });
  }

  private async findExistingDemoIdentities(dto: StartDemoTourDto) {
    const where: FindOptionsWhere<User>[] = [{ email: dto.email }];

    if (dto.phoneNumber) {
      where.push({ phoneNumber: dto.phoneNumber });
    }

    const users = await this.userRepository.find({
      where,
      withDeleted: true,
    });

    return Array.from(new Map(users.map((user) => [user.id, user])).values());
  }

  private async ensureDemoRole() {
    let role = await this.roleRepository.findOne({
      where: { name: DEMO_ROLE_NAME },
      relations: ['permissions'],
    });

    const permissions = await this.ensureDemoPermissions();

    if (!role) {
      role = this.roleRepository.create({
        name: DEMO_ROLE_NAME,
        permissions,
      });
    } else {
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  private async ensureDemoPermissions() {
    const permissions: Permission[] = [];

    for (const name of DEMO_PERMISSIONS) {
      let permission = await this.permissionRepository.findOne({
        where: { name },
      });

      if (!permission) {
        permission = await this.permissionRepository.save({ name });
      }

      permissions.push(permission);
    }

    return permissions;
  }

  private generateDemoPassword() {
    return `Kasa@${Math.random().toString(36).slice(2, 8)}9A`;
  }

  private async generateDemoUsername(email: string) {
    const base = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 24);

    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = Math.random().toString(36).slice(2, 8);
      const username = `${base || 'demo'}-${suffix}`;
      const exists = await this.userRepository.findOne({
        where: { username },
        withDeleted: true,
      });

      if (!exists) return username;
    }

    return `demo-${Date.now()}`;
  }

  private async areDemoToursEnabled() {
    const settings = await this.getDemoOperationsSettings();
    return settings.demoToursEnabled;
  }

  private async assertDemoToursEnabled() {
    if (!(await this.areDemoToursEnabled())) {
      throw new NotFoundException('Demo tours are not enabled');
    }
  }

  private async shouldRestoreDemoBaselineOnExpiry() {
    const settings = await this.getDemoOperationsSettings();
    return settings.demoResetOnExpiry;
  }

  private async getDemoOperationsSettings() {
    const portalSettings = await this.fetchPortalDemoOperationsSettings();
    if (portalSettings) return portalSettings;

    const localSetting = await this.appSettingRepository.findOne({
      where: { key: DEMO_OPERATIONS_KEY },
    });

    if (localSetting?.valueJson && typeof localSetting.valueJson === 'object') {
      const data = localSetting.valueJson as Record<string, unknown>;
      return {
        demoToursEnabled: Boolean(data.demoToursEnabled),
        demoResetOnExpiry:
          typeof data.demoResetOnExpiry === 'boolean'
            ? data.demoResetOnExpiry
            : true,
      };
    }

    return {
      demoToursEnabled:
        this.configService.get<string>('KASA_DEMO_TOURS_ENABLED') === 'true',
      demoResetOnExpiry:
        this.configService.get<string>('KASA_DEMO_RESET_ON_EXPIRY') === 'true',
    };
  }

  private async fetchPortalDemoOperationsSettings() {
    const portalUrl =
      this.configService.get<string>('LICENSE_PORTAL_URL')?.trim() ||
      this.configService.get<string>('KASA_ADMIN_URL')?.trim();

    if (!portalUrl) return null;

    try {
      const response = await fetch(new URL(DEMO_SETTINGS_PATH, portalUrl), {
        cache: 'no-store',
      });

      if (!response.ok) return null;

      const data = (await response.json()) as {
        demoToursEnabled?: unknown;
        demoResetOnExpiry?: unknown;
      };

      return {
        demoToursEnabled: Boolean(data.demoToursEnabled),
        demoResetOnExpiry:
          typeof data.demoResetOnExpiry === 'boolean'
            ? data.demoResetOnExpiry
            : true,
      };
    } catch {
      return null;
    }
  }

  private async restoreDemoBaseline() {
    if (this.isRestoringDemoBaseline) return;

    this.isRestoringDemoBaseline = true;

    try {
      await seedPermissions(this.dataSource);
      await seedRoles(this.dataSource);
      await seedLocation(this.dataSource);
      await seedEmailTemplates(this.dataSource);
      await seedProductionDemoContent(this.dataSource);
      await assignDefaultRole(this.dataSource);
    } finally {
      this.isRestoringDemoBaseline = false;
    }
  }
}
