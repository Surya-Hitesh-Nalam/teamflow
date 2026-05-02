const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'suryanalam1234@gmail.com';
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    // Delete associated data first if necessary (though relations are usually set to Cascade or will throw error)
    // Looking at the schema, many relations are Cascade.
    await prisma.user.delete({ where: { email } });
    console.log(`Successfully deleted user: ${email}`);
  } catch (err) {
    console.error('Error deleting user:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
