import { registerAs } from '@nestjs/config';
import { readRuntimeDatabaseConfig } from './runtime-database.config';

export default registerAs('database', () => {
  const runtimeConfig = readRuntimeDatabaseConfig();
  const useRuntimeDatabase = runtimeConfig?.mode === 'external';

  return {
    source: useRuntimeDatabase ? 'external' : 'bundled',
    host: useRuntimeDatabase
      ? runtimeConfig.host
      : process.env.DATABASE_HOST || 'localhost',
    port: useRuntimeDatabase
      ? runtimeConfig.port || 5432
      : parseInt(process.env.DATABASE_PORT!) || 5432,
    user: useRuntimeDatabase ? runtimeConfig.user : process.env.DATABASE_USER,
    password: useRuntimeDatabase
      ? runtimeConfig.password
      : process.env.DATABASE_PASSWORD,
    name: useRuntimeDatabase ? runtimeConfig.name : process.env.DATABASE_NAME,
    ssl: useRuntimeDatabase ? Boolean(runtimeConfig.ssl) : false,
    rejectUnauthorized: runtimeConfig?.rejectUnauthorized !== false,
    synchronize: process.env.DATABASE_SYNC === 'true' ? true : false,
    autoLoadEntities: process.env.DATABASE_AUTO_LOAD === 'true' ? true : false,
  };
});
