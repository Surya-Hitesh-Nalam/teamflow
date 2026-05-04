const prisma = require('../config/prisma');

const createNotification = async (userId, title, message, link = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        link
      }
    });
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

module.exports = { createNotification };
