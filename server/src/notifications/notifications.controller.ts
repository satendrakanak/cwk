import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import {
  DeletePushSubscriptionDto,
  UpsertPushSubscriptionDto,
} from './dtos/upsert-push-subscription.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('my')
  getMine(@ActiveUser() user: ActiveUserData, @Query('limit') limit?: string) {
    return this.notificationsService.getMine(user, Number(limit) || 20);
  }

  @Get('my/unread-count')
  getUnreadCount(@ActiveUser() user: ActiveUserData) {
    return this.notificationsService.getUnreadCount(user);
  }

  @Patch(':id/read')
  markRead(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.notificationsService.markRead(id, user);
  }

  @Patch(':id/click')
  markClicked(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.notificationsService.markClicked(id, user);
  }

  @Patch('my/read-all')
  markAllRead(@ActiveUser() user: ActiveUserData) {
    return this.notificationsService.markAllRead(user);
  }

  @Post('push-subscriptions')
  upsertPushSubscription(
    @ActiveUser() user: ActiveUserData,
    @Body() dto: UpsertPushSubscriptionDto,
  ) {
    return this.notificationsService.upsertPushSubscription(user, dto);
  }

  @Delete('push-subscriptions')
  deletePushSubscription(
    @ActiveUser() user: ActiveUserData,
    @Body() dto: DeletePushSubscriptionDto,
  ) {
    return this.notificationsService.deletePushSubscription(user, dto.endpoint);
  }

  @Post('push-subscriptions/remove')
  removePushSubscription(
    @ActiveUser() user: ActiveUserData,
    @Body() dto: DeletePushSubscriptionDto,
  ) {
    return this.notificationsService.deletePushSubscription(user, dto.endpoint);
  }

  @Post('push/test')
  sendTestPush(@ActiveUser() user: ActiveUserData) {
    return this.notificationsService.sendTestPush(user);
  }

  @Auth(AuthType.None)
  @Get('push/public-key')
  getPushPublicKey() {
    return this.notificationsService.getPushPublicKey();
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.notificationsService.delete(id, user);
  }
}
