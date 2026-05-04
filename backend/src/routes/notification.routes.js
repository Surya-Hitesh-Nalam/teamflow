const express = require('express');
const authenticate = require('../middleware/auth.middleware');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

module.exports = router;
