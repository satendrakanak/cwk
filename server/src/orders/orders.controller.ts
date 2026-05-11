import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { OrdersService } from './providers/orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { VerifyPaymentDto } from './dtos/verify-payment.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import type { Request } from 'express';
import { Order } from './order.entity';
import { OrderStatus } from './enums/orderStatus.enum';
import { DateRangeQueryDto } from 'src/common/dtos/date-range-query.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    /**
     * Inject ordersService
     */

    private readonly ordersService: OrdersService,
  ) {}

  // 🔥 Get All Orders
  @Get()
  async findAll(@Query() query: DateRangeQueryDto): Promise<Order[]> {
    return await this.ordersService.findAll(query);
  }

  // 🔥 Get My Orders
  @Get('my-orders')
  async getMyOrders(
    @ActiveUser() user: ActiveUserData,
    @Query() query: DateRangeQueryDto,
  ): Promise<Order[]> {
    return await this.ordersService.findUserOrders(user.sub, query);
  }

  @Get(':id')
  async findOneById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return await this.ordersService.findOneById(id);
  }

  // 🔥 Create Order
  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return await this.ordersService.create(createOrderDto, user);
  }

  @Post('verify')
  async verify(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return await this.ordersService.verifyPayment(verifyPaymentDto);
  }

  @Post(':id/retry')
  async retryPayment(@Param('id', ParseIntPipe) orderId: number) {
    return this.ordersService.retryPayment(orderId);
  }

  @Post(':id/cancel-payment')
  async cancelPayment(
    @Param('id', ParseIntPipe) orderId: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.ordersService.cancelPendingOrder(orderId, user);

    return {
      success: true,
    };
  }

  @Post(':id/mark-failed')
  async markFailed(
    @Param('id', ParseIntPipe) orderId: number,
    @ActiveUser() user: ActiveUserData,
    @Body('paymentId') paymentId?: string,
  ) {
    await this.ordersService.markPaymentFailed(orderId, user, paymentId);

    return {
      success: true,
    };
  }

  @Auth(AuthType.None)
  @Post('webhook')
  async handleWebhook(@Req() req: Request) {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      throw new BadRequestException('Missing signature');
    }

    return await this.ordersService.handleWebhook(
      req.body as Buffer,
      signature,
    );
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: OrderStatus,
  ) {
    return await this.ordersService.updateStatus(id, status);
  }
}
