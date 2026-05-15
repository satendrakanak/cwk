import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from 'src/articles/article.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Category } from 'src/categories/category.entity';
import { Course } from 'src/courses/course.entity';
import { UserProfile } from 'src/profiles/user-profile.entity';
import { Permission } from 'src/roles-permissions/permission.entity';
import { Role } from 'src/roles-permissions/role.entity';
import { Tag } from 'src/tags/tag.entity';
import { User } from 'src/users/user.entity';
import { DemoToursController } from './demo-tours.controller';
import { DemoToursService } from './providers/demo-tours.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      Role,
      Permission,
      Article,
      Course,
      Category,
      Tag,
    ]),
    AuthModule,
  ],
  controllers: [DemoToursController],
  providers: [DemoToursService],
})
export class DemoToursModule {}
