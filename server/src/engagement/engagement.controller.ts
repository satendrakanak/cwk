import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { CreateAutomationJobDto } from './dtos/create-automation-job.dto';
import { CreateNotificationBroadcastDto } from './dtos/create-notification-broadcast.dto';
import { UpdateAutomationJobDto } from './dtos/update-automation-job.dto';
import { UpdateNotificationBroadcastDto } from './dtos/update-notification-broadcast.dto';
import { UpsertNotificationRuleDto } from './dtos/upsert-notification-rule.dto';
import { EngagementService } from './providers/engagement.service';

@Controller('engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Get('dashboard')
  getDashboard(@ActiveUser() user: ActiveUserData) {
    this.assertPermission(user, 'manage_engagement');
    return this.engagementService.getDashboard();
  }

  @Get('schedulers')
  findJobs(@ActiveUser() user: ActiveUserData) {
    this.assertPermission(user, 'manage_schedulers');
    return this.engagementService.findJobs();
  }

  @Post('schedulers')
  createJob(
    @Body() dto: CreateAutomationJobDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'manage_schedulers');
    return this.engagementService.createJob(dto, user.sub);
  }

  @Patch('schedulers/:id')
  updateJob(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAutomationJobDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'manage_schedulers');
    return this.engagementService.updateJob(id, dto);
  }

  @Post('schedulers/:id/run')
  runJob(@Param('id', ParseIntPipe) id: number, @ActiveUser() user: ActiveUserData) {
    this.assertPermission(user, 'manage_schedulers');
    return this.engagementService.runJobNow(id);
  }

  @Delete('schedulers/:id')
  deleteJob(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'manage_schedulers');
    return this.engagementService.deleteJob(id);
  }

  @Get('notification-rules')
  findRules(@ActiveUser() user: ActiveUserData) {
    this.assertPermission(user, 'manage_notification_rules');
    return this.engagementService.findRules();
  }

  @Post('notification-rules')
  upsertRule(
    @Body() dto: UpsertNotificationRuleDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'manage_notification_rules');
    return this.engagementService.upsertRule(dto, user.sub);
  }

  @Patch('notification-rules/:id')
  updateRule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<UpsertNotificationRuleDto>,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'manage_notification_rules');
    return this.engagementService.updateRule(id, dto);
  }

  @Delete('notification-rules/:id')
  deleteRule(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'manage_notification_rules');
    return this.engagementService.deleteRule(id);
  }

  @Get('broadcasts')
  findBroadcasts(@ActiveUser() user: ActiveUserData) {
    this.assertPermission(user, 'send_broadcast_notification');
    return this.engagementService.findBroadcasts();
  }

  @Post('broadcasts')
  createBroadcast(
    @Body() dto: CreateNotificationBroadcastDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'send_broadcast_notification');
    return this.engagementService.createBroadcast(dto, user.sub);
  }

  @Patch('broadcasts/:id')
  updateBroadcast(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNotificationBroadcastDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'send_broadcast_notification');
    return this.engagementService.updateBroadcast(id, dto);
  }

  @Post('broadcasts/:id/send')
  sendBroadcast(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'send_broadcast_notification');
    return this.engagementService.sendBroadcast(id);
  }

  @Post('broadcasts/:id/duplicate')
  duplicateBroadcast(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'send_broadcast_notification');
    return this.engagementService.duplicateBroadcast(id);
  }

  @Get('broadcasts/:id/stats')
  getBroadcastStats(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'send_broadcast_notification');
    return this.engagementService.getBroadcastStats(id);
  }

  @Delete('broadcasts/:id')
  deleteBroadcast(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'send_broadcast_notification');
    return this.engagementService.deleteBroadcast(id);
  }

  private isAdmin(user?: ActiveUserData) {
    return Boolean(user?.roles?.includes('admin'));
  }

  private assertPermission(user: ActiveUserData | undefined, permission: string) {
    if (this.isAdmin(user) || user?.permissions?.includes(permission)) {
      return;
    }

    throw new ForbiddenException(`Missing permission: ${permission}`);
  }
}
