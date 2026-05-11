import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/roles-permissions/role.entity';
import { AppSetting } from 'src/settings/app-setting.entity';
import { SettingsModule } from 'src/settings/settings.module';
import { User } from 'src/users/user.entity';
import { InstallerController } from './installer.controller';
import { InstallerService } from './installer.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppSetting, Role, User]), SettingsModule],
  controllers: [InstallerController],
  providers: [InstallerService],
})
export class InstallerModule {}
