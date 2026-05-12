import { Role } from 'src/roles-permissions/role.entity';
import { User } from 'src/users/user.entity';
import { DataSource } from 'typeorm';

export async function assignDefaultRole(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  const studentRole = await roleRepo.findOne({
    where: { name: 'student' },
  });

  if (!studentRole) throw new Error('Student role not found');

  const users = await userRepo.find(); // relation API is used below for safe updates

  for (const user of users) {
    const roles = await dataSource
      .createQueryBuilder()
      .relation(User, 'roles')
      .of(user.id)
      .loadMany();

    const hasStudentRole = roles.some((role) => role.name === 'student');

    if (!hasStudentRole) {
      await dataSource
        .createQueryBuilder()
        .relation(User, 'roles')
        .of(user.id)
        .add(studentRole.id);
    }
  }

  console.log('✅ Existing users updated');
}
