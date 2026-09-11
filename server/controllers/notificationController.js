const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// GET /api/notifications
exports.getNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('actor', 'name avatar')
    .populate('project', 'title')
    .populate('task', 'title');

  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

  res.status(200).json({ success: true, notifications, unreadCount });
});

// PUT /api/notifications/:id/read
exports.markRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  res.status(200).json({ success: true, notification });
});

// PUT /api/notifications/read-all
exports.markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.status(200).json({ success: true, message: 'All notifications marked read' });
});
