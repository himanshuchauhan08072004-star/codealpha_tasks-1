const express = require('express');
const { getTask, updateTask, deleteTask, loadTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { taskCommentsRouter } = require('./commentRoutes');

const router = express.Router();

router.use(protect);

router.route('/:id').get(loadTask, getTask).put(loadTask, updateTask).delete(loadTask, deleteTask);

router.use('/:taskId/comments', taskCommentsRouter);

module.exports = router;
