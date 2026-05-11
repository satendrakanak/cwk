import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { CompleteInstallationDto } from './dtos/complete-installation.dto';
import { DatabaseSetupDto } from './dtos/database-setup.dto';
import { ValidateLicenseDto } from './dtos/validate-license.dto';
import { InstallerService } from './installer.service';

@Auth(AuthType.None)
@Controller('installer')
export class InstallerController {
  constructor(private readonly installerService: InstallerService) {}

  @Get('status')
  getStatus() {
    return this.installerService.getStatus();
  }

  @Post('validate-license')
  validateLicense(@Body() payload: ValidateLicenseDto) {
    return this.installerService.validateLicense(payload.licenseKey);
  }

  @Post('database/test')
  testDatabase(@Body() payload: DatabaseSetupDto) {
    return this.installerService.testDatabaseConnection(payload);
  }

  @Post('database/save')
  saveDatabase(@Body() payload: DatabaseSetupDto) {
    return this.installerService.saveDatabaseConfiguration(payload);
  }

  @Post('complete')
  complete(@Body() payload: CompleteInstallationDto) {
    return this.installerService.completeInstallation(payload);
  }

  @Post('start')
  start(@Body() payload: CompleteInstallationDto) {
    return this.installerService.startInstallation(payload);
  }

  @Get('progress/:jobId')
  progress(@Param('jobId') jobId: string) {
    return this.installerService.getInstallationProgress(jobId);
  }
}
