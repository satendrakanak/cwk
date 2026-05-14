import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ActivateLicenseDto } from './dtos/activate-license.dto';
import { LicensesService } from './providers/licenses.service';

@Controller('licenses')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Get('current')
  getCurrent() {
    return this.licensesService.getCurrent();
  }

  @HttpCode(HttpStatus.OK)
  @Post('activate')
  activate(@Body() activateLicenseDto: ActivateLicenseDto) {
    return this.licensesService.activate(activateLicenseDto);
  }
}
