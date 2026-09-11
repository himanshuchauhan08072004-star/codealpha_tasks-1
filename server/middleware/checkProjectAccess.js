const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Loads project by :projectId or :id param, ensures req.user is owner or member.
 * Attaches project to req.project.
 */
exports.checkProjectAccess = catchAsync(async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;

  const project = await Project.findById(projectId);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const userId = req.user._id.toString();
  const isOwner = project.owner.toString() === userId;
  const isMember = project.members.some((m) => m.toString() === userId);

  if (!isOwner && !isMember) {
    return next(new AppError('Not authorized to access this project', 403));
  }

  req.project = project;
  req.isProjectOwner = isOwner;
  next();
});

/**
 * Restricts action to project owner only (e.g. delete project, add/remove members).
 */
exports.requireProjectOwner = (req, res, next) => {
  if (!req.isProjectOwner) {
    return next(new AppError('Only the project owner can perform this action', 403));
  }
  next();
};
