const prisma = require('../config/prisma');

// logs an action to the activity log table
// used throughout controllers to track what happened in a project
const logActivity = async (projectId, userId, action, entityType, entityId) => {
  try {
    await prisma.activityLog.create({
      data: {
        projectId,
        userId,
        action,
        entityType,
        entityId
      }
    });
  } catch (err) {
    // don't let logging failures break the actual request
    console.error('Failed to log activity:', err.message);
  }
};

module.exports = logActivity;
