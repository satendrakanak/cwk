import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { GenerateTokensProvider } from 'src/auth/providers/generate-tokens.provider';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { Course } from 'src/courses/course.entity';
import { UserProfile } from 'src/profiles/user-profile.entity';
import { Permission } from 'src/roles-permissions/permission.entity';
import { Role } from 'src/roles-permissions/role.entity';
import { User } from 'src/users/user.entity';
import { LessThan, Repository } from 'typeorm';
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
  'view_category',
  'create_category',
  'update_category',
  'view_tag',
  'create_tag',
  'update_tag',
  'view_exam',
  'create_exam',
  'update_exam',
  'view_faculty_workspace',
  'manage_faculty_batches',
  'manage_faculty_calendar',
  'view_certificate',
];

@Injectable()
export class DemoToursService {
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

    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  async start(dto: StartDemoTourDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
      withDeleted: true,
    });

    if (existingUser) {
      throw new ConflictException(
        'A user already exists with this email. Please sign in or use another email for demo.',
      );
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
    await this.expireDemoData();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async expireDemoData() {
    const expiredUsers = await this.userRepository.find({
      where: {
        isDemo: true,
        demoExpiresAt: LessThan(new Date()),
      },
    });

    if (!expiredUsers.length) return;

    const expiredUserIds = expiredUsers.map((user) => user.id);

    await this.courseRepository
      .createQueryBuilder()
      .softDelete()
      .where('createdById IN (:...expiredUserIds)', { expiredUserIds })
      .execute();

    await this.userRepository.softDelete(expiredUserIds);
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
}
