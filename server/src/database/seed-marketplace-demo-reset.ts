import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';

import { assignDefaultRole } from './seeds/assign-default-role.seed';
import { seedEmailTemplates } from './seeds/email-template.seed';
import { seedLocation } from './seeds/location.seed';
import { seedPermissions } from './seeds/permission.seed';
import { seedProductionDemoContent } from './seeds/production-demo-content.seed';
import { seedRoles } from './seeds/role.seed';

const RESET_CONFIRMATION = 'RESET_DEMO_DATABASE';

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
  if (process.env.MARKETPLACE_DEMO_RESET_CONFIRM !== RESET_CONFIRMATION) {
    throw new Error(
      `Refusing to reset database. Set MARKETPLACE_DEMO_RESET_CONFIRM=${RESET_CONFIRMATION} to continue.`,
    );
  }

  await AppDataSource.initialize();

  await AppDataSource.synchronize(true);
  console.log('✅ Database schema reset');

  await seedPermissions(AppDataSource);
  await seedRoles(AppDataSource);
  await seedLocation(AppDataSource);
  await seedEmailTemplates(AppDataSource);
  await seedProductionDemoContent(AppDataSource);
  await assignDefaultRole(AppDataSource);

  await AppDataSource.destroy();

  console.log('✅ Fresh marketplace demo database is ready');
}

run().catch(async (error) => {
  console.error('❌ Marketplace demo reset failed', error);

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }

  process.exit(1);
});
