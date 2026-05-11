import * as fs from 'fs';

export type RuntimeDatabaseConfig = {
  mode?: 'bundled' | 'external';
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  name?: string;
  ssl?: boolean;
  rejectUnauthorized?: boolean;
};

export const runtimeDatabaseConfigPath =
  process.env.KASA_RUNTIME_DATABASE_CONFIG || '/app/.kasa/database.json';

export function readRuntimeDatabaseConfig(): RuntimeDatabaseConfig | null {
  try {
    if (!fs.existsSync(runtimeDatabaseConfigPath)) return null;

    const parsed = JSON.parse(
      fs.readFileSync(runtimeDatabaseConfigPath, 'utf8'),
    ) as RuntimeDatabaseConfig;

    if (parsed.mode !== 'external') return parsed;
    if (!parsed.host || !parsed.user || !parsed.password || !parsed.name) {
      return null;
    }

    return {
      ...parsed,
      port: Number(parsed.port || 5432),
      ssl: Boolean(parsed.ssl),
      rejectUnauthorized: parsed.rejectUnauthorized !== false,
    };
  } catch {
    return null;
  }
}
