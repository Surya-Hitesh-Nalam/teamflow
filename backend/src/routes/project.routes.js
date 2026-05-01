const express = require('express');
const authenticate = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');
const {
  createProject,
  getProjects,
  getProjectById,
  addMember,
  removeMember
} = require('../controllers/project.controller');
const { getDashboard } = require('../controllers/dashboard.controller');

const timeAgo = require('../utils/timeAgo');
const prisma = require('../config/prisma');

const router = express.Router();

// all project routes require auth
router.use(authenticate);

// dashboard
router.get('/dashboard', getDashboard);

router.get('/', getProjects);
router.post('/', checkRole('ADMIN'), createProject);
router.get('/:id', getProjectById);

// members
router.post('/:id/members', checkRole('ADMIN'), addMember);
router.delete('/:id/members/:userId', checkRole('ADMIN'), removeMember);

// activity log for a project
router.get('/:id/activity', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    const logs = await prisma.activityLog.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const formatted = logs.map(log => ({
      ...log,
      timeAgo: timeAgo(log.createdAt)
    }));

    res.json({ activities: formatted });
  } catch (err) {
    console.error('Activity log error:', err);
    res.status(500).json({ message: 'Failed to fetch activity log' });
  }
});

module.exports = router;
