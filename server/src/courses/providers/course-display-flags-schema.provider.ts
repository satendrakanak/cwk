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
        ADD COLUMN IF NOT EXISTS "showInPopular" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "showInMegaMenu" boolean NOT NULL DEFAULT false
    `);

    await this.dataSource.query(`
      WITH selected_courses AS (
        SELECT "id"
        FROM "course"
        WHERE "isPublished" = true
        ORDER BY
          "showInPopular" DESC,
          "showInHero" DESC,
          "createdAt" DESC
        LIMIT 6
      )
      UPDATE "course"
      SET "showInMegaMenu" = true
      WHERE "id" IN (SELECT "id" FROM selected_courses)
        AND NOT EXISTS (
          SELECT 1 FROM "course" WHERE "showInMegaMenu" = true
        )
    `);

    this.logger.log('Course display flag columns are ready');
  }
}
