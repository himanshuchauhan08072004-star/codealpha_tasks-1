const Project = require('../models/Project');
const Task = require('../models/Task');
const catchAsync = require('../utils/catchAsync');

// GET /api/dashboard
exports.getDashboard = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const projects = await Project.find({
    $or: [{ owner: userId }, { members: userId }]
  }).select('_id status');

  const projectIds = projects.map((p) => p._id);
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;

  const assignedTasks = await Task.find({ assignee: userId, project: { $in: projectIds } })
    .populate('project', 'title')
    .sort({ dueDate: 1 });

  const pendingTasks = assignedTasks.filter((t) => t.status !== 'done').length;

  const upcomingDeadlines = assignedTasks
    .filter((t) => t.dueDate && t.status !== 'done')
    .slice(0, 5);

  const byStatus = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const byPriority = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);

  const recentActivity = await Task.find({ project: { $in: projectIds } })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate('project', 'title')
    .populate('assignee', 'name avatar');

  res.status(200).json({
    success: true,
    stats: {
      totalProjects,
      activeProjects,
      completedProjects,
      assignedTasksCount: assignedTasks.length,
      pendingTasks
    },
    upcomingDeadlines,
    tasksByStatus: byStatus,
    tasksByPriority: byPriority,
    recentActivity
  });
});
