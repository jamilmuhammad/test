const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || '123';
  const name = process.env.ADMIN_NAME || 'User Admin';
  const role = process.env.ROLE_TYPE || 'super-admin';

  const hashed = await bcrypt.hash(password, 10);

  // Upsert admin user (create if not exists, otherwise update role/permissions)
  const user = await prisma.user.upsert({
    where: { username },
    create: {
      username,
      password: hashed,
      name,
      role,
      permissions: ['*'],
      wallet: { create: { balance: 0 } },
    },
    update: {
      role,
      permissions: ['*'],
    },
  });

  console.log(`Admin user ready: ${user.username} (id: ${user.id})`);
  console.log('If this is a fresh DB, use the password from ADMIN_PASSWORD or the default 123');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
