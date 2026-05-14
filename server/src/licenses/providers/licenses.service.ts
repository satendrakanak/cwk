import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/courses/course.entity';
import { User } from 'src/users/user.entity';
import { IsNull, Repository } from 'typeorm';
import { ActivateLicenseDto } from '../dtos/activate-license.dto';
import { LicensePlan } from '../enums/license-plan.enum';
import { LicenseStatus } from '../enums/license-status.enum';
import { License } from '../license.entity';
import {
  getPlanFromLicenseKey,
  LICENSE_PLANS,
  LicenseFeatureKey,
  LicenseLimitKey,
} from '../license-plans';

@Injectable()
export class LicensesService {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async activate(dto: ActivateLicenseDto) {
    const key = dto.key.trim().toUpperCase();
    const plan = getPlanFromLicenseKey(key);

    if (!plan) {
      throw new BadRequestException(
        'Invalid license key. Use a KASA Starter, Plus, or Enterprise key.',
      );
    }

    await this.licenseRepository.update(
      { status: LicenseStatus.ACTIVE },
      { status: LicenseStatus.REVOKED },
    );

    let license = await this.licenseRepository.findOne({ where: { key } });

    if (!license) {
      license = this.licenseRepository.create({ key });
    }

    license.plan = plan;
    license.status = LicenseStatus.ACTIVE;
    license.purchaserEmail = dto.purchaserEmail ?? license.purchaserEmail;
    license.activatedAt = new Date();
    license.expiresAt = null;

    await this.licenseRepository.save(license);

    return this.getCurrent();
  }

  async getCurrent() {
    const license = await this.getActiveLicense();
    const effectivePlan = license?.plan ?? LicensePlan.STARTER;
    const plan = LICENSE_PLANS[effectivePlan];
    const usage = await this.getUsage();

    return {
      license,
      plan,
      usage,
      locked: this.getLockedState(plan.plan, usage),
    };
  }

  async assertFeature(feature: LicenseFeatureKey) {
    const license = await this.getActiveLicense();
    const plan = LICENSE_PLANS[license?.plan ?? LicensePlan.STARTER];

    if (!plan.features[feature]) {
      throw new HttpException(
        `${plan.label} does not include this feature. Please upgrade to unlock it.`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async assertCanCreateUser() {
    await this.assertWithinLimit('users');
  }

  async assertCanCreateCourse() {
    await this.assertFeature('courses');
    await this.assertWithinLimit('courses');
  }

  async assertCanCreateFaculty() {
    await this.assertFeature('faculty');
    await this.assertWithinLimit('faculty');
  }

  private async assertWithinLimit(limitKey: LicenseLimitKey) {
    const license = await this.getActiveLicense();
    const plan = LICENSE_PLANS[license?.plan ?? LicensePlan.STARTER];
    const limit = plan.limits[limitKey];

    if (limit === null) return;

    const usage = await this.getUsage();

    if (usage[limitKey] >= limit) {
      throw new HttpException(
        `${plan.label} allows up to ${limit} ${limitKey}. Please upgrade to add more.`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  private async getActiveLicense() {
    const now = new Date();
    const license = await this.licenseRepository.findOne({
      where: { status: LicenseStatus.ACTIVE },
      order: { activatedAt: 'DESC', createdAt: 'DESC' },
    });

    if (!license) return null;

    if (license.expiresAt && license.expiresAt <= now) {
      license.status = LicenseStatus.EXPIRED;
      await this.licenseRepository.save(license);
      return null;
    }

    return license;
  }

  private async getUsage() {
    const [users, courses, faculty] = await Promise.all([
      this.userRepository.count({ where: { deletedAt: IsNull() } }),
      this.courseRepository.count({ where: { deletedAt: IsNull() } }),
      this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.roles', 'role', 'role.name = :roleName', {
          roleName: 'faculty',
        })
        .where('user.deletedAt IS NULL')
        .getCount(),
    ]);

    return {
      users,
      courses,
      faculty,
    };
  }

  private getLockedState(
    plan: LicensePlan,
    usage: Record<LicenseLimitKey, number>,
  ) {
    const definition = LICENSE_PLANS[plan];

    return Object.entries(definition.limits).reduce(
      (result, [key, limit]) => ({
        ...result,
        [key]: limit !== null && usage[key as LicenseLimitKey] >= limit,
      }),
      {} as Record<LicenseLimitKey, boolean>,
    );
  }
}
