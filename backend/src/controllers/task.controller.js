const prisma = require('../config/prisma');
const logActivity = require('../utils/activityLogger');
const { createNotification } = require('../utils/notificationService');

const createTask = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const createdBy = req.user.userId;

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        projectId,
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
        createdBy,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } }
      }
    });

    await logActivity(projectId, createdBy, 'created task', 'task', task.id);

    // Personal Notification
    if (task.assignedTo) {
      await createNotification(
        task.assignedTo,
        'New Task Assigned! 🎉',
        `You have been assigned to: ${task.title}`,
        `/tasks/${task.id}`
      );
    }

    res.status(201).json({ task });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const tasksWithOverdue = tasks.map(task => ({
      ...task,
      isOverdue: task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE'
    }));

    res.json({ tasks: tasksWithOverdue });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const now = new Date();
    const taskWithOverdue = {
      ...task,
      isOverdue: task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE'
    };

    res.json({ task: taskWithOverdue });
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ message: 'Failed to fetch task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // build the update data dynamically so we only update fields that were sent
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo ? parseInt(assignedTo) : null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } }
      }
    });

    // log status changes specifically since those are the most meaningful
    if (status && status !== existing.status) {
      await logActivity(
        existing.projectId,
        req.user.userId,
        `updated status to ${status}`,
        'task',
        taskId
      );
    }

    // Personal Notification if assignee changed
    if (assignedTo && assignedTo !== existing.assignedTo) {
      await createNotification(
        parseInt(assignedTo),
        'Task Reassigned to You! 👤',
        `You are now responsible for: ${task.title}`,
        `/tasks/${task.id}`
      );
    }

    res.json({ task });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await prisma.task.delete({ where: { id: taskId } });

    await logActivity(task.projectId, req.user.userId, 'deleted task', 'task', taskId);

    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

module.exports = { createTask, getProjectTasks, getTaskById, updateTask, deleteTask };
