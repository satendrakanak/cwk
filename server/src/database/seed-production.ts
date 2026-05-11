import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';

import { seedPermissions } from './seeds/permission.seed';
import { seedRoles } from './seeds/role.seed';
import { assignDefaultRole } from './seeds/assign-default-role.seed';
import { seedEmailTemplates } from './seeds/email-template.seed';
import { seedLocation } from './seeds/location.seed';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER || 'codewithkasa',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'codewithkasa',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: false,
});

async function run() {
  await AppDataSource.initialize();

  await seedPermissions(AppDataSource);
  await seedRoles(AppDataSource);
  await assignDefaultRole(AppDataSource);
  await seedLocation(AppDataSource);
  await seedEmailTemplates(AppDataSource);

  await AppDataSource.destroy();

  console.log('✅ Production seed completed');
}

run().catch(async (error) => {
  console.error('❌ Production seed failed', error);

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }

  process.exit(1);
});
