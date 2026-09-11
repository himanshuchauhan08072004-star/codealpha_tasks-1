const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

// GET /api/users?search=term  (used to find users to add as project members)
exports.searchUsers = catchAsync(async (req, res) => {
  const { search } = req.query;
  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    : {};

  const users = await User.find(filter).limit(20).select('name email avatar');

  res.status(200).json({ success: true, count: users.length, users });
});
