import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { CreateRefundRequestDto } from './dtos/create-refund-request.dto';
import {
  ReviewRefundRequestDto,
} from './dtos/review-refund-request.dto';
import { RefundsService } from './providers/refunds.service';
import { DateRangeQueryDto } from 'src/common/dtos/date-range-query.dto';
import { LicensesService } from 'src/licenses/providers/licenses.service';

@Controller('refund-requests')
export class RefundsController {
  constructor(
    private readonly refundsService: RefundsService,
    private readonly licensesService: LicensesService,
  ) {}

  @Get('my')
  async findMine(@ActiveUser() user: ActiveUserData) {
    await this.licensesService.assertFeature('refunds');
    return this.refundsService.findMine(user.sub);
  }

  @Get('admin')
  async findAllAdmin(@Query() query: DateRangeQueryDto) {
    await this.licensesService.assertFeature('refunds');
    return this.refundsService.findAllAdmin(query);
  }

  @Get(':id')
  async findOneById(@Param('id', ParseIntPipe) id: number) {
    await this.licensesService.assertFeature('refunds');
    return this.refundsService.findOneById(id);
  }

  @Post('orders/:orderId')
  async createRequest(
    @Param('orderId', ParseIntPipe) orderId: number,
    @ActiveUser() user: ActiveUserData,
    @Body() dto: CreateRefundRequestDto,
  ) {
    await this.licensesService.assertFeature('refunds');
    return this.refundsService.createRequest(orderId, user, dto);
  }

  @Patch(':id/review')
  async reviewRequest(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
    @Body() dto: ReviewRefundRequestDto,
  ) {
    await this.licensesService.assertFeature('refunds');
    return this.refundsService.reviewRequest(id, user, dto);
  }

  @Post(':id/sync')
  async syncRefundStatus(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.licensesService.assertFeature('refunds');
    return this.refundsService.syncRefundStatus(id, user);
  }
}
