const express = require('express');
const {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  loadTaskForComments
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// Nested router: mounted at /api/tasks/:taskId/comments
const taskCommentsRouter = express.Router({ mergeParams: true });
taskCommentsRouter.use(protect);
taskCommentsRouter.route('/').get(loadTaskForComments, getComments).post(loadTaskForComments, addComment);

// Standalone router: mounted at /api/comments
const commentRouter = express.Router();
commentRouter.use(protect);
commentRouter.route('/:id').put(updateComment).delete(deleteComment);

module.exports = { taskCommentsRouter, commentRouter };
