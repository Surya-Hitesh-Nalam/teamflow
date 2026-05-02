const express = require('express');
const authenticate = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');
const { createTask, getProjectTasks, getTaskById, updateTask, deleteTask } = require('../controllers/task.controller');
const { getComments, addComment } = require('../controllers/comment.controller');

const router = express.Router();

router.use(authenticate);

// task routes nested under projects
router.get('/projects/:id/tasks', getProjectTasks);
router.post('/projects/:id/tasks', createTask);

// standalone task routes
router.get('/tasks/:id', getTaskById);
router.patch('/tasks/:id', updateTask);
router.delete('/tasks/:id', checkRole('ADMIN'), deleteTask);

// comments on tasks
router.get('/tasks/:id/comments', getComments);
router.post('/tasks/:id/comments', addComment);

module.exports = router;
