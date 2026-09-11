const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

// Writes an Activity row, broadcasts it to the project room.
async function logActivity(io, { project, actor, type, task, meta }) {
  const activity = await Activity.create({ project, actor, type, task, meta });
  const populated = await activity.populate([
    { path: 'actor', select: 'name avatar' },
    { path: 'task', select: 'title' }
  ]);
  io.to(`project:${project}`).emit('activity:created', populated);
  return populated;
}

// Creates a notification for one user, pushes it to their personal room.
async function notify(io, { user, actor, type, message, project, task }) {
  if (String(user) === String(actor)) return null; // don't notify yourself
  const notification = await Notification.create({ user, actor, type, message, project, task });
  io.to(`user:${user}`).emit('notification:new', notification);
  return notification;
}

module.exports = { logActivity, notify };
