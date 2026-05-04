const prisma = require('../config/prisma');
const timeAgo = require('../utils/timeAgo');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true }
    });
    const projectIds = memberships.map(m => m.projectId);

    const totalProjects = projectIds.length;

    const myTasks = await prisma.task.findMany({
      where: { assignedTo: userId },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const completedTasks = myTasks.filter(t => t.status === 'DONE').length;
    const overdueTasks = myTasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
    );

    const tasksWithOverdue = myTasks.map(task => ({
      ...task,
      isOverdue: task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE'
    }));

    const recentActivity = await prisma.activityLog.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const formattedActivity = recentActivity.map(log => ({
      ...log,
      timeAgo: timeAgo(log.createdAt)
    }));

    res.json({
      summary: {
        totalProjects,
        totalTasks: myTasks.length,
        completedTasks,
        overdueTasks: overdueTasks.length
      },
      myTasks: tasksWithOverdue,
      recentActivity: formattedActivity
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};

module.exports = { getDashboard };
