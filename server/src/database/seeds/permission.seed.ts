import { DataSource } from 'typeorm';
import { Permission } from 'src/roles-permissions/permission.entity';

export async function seedPermissions(dataSource: DataSource) {
  const repo = dataSource.getRepository(Permission);

  const permissions = [
    'view_dashboard',
    'create_course',
    'update_course',
    'delete_course',
    'view_course',
    'edit_assigned_course',
    'enroll_course',
    'view_category',
    'create_category',
    'update_category',
    'delete_category',
    'view_tag',
    'create_tag',
    'update_tag',
    'delete_tag',
    'view_article',
    'create_article',
    'update_article',
    'delete_article',
    'view_coupon',
    'create_coupon',
    'update_coupon',
    'delete_coupon',
    'view_order',
    'create_order',
    'update_order',
    'delete_order',
    'view_testimonial',
    'create_testimonial',
    'update_testimonial',
    'delete_testimonial',
    'view_user',
    'create_user',
    'update_user',
    'delete_user',
    'view_role',
    'create_role',
    'update_role',
    'delete_role',
    'view_permission',
    'create_permission',
    'update_permission',
    'delete_permission',
    'view_settings',
    'update_settings',
    'view_email_template',
    'create_email_template',
    'update_email_template',
    'delete_email_template',
    'view_certificate',
    'manage_certificate',
    'manage_users',
    'approve_faculty',
    'view_exam',
    'create_exam',
    'update_exam',
    'delete_exam',
    'manage_exam_rules',
    'grade_exam_attempt',
    'assign_exam_faculty',
    'view_question_bank',
    'create_question',
    'update_question',
    'delete_question',
    'create_question_category',
    'update_question_category',
    'delete_question_category',
    'view_faculty_workspace',
    'manage_faculty_batches',
    'manage_faculty_calendar',
    'manage_engagement',
    'manage_schedulers',
    'manage_notification_rules',
    'send_broadcast_notification',
  ];

  for (const name of permissions) {
    const exists = await repo.findOne({ where: { name } });

    if (!exists) {
      await repo.save({ name });
    }
  }

  console.log('✅ Permissions seeded');
}
