import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';

import { seedPermissions } from './seeds/permission.seed';
import { seedRoles } from './seeds/role.seed';
import { assignDefaultRole } from './seeds/assign-default-role.seed';
import { seedEmailTemplates } from './seeds/email-template.seed';
import { seedCourseLearningDemo } from './seeds/course-learning-demo.seed';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER || 'shivaan',
  password: process.env.DATABASE_PASSWORD || '1234',
  database: process.env.DATABASE_NAME || 'codewithkasa',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: false,
});

async function run() {
  await AppDataSource.initialize();

  await seedPermissions(AppDataSource);
  await seedRoles(AppDataSource);

  await assignDefaultRole(AppDataSource);
  await seedEmailTemplates(AppDataSource);
  await seedCourseLearningDemo(AppDataSource);

  await AppDataSource.destroy();

  console.log('🔥 DONE');
}

run();
