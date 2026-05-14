import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Course } from 'src/courses/course.entity';
import { UserProfile } from 'src/profiles/user-profile.entity';
import { Permission } from 'src/roles-permissions/permission.entity';
import { Role } from 'src/roles-permissions/role.entity';
import { User } from 'src/users/user.entity';
import { DemoToursController } from './demo-tours.controller';
import { DemoToursService } from './providers/demo-tours.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, Role, Permission, Course]),
    AuthModule,
  ],
  controllers: [DemoToursController],
  providers: [DemoToursService],
})
export class DemoToursModule {}
