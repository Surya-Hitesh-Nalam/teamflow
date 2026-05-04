const prisma = require('../config/prisma');
const logActivity = require('../utils/activityLogger');

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        ownerId: userId,
        // automatically add owner as a member too
        members: {
          create: { userId }
        }
      }
    });

    await logActivity(project.id, userId, 'created project', 'project', project.id);

    res.status(201).json({ project });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ message: 'Failed to create project' });
  }
};

const getProjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    // get all projects where the user is either the owner or a member
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ projects });
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user.userId;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true } },
            creator: { select: { id: true, name: true } },
            _count: { select: { comments: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // make sure the user is actually part of this project
    const isMember = project.members.some(m => m.userId === userId);
    const isOwner = project.ownerId === userId;

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    // add overdue flag to each task
    const now = new Date();
    const tasksWithOverdue = project.tasks.map(task => ({
      ...task,
      isOverdue: task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE'
    }));

    res.json({ project: { ...project, tasks: tasksWithOverdue } });
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

const addMember = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User with that email not found' });
    }

    // check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } }
    });

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    await prisma.projectMember.create({
      data: { projectId, userId: user.id }
    });

    await logActivity(projectId, req.user.userId, `added member ${user.name}`, 'member', user.id);

    res.json({ message: `${user.name} added to project` });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ message: 'Failed to add member' });
  }
};

const removeMember = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);

    // don't let owner remove themselves
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project.ownerId === userId) {
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    }

    await prisma.projectMember.deleteMany({
      where: { projectId, userId }
    });

    await logActivity(projectId, req.user.userId, 'removed member', 'member', userId);

    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ message: 'Failed to remove member' });
  }
};

module.exports = { createProject, getProjects, getProjectById, addMember, removeMember };
