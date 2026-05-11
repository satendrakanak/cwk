import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CourseDisplayFlagsSchemaProvider implements OnModuleInit {
  private readonly logger = new Logger(CourseDisplayFlagsSchemaProvider.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    await this.ensureDisplayFlagColumns();
  }

  private async ensureDisplayFlagColumns() {
    await this.dataSource.query(`
      ALTER TABLE "course"
        ADD COLUMN IF NOT EXISTS "showInHero" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "showInPopular" boolean NOT NULL DEFAULT false
    `);

    this.logger.log('Course display flag columns are ready');
  }
}
