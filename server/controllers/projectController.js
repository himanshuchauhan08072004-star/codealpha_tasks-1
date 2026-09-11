const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// GET /api/projects  (projects the user owns or is a member of)
exports.getProjects = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { search } = req.query;

  const filter = {
    $and: [
      { $or: [{ owner: userId }, { members: userId }] },
      search ? { $text: { $search: search } } : {}
    ]
  };

  const projects = await Project.find(filter)
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort({ updatedAt: -1 });

  res.status(200).json({ success: true, count: projects.length, projects });
});

// POST /api/projects
exports.createProject = catchAsync(async (req, res, next) => {
  const { title, description, deadline, members } = req.body;

  if (!title) {
    return next(new AppError('Project title is required', 400));
  }

  const project = await Project.create({
    title,
    description,
    deadline,
    owner: req.user._id,
    members: Array.isArray(members) ? members : []
  });

  const populated = await project.populate([
    { path: 'owner', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar' }
  ]);

  res.status(201).json({ success: true, project: populated });
});

// GET /api/projects/:id  (requires checkProjectAccess -> req.project)
exports.getProject = catchAsync(async (req, res) => {
  const project = await req.project.populate([
    { path: 'owner', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar' }
  ]);

  const taskCounts = await Task.aggregate([
    { $match: { project: project._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  res.status(200).json({ success: true, project, taskCounts });
});

// PUT /api/projects/:id
exports.updateProject = catchAsync(async (req, res, next) => {
  const allowed = ['title', 'description', 'deadline', 'status'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const project = await Project.findByIdAndUpdate(req.project._id, updates, {
    new: true,
    runValidators: true
  }).populate([
    { path: 'owner', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar' }
  ]);

  res.status(200).json({ success: true, project });
});

// DELETE /api/projects/:id  (owner only, enforced by requireProjectOwner)
exports.deleteProject = catchAsync(async (req, res) => {
  await Task.deleteMany({ project: req.project._id });
  await req.project.deleteOne();

  res.status(200).json({ success: true, message: 'Project deleted' });
});

// POST /api/projects/:id/members  { userId }
exports.addMember = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return next(new AppError('userId is required', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const project = req.project;
  const already = project.members.some((m) => m.toString() === userId);
  if (already || project.owner.toString() === userId) {
    return next(new AppError('User is already a project member', 400));
  }

  project.members.push(userId);
  await project.save();

  const populated = await project.populate([
    { path: 'owner', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar' }
  ]);

  req.app.get('io').to(`project:${project._id}`).emit('project:updated', populated);

  res.status(200).json({ success: true, project: populated });
});

// DELETE /api/projects/:id/members/:userId
exports.removeMember = catchAsync(async (req, res) => {
  const { userId } = req.params;
  req.project.members = req.project.members.filter((m) => m.toString() !== userId);
  await req.project.save();

  res.status(200).json({ success: true, message: 'Member removed' });
});
