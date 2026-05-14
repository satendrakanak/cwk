import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { LicensesService } from 'src/licenses/providers/licenses.service';
import { FacultyWorkspaceService } from './providers/faculty-workspace.service';

@Controller('class-sessions')
export class ClassSessionsController {
  constructor(
    private readonly facultyWorkspaceService: FacultyWorkspaceService,
    private readonly licensesService: LicensesService,
  ) {}

  @Get('my')
  async getMySessions(@ActiveUser() user: ActiveUserData) {
    await this.licensesService.assertFeature('liveClasses');
    return this.facultyWorkspaceService.getLearnerSessions(user);
  }

  @Get('my/upcoming')
  async getMyUpcomingSessions(@ActiveUser() user: ActiveUserData) {
    await this.licensesService.assertFeature('liveClasses');
    return this.facultyWorkspaceService.getLearnerUpcomingSessions(user);
  }

  @Get('my/recordings')
  async getMyRecordings(@ActiveUser() user: ActiveUserData) {
    await this.licensesService.assertFeature('liveClasses');
    return this.facultyWorkspaceService.getLearnerRecordings(user);
  }

  @Post(':id/bbb/join')
  async joinBbbSession(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.licensesService.assertFeature('liveClasses');
    return this.facultyWorkspaceService.joinBbbSession(id, user);
  }

  @Get(':id/bbb/status')
  async getBbbSessionStatus(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.licensesService.assertFeature('liveClasses');
    return this.facultyWorkspaceService.getLearnerBbbSessionStatus(id, user);
  }
}
