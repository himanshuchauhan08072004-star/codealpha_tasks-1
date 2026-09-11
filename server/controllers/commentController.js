const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Middleware-like helper: verify access to the task via :taskId, attach req.task
exports.loadTaskForComments = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  const project = await Project.findById(task.project);
  const userId = req.user._id.toString();
  const isOwner = project.owner.toString() === userId;
  const isMember = project.members.some((m) => m.toString() === userId);
  if (!isOwner && !isMember) {
    return next(new AppError('Not authorized to access this task', 403));
  }

  req.task = task;
  next();
});

// GET /api/tasks/:taskId/comments
exports.getComments = catchAsync(async (req, res) => {
  const comments = await Comment.find({ task: req.task._id })
    .populate('author', 'name email avatar')
    .sort({ createdAt: 1 });

  res.status(200).json({ success: true, count: comments.length, comments });
});

// POST /api/tasks/:taskId/comments
exports.addComment = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return next(new AppError('Comment content is required', 400));
  }

  const comment = await Comment.create({
    content,
    task: req.task._id,
    author: req.user._id
  });

  const populated = await comment.populate('author', 'name email avatar');

  req.app
    .get('io')
    .to(`project:${req.task.project}`)
    .emit('comment:created', { taskId: req.task._id, comment: populated });

  res.status(201).json({ success: true, comment: populated });
});

// PUT /api/comments/:id  (author only)
exports.updateComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }
  if (comment.author.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only edit your own comments', 403));
  }

  const { content } = req.body;
  if (!content || !content.trim()) {
    return next(new AppError('Comment content is required', 400));
  }

  comment.content = content;
  await comment.save();
  await comment.populate('author', 'name email avatar');

  const parentTask = await Task.findById(comment.task).select('project');
  if (parentTask) {
    req.app
      .get('io')
      .to(`project:${parentTask.project}`)
      .emit('comment:updated', { taskId: comment.task, comment });
  }

  res.status(200).json({ success: true, comment });
});

// DELETE /api/comments/:id  (author only)
exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }
  if (comment.author.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own comments', 403));
  }

  const parentTask = await Task.findById(comment.task).select('project');
  const taskId = comment.task;
  const commentId = comment._id;
  await comment.deleteOne();

  if (parentTask) {
    req.app
      .get('io')
      .to(`project:${parentTask.project}`)
      .emit('comment:deleted', { taskId, commentId });
  }

  res.status(200).json({ success: true, message: 'Comment deleted' });
});
