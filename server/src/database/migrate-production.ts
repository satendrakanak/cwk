import 'reflect-metadata';
import { DataSource, EntityManager } from 'typeorm';
import { join } from 'path';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER || 'codewithkasa',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'codewithkasa',
  ssl:
    process.env.DATABASE_SSL === 'true'
      ? {
          rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED !== 'false',
        }
      : false,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: false,
});

async function run() {
  await AppDataSource.initialize();

  await AppDataSource.transaction(async (manager) => {
    await manager.query(`
      CREATE TABLE IF NOT EXISTS "assignment" (
        "id" SERIAL PRIMARY KEY,
        "title" varchar(255) NOT NULL,
        "description" text,
        "instructions" text,
        "status" varchar(32) NOT NULL DEFAULT 'draft',
        "submissionType" varchar(32) NOT NULL DEFAULT 'mixed',
        "dueAt" timestamptz,
        "points" integer,
        "allowResubmission" boolean NOT NULL DEFAULT true,
        "resourceIds" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        "courseId" integer NOT NULL,
        "chapterId" integer,
        "lectureId" integer,
        "batchId" integer,
        "createdById" integer,
        "updatedById" integer
      );
    `);

    await manager.query(`
      CREATE TABLE IF NOT EXISTS "assignment_submission" (
        "id" SERIAL PRIMARY KEY,
        "status" varchar(32) NOT NULL DEFAULT 'submitted',
        "text" text,
        "link" text,
        "attachmentIds" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "score" integer,
        "feedback" text,
        "submittedAt" timestamptz NOT NULL,
        "reviewedAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "assignmentId" integer NOT NULL,
        "learnerId" integer NOT NULL,
        "reviewedById" integer
      );
    `);

    await manager.query(`
      CREATE TABLE IF NOT EXISTS "assignment_faculties_user" (
        "assignmentId" integer NOT NULL,
        "userId" integer NOT NULL,
        PRIMARY KEY ("assignmentId", "userId")
      );
    `);

    await manager.query(`
      CREATE INDEX IF NOT EXISTS "IDX_assignment_courseId"
      ON "assignment" ("courseId");
    `);
    await manager.query(`
      CREATE INDEX IF NOT EXISTS "IDX_assignment_submission_assignmentId"
      ON "assignment_submission" ("assignmentId");
    `);
    await manager.query(`
      CREATE INDEX IF NOT EXISTS "IDX_assignment_submission_learnerId"
      ON "assignment_submission" ("learnerId");
    `);
    await manager.query(`
      CREATE INDEX IF NOT EXISTS "IDX_assignment_faculties_assignmentId"
      ON "assignment_faculties_user" ("assignmentId");
    `);
    await manager.query(`
      CREATE INDEX IF NOT EXISTS "IDX_assignment_faculties_userId"
      ON "assignment_faculties_user" ("userId");
    `);

    await addForeignKey(
      manager,
      'assignment',
      'FK_assignment_course',
      '"courseId"',
      'course',
      'id',
      'CASCADE',
    );
    await addForeignKey(
      manager,
      'assignment',
      'FK_assignment_chapter',
      '"chapterId"',
      'chapter',
      'id',
      'SET NULL',
    );
    await addForeignKey(
      manager,
      'assignment',
      'FK_assignment_lecture',
      '"lectureId"',
      'lecture',
      'id',
      'SET NULL',
    );
    await addForeignKey(
      manager,
      'assignment',
      'FK_assignment_batch',
      '"batchId"',
      'course_batch',
      'id',
      'SET NULL',
    );
    await addForeignKey(
      manager,
      'assignment',
      'FK_assignment_created_by',
      '"createdById"',
      '"user"',
      'id',
      'SET NULL',
    );
    await addForeignKey(
      manager,
      'assignment',
      'FK_assignment_updated_by',
      '"updatedById"',
      '"user"',
      'id',
      'SET NULL',
    );
    await addForeignKey(
      manager,
      'assignment_submission',
      'FK_assignment_submission_assignment',
      '"assignmentId"',
      'assignment',
      'id',
      'CASCADE',
    );
    await addForeignKey(
      manager,
      'assignment_submission',
      'FK_assignment_submission_learner',
      '"learnerId"',
      '"user"',
      'id',
      'CASCADE',
    );
    await addForeignKey(
      manager,
      'assignment_submission',
      'FK_assignment_submission_reviewed_by',
      '"reviewedById"',
      '"user"',
      'id',
      'SET NULL',
    );
    await addForeignKey(
      manager,
      'assignment_faculties_user',
      'FK_assignment_faculties_assignment',
      '"assignmentId"',
      'assignment',
      'id',
      'CASCADE',
    );
    await addForeignKey(
      manager,
      'assignment_faculties_user',
      'FK_assignment_faculties_user',
      '"userId"',
      '"user"',
      'id',
      'CASCADE',
    );

    await manager.query(`
      INSERT INTO "user_roles_role" ("userId", "roleId")
      SELECT u.id, r.id
      FROM "user" u
      CROSS JOIN "role" r
      WHERE r.name = 'student'
        AND NOT EXISTS (
          SELECT 1
          FROM "user_roles_role" urr
          WHERE urr."userId" = u.id AND urr."roleId" = r.id
        );
    `);
  });

  await AppDataSource.destroy();
  console.log('✅ Production database migration completed');
}

async function addForeignKey(
  manager: EntityManager,
  tableName: string,
  constraintName: string,
  columnName: string,
  referencedTableName: string,
  referencedColumnName: string,
  onDelete: 'CASCADE' | 'SET NULL',
) {
  const exists = await manager.query(
    `
      SELECT 1
      FROM information_schema.table_constraints
      WHERE constraint_schema = current_schema()
        AND table_name = $1
        AND constraint_name = $2
      LIMIT 1;
    `,
    [tableName, constraintName],
  );

  if (exists.length) return;

  await manager.query(`
    ALTER TABLE "${tableName}"
    ADD CONSTRAINT "${constraintName}"
    FOREIGN KEY (${columnName})
    REFERENCES ${referencedTableName}("${referencedColumnName}")
    ON DELETE ${onDelete};
  `);
}

run().catch(async (error) => {
  console.error('❌ Production database migration failed', error);

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }

  process.exit(1);
});
