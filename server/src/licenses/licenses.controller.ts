import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { ActivateLicenseDto } from './dtos/activate-license.dto';
import { LicensesService } from './providers/licenses.service';

const DEMO_CONFIGURATION_LOCK_MESSAGE =
  'Demo users cannot change these settings. Purchase KASA to unlock configuration changes.';

@Controller('licenses')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Get('current')
  getCurrent() {
    return this.licensesService.getCurrent();
  }

  @HttpCode(HttpStatus.OK)
  @Post('activate')
  activate(
    @Body() activateLicenseDto: ActivateLicenseDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    if (user?.roles?.includes('demo_admin')) {
      throw new ForbiddenException(DEMO_CONFIGURATION_LOCK_MESSAGE);
    }

    return this.licensesService.activate(activateLicenseDto);
  }
}
