const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // clean up existing data
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.blacklistedToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // create admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Surya Kumar',
      email: 'admin@teamflow.com',
      passwordHash,
      role: 'ADMIN'
    }
  });

  // create regular member
  const member = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'member@teamflow.com',
      passwordHash,
      role: 'MEMBER'
    }
  });

  console.log('Created users:', admin.email, member.email);

  // create a project
  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Redesigning the company website with a fresh look and better UX',
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: member.id }
        ]
      }
    }
  });

  console.log('Created project:', project.name);

  // create some tasks with different statuses and priorities
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Design new homepage layout',
        description: 'Create wireframes and mockups for the new homepage',
        projectId: project.id,
        assignedTo: member.id,
        createdBy: admin.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2026-05-10')
      }
    }),
    prisma.task.create({
      data: {
        title: 'Fix login bug on mobile',
        description: 'Users are reporting that the login form does not work on Safari mobile',
        projectId: project.id,
        assignedTo: member.id,
        createdBy: admin.id,
        status: 'TODO',
        priority: 'URGENT',
        dueDate: new Date('2026-05-03')
      }
    }),
    prisma.task.create({
      data: {
        title: 'Update footer links',
        description: 'Add new social media links and update the privacy policy URL',
        projectId: project.id,
        assignedTo: admin.id,
        createdBy: admin.id,
        status: 'DONE',
        priority: 'LOW'
      }
    })
  ]);

  console.log(`Created ${tasks.length} tasks`);

  // add a couple activity logs so the dashboard isn't empty
  await prisma.activityLog.createMany({
    data: [
      {
        projectId: project.id,
        userId: admin.id,
        action: 'created project',
        entityType: 'project',
        entityId: project.id
      },
      {
        projectId: project.id,
        userId: admin.id,
        action: 'created task',
        entityType: 'task',
        entityId: tasks[0].id
      },
      {
        projectId: project.id,
        userId: member.id,
        action: 'updated status to IN_PROGRESS',
        entityType: 'task',
        entityId: tasks[0].id
      }
    ]
  });

  // add a sample comment
  await prisma.comment.create({
    data: {
      taskId: tasks[0].id,
      userId: member.id,
      content: 'Started working on this. Will share the mockups by tomorrow.'
    }
  });

  console.log('Seed completed!');
  console.log('Admin login: admin@teamflow.com / password123');
  console.log('Member login: member@teamflow.com / password123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
