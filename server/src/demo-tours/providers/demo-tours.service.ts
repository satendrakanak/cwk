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
import { Tag } from 'src/tags/tag.entity';
import { User } from 'src/users/user.entity';
import { DataSource, FindOptionsWhere, LessThan, Repository } from 'typeorm';
import { StartDemoTourDto } from '../dtos/start-demo-tour.dto';

const DEMO_DURATION_MINUTES = 60;
const DEMO_ROLE_NAME = 'demo_admin';
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
  private isResettingDemoDatabase = false;

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

    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  async start(dto: StartDemoTourDto) {
    this.assertDemoToursEnabled();

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
    if (!this.areDemoToursEnabled()) return;

    await this.expireDemoData();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async expireDemoData() {
    if (!this.areDemoToursEnabled()) return { cleanedUsers: 0 };

    const expiredUsers = await this.userRepository.find({
      where: {
        isDemo: true,
        demoExpiresAt: LessThan(new Date()),
      },
    });

    if (!expiredUsers.length) return { cleanedUsers: 0 };

    if (this.shouldResetDemoDatabaseOnExpiry()) {
      await this.resetDemoDatabase();

      return {
        cleanedUsers: expiredUsers.length,
        databaseRestored: true,
      };
    }

    await this.cleanupDemoUsers(expiredUsers);

    return {
      cleanedUsers: expiredUsers.length,
      databaseRestored: false,
    };
  }

  private async cleanupDemoUsers(users: User[]) {
    const expiredUserIds = users.map((user) => user.id);

    if (!expiredUserIds.length) return;

    await this.courseRepository
      .createQueryBuilder()
      .softDelete()
      .where('createdById IN (:...expiredUserIds)', { expiredUserIds })
      .execute();

    await this.categoryRepository
      .createQueryBuilder()
      .softDelete()
      .where('createdById IN (:...expiredUserIds)', { expiredUserIds })
      .execute();

    await this.tagRepository
      .createQueryBuilder()
      .softDelete()
      .where('createdById IN (:...expiredUserIds)', { expiredUserIds })
      .execute();

    for (const user of users) {
      const suffix = `${user.id}-${Date.now()}`;

      await this.userRepository.update(user.id, {
        email: `expired-demo-${suffix}@codewithkasa.demo`,
        username: `expired-demo-${suffix}`,
        phoneNumber: null,
      });
    }

    await this.userRepository.softDelete(expiredUserIds);
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

  private areDemoToursEnabled() {
    return this.configService.get<string>('KASA_DEMO_TOURS_ENABLED') === 'true';
  }

  private assertDemoToursEnabled() {
    if (!this.areDemoToursEnabled()) {
      throw new NotFoundException('Demo tours are not enabled');
    }
  }

  private shouldResetDemoDatabaseOnExpiry() {
    return (
      this.configService.get<string>('KASA_DEMO_RESET_ON_EXPIRY') === 'true'
    );
  }

  private async resetDemoDatabase() {
    if (this.isResettingDemoDatabase) return;

    this.isResettingDemoDatabase = true;

    try {
      await this.dataSource.synchronize(true);
      await seedPermissions(this.dataSource);
      await seedRoles(this.dataSource);
      await seedLocation(this.dataSource);
      await seedEmailTemplates(this.dataSource);
      await seedProductionDemoContent(this.dataSource);
      await assignDefaultRole(this.dataSource);
    } finally {
      this.isResettingDemoDatabase = false;
    }
  }
}
