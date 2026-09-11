const Activity = require('../models/Activity');
const catchAsync = require('../utils/catchAsync');

// GET /api/projects/:id/activity
exports.getProjectActivity = catchAsync(async (req, res) => {
  const activities = await Activity.find({ project: req.project._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('actor', 'name avatar')
    .populate('task', 'title');

  res.status(200).json({ success: true, count: activities.length, activities });
});
