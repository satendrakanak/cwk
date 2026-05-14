import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/courses/course.entity';
import { User } from 'src/users/user.entity';
import { License } from './license.entity';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './providers/licenses.service';

@Module({
  imports: [TypeOrmModule.forFeature([License, User, Course])],
  controllers: [LicensesController],
  providers: [LicensesService],
  exports: [LicensesService],
})
export class LicensesModule {}
