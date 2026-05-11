import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';

import { seedProductionDemoContent } from './seeds/production-demo-content.seed';

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

  await seedProductionDemoContent(AppDataSource);

  await AppDataSource.destroy();

  console.log('✅ Production demo content seed completed');
}

run().catch(async (error) => {
  console.error('❌ Production demo content seed failed', error);

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }

  process.exit(1);
});
