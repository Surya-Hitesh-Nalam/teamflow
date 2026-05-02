const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // clean up existing data
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('admin123', 10);
  const memberHash = await bcrypt.hash('member123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@teamflow.com',
      passwordHash,
      role: 'ADMIN',
      isVerified: true
    }
  });

  // 2. Create Sample Member
  const member = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: memberHash,
      role: 'MEMBER',
      isVerified: true
    }
  });

  // 3. Create Sample Project
  const project = await prisma.project.create({
    data: {
      name: 'Enterprise App 2024',
      description: 'Building the next generation of team collaboration tools.',
      ownerId: admin.id
    }
  });

  // 4. Add Member to Project
  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: member.id
    }
  });

  // 5. Create Sample Tasks
  await prisma.task.create({
    data: {
      title: 'Design System Architecture',
      description: 'Define the core components and layout for the new enterprise application.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      projectId: project.id,
      assignedTo: admin.id,
      createdBy: admin.id
    }
  });

  await prisma.task.create({
    data: {
      title: 'Setup CI/CD Pipeline',
      description: 'Automate deployment to staging and production environments.',
      status: 'TODO',
      priority: 'URGENT',
      projectId: project.id,
      assignedTo: member.id,
      createdBy: admin.id,
      dueDate: new Date(Date.now() - 86400000) // Yesterday (Overdue)
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
