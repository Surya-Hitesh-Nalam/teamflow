const prisma = require('../config/prisma');
const logActivity = require('../utils/activityLogger');

const getComments = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ comments });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

const addComment = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = await prisma.comment.create({
      data: { taskId, userId, content: content.trim() },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    await logActivity(task.projectId, userId, 'added comment', 'task', taskId);

    res.status(201).json({ comment });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

module.exports = { getComments, addComment };
