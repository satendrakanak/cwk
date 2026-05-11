import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { CertificatesService } from './providers/certificates.service';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('admin/dashboard')
  getAdminDashboard(@ActiveUser() user: ActiveUserData) {
    this.assertPermission(user, 'view_certificate');
    return this.certificatesService.getAdminDashboard();
  }

  @Post('admin/users/:userId/courses/:courseId/generate')
  generateForUserCourse(
    @ActiveUser() user: ActiveUserData,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    this.assertPermission(user, 'manage_certificate');
    return this.certificatesService.generateForUserCourse(userId, courseId);
  }

  @Get('my')
  findMine(@ActiveUser() user: ActiveUserData) {
    return this.certificatesService.findMine(user.sub);
  }

  @Get('course/:courseId')
  findForCourse(
    @ActiveUser() user: ActiveUserData,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.certificatesService.findForCourse(user.sub, courseId);
  }

  @Post('course/:courseId/generate')
  generateForCourse(
    @ActiveUser() user: ActiveUserData,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.certificatesService.generateForCourse(user.sub, courseId);
  }

  private assertPermission(user: ActiveUserData | undefined, permission: string) {
    if (
      user?.roles?.includes('admin') ||
      user?.permissions?.includes(permission)
    ) {
      return;
    }

    throw new ForbiddenException(`Missing permission: ${permission}`);
  }
}
