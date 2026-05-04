const prisma = require('../config/prisma');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json({ notifications });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notificationId = parseInt(req.params.id);

    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true }
    });

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notification' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notifications' });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
