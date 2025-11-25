const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('Isolated connect OK');
  } catch (e) {
    console.error('Isolated connect failed');
    console.error(e);
  } finally {
    await prisma.$disconnect().catch(()=>{});
  }
})();
