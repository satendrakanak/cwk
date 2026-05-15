import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { httpOnlyCookieOptions } from 'src/auth/cookies/cookies-options';
import { StartDemoTourDto } from './dtos/start-demo-tour.dto';
import { DemoToursService } from './providers/demo-tours.service';

@Controller('demo-tours')
export class DemoToursController {
  constructor(private readonly demoToursService: DemoToursService) {}

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('start')
  async start(
    @Body() startDemoTourDto: StartDemoTourDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = await this.demoToursService.start(startDemoTourDto);

    res.cookie('accessToken', result.accessToken, httpOnlyCookieOptions);
    res.cookie('refreshToken', result.refreshToken, httpOnlyCookieOptions);

    return {
      success: true,
      message: 'Demo workspace is ready',
      data: {
        user: result.user,
        defaultRedirect: result.defaultRedirect,
        expiresAt: result.expiresAt,
      },
    };
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('cleanup-expired')
  async cleanupExpired() {
    const result = await this.demoToursService.expireDemoData();

    return {
      success: true,
      message: 'Expired demo workspaces cleaned',
      data: result,
    };
  }
}
