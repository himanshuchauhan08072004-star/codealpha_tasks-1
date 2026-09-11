const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const populateTask = (query) =>
  query
    .populate('assignee', 'name email avatar')
    .populate('creator', 'name email avatar')
    .populate('project', 'title');

// GET /api/projects/:projectId/tasks?status=&priority=&assignee=&sort=
exports.getTasksForProject = catchAsync(async (req, res) => {
  const { status, priority, assignee, sort, search } = req.query;

  const filter = { project: req.project._id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;
  if (search) filter.$text = { $search: search };

  let sortOption = { createdAt: -1 };
  if (sort === 'dueDate') sortOption = { dueDate: 1 };
  if (sort === 'priority') {
    // Manual priority ranking sort done post-query since enum isn't numeric
  }

  let query = populateTask(Task.find(filter).sort(sortOption));
  let tasks = await query;

  if (sort === 'priority') {
    const rank = { urgent: 0, high: 1, medium: 2, low: 3 };
    tasks = tasks.sort((a, b) => rank[a.priority] - rank[b.priority]);
  }

  res.status(200).json({ success: true, count: tasks.length, tasks });
});

// POST /api/projects/:projectId/tasks
exports.createTask = catchAsync(async (req, res, next) => {
  const { title, description, status, priority, assignee, dueDate } = req.body;

  if (!title) {
    return next(new AppError('Task title is required', 400));
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    assignee: assignee || null,
    dueDate,
    project: req.project._id,
    creator: req.user._id
  });

  const populated = await populateTask(Task.findById(task._id));

  req.app.get('io').to(`project:${req.project._id}`).emit('task:created', populated);

  res.status(201).json({ success: true, task: populated });
});

// helper: load task + verify project access, attach to req
exports.loadTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  const project = await Project.findById(task.project);
  if (!project) {
    return next(new AppError('Parent project not found', 404));
  }

  const userId = req.user._id.toString();
  const isOwner = project.owner.toString() === userId;
  const isMember = project.members.some((m) => m.toString() === userId);
  if (!isOwner && !isMember) {
    return next(new AppError('Not authorized to access this task', 403));
  }

  req.task = task;
  req.project = project;
  req.isProjectOwner = isOwner;
  next();
});

// GET /api/tasks/:id
exports.getTask = catchAsync(async (req, res) => {
  const task = await populateTask(Task.findById(req.task._id));
  res.status(200).json({ success: true, task });
});

// PUT /api/tasks/:id
exports.updateTask = catchAsync(async (req, res) => {
  const allowed = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const task = await populateTask(
    Task.findByIdAndUpdate(req.task._id, updates, { new: true, runValidators: true })
  );

  req.app.get('io').to(`project:${req.project._id}`).emit('task:updated', task);

  res.status(200).json({ success: true, task });
});

// DELETE /api/tasks/:id
exports.deleteTask = catchAsync(async (req, res) => {
  await Comment.deleteMany({ task: req.task._id });
  const taskId = req.task._id;
  await req.task.deleteOne();
  req.app.get('io').to(`project:${req.project._id}`).emit('task:deleted', { taskId });
  res.status(200).json({ success: true, message: 'Task deleted' });
});
