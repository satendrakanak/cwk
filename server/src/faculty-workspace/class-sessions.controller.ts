import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { FacultyWorkspaceService } from './providers/faculty-workspace.service';

@Controller('class-sessions')
export class ClassSessionsController {
  constructor(
    private readonly facultyWorkspaceService: FacultyWorkspaceService,
  ) {}

  @Get('my')
  getMySessions(@ActiveUser() user: ActiveUserData) {
    return this.facultyWorkspaceService.getLearnerSessions(user);
  }

  @Get('my/recordings')
  getMyRecordings(@ActiveUser() user: ActiveUserData) {
    return this.facultyWorkspaceService.getLearnerRecordings(user);
  }

  @Post(':id/bbb/join')
  joinBbbSession(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.facultyWorkspaceService.joinBbbSession(id, user);
  }

  @Get(':id/bbb/status')
  getBbbSessionStatus(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.facultyWorkspaceService.getLearnerBbbSessionStatus(id, user);
  }
}
